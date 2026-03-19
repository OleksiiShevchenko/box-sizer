"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateIdealBoxPacking,
  calculateShipmentPacking,
} from "@/services/shipment-packing";
import type { IProduct, IShipment, IShipmentListItem, PackingResult } from "@/types";

const shipmentItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  depth: z.number().positive("Depth must be positive"),
  weight: z.number().nonnegative("Weight must be non-negative").nullable().optional(),
  canStackOnTop: z.boolean().optional().default(true),
  canBePlacedOnTop: z.boolean().optional().default(true),
  orientation: z.enum(["any", "horizontal", "vertical"]).optional().default("any"),
});

const calculateShipmentSchema = z.object({
  name: z.string().trim().min(1, "Shipment name is required"),
  spacingOverride: z.number().nonnegative("Spacing override must be non-negative").nullable(),
  items: z.array(shipmentItemSchema).min(1, "Add at least one item"),
});

async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

function isMissingShipmentSchemaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    typeof error.meta?.table === "string" &&
    (error.meta.table.includes("Shipment") || error.meta.table.includes("ShipmentItem"))
  );
}

export async function getShipments(
  page = 1,
  pageSize = 10
): Promise<{ shipments: IShipmentListItem[]; totalCount: number; schemaReady: boolean }> {
  const userId = await getAuthUserId();
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.max(1, Math.floor(pageSize));
  const skip = (normalizedPage - 1) * normalizedPageSize;

  try {
    const [shipments, totalCount] = await Promise.all([
      prisma.shipment.findMany({
        where: { userId },
        include: {
          box: true,
          items: {
            orderBy: { id: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: normalizedPageSize,
      }),
      prisma.shipment.count({
        where: { userId },
      }),
    ]);

    return {
      shipments: shipments.map((shipment) => ({
        id: shipment.id,
        name: shipment.name,
        spacingOverride: shipment.spacingOverride,
        dimensionalWeight: shipment.dimensionalWeight,
        box: shipment.box,
        items: shipment.items,
        itemCount: shipment.items.length,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      })),
      totalCount,
      schemaReady: true,
    };
  } catch (error) {
    if (isMissingShipmentSchemaError(error)) {
      return {
        shipments: [],
        totalCount: 0,
        schemaReady: false,
      };
    }

    throw error;
  }
}

export async function getShipment(id: string): Promise<IShipment | null> {
  const userId = await getAuthUserId();
  try {
    const shipment = await prisma.shipment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        box: true,
        items: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!shipment) {
      return null;
    }

    return {
      id: shipment.id,
      name: shipment.name,
      spacingOverride: shipment.spacingOverride,
      box: shipment.box,
      dimensionalWeight: shipment.dimensionalWeight,
      items: shipment.items,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  } catch (error) {
    if (isMissingShipmentSchemaError(error)) {
      return null;
    }

    throw error;
  }
}

export async function createShipment(name = "Untitled Shipment"): Promise<{ id: string }> {
  const userId = await getAuthUserId();
  const shipment = await prisma.shipment.create({
    data: {
      userId,
      name,
    },
  });

  revalidatePath("/dashboard");
  return { id: shipment.id };
}

export async function calculateAndSaveShipment(
  id: string,
  input: {
    name: string;
    items: IProduct[];
    spacingOverride?: number | null;
  }
): Promise<{
  results?: PackingResult[];
  idealResult?: PackingResult | null;
  error?: string;
}> {
  const userId = await getAuthUserId();
  const shipment = await prisma.shipment.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!shipment) {
    return { error: "Shipment not found" };
  }

  const parsed = calculateShipmentSchema.safeParse({
    name: input.name,
    spacingOverride: input.spacingOverride ?? null,
    items: input.items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid shipment data" };
  }

  const boxes = await prisma.box.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (boxes.length === 0) {
    let idealResult: PackingResult | null = null;

    try {
      idealResult = calculateIdealBoxPacking(
        parsed.data.items,
        parsed.data.spacingOverride
      );
    } catch {
      idealResult = null;
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.shipmentItem.deleteMany({
          where: { shipmentId: id },
        });

        await tx.shipment.update({
          where: { id },
          data: {
            name: parsed.data.name,
            spacingOverride: parsed.data.spacingOverride,
            boxId: null,
            dimensionalWeight: null,
            items: {
              create: parsed.data.items.map((item) => ({
                name: item.name,
                width: item.width,
                height: item.height,
                depth: item.depth,
                weight: item.weight,
                canStackOnTop: item.canStackOnTop,
                canBePlacedOnTop: item.canBePlacedOnTop,
                orientation: item.orientation,
              })),
            },
          },
        });
      });

      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/shipments/${id}`);
      return { idealResult };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to calculate shipment",
      };
    }
  }

  try {
    const results = calculateShipmentPacking(
      boxes,
      parsed.data.items,
      parsed.data.spacingOverride
    );
    let idealResult: PackingResult | null = null;

    try {
      idealResult = calculateIdealBoxPacking(
        parsed.data.items,
        parsed.data.spacingOverride
      );
    } catch {
      idealResult = null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.shipmentItem.deleteMany({
        where: { shipmentId: id },
      });

      await tx.shipment.update({
        where: { id },
        data: {
          name: parsed.data.name,
          spacingOverride: parsed.data.spacingOverride,
          boxId: results[0]?.box.id ?? null,
          dimensionalWeight:
            results.length === 1
              ? results[0]?.dimensionalWeight ?? null
              : results.reduce((sum, result) => sum + result.dimensionalWeight, 0),
          items: {
            create: parsed.data.items.map((item) => ({
              name: item.name,
              width: item.width,
              height: item.height,
              depth: item.depth,
              weight: item.weight,
            })),
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/shipments/${id}`);
    return { results, idealResult };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to calculate shipment",
    };
  }
}

export async function deleteShipment(id: string): Promise<{ success?: true; error?: string }> {
  const userId = await getAuthUserId();
  const shipment = await prisma.shipment.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!shipment) {
    return { error: "Shipment not found" };
  }

  await prisma.shipment.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

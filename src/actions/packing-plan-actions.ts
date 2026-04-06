"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod/v4";
import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { savePackingPlanCalculation } from "@/lib/api-packing-plans";
import {
  calculateIdealBoxPacking,
  calculatePackingPlanPacking,
} from "@/services/packing-plan-packing";
import {
  CalculationQuotaExceededError,
  formatCalculationQuotaExceededMessage,
  notifyQuotaReachedIfNeeded,
  performMeteredCalculation,
} from "@/services/subscription";
import type { IProduct, IPackingPlan, IPackingPlanListItem, Orientation, PackingResult } from "@/types";

const packingPlanItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional().default(1),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  depth: z.number().positive("Depth must be positive"),
  weight: z.number().nonnegative("Weight must be non-negative").nullable().optional(),
  canStackOnTop: z.boolean().optional().default(true),
  canBePlacedOnTop: z.boolean().optional().default(true),
  orientation: z.enum(["any", "horizontal", "vertical"]).optional().default("any"),
});

const calculatePackingPlanSchema = z.object({
  name: z.string().trim().min(1, "Packing plan name is required"),
  spacingOverride: z.number().nonnegative("Spacing override must be non-negative").nullable(),
  items: z.array(packingPlanItemSchema).min(1, "Add at least one item"),
});

function isMissingPackingPlanSchemaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    typeof error.meta?.table === "string" &&
    (error.meta.table.includes("PackingPlan") || error.meta.table.includes("PackingPlanItem"))
  );
}

export async function getPackingPlans(
  page = 1,
  pageSize = 10
): Promise<{ packingPlans: IPackingPlanListItem[]; totalCount: number; schemaReady: boolean }> {
  const userId = await getCurrentUserId();
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.max(1, Math.floor(pageSize));
  const skip = (normalizedPage - 1) * normalizedPageSize;

  try {
    const [packingPlans, totalCount] = await Promise.all([
      prisma.packingPlan.findMany({
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
      prisma.packingPlan.count({
        where: { userId },
      }),
    ]);

    return {
      packingPlans: packingPlans.map((packingPlan) => ({
        id: packingPlan.id,
        name: packingPlan.name,
        spacingOverride: packingPlan.spacingOverride,
        dimensionalWeight: packingPlan.dimensionalWeight,
        box: packingPlan.box,
        items: packingPlan.items.map((item) => ({
          ...item,
          orientation: item.orientation as Orientation,
        })),
        itemCount: packingPlan.items.reduce((total, item) => total + item.quantity, 0),
        calculationCount: packingPlan.calculationCount,
        createdAt: packingPlan.createdAt,
        updatedAt: packingPlan.updatedAt,
      })),
      totalCount,
      schemaReady: true,
    };
  } catch (error) {
    if (isMissingPackingPlanSchemaError(error)) {
      return {
        packingPlans: [],
        totalCount: 0,
        schemaReady: false,
      };
    }

    throw error;
  }
}

export async function getPackingPlan(id: string): Promise<IPackingPlan | null> {
  const userId = await getCurrentUserId();
  try {
    const packingPlan = await prisma.packingPlan.findFirst({
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

    if (!packingPlan) {
      return null;
    }

    return {
      id: packingPlan.id,
      name: packingPlan.name,
      spacingOverride: packingPlan.spacingOverride,
      box: packingPlan.box,
      dimensionalWeight: packingPlan.dimensionalWeight,
      items: packingPlan.items.map((item) => ({
        ...item,
        orientation: item.orientation as Orientation,
      })),
      createdAt: packingPlan.createdAt,
      updatedAt: packingPlan.updatedAt,
    };
  } catch (error) {
    if (isMissingPackingPlanSchemaError(error)) {
      return null;
    }

    throw error;
  }
}

export async function createPackingPlan(name = "Untitled Packing Plan"): Promise<{ id: string }> {
  const userId = await getCurrentUserId();
  const packingPlan = await prisma.packingPlan.create({
    data: {
      userId,
      name,
    },
  });

  revalidatePath("/dashboard");
  return { id: packingPlan.id };
}

export async function calculateAndSavePackingPlan(
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
  const userId = await getCurrentUserId();
  const packingPlan = await prisma.packingPlan.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!packingPlan) {
    return { error: "Packing plan not found" };
  }

  const parsed = calculatePackingPlanSchema.safeParse({
    name: input.name,
    spacingOverride: input.spacingOverride ?? null,
    items: input.items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid packing plan data" };
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
      await performMeteredCalculation(userId, (tx) =>
        savePackingPlanCalculation(
          tx,
          id,
          {
            name: parsed.data.name,
            items: parsed.data.items,
            spacingOverride: parsed.data.spacingOverride,
          },
          []
        )
      );

      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/packing-plans/${id}`);
      return { idealResult };
    } catch (error) {
      if (error instanceof CalculationQuotaExceededError) {
        await notifyQuotaReachedIfNeeded(userId);
        return {
          error: formatCalculationQuotaExceededMessage(error.usageLimit),
        };
      }

      return {
        error: error instanceof Error ? error.message : "Failed to calculate packing plan",
      };
    }
  }

  try {
    const results = calculatePackingPlanPacking(
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

    await performMeteredCalculation(userId, (tx) =>
      savePackingPlanCalculation(
        tx,
        id,
        {
          name: parsed.data.name,
          items: parsed.data.items,
          spacingOverride: parsed.data.spacingOverride,
        },
        results
      )
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/packing-plans/${id}`);
    return { results, idealResult };
  } catch (error) {
    if (error instanceof CalculationQuotaExceededError) {
      await notifyQuotaReachedIfNeeded(userId);
      return {
        error: formatCalculationQuotaExceededMessage(error.usageLimit),
      };
    }

    return {
      error: error instanceof Error ? error.message : "Failed to calculate packing plan",
    };
  }
}

export async function deletePackingPlan(id: string): Promise<{ success?: true; error?: string }> {
  const userId = await getCurrentUserId();
  const packingPlan = await prisma.packingPlan.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!packingPlan) {
    return { error: "Packing plan not found" };
  }

  await prisma.packingPlan.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

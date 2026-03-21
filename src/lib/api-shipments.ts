import type { Shipment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/api-errors";
import {
  calculateShipmentPacking,
  calculateIdealBoxPacking,
} from "@/services/shipment-packing";
import type { IProduct, PackingResult } from "@/types";

type ShipmentCalculationInput = {
  name?: string;
  spacingOverride?: number | null;
  items: IProduct[];
  includeIdealBox?: boolean;
};

export async function getBoxesForUser(userId: string) {
  return prisma.box.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getShipmentForUser(userId: string, publicId: string) {
  const shipment = await prisma.shipment.findFirst({
    where: {
      userId,
      publicId,
    },
    include: {
      box: true,
      items: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!shipment) {
    throw notFound("Shipment not found");
  }

  return shipment;
}

export async function getBoxForUser(userId: string, publicId: string) {
  const box = await prisma.box.findFirst({
    where: {
      userId,
      publicId,
    },
  });

  if (!box) {
    throw notFound("Packaging not found");
  }

  return box;
}

export async function calculateShipmentForUser(
  userId: string,
  input: ShipmentCalculationInput
): Promise<{
  results: PackingResult[];
  idealResult: PackingResult | null;
}> {
  const boxes = await getBoxesForUser(userId);
  const includeIdealBox = input.includeIdealBox ?? false;

  let idealResult: PackingResult | null = null;
  if (includeIdealBox || boxes.length === 0) {
    try {
      idealResult = calculateIdealBoxPacking(input.items, input.spacingOverride);
    } catch {
      idealResult = null;
    }
  }

  if (boxes.length === 0) {
    if (!includeIdealBox) {
      throw badRequest("No packaging options available for this account");
    }

    return {
      results: [],
      idealResult,
    };
  }

  const results = calculateShipmentPacking(boxes, input.items, input.spacingOverride);

  return {
    results,
    idealResult,
  };
}

export async function saveShipmentCalculation(
  shipment: Shipment,
  input: Required<Pick<ShipmentCalculationInput, "name">> &
    Pick<ShipmentCalculationInput, "spacingOverride" | "items">,
  results: PackingResult[]
) {
  const dimensionalWeight =
    results.length === 0
      ? null
      : results.length === 1
        ? results[0]!.dimensionalWeight
        : results.reduce((sum, result) => sum + result.dimensionalWeight, 0);

  await prisma.$transaction(async (tx) => {
    await tx.shipmentItem.deleteMany({
      where: { shipmentId: shipment.id },
    });

    await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        name: input.name,
        spacingOverride: input.spacingOverride ?? null,
        boxId: results[0]?.box.id ?? null,
        dimensionalWeight,
        items: {
          create: input.items.map((item) => ({
            name: item.name,
            quantity: item.quantity ?? 1,
            width: item.width,
            height: item.height,
            depth: item.depth,
            weight: item.weight ?? null,
            canStackOnTop: item.canStackOnTop ?? true,
            canBePlacedOnTop: item.canBePlacedOnTop ?? true,
            orientation: item.orientation ?? "any",
          })),
        },
      },
    });
  });
}

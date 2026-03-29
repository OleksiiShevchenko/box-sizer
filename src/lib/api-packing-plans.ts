import type { PackingPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/api-errors";
import {
  calculatePackingPlanPacking,
  calculateIdealBoxPacking,
} from "@/services/packing-plan-packing";
import type { IProduct, PackingResult } from "@/types";

type PackingPlanCalculationInput = {
  name?: string;
  spacingOverride?: number | null;
  items: IProduct[];
  includeIdealBox?: boolean;
};

function getPackingPlanCalculationData(
  input: Required<Pick<PackingPlanCalculationInput, "name">> &
    Pick<PackingPlanCalculationInput, "spacingOverride" | "items">,
  results: PackingResult[]
) {
  const dimensionalWeight =
    results.length === 0
      ? null
      : results.length === 1
        ? results[0]!.dimensionalWeight
        : results.reduce((sum, result) => sum + result.dimensionalWeight, 0);

  return {
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
  };
}

export async function createPackingPlanCalculationForUser(
  userId: string,
  input: Required<Pick<PackingPlanCalculationInput, "name">> &
    Pick<PackingPlanCalculationInput, "spacingOverride" | "items">,
  results: PackingResult[]
) {
  return prisma.packingPlan.create({
    data: {
      userId,
      ...getPackingPlanCalculationData(input, results),
    },
  });
}

export async function getBoxesForUser(userId: string) {
  return prisma.box.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPackingPlanForUser(userId: string, publicId: string) {
  const packingPlan = await prisma.packingPlan.findFirst({
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

  if (!packingPlan) {
    throw notFound("Packing plan not found");
  }

  return packingPlan;
}

export async function getBoxForUser(userId: string, publicId: string) {
  const box = await prisma.box.findFirst({
    where: {
      userId,
      publicId,
    },
  });

  if (!box) {
    throw notFound("Box not found");
  }

  return box;
}

export async function calculatePackingPlanForUser(
  userId: string,
  input: PackingPlanCalculationInput
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
      throw badRequest("No box options available for this account");
    }

    return {
      results: [],
      idealResult,
    };
  }

  const results = calculatePackingPlanPacking(boxes, input.items, input.spacingOverride);

  return {
    results,
    idealResult,
  };
}

export async function savePackingPlanCalculation(
  packingPlan: PackingPlan,
  input: Required<Pick<PackingPlanCalculationInput, "name">> &
    Pick<PackingPlanCalculationInput, "spacingOverride" | "items">,
  results: PackingResult[]
) {
  await prisma.$transaction(async (tx) => {
    await tx.packingPlanItem.deleteMany({
      where: { packingPlanId: packingPlan.id },
    });

    await tx.packingPlan.update({
      where: { id: packingPlan.id },
      data: getPackingPlanCalculationData(input, results),
    });
  });
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePacking } from "@/services/box-packer";
import {
  CalculationQuotaExceededError,
  formatCalculationQuotaExceededMessage,
  notifyQuotaReachedIfNeeded,
  performMeteredCalculation,
} from "@/services/subscription";
import type { IProduct, PackingResult } from "@/types";

export async function calculatePackingAction(
  products: IProduct[]
): Promise<{ results?: PackingResult[]; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const boxes = await prisma.box.findMany({
    where: { userId: session.user.id },
  });

  if (boxes.length === 0) {
    return { error: "No boxes configured. Add box options first." };
  }

  try {
    const results = calculatePacking(boxes, products);
    await performMeteredCalculation(session.user.id, async () => results);
    return { results };
  } catch (err) {
    if (err instanceof CalculationQuotaExceededError) {
      await notifyQuotaReachedIfNeeded(session.user.id);
      return {
        error: formatCalculationQuotaExceededMessage(err.usageLimit),
      };
    }

    return {
      error: err instanceof Error ? err.message : "Failed to calculate packing",
    };
  }
}

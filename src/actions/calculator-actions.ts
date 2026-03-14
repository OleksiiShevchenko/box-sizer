"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePacking } from "@/services/box-packer";
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
    return { error: "No boxes configured. Add packaging options first." };
  }

  try {
    const results = calculatePacking(boxes, products);
    return { results };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to calculate packing",
    };
  }
}

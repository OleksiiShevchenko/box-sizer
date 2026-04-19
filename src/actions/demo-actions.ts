"use server";

import { z } from "zod/v4";
import {
  DEMO_BOXES,
  DEMO_MAX_ITEM_QUANTITY,
  DEMO_MAX_TOTAL_UNITS,
  buildDemoProducts,
  getDemoScenario,
  type DemoScenarioId,
} from "@/lib/demo-scenarios";
import { calculateIdealBoxPacking, calculatePackingPlanPacking } from "@/services/packing-plan-packing";
import type { PackingResult } from "@/types";
import { inchesToCm } from "@/types";

const calculateDemoPackingSchema = z.object({
  scenarioId: z.enum(["ecommerce-order", "gift-kit"]),
  quantities: z.record(z.string(), z.number().int().min(1).max(DEMO_MAX_ITEM_QUANTITY)),
});

export async function calculateDemoPacking(input: {
  scenarioId: DemoScenarioId;
  quantities: Record<string, number>;
}): Promise<{
  results: PackingResult[];
  idealResult: PackingResult | null;
  error?: string;
}> {
  const parsed = calculateDemoPackingSchema.safeParse(input);
  if (!parsed.success) {
    return { results: [], idealResult: null, error: parsed.error.issues[0]?.message ?? "Invalid demo input" };
  }

  const scenario = getDemoScenario(parsed.data.scenarioId);
  if (!scenario) {
    return { results: [], idealResult: null, error: "Demo scenario not found." };
  }

  const selectedItemIds = new Set(scenario.items.map((item) => item.id));
  const filteredQuantities = Object.fromEntries(
    Object.entries(parsed.data.quantities).filter(([itemId]) => selectedItemIds.has(itemId))
  );

  const totalUnits = Object.values(filteredQuantities).reduce((sum, quantity) => sum + quantity, 0);
  if (totalUnits > DEMO_MAX_TOTAL_UNITS) {
    return {
      results: [],
      idealResult: null,
      error: `Demo requests are limited to ${DEMO_MAX_TOTAL_UNITS} total units.`,
    };
  }

  const products = buildDemoProducts(scenario, filteredQuantities);
  if (products.length === 0) {
    return {
      results: [],
      idealResult: null,
      error: "Select at least one item to continue.",
    };
  }

  const spacingOverride = inchesToCm(scenario.spacingOverrideIn);

  let idealResult: PackingResult | null = null;
  try {
    idealResult = calculateIdealBoxPacking(products, spacingOverride);
  } catch {
    idealResult = null;
  }

  try {
    const results = calculatePackingPlanPacking(DEMO_BOXES, products, spacingOverride);
    return { results, idealResult };
  } catch {
    if (idealResult) {
      return { results: [], idealResult };
    }

    return {
      results: [],
      idealResult: null,
      error: "We could not calculate a packing result for that demo selection.",
    };
  }
}

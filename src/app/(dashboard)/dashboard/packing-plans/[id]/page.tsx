import { notFound } from "next/navigation";
import { getBoxes } from "@/actions/box-actions";
import { getUnitSystem } from "@/actions/profile-actions";
import { getPackingPlan } from "@/actions/packing-plan-actions";
import { PackingPlanDetailClient } from "@/components/packing-plans/packing-plan-detail-client";
import {
  calculateIdealBoxPacking,
  calculatePackingPlanPacking,
} from "@/services/packing-plan-packing";

interface PackingPlanDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function PackingPlanDetailPage({ params }: PackingPlanDetailPageProps) {
  const { id } = params instanceof Promise ? await params : params;
  const [packingPlan, unitSystem] = await Promise.all([getPackingPlan(id), getUnitSystem()]);

  if (!packingPlan) {
    notFound();
  }

  const boxes = await getBoxes();
  let initialResults = null;
  let initialIdealResult = null;

  if (packingPlan.items.length > 0 && boxes.length > 0) {
    try {
      initialResults = calculatePackingPlanPacking(boxes, packingPlan.items, packingPlan.spacingOverride);
    } catch {
      initialResults = null;
    }
  }

  if (packingPlan.items.length > 0) {
    try {
      initialIdealResult = calculateIdealBoxPacking(
        packingPlan.items,
        packingPlan.spacingOverride
      );
    } catch {
      initialIdealResult = null;
    }
  }

  return (
    <PackingPlanDetailClient
      packingPlan={packingPlan}
      initialResults={initialResults}
      initialIdealResult={initialIdealResult}
      hasBoxes={boxes.length > 0}
      unitSystem={unitSystem}
    />
  );
}

import { Card } from "@/components/ui/card";
import { NewPackingPlanButton } from "@/components/packing-plans/new-packing-plan-button";

export function PackingPlanEmptyState() {
  return (
    <Card className="py-12 text-center">
      <h2 className="text-lg font-semibold text-gray-900">No packing plans yet</h2>
      <p className="mt-2 text-sm text-gray-500">
        Create your first packing plan to save items and calculate the best box.
      </p>
      <div className="mt-6">
        <NewPackingPlanButton />
      </div>
    </Card>
  );
}

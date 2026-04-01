import { Card } from "@/components/ui/card";
import { NewPackingPlanButton } from "@/components/packing-plans/new-packing-plan-button";

export function PackingPlanEmptyState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <Card className="mx-auto flex w-full max-w-[420px] flex-col items-center border-slate-200 px-10 py-12 text-center shadow-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
            inventory_2
          </span>
        </div>
        <h2 className="mt-6 text-lg font-semibold text-slate-900">No packing plans yet</h2>
        <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-500">
          Create your first packing plan to save items and calculate the best box.
        </p>
        <div className="mt-6">
          <NewPackingPlanButton className="px-4 py-2 text-xs" />
        </div>
      </Card>
    </div>
  );
}

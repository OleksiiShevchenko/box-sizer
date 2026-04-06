"use client";

import Link from "next/link";
import { useState } from "react";
import posthog from "posthog-js";
import { deletePackingPlan } from "@/actions/packing-plan-actions";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Tooltip } from "@/components/ui/tooltip";
import type { IPackingPlanListItem, UnitSystem } from "@/types";
import { cmToInches, kgToLbs, normalizeProductQuantity } from "@/types";

interface PackingPlanTableProps {
  packingPlans: IPackingPlanListItem[];
  unitSystem: UnitSystem;
  onDeleted?: (packingPlanId: string) => void;
}

function dim(value: number, unit: UnitSystem): string {
  return (unit === "in" ? cmToInches(value) : value).toFixed(1);
}

function formatDimensions(packingPlan: IPackingPlanListItem, unit: UnitSystem): string {
  if (!packingPlan.box) {
    return "Not calculated yet";
  }

  return `${dim(packingPlan.box.width, unit)} x ${dim(packingPlan.box.height, unit)} x ${dim(packingPlan.box.depth, unit)} ${unit}`;
}

export function PackingPlanTable({ packingPlans, unitSystem, onDeleted }: PackingPlanTableProps) {
  const [targetPackingPlan, setTargetPackingPlan] = useState<IPackingPlanListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(): Promise<boolean> {
    if (!targetPackingPlan) {
      return false;
    }

    setDeleting(true);
    setDeleteError("");
    const result = await deletePackingPlan(targetPackingPlan.id);
    setDeleting(false);

    if (result.success) {
      posthog.capture("packing_plan_deleted", { packing_plan_id: targetPackingPlan.id });
      onDeleted?.(targetPackingPlan.id);
      return true;
    }

    setDeleteError(result.error ?? "Failed to delete packing plan");
    return false;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
              <th className="px-6 py-3">Packing plan</th>
              <th className="px-6 py-3">Units</th>
              <th className="px-6 py-3">Box size</th>
              <th className="px-6 py-3">Dimensional weight</th>
              <th className="px-6 py-3">Calculations</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {packingPlans.map((packingPlan) => (
              <tr key={packingPlan.id} className="text-sm text-slate-600">
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/packing-plans/${packingPlan.id}`}
                    prefetch={false}
                    className="font-medium text-slate-900 underline decoration-transparent transition-colors hover:text-blue-600 hover:decoration-blue-600"
                  >
                    {packingPlan.name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Tooltip
                    content={
                      <div className="space-y-1">
                        {packingPlan.items.map((item) => (
                          <div key={item.id}>
                            <p className="font-medium">
                              {item.name} x{normalizeProductQuantity(item.quantity)}
                            </p>
                            <p className="text-gray-300">
                              {dim(item.width, unitSystem)} x {dim(item.height, unitSystem)} x{" "}
                              {dim(item.depth, unitSystem)} {unitSystem}
                            </p>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <span className="cursor-default underline decoration-dashed decoration-slate-300 underline-offset-2">
                      {packingPlan.itemCount}
                    </span>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">{formatDimensions(packingPlan, unitSystem)}</td>
                <td className="px-6 py-4">
                  {packingPlan.dimensionalWeight != null
                    ? `${(unitSystem === "in" ? kgToLbs(packingPlan.dimensionalWeight) : packingPlan.dimensionalWeight).toFixed(1)} ${unitSystem === "in" ? "lbs" : "kg"}`
                    : "Not calculated yet"}
                </td>
                <td className="px-6 py-4">{packingPlan.calculationCount}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/packing-plans/${packingPlan.id}`}
                      prefetch={false}
                      className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setTargetPackingPlan(packingPlan)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        open={Boolean(targetPackingPlan)}
        title="Delete packing plan"
        entityName={targetPackingPlan?.name}
        error={deleteError}
        loading={deleting}
        onClose={() => {
          setTargetPackingPlan(null);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

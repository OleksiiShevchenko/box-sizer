"use client";

import Link from "next/link";
import { useState } from "react";
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
      onDeleted?.(targetPackingPlan.id);
      return true;
    }

    setDeleteError(result.error ?? "Failed to delete packing plan");
    return false;
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-clip overflow-y-visible rounded-xl">

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-3">Packing plan</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Box Size</th>
                <th className="px-4 py-3">Dimensional Weight</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {packingPlans.map((packingPlan) => (
                <tr key={packingPlan.id} className="text-sm text-gray-700">
                  <td className="px-4 py-4">
                    <Link
                      href={`/dashboard/packing-plans/${packingPlan.id}`}
                      prefetch={false}
                      className="font-medium text-gray-900 underline decoration-transparent transition-colors hover:text-blue-600 hover:decoration-blue-600"
                    >
                      {packingPlan.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
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
                      <span className="cursor-default underline decoration-dashed decoration-gray-300 underline-offset-2">
                        {packingPlan.itemCount}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-4">{formatDimensions(packingPlan, unitSystem)}</td>
                  <td className="px-4 py-4">
                    {packingPlan.dimensionalWeight != null
                      ? `${(unitSystem === "in" ? kgToLbs(packingPlan.dimensionalWeight) : packingPlan.dimensionalWeight).toFixed(1)} ${unitSystem === "in" ? "lbs" : "kg"}`
                      : "Not calculated yet"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/packing-plans/${packingPlan.id}`}
                        prefetch={false}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
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

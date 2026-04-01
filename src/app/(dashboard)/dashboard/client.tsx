"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { UsageWidget } from "@/components/dashboard/usage-widget";
import { NewPackingPlanButton } from "@/components/packing-plans/new-packing-plan-button";
import { PackingPlanEmptyState } from "@/components/packing-plans/packing-plan-empty-state";
import { PackingPlanTable } from "@/components/packing-plans/packing-plan-table";
import type { IPackingPlanListItem, ISubscriptionInfo, UnitSystem } from "@/types";

interface DashboardClientProps {
  hasBoxes: boolean;
  initialPackingPlans: IPackingPlanListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  subscriptionInfo: ISubscriptionInfo;
  unitSystem: UnitSystem;
}

export function DashboardClient({
  hasBoxes,
  initialPackingPlans,
  totalCount,
  page,
  pageSize,
  subscriptionInfo,
  unitSystem,
}: DashboardClientProps) {
  const [packingPlans, setPackingPlans] = useState(initialPackingPlans);
  const [currentTotalCount, setCurrentTotalCount] = useState(totalCount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Packing plans</h1>
        <p className="mt-1 text-sm text-slate-500">
          Save packing plans, manage products, and calculate the best box.
        </p>
      </div>

      <UsageWidget subscriptionInfo={subscriptionInfo} />

      {!hasBoxes ? (
        <Card className="flex flex-col gap-4 border-blue-100 bg-blue-50/70 p-4 shadow-none sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600">
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                info
              </span>
            </div>
            <p className="text-sm text-slate-700">
              Box options are recommended for best-box matching. You can still create packing plans
              and calculate an ideal custom box.
            </p>
          </div>
          <Link
            href="/settings/boxes"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Add Boxes
          </Link>
        </Card>
      ) : null}

      {packingPlans.length === 0 ? (
        <PackingPlanEmptyState />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-900">All packing plans</h2>
            <NewPackingPlanButton className="px-4 py-2 text-xs" />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <PackingPlanTable
              packingPlans={packingPlans}
              unitSystem={unitSystem}
              onDeleted={(packingPlanId) => {
                setPackingPlans((currentPackingPlans) =>
                  currentPackingPlans.filter((packingPlan) => packingPlan.id !== packingPlanId)
                );
                setCurrentTotalCount((currentCount) => Math.max(currentCount - 1, 0));
              }}
            />
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={currentTotalCount}
            />
          </div>
        </>
      )}
    </div>
  );
}

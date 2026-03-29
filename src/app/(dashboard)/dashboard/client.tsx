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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packing plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            Save packing plans, manage products, and calculate the best box.
          </p>
        </div>
        {packingPlans.length > 0 && <NewPackingPlanButton />}
      </div>

      <UsageWidget subscriptionInfo={subscriptionInfo} />

      {!hasBoxes ? (
        <Card className="flex items-center justify-between gap-4 bg-blue-50 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              Box options are recommended for best-box matching.
            </p>
            <p className="text-sm text-blue-700">
              You can still create packing plans and calculate an ideal custom box.
            </p>
          </div>
          <Link
            href="/settings/boxes"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Boxes
          </Link>
        </Card>
      ) : null}

      {packingPlans.length === 0 ? (
        <PackingPlanEmptyState />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

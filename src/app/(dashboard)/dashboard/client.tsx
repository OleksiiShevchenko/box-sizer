"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { UsageWidget } from "@/components/dashboard/usage-widget";
import { NewShipmentButton } from "@/components/shipments/new-shipment-button";
import { ShipmentEmptyState } from "@/components/shipments/shipment-empty-state";
import { ShipmentTable } from "@/components/shipments/shipment-table";
import type { IShipmentListItem, ISubscriptionInfo, UnitSystem } from "@/types";

interface DashboardClientProps {
  hasBoxes: boolean;
  initialShipments: IShipmentListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  subscriptionInfo: ISubscriptionInfo;
  unitSystem: UnitSystem;
}

export function DashboardClient({
  hasBoxes,
  initialShipments,
  totalCount,
  page,
  pageSize,
  subscriptionInfo,
  unitSystem,
}: DashboardClientProps) {
  const [shipments, setShipments] = useState(initialShipments);
  const [currentTotalCount, setCurrentTotalCount] = useState(totalCount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Save shipments, manage products, and calculate the best packaging.
          </p>
        </div>
        {shipments.length > 0 && <NewShipmentButton />}
      </div>

      <UsageWidget subscriptionInfo={subscriptionInfo} />

      {!hasBoxes ? (
        <Card className="flex items-center justify-between gap-4 bg-blue-50 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              Packaging options are recommended for best-box matching.
            </p>
            <p className="text-sm text-blue-700">
              You can still create shipments and calculate an ideal custom box.
            </p>
          </div>
          <Link
            href="/settings/packaging"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Boxes
          </Link>
        </Card>
      ) : null}

      {shipments.length === 0 ? (
        <ShipmentEmptyState />
      ) : (
        <>
          <ShipmentTable
            shipments={shipments}
            unitSystem={unitSystem}
            onDeleted={(shipmentId) => {
              setShipments((currentShipments) =>
                currentShipments.filter((shipment) => shipment.id !== shipmentId)
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

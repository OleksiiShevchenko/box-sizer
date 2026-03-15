"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { ShipmentEmptyState } from "@/components/shipments/shipment-empty-state";
import { ShipmentTable } from "@/components/shipments/shipment-table";
import type { IShipmentListItem } from "@/types";

interface DashboardClientProps {
  hasBoxes: boolean;
  initialShipments: IShipmentListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function DashboardClient({
  hasBoxes,
  initialShipments,
  totalCount,
  page,
  pageSize,
}: DashboardClientProps) {
  const [shipments, setShipments] = useState(initialShipments);
  const [currentTotalCount, setCurrentTotalCount] = useState(totalCount);

  if (!hasBoxes) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        <Card className="text-center py-12">
          <p className="text-lg text-gray-500 mb-4">
            You should add packaging options first.
          </p>
          <Link
            href="/settings/packaging"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Boxes
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Save shipments, manage products, and calculate the best packaging.
          </p>
        </div>
        <Link
          href="/dashboard/shipments/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          New Shipment
        </Link>
      </div>

      {shipments.length === 0 ? (
        <ShipmentEmptyState />
      ) : (
        <>
          <ShipmentTable
            shipments={shipments}
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

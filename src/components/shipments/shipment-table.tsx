"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteShipment } from "@/actions/shipment-actions";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Tooltip } from "@/components/ui/tooltip";
import type { IShipmentListItem, UnitSystem } from "@/types";
import { cmToInches, kgToLbs } from "@/types";

interface ShipmentTableProps {
  shipments: IShipmentListItem[];
  unitSystem: UnitSystem;
  onDeleted?: (shipmentId: string) => void;
}

function dim(value: number, unit: UnitSystem): string {
  return (unit === "in" ? cmToInches(value) : value).toFixed(1);
}

function formatDimensions(shipment: IShipmentListItem, unit: UnitSystem): string {
  if (!shipment.box) {
    return "Not calculated yet";
  }

  return `${dim(shipment.box.width, unit)} x ${dim(shipment.box.height, unit)} x ${dim(shipment.box.depth, unit)} ${unit}`;
}

export function ShipmentTable({ shipments, unitSystem, onDeleted }: ShipmentTableProps) {
  const [targetShipment, setTargetShipment] = useState<IShipmentListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(): Promise<boolean> {
    if (!targetShipment) {
      return false;
    }

    setDeleting(true);
    setDeleteError("");
    const result = await deleteShipment(targetShipment.id);
    setDeleting(false);

    if (result.success) {
      onDeleted?.(targetShipment.id);
      return true;
    }

    setDeleteError(result.error ?? "Failed to delete shipment");
    return false;
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Box Size</th>
                <th className="px-4 py-3">Dimensional Weight</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="text-sm text-gray-700">
                  <td className="px-4 py-4">
                    <Tooltip
                      content={
                        <div className="space-y-1">
                          {shipment.items.map((item) => (
                            <div key={item.id}>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-gray-300">
                                {dim(item.width, unitSystem)} x {dim(item.height, unitSystem)} x{" "}
                                {dim(item.depth, unitSystem)} {unitSystem}
                              </p>
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <Link
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="font-medium text-gray-900 underline decoration-transparent transition-colors hover:text-blue-600 hover:decoration-blue-600"
                      >
                        {shipment.name}
                      </Link>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-4">{shipment.itemCount}</td>
                  <td className="px-4 py-4">{formatDimensions(shipment, unitSystem)}</td>
                  <td className="px-4 py-4">
                    {shipment.dimensionalWeight != null
                      ? `${(unitSystem === "in" ? kgToLbs(shipment.dimensionalWeight) : shipment.dimensionalWeight).toFixed(1)} ${unitSystem === "in" ? "lbs" : "kg"}`
                      : "Not calculated yet"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTargetShipment(shipment)}
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
        open={Boolean(targetShipment)}
        title="Delete shipment"
        entityName={targetShipment?.name}
        error={deleteError}
        loading={deleting}
        onClose={() => {
          setTargetShipment(null);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

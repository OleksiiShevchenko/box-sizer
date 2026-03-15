import Link from "next/link";
import { Card } from "@/components/ui/card";

export function ShipmentEmptyState() {
  return (
    <Card className="py-12 text-center">
      <h2 className="text-lg font-semibold text-gray-900">No shipments yet</h2>
      <p className="mt-2 text-sm text-gray-500">
        Create your first shipment to save items and calculate the best packaging.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard/shipments/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          New Shipment
        </Link>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { NewShipmentButton } from "@/components/shipments/new-shipment-button";

export function ShipmentEmptyState() {
  return (
    <Card className="py-12 text-center">
      <h2 className="text-lg font-semibold text-gray-900">No shipments yet</h2>
      <p className="mt-2 text-sm text-gray-500">
        Create your first shipment to save items and calculate the best packaging.
      </p>
      <div className="mt-6">
        <NewShipmentButton />
      </div>
    </Card>
  );
}

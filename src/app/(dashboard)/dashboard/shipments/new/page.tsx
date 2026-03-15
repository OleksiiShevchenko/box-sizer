import { redirect } from "next/navigation";
import { createShipment } from "@/actions/shipment-actions";
import { Button } from "@/components/ui/button";

async function createShipmentAndRedirect() {
  "use server";

  const { id } = await createShipment();
  redirect(`/dashboard/shipments/${id}`);
}

export default function NewShipmentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Create Shipment</h1>
        <p className="text-sm text-gray-500">
          Create a shipment record, then add items and calculate the best packaging.
        </p>
      </div>

      <form action={createShipmentAndRedirect}>
        <Button type="submit">Create Shipment</Button>
      </form>
    </div>
  );
}

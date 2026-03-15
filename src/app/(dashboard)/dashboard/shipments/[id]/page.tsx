import { notFound } from "next/navigation";
import { getBoxes } from "@/actions/box-actions";
import { getShipment } from "@/actions/shipment-actions";
import { ShipmentDetailClient } from "@/components/shipments/shipment-detail-client";
import { calculateShipmentPacking } from "@/services/shipment-packing";

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = params instanceof Promise ? await params : params;
  const shipment = await getShipment(id);

  if (!shipment) {
    notFound();
  }

  const boxes = await getBoxes();
  let initialResults = null;

  if (shipment.items.length > 0 && boxes.length > 0) {
    try {
      initialResults = calculateShipmentPacking(boxes, shipment.items, shipment.spacingOverride);
    } catch {
      initialResults = null;
    }
  }

  return <ShipmentDetailClient shipment={shipment} initialResults={initialResults} />;
}

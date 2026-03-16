import { notFound } from "next/navigation";
import { getBoxes } from "@/actions/box-actions";
import { getUnitSystem } from "@/actions/profile-actions";
import { getShipment } from "@/actions/shipment-actions";
import { ShipmentDetailClient } from "@/components/shipments/shipment-detail-client";
import {
  calculateIdealBoxPacking,
  calculateShipmentPacking,
} from "@/services/shipment-packing";

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = params instanceof Promise ? await params : params;
  const [shipment, unitSystem] = await Promise.all([getShipment(id), getUnitSystem()]);

  if (!shipment) {
    notFound();
  }

  const boxes = await getBoxes();
  let initialResults = null;
  let initialIdealResult = null;

  if (shipment.items.length > 0 && boxes.length > 0) {
    try {
      initialResults = calculateShipmentPacking(boxes, shipment.items, shipment.spacingOverride);
    } catch {
      initialResults = null;
    }
  }

  if (shipment.items.length > 0) {
    try {
      initialIdealResult = calculateIdealBoxPacking(
        shipment.items,
        shipment.spacingOverride
      );
    } catch {
      initialIdealResult = null;
    }
  }

  return (
    <ShipmentDetailClient
      shipment={shipment}
      initialResults={initialResults}
      initialIdealResult={initialIdealResult}
      hasBoxes={boxes.length > 0}
      unitSystem={unitSystem}
    />
  );
}

ALTER TABLE "Shipment" RENAME TO "PackingPlan";
ALTER TABLE "ShipmentItem" RENAME TO "PackingPlanItem";

ALTER TABLE "PackingPlanItem" RENAME COLUMN "shipmentId" TO "packingPlanId";

ALTER INDEX "Shipment_userId_idx" RENAME TO "PackingPlan_userId_idx";
ALTER INDEX "Shipment_publicId_idx" RENAME TO "PackingPlan_publicId_idx";
ALTER INDEX "ShipmentItem_shipmentId_idx" RENAME TO "PackingPlanItem_packingPlanId_idx";
ALTER INDEX "ShipmentItem_publicId_idx" RENAME TO "PackingPlanItem_publicId_idx";

ALTER TABLE "PackingPlan" RENAME CONSTRAINT "Shipment_pkey" TO "PackingPlan_pkey";
ALTER TABLE "PackingPlan" RENAME CONSTRAINT "Shipment_publicId_key" TO "PackingPlan_publicId_key";
ALTER TABLE "PackingPlan" RENAME CONSTRAINT "Shipment_userId_fkey" TO "PackingPlan_userId_fkey";
ALTER TABLE "PackingPlan" RENAME CONSTRAINT "Shipment_boxId_fkey" TO "PackingPlan_boxId_fkey";

ALTER TABLE "PackingPlanItem" RENAME CONSTRAINT "ShipmentItem_pkey" TO "PackingPlanItem_pkey";
ALTER TABLE "PackingPlanItem" RENAME CONSTRAINT "ShipmentItem_publicId_key" TO "PackingPlanItem_publicId_key";
ALTER TABLE "PackingPlanItem" RENAME CONSTRAINT "ShipmentItem_shipmentId_fkey" TO "PackingPlanItem_packingPlanId_fkey";

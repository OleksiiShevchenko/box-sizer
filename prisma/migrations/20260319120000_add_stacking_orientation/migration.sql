-- AlterTable
ALTER TABLE "ShipmentItem" ADD COLUMN "canStackOnTop" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ShipmentItem" ADD COLUMN "canBePlacedOnTop" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ShipmentItem" ADD COLUMN "orientation" TEXT NOT NULL DEFAULT 'any';

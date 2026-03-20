CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "Box" ADD COLUMN "publicId" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "publicId" TEXT;
ALTER TABLE "ShipmentItem" ADD COLUMN "publicId" TEXT;

UPDATE "Box" SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL;
UPDATE "Shipment" SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL;
UPDATE "ShipmentItem" SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL;

ALTER TABLE "Box" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "Box" ADD CONSTRAINT "Box_publicId_key" UNIQUE ("publicId");
CREATE INDEX "Box_publicId_idx" ON "Box"("publicId");

ALTER TABLE "Shipment" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_publicId_key" UNIQUE ("publicId");
CREATE INDEX "Shipment_publicId_idx" ON "Shipment"("publicId");

ALTER TABLE "ShipmentItem" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_publicId_key" UNIQUE ("publicId");
CREATE INDEX "ShipmentItem_publicId_idx" ON "ShipmentItem"("publicId");

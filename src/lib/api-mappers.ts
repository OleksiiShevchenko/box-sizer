import type { Box, Prisma, Shipment, ShipmentItem } from "@prisma/client";
import type { PackingResult } from "@/types";

export type ShipmentWithRelations = Prisma.ShipmentGetPayload<{
  include: {
    box: true;
    items: true;
  };
}>;

export function mapBoxToApi(box: Box) {
  return {
    id: box.publicId,
    name: box.name,
    width: box.width,
    height: box.height,
    depth: box.depth,
    spacing: box.spacing,
    maxWeight: box.maxWeight,
    createdAt: box.createdAt.toISOString(),
    updatedAt: box.updatedAt.toISOString(),
  };
}

export function mapShipmentItemToApi(item: ShipmentItem) {
  return {
    id: item.publicId,
    name: item.name,
    width: item.width,
    height: item.height,
    depth: item.depth,
    weight: item.weight,
    canStackOnTop: item.canStackOnTop,
    canBePlacedOnTop: item.canBePlacedOnTop,
    orientation: item.orientation,
  };
}

export function mapShipmentToApi(
  shipment: ShipmentWithRelations | (Shipment & { box?: Box | null; items?: ShipmentItem[] }),
  options?: {
    visualization?: {
      status: "pending" | "ready";
      perspectiveUrl: string;
      frontUrl: string;
      sideUrl: string;
      topUrl: string;
    } | null;
  }
) {
  return {
    id: shipment.publicId,
    name: shipment.name,
    spacingOverride: shipment.spacingOverride,
    dimensionalWeight: shipment.dimensionalWeight,
    box: shipment.box ? mapBoxToApi(shipment.box) : null,
    items: shipment.items?.map(mapShipmentItemToApi) ?? [],
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
    ...(options?.visualization ? { visualization: options.visualization } : {}),
  };
}

export function mapPackingResultToApi(result: PackingResult) {
  const boxWithPublicId = result.box as typeof result.box & { publicId?: string };

  return {
    box: {
      id: boxWithPublicId.publicId ?? result.box.id,
      name: result.box.name,
      width: result.box.width,
      height: result.box.height,
      depth: result.box.depth,
      spacing: result.box.spacing ?? 0,
      maxWeight: result.box.maxWeight ?? null,
    },
    items: result.items.map((item) => ({
      name: item.name,
      width: item.width,
      height: item.height,
      depth: item.depth,
      x: item.x,
      y: item.y,
      z: item.z,
    })),
    dimensionalWeight: result.dimensionalWeight,
  };
}

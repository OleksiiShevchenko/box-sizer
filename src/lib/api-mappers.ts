import type { Box, Prisma, Shipment, ShipmentItem } from "@prisma/client";
import type { PackingResult } from "@/types";
import type { UnitSystem } from "@/types";
import {
  convertDimensionToApi,
  convertDimensionalWeightToApi,
  convertWeightToApi,
} from "@/lib/api-units";

export type ShipmentWithRelations = Prisma.ShipmentGetPayload<{
  include: {
    box: true;
    items: true;
  };
}>;

export function mapBoxToApi(box: Box, unitSystem: UnitSystem) {
  return {
    id: box.publicId,
    name: box.name,
    width: convertDimensionToApi(box.width, unitSystem),
    height: convertDimensionToApi(box.height, unitSystem),
    depth: convertDimensionToApi(box.depth, unitSystem),
    spacing: convertDimensionToApi(box.spacing, unitSystem),
    maxWeight: box.maxWeight == null ? null : convertWeightToApi(box.maxWeight, unitSystem),
    createdAt: box.createdAt.toISOString(),
    updatedAt: box.updatedAt.toISOString(),
  };
}

export function mapShipmentItemToApi(item: ShipmentItem, unitSystem: UnitSystem) {
  return {
    id: item.publicId,
    name: item.name,
    quantity: item.quantity,
    width: convertDimensionToApi(item.width, unitSystem),
    height: convertDimensionToApi(item.height, unitSystem),
    depth: convertDimensionToApi(item.depth, unitSystem),
    weight: item.weight == null ? null : convertWeightToApi(item.weight, unitSystem),
    canStackOnTop: item.canStackOnTop,
    canBePlacedOnTop: item.canBePlacedOnTop,
    orientation: item.orientation,
  };
}

export function mapShipmentToApi(
  shipment: ShipmentWithRelations | (Shipment & { box?: Box | null; items?: ShipmentItem[] }),
  unitSystem: UnitSystem,
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
    spacingOverride:
      shipment.spacingOverride == null
        ? null
        : convertDimensionToApi(shipment.spacingOverride, unitSystem),
    dimensionalWeight:
      shipment.dimensionalWeight == null
        ? null
        : convertDimensionalWeightToApi(shipment.dimensionalWeight, unitSystem),
    box: shipment.box ? mapBoxToApi(shipment.box, unitSystem) : null,
    items: shipment.items?.map((item) => mapShipmentItemToApi(item, unitSystem)) ?? [],
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
    ...(options?.visualization ? { visualization: options.visualization } : {}),
  };
}

export function mapPackingResultToApi(result: PackingResult, unitSystem: UnitSystem) {
  const boxWithPublicId = result.box as typeof result.box & { publicId?: string };

  return {
    box: {
      id: boxWithPublicId.publicId ?? result.box.id,
      name: result.box.name,
      width: convertDimensionToApi(result.box.width, unitSystem),
      height: convertDimensionToApi(result.box.height, unitSystem),
      depth: convertDimensionToApi(result.box.depth, unitSystem),
      spacing: convertDimensionToApi(result.box.spacing ?? 0, unitSystem),
      maxWeight:
        result.box.maxWeight == null ? null : convertWeightToApi(result.box.maxWeight, unitSystem),
    },
    items: result.items.map((item) => ({
      name: item.name,
      width: convertDimensionToApi(item.width, unitSystem),
      height: convertDimensionToApi(item.height, unitSystem),
      depth: convertDimensionToApi(item.depth, unitSystem),
      x: convertDimensionToApi(item.x, unitSystem),
      y: convertDimensionToApi(item.y, unitSystem),
      z: convertDimensionToApi(item.z, unitSystem),
    })),
    dimensionalWeight: convertDimensionalWeightToApi(result.dimensionalWeight, unitSystem),
  };
}

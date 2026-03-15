import { calculatePacking } from "@/services/box-packer";
import type { IBox, IProduct, PackingResult } from "@/types";

export function applySpacingOverride(
  boxes: IBox[],
  spacingOverride: number | null | undefined
): IBox[] {
  if (spacingOverride == null) {
    return boxes;
  }

  return boxes.map((box) => ({
    ...box,
    spacing: spacingOverride,
  }));
}

export function calculateShipmentPacking(
  boxes: IBox[],
  products: IProduct[],
  spacingOverride: number | null | undefined
): PackingResult[] {
  return calculatePacking(applySpacingOverride(boxes, spacingOverride), products);
}

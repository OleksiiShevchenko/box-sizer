export interface IProduct {
  name: string;
  width: number;
  height: number;
  depth: number;
  weight?: number;
}

export interface IBox {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  spacing?: number;
  maxWeight?: number | null;
}

export interface PackedItem {
  name: string;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
}

export interface PackingResult {
  box: IBox;
  items: PackedItem[];
  dimensionalWeight: number;
}

export type UnitSystem = "cm" | "in";

export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function calculateDimensionalWeight(
  width: number,
  height: number,
  depth: number,
  unit: UnitSystem
): number {
  if (unit === "cm") {
    return Math.ceil((width * height * depth) / 5000);
  }
  return Math.ceil((width * height * depth) / 139);
}

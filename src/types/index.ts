export interface IProduct {
  name: string;
  width: number;
  height: number;
  depth: number;
  weight?: number | null;
}

export interface IShipmentItem extends IProduct {
  id: string;
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

export interface IShipment {
  id: string;
  name: string;
  spacingOverride: number | null;
  box: IBox | null;
  dimensionalWeight: number | null;
  items: IShipmentItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipmentListItem {
  id: string;
  name: string;
  spacingOverride: number | null;
  dimensionalWeight: number | null;
  box: IBox | null;
  items: IShipmentItem[];
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfile {
  name: string | null;
  email: string;
  image: string | null;
  isGoogleUser: boolean;
  hasPassword: boolean;
  unitSystem: UnitSystem;
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

export function gramsToOz(grams: number): number {
  return grams / 28.3495;
}

export function ozToGrams(oz: number): number {
  return oz * 28.3495;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
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

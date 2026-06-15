import {
  cmToInches,
  gramsToOz,
  inchesToCm,
  kgToLbs,
  ozToGrams,
  type UnitSystem,
} from "@/types";

export type ApiMeasurementSystem = "metric" | "imperial";

export type ApiMeasurementUnits = {
  unitSystem: UnitSystem;
  dimension: "cm" | "in";
  weight: "g" | "oz";
  dimensionalWeight: "kg" | "lbs";
};

export function normalizeUnitSystem(unitSystem: string | null | undefined): UnitSystem {
  return unitSystem === "in" ? "in" : "cm";
}

export function getMeasurementSystem(unitSystem: UnitSystem): ApiMeasurementSystem {
  return unitSystem === "in" ? "imperial" : "metric";
}

export function getUnitSystemFromMeasurementSystem(
  measurementSystem: ApiMeasurementSystem
): UnitSystem {
  return measurementSystem === "imperial" ? "in" : "cm";
}

export function getMeasurementUnits(unitSystem: UnitSystem): ApiMeasurementUnits {
  return unitSystem === "in"
    ? {
        unitSystem,
        dimension: "in",
        weight: "oz",
        dimensionalWeight: "lbs",
      }
    : {
        unitSystem: "cm",
        dimension: "cm",
        weight: "g",
        dimensionalWeight: "kg",
      };
}

// Values are stored in metric and converted to the account's unit on output. Unit conversion
// (e.g. cm / 2.54) can introduce IEEE-754 noise — a stored 13 in (33.02 cm) reads back as
// 13.000000000000002. Round serialized API values to 6 dp: enough to strip conversion noise
// while preserving any legitimate fractional precision.
const API_MEASUREMENT_PRECISION = 1e6;

function roundApiMeasurement(value: number): number {
  return Math.round(value * API_MEASUREMENT_PRECISION) / API_MEASUREMENT_PRECISION;
}

export function convertDimensionFromApi(value: number, unitSystem: UnitSystem): number {
  return unitSystem === "in" ? inchesToCm(value) : value;
}

export function convertDimensionToApi(value: number, unitSystem: UnitSystem): number {
  return roundApiMeasurement(unitSystem === "in" ? cmToInches(value) : value);
}

export function convertWeightFromApi(value: number, unitSystem: UnitSystem): number {
  return unitSystem === "in" ? ozToGrams(value) : value;
}

export function convertWeightToApi(value: number, unitSystem: UnitSystem): number {
  return roundApiMeasurement(unitSystem === "in" ? gramsToOz(value) : value);
}

export function convertDimensionalWeightToApi(
  value: number,
  unitSystem: UnitSystem
): number {
  return roundApiMeasurement(unitSystem === "in" ? kgToLbs(value) : value);
}

export function convertBoxInputToStorage<T extends {
  width: number;
  height: number;
  depth: number;
  spacing: number;
  maxWeight?: number | null;
}>(input: T, unitSystem: UnitSystem): Omit<T, "width" | "height" | "depth" | "spacing" | "maxWeight"> & {
  width: number;
  height: number;
  depth: number;
  spacing: number;
  maxWeight: number | null;
} {
  return {
    ...input,
    width: convertDimensionFromApi(input.width, unitSystem),
    height: convertDimensionFromApi(input.height, unitSystem),
    depth: convertDimensionFromApi(input.depth, unitSystem),
    spacing: convertDimensionFromApi(input.spacing, unitSystem),
    maxWeight:
      input.maxWeight == null ? null : convertWeightFromApi(input.maxWeight, unitSystem),
  };
}

export function convertPackingPlanItemInputToStorage<T extends {
  width: number;
  height: number;
  depth: number;
  weight?: number | null;
}>(input: T, unitSystem: UnitSystem): Omit<T, "width" | "height" | "depth" | "weight"> & {
  width: number;
  height: number;
  depth: number;
  weight: number | null;
} {
  return {
    ...input,
    width: convertDimensionFromApi(input.width, unitSystem),
    height: convertDimensionFromApi(input.height, unitSystem),
    depth: convertDimensionFromApi(input.depth, unitSystem),
    weight: input.weight == null ? null : convertWeightFromApi(input.weight, unitSystem),
  };
}

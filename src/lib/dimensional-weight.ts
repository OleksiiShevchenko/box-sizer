import type { UnitSystem } from "@/types";

export type DimensionalWeightCarrier = "UPS" | "FedEx" | "USPS" | "DHL";

interface CarrierDimensionalWeightConfig {
  label: DimensionalWeightCarrier;
  imperialDivisor: number;
  metricDivisor: number;
  minimumCubicInches?: number;
  minimumCubicCentimeters?: number;
}

export const DIMENSIONAL_WEIGHT_DIVISORS: Record<
  DimensionalWeightCarrier,
  CarrierDimensionalWeightConfig
> = {
  UPS: {
    label: "UPS",
    imperialDivisor: 139,
    metricDivisor: 5000,
  },
  FedEx: {
    label: "FedEx",
    imperialDivisor: 139,
    metricDivisor: 5000,
  },
  USPS: {
    label: "USPS",
    imperialDivisor: 166,
    metricDivisor: 6000,
    minimumCubicInches: 1728,
    minimumCubicCentimeters: 1728 * 2.54 ** 3,
  },
  DHL: {
    label: "DHL",
    imperialDivisor: 139,
    metricDivisor: 5000,
  },
};

export interface DimensionalWeightInput {
  unitSystem: UnitSystem;
  actualWeight?: number;
  length: number;
  width: number;
  height: number;
}

export interface CarrierDimensionalWeightResult {
  carrier: DimensionalWeightCarrier;
  actualWeight: number | null;
  dimensionalWeight: number;
  billableWeight: number;
  divisor: number;
  roundedDimensions: {
    length: number;
    width: number;
    height: number;
  };
  appliesDimensionalWeight: boolean;
}

export function calculateCarrierDimensionalWeights({
  unitSystem,
  actualWeight,
  length,
  width,
  height,
}: DimensionalWeightInput): CarrierDimensionalWeightResult[] {
  const roundedDimensions = {
    length: Math.round(length),
    width: Math.round(width),
    height: Math.round(height),
  };
  const volume =
    roundedDimensions.length * roundedDimensions.width * roundedDimensions.height;

  return Object.values(DIMENSIONAL_WEIGHT_DIVISORS).map((config) => {
    const divisor = unitSystem === "in" ? config.imperialDivisor : config.metricDivisor;
    const minimumVolume =
      unitSystem === "in"
        ? config.minimumCubicInches
        : config.minimumCubicCentimeters;
    const appliesDimensionalWeight =
      minimumVolume == null || volume > minimumVolume;
    const dimensionalWeight = appliesDimensionalWeight
      ? Math.ceil(volume / divisor)
      : 0;

    return {
      carrier: config.label,
      actualWeight: actualWeight ?? null,
      dimensionalWeight,
      billableWeight:
        actualWeight == null
          ? dimensionalWeight
          : Math.max(actualWeight, dimensionalWeight),
      divisor,
      roundedDimensions,
      appliesDimensionalWeight,
    };
  });
}

export function getDimensionalWeightUnitLabel(unitSystem: UnitSystem): "kg" | "lb" {
  return unitSystem === "in" ? "lb" : "kg";
}

export function getDimensionUnitLabel(unitSystem: UnitSystem): "cm" | "in" {
  return unitSystem === "in" ? "in" : "cm";
}

export function getDimensionalWeightDivisorDescription(
  result: CarrierDimensionalWeightResult,
  unitSystem: UnitSystem
): string {
  const dimensionUnit = getDimensionUnitLabel(unitSystem);
  const weightUnit = getDimensionalWeightUnitLabel(unitSystem);
  const uspsThreshold =
    result.carrier === "USPS"
      ? ` USPS DIM pricing only applies above 1 cubic foot (${unitSystem === "in" ? "1,728 cubic inches" : "28,317 cubic centimeters"}).`
      : "";

  return `${result.carrier} divisor: ${result.divisor} ${dimensionUnit}^3 per ${weightUnit}. Dimensions are rounded to the nearest whole ${dimensionUnit} before calculation.${uspsThreshold}`;
}

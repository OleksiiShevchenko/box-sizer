import type { UnitSystem } from "@/types";

export const IMPERIAL_COUNTRIES = new Set(["US", "LR", "MM"]);

export function detectUnitSystemFromLocale(locale: string | null | undefined): UnitSystem {
  const countryCode = locale?.split("-").pop()?.toUpperCase() ?? "";
  return IMPERIAL_COUNTRIES.has(countryCode) ? "in" : "cm";
}

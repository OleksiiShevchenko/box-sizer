import { Tooltip } from "@/components/ui/tooltip";
import {
  calculateCarrierDimensionalWeights,
  getDimensionalWeightDivisorDescription,
  getDimensionalWeightUnitLabel,
} from "@/lib/dimensional-weight";
import type { UnitSystem } from "@/types";
import { cmToInches } from "@/types";

interface CarrierDimensionalWeightListProps {
  widthCm: number;
  heightCm: number;
  depthCm: number;
  unitSystem: UnitSystem;
}

function displayDimension(valueCm: number, unitSystem: UnitSystem): number {
  return unitSystem === "in" ? cmToInches(valueCm) : valueCm;
}

export function CarrierDimensionalWeightList({
  widthCm,
  heightCm,
  depthCm,
  unitSystem,
}: CarrierDimensionalWeightListProps) {
  const weightUnit = getDimensionalWeightUnitLabel(unitSystem);
  const results = calculateCarrierDimensionalWeights({
    unitSystem,
    length: displayDimension(widthCm, unitSystem),
    width: displayDimension(heightCm, unitSystem),
    height: displayDimension(depthCm, unitSystem),
  });

  return (
    <div className="border-t border-slate-200 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">
        Carrier dimensional weight
      </p>
      <dl className="grid gap-2 sm:grid-cols-2">
        {results.map((result) => (
          <div
            key={result.carrier}
            className="flex min-h-8 items-center justify-between gap-3 text-sm"
          >
            <dt className="flex items-center gap-1 text-gray-500">
              {result.carrier}
              <Tooltip
                content={getDimensionalWeightDivisorDescription(result, unitSystem)}
              >
                <span
                  className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold leading-none text-slate-500"
                  aria-label={`${result.carrier} dimensional weight divisor`}
                >
                  i
                </span>
              </Tooltip>
            </dt>
            <dd className="font-semibold text-gray-900">
              {result.appliesDimensionalWeight
                ? `${result.dimensionalWeight} ${weightUnit}`
                : "Not applied"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

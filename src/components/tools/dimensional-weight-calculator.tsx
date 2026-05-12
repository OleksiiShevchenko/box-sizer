"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  calculateCarrierDimensionalWeights,
  getDimensionalWeightDivisorDescription,
  getDimensionalWeightUnitLabel,
  getDimensionUnitLabel,
  type CarrierDimensionalWeightResult,
  type DimensionalWeightCarrier,
} from "@/lib/dimensional-weight";
import { detectUnitSystemFromLocale } from "@/lib/unit-system";
import type { UnitSystem } from "@/types";

type FieldName = "actualWeight" | "length" | "width" | "height";

type FormValues = Record<FieldName, string>;

const EMPTY_VALUES: FormValues = {
  actualWeight: "",
  length: "",
  width: "",
  height: "",
};

const FIELD_LABELS: Record<FieldName, string> = {
  actualWeight: "Actual package weight",
  length: "Package length",
  width: "Package width",
  height: "Package height",
};

const CARRIER_LOGOS: Record<DimensionalWeightCarrier, string> = {
  UPS: "/carrier-logos/ups.png",
  FedEx: "/carrier-logos/fedex.png",
  USPS: "/carrier-logos/usps.png",
  DHL: "/carrier-logos/dhl.png",
};

function parsePositiveNumber(value: string): number | null {
  if (value.trim() === "") return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return parsed;
}

function formatInputValue(value: number): string {
  return String(Number(value.toFixed(2)));
}

function convertValue(value: string, converter: (value: number) => number): string {
  const parsed = parsePositiveNumber(value);
  if (parsed == null) return value;
  return formatInputValue(converter(parsed));
}

function toAnalyticsPayload(
  unitSystem: UnitSystem,
  values: FormValues,
  results: CarrierDimensionalWeightResult[] | null
) {
  const actualWeight = parsePositiveNumber(values.actualWeight);
  const dimensions = {
    length: parsePositiveNumber(values.length),
    width: parsePositiveNumber(values.width),
    height: parsePositiveNumber(values.height),
  };
  const highestDimensionalWeight = results
    ? Math.max(...results.map((result) => result.dimensionalWeight))
    : null;
  const highestBillableWeight = results
    ? Math.max(...results.map((result) => result.billableWeight))
    : null;

  return {
    unit_system: unitSystem,
    actual_weight: actualWeight,
    package_dimensions: dimensions,
    highest_dimensional_weight: highestDimensionalWeight,
    highest_billable_weight: highestBillableWeight,
    dimensional_weight_exceeds_actual_weight:
      highestDimensionalWeight != null && actualWeight != null
        ? highestDimensionalWeight > actualWeight
        : null,
  };
}

function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function DimensionalWeightCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("cm");
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<CarrierDimensionalWeightResult[] | null>(null);

  useEffect(() => {
    const detectedUnitSystem = detectUnitSystemFromLocale(navigator.language);
    setUnitSystem(detectedUnitSystem);
    posthog.capture(
      "dimensional_weight_calculator_viewed",
      toAnalyticsPayload(detectedUnitSystem, values, null)
    );
    // The view event should fire once with the browser-derived default unit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validationErrors = useMemo(() => {
    return (Object.keys(values) as FieldName[]).reduce<Partial<Record<FieldName, string>>>(
      (errors, field) => {
        if (values[field].trim() === "") {
          errors[field] = `Enter ${FIELD_LABELS[field].toLowerCase()}.`;
          return errors;
        }

        if (parsePositiveNumber(values[field]) == null) {
          errors[field] = "Enter a number greater than 0.";
        }

        return errors;
      },
      {}
    );
  }, [values]);

  const canCalculate = Object.keys(validationErrors).length === 0;
  const weightUnit = getDimensionalWeightUnitLabel(unitSystem);
  const dimensionUnit = getDimensionUnitLabel(unitSystem);

  function handleUnitChange(nextUnitSystem: UnitSystem) {
    if (nextUnitSystem === unitSystem) return;

    const nextValues =
      nextUnitSystem === "in"
        ? {
            actualWeight: convertValue(values.actualWeight, (value) => value * 2.20462),
            length: convertValue(values.length, (value) => value / 2.54),
            width: convertValue(values.width, (value) => value / 2.54),
            height: convertValue(values.height, (value) => value / 2.54),
          }
        : {
            actualWeight: convertValue(values.actualWeight, (value) => value / 2.20462),
            length: convertValue(values.length, (value) => value * 2.54),
            width: convertValue(values.width, (value) => value * 2.54),
            height: convertValue(values.height, (value) => value * 2.54),
          };

    posthog.capture(
      "dimensional_weight_units_changed",
      toAnalyticsPayload(nextUnitSystem, nextValues, null)
    );

    setValues(nextValues);
    setUnitSystem(nextUnitSystem);
    setResults(null);
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setTouched({
      actualWeight: true,
      length: true,
      width: true,
      height: true,
    });

    if (!canCalculate) return;

    const nextResults = calculateCarrierDimensionalWeights({
      unitSystem,
      actualWeight: Number(values.actualWeight),
      length: Number(values.length),
      width: Number(values.width),
      height: Number(values.height),
    });

    setResults(nextResults);
    posthog.capture(
      "dimensional_weight_calculated",
      toAnalyticsPayload(unitSystem, values, nextResults)
    );
  }

  const dimensionalWeightWins =
    results != null &&
    Math.max(...results.map((result) => result.dimensionalWeight)) >
      Number(values.actualWeight);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <form
        onSubmit={handleCalculate}
        className="rounded-lg border border-outline-variant/70 bg-white p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-on-background">
              Package details
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Enter the packed box size and actual scale weight.
            </p>
          </div>
          <div
            className="inline-flex w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-1 sm:w-auto"
            aria-label="Unit system"
          >
            <button
              type="button"
              onClick={() => handleUnitChange("in")}
              className={`min-h-10 flex-1 rounded-md px-4 text-sm font-semibold transition-colors sm:flex-none ${
                unitSystem === "in"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-background"
              }`}
            >
              Imperial
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange("cm")}
              className={`min-h-10 flex-1 rounded-md px-4 text-sm font-semibold transition-colors sm:flex-none ${
                unitSystem === "cm"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-background"
              }`}
            >
              Metric
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {(Object.keys(FIELD_LABELS) as FieldName[]).map((field) => {
            const showError = submitted || touched[field];
            const unit = field === "actualWeight" ? weightUnit : dimensionUnit;
            const error = showError ? validationErrors[field] : undefined;

            return (
              <div key={field} className="space-y-1.5">
                <label
                  htmlFor={`dimensional-weight-${field}`}
                  className="block text-sm font-semibold text-slate-800"
                >
                  {FIELD_LABELS[field]} ({unit})
                </label>
                <input
                  id={`dimensional-weight-${field}`}
                  name={field}
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={values[field]}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }));
                    setResults(null);
                  }}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      [field]: true,
                    }))
                  }
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={
                    error ? `dimensional-weight-${field}-error` : undefined
                  }
                  className={`block min-h-11 w-full rounded-lg border px-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    error
                      ? "border-red-600 focus:border-red-600 focus:ring-red-600/10"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/15"
                  }`}
                />
                {error ? (
                  <p
                    id={`dimensional-weight-${field}-error`}
                    className="text-xs font-medium text-red-600"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={!canCalculate}
        >
          Calculate
        </Button>
      </form>

      <section aria-labelledby="dimensional-weight-results-heading">
        <div className="rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2
              id="dimensional-weight-results-heading"
              className="text-2xl font-extrabold text-on-background"
            >
              Estimated billable weight
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Compare actual weight with dimensional weight by carrier.
            </p>
          </div>

          {results ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((result) => (
                <article
                  key={result.carrier}
                  className="rounded-lg border border-slate-200 bg-white p-5"
                >
                  <h3 className="flex h-[50px] items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={CARRIER_LOGOS[result.carrier]}
                      alt=""
                      className="h-[50px] w-[100px] object-contain"
                    />
                    <span className="sr-only">{result.carrier}</span>
                  </h3>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-on-surface-variant">Actual weight</dt>
                      <dd className="font-bold text-on-background">
                        {result.actualWeight == null
                          ? "Not provided"
                          : `${formatWeight(result.actualWeight)} ${weightUnit}`}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex items-center gap-1 text-on-surface-variant">
                        Dimensional weight
                        <Tooltip
                          content={getDimensionalWeightDivisorDescription(
                            result,
                            unitSystem
                          )}
                        >
                          <span
                            className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold leading-none text-slate-500"
                            aria-label={`${result.carrier} dimensional weight divisor`}
                          >
                            i
                          </span>
                        </Tooltip>
                      </dt>
                      <dd className="font-bold text-on-background">
                        {result.appliesDimensionalWeight
                          ? `${result.dimensionalWeight} ${weightUnit}`
                          : "Not applied"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                      <dt className="font-semibold text-on-background">
                        Billable weight
                      </dt>
                      <dd className="font-extrabold text-primary">
                        {formatWeight(result.billableWeight)} {weightUnit}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-outline-variant bg-white px-6 text-center">
              <p className="max-w-sm text-sm leading-6 text-on-surface-variant">
                Results will appear here after you enter positive dimensions,
                actual weight, and calculate.
              </p>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-on-surface-variant">
            Dimensional weight rules vary by carrier, service, destination, and
            contract. These results are estimates and should be verified with the
            carrier.
          </p>
        </div>

        {results ? (
          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-5">
            <h2 className="text-lg font-extrabold text-slate-950">
              What this means
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {dimensionalWeightWins
                ? "This package is billed by dimensional weight because it takes up more space than its actual weight suggests."
                : "This package is billed by actual weight because it is heavier than its dimensional weight."}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
              Next step: dimensional weight tells you the billing weight.
              Packwell helps you find the right box before checkout.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

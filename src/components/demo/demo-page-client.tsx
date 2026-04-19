"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { Card } from "@/components/ui/card";
import { calculateDemoPacking } from "@/actions/demo-actions";
import { PackingPlanResultPanel } from "@/components/packing-plans/packing-plan-result-panel";
import {
  DEMO_MAX_ITEM_QUANTITY,
  DEMO_MAX_TOTAL_UNITS,
  DEMO_SCENARIOS,
  type DemoScenario,
  type DemoScenarioId,
} from "@/lib/demo-scenarios";
import { DemoOrderForm, type DemoDraftItem } from "./demo-order-form";
import { DemoResultActions } from "./demo-result-actions";
import { DemoScenarioSelector } from "./demo-scenario-selector";
import { DemoStepper } from "./demo-stepper";
import type { PackingResult } from "@/types";

interface DemoHistoryState {
  __demoFlow: true;
  step: 1 | 2 | 3;
  scenarioId: DemoScenarioId | null;
  draftItems: DemoDraftItem[];
  results: PackingResult[] | null;
  idealResult: PackingResult | null;
}

function createDraftItems(scenario: DemoScenario): DemoDraftItem[] {
  return scenario.items.map((item) => ({
    id: item.id,
    name: item.name,
    widthIn: item.widthIn,
    heightIn: item.heightIn,
    depthIn: item.depthIn,
    weightOz: item.weightOz,
    quantity: String(item.quantity),
  }));
}

function parseQuantities(items: DemoDraftItem[]): {
  quantities?: Record<string, number>;
  fieldErrors: Record<string, string>;
  formError?: string;
} {
  const fieldErrors: Record<string, string> = {};
  const quantities: Record<string, number> = {};

  for (const item of items) {
    const trimmedQuantity = item.quantity.trim();
    if (!trimmedQuantity) {
      fieldErrors[item.id] = "Quantity is required";
      continue;
    }

    const quantity = Number(trimmedQuantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      fieldErrors[item.id] = "Quantity must be at least 1";
      continue;
    }

    if (quantity > DEMO_MAX_ITEM_QUANTITY) {
      fieldErrors[item.id] = `Quantity must be ${DEMO_MAX_ITEM_QUANTITY} or less`;
      continue;
    }

    quantities[item.id] = quantity;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const totalUnits = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  if (totalUnits > DEMO_MAX_TOTAL_UNITS) {
    return {
      fieldErrors,
      formError: `Demo requests are limited to ${DEMO_MAX_TOTAL_UNITS} total units.`,
    };
  }

  return { quantities, fieldErrors };
}

export function DemoPageClient() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<DemoScenarioId | null>(null);
  const [draftItems, setDraftItems] = useState<DemoDraftItem[]>([]);
  const [results, setResults] = useState<PackingResult[] | null>(null);
  const [idealResult, setIdealResult] = useState<PackingResult | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const hasTrackedStart = useRef(false);
  const lastTrackedResultKey = useRef<string | null>(null);

  const selectedScenario = useMemo(
    () => DEMO_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? null,
    [selectedScenarioId]
  );

  function createHistoryState(
    step: 1 | 2 | 3 = currentStep,
    scenarioId: DemoScenarioId | null = selectedScenarioId,
    nextDraftItems: DemoDraftItem[] = draftItems,
    nextResults: PackingResult[] | null = results,
    nextIdealResult: PackingResult | null = idealResult
  ): DemoHistoryState {
    return {
      __demoFlow: true,
      step,
      scenarioId,
      draftItems: nextDraftItems,
      results: nextResults,
      idealResult: nextIdealResult,
    };
  }

  function applyHistoryState(state: DemoHistoryState) {
    setCurrentStep(state.step);
    setSelectedScenarioId(state.scenarioId);
    setDraftItems(state.draftItems);
    setResults(state.results);
    setIdealResult(state.idealResult);
    setError("");
    setFieldErrors({});
    setLoading(false);
  }

  useEffect(() => {
    if (hasTrackedStart.current) {
      return;
    }

    hasTrackedStart.current = true;
    posthog.capture("demo_started");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const initialState =
      window.history.state && window.history.state.__demoFlow
        ? (window.history.state as DemoHistoryState)
        : createHistoryState(1, null, [], null, null);

    window.history.replaceState(initialState, "", window.location.href);
    if (
      initialState.step !== 1 ||
      initialState.scenarioId !== null ||
      initialState.draftItems.length > 0 ||
      initialState.results !== null ||
      initialState.idealResult !== null
    ) {
      applyHistoryState(initialState);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.__demoFlow) {
        applyHistoryState(event.state as DemoHistoryState);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.history.replaceState(createHistoryState(), "", window.location.href);
  }, [currentStep, selectedScenarioId, draftItems, results, idealResult]);

  useEffect(() => {
    if (currentStep !== 3 || !selectedScenario) {
      return;
    }

    const recommendedBoxName = results?.[0]?.box.name ?? idealResult?.box.name ?? null;
    const resultKey = JSON.stringify({
      scenarioId: selectedScenario.id,
      resultsCount: results?.length ?? 0,
      recommendedBoxName,
      idealBoxName: idealResult?.box.name ?? null,
    });

    if (lastTrackedResultKey.current === resultKey) {
      return;
    }

    lastTrackedResultKey.current = resultKey;
    posthog.capture("demo_result_viewed", {
      preset_id: selectedScenario.id,
      preset_name: selectedScenario.name,
      results_count: results?.length ?? 0,
      recommended_box_name: recommendedBoxName,
    });
  }, [currentStep, idealResult, results, selectedScenario]);

  function resetDemoFlow() {
    const nextState = createHistoryState(1, null, [], null, null);
    window.history.pushState(nextState, "", window.location.href);
    applyHistoryState(nextState);
    setError("");
    setFieldErrors({});
    setLoading(false);
  }

  function handleSelectScenario(scenario: DemoScenario) {
    const nextDraftItems = createDraftItems(scenario);
    const nextState = createHistoryState(2, scenario.id, nextDraftItems, null, null);
    window.history.pushState(nextState, "", window.location.href);
    applyHistoryState(nextState);
    setError("");
    setFieldErrors({});
    posthog.capture("preset_selected", {
      preset_id: scenario.id,
      preset_name: scenario.name,
    });
  }

  function handleQuantityChange(itemId: string, quantity: string) {
    setDraftItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[itemId];
      return nextErrors;
    });
    setError("");
  }

  function handleDelete(itemId: string) {
    setDraftItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[itemId];
      return nextErrors;
    });
    setError("");
  }

  function handleStepSelect(step: 1 | 2 | 3) {
    if (step === currentStep) {
      return;
    }

    if (step === 1) {
      const nextState = createHistoryState(1, null, [], null, null);
      window.history.pushState(nextState, "", window.location.href);
      applyHistoryState(nextState);
      setError("");
      setFieldErrors({});
      setLoading(false);
      return;
    }

    if (!selectedScenario) {
      return;
    }

    if (step === 2) {
      const nextState = createHistoryState(2, selectedScenario.id, draftItems, null, null);
      window.history.pushState(nextState, "", window.location.href);
      applyHistoryState(nextState);
      setError("");
      setFieldErrors({});
      setLoading(false);
      return;
    }

    if (step === 3 && (results || idealResult)) {
      const nextState = createHistoryState(3, selectedScenario.id, draftItems, results, idealResult);
      window.history.pushState(nextState, "", window.location.href);
      applyHistoryState(nextState);
    }
  }

  async function handleCalculate() {
    if (!selectedScenario) {
      return;
    }

    if (draftItems.length === 0) {
      setError("Select at least one item to continue.");
      return;
    }

    const parsed = parseQuantities(draftItems);
    setFieldErrors(parsed.fieldErrors);
    if (!parsed.quantities) {
      setError(parsed.formError ?? "Fix the highlighted quantities to continue.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await calculateDemoPacking({
      scenarioId: selectedScenario.id,
      quantities: parsed.quantities,
    });
    setLoading(false);

    if (result.error) {
      setResults(null);
      setIdealResult(result.idealResult ?? null);
      setError(result.error);
      return;
    }

    setResults(result.results);
    setIdealResult(result.idealResult);
    const nextState = createHistoryState(
      3,
      selectedScenario.id,
      draftItems,
      result.results,
      result.idealResult
    );
    window.history.pushState(nextState, "", window.location.href);
    applyHistoryState(nextState);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="shrink-0">
            <PackwellLogo className="h-8 w-auto text-slate-900" />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium tracking-tight md:flex">
            <Link href="/#features" className="text-slate-600 transition-colors hover:text-blue-600">
              Product
            </Link>
            <Link href="/#use-cases" className="text-slate-600 transition-colors hover:text-blue-600">
              Use Cases
            </Link>
            <Link href="/#how-it-works" className="text-slate-600 transition-colors hover:text-blue-600">
              How it works
            </Link>
            <Link href="/#pricing" className="text-slate-600 transition-colors hover:text-blue-600">
              Pricing
            </Link>
            <Link
              href="/api/v1/docs#description/introduction"
              className="text-slate-600 transition-colors hover:text-blue-600"
            >
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">Try Packwell on a sample order</h1>
          <p className="max-w-3xl text-lg text-slate-600">
            You provide item dimensions. Packwell returns the best box, dimensional weight, and a 3D packing plan.
          </p>
        </div>

        <DemoStepper currentStep={currentStep} onStepSelect={handleStepSelect} />

        {currentStep === 1 ? (
          <DemoScenarioSelector scenarios={DEMO_SCENARIOS} onSelect={handleSelectScenario} />
        ) : selectedScenario ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <DemoOrderForm
              scenario={selectedScenario}
              items={draftItems}
              loading={loading}
              error={error}
              fieldErrors={fieldErrors}
              onQuantityChange={handleQuantityChange}
              onDelete={handleDelete}
              onCalculate={handleCalculate}
            />

            <div className="space-y-4">
              <PackingPlanResultPanel
                results={results}
                idealResult={idealResult}
                unitSystem="in"
              />
              {currentStep === 3 ? (
                <DemoResultActions
                  scenario={selectedScenario}
                  onSignupClick={(scenario) => {
                    posthog.capture("signup_clicked_after_demo", {
                      preset_id: scenario.id,
                      preset_name: scenario.name,
                    });
                  }}
                  onBookDemoClick={(scenario) => {
                    posthog.capture("book_demo_clicked_after_demo", {
                      preset_id: scenario.id,
                      preset_name: scenario.name,
                    });
                  }}
                  onStartOver={resetDemoFlow}
                />
              ) : (
                <Card className="min-h-[120px] text-sm text-slate-500">
                  Update quantities on the left and calculate a box to see the packing result.
                </Card>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

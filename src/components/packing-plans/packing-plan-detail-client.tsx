"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PackingPlanDetailForm } from "@/components/packing-plans/packing-plan-detail-form";
import { PackingPlanResultPanel } from "@/components/packing-plans/packing-plan-result-panel";
import type { IPackingPlan, PackingResult, UnitSystem } from "@/types";

interface PackingPlanDetailClientProps {
  packingPlan: IPackingPlan;
  initialResults: PackingResult[] | null;
  initialIdealResult: PackingResult | null;
  hasBoxes: boolean;
  unitSystem: UnitSystem;
}

export function PackingPlanDetailClient({
  packingPlan,
  initialResults,
  initialIdealResult,
  hasBoxes,
  unitSystem,
}: PackingPlanDetailClientProps) {
  const [packingPlanName, setPackingPlanName] = useState(packingPlan.name);
  const [results, setResults] = useState<PackingResult[] | null>(initialResults);
  const [idealResult, setIdealResult] = useState<PackingResult | null>(initialIdealResult);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Packing plans", href: "/dashboard" },
          { label: packingPlanName || "Untitled Packing Plan" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <PackingPlanDetailForm
          packingPlan={packingPlan}
          hasBoxes={hasBoxes}
          unitSystem={unitSystem}
          onNameChange={setPackingPlanName}
          onCalculated={(nextName, nextResults, nextIdealResult) => {
            setPackingPlanName(nextName);
            setResults(nextResults);
            setIdealResult(nextIdealResult);
          }}
        />
        <PackingPlanResultPanel
          results={results}
          idealResult={idealResult}
          unitSystem={unitSystem}
        />
      </div>
    </div>
  );
}

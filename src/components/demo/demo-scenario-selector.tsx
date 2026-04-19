"use client";

import { Card } from "@/components/ui/card";
import type { DemoScenario } from "@/lib/demo-scenarios";

interface DemoScenarioSelectorProps {
  scenarios: DemoScenario[];
  onSelect: (scenario: DemoScenario) => void;
}

export function DemoScenarioSelector({
  scenarios,
  onSelect,
}: DemoScenarioSelectorProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2" data-testid="demo-scenario-selector">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          className="text-left"
          onClick={() => onSelect(scenario)}
          data-testid={`scenario-card-${scenario.id}`}
        >
          <Card className="h-full overflow-hidden p-0 transition-shadow hover:shadow-md">
            <img
              src={scenario.imageSrc}
              alt={`${scenario.name} illustration`}
              className="h-[16.5rem] w-full object-cover"
            />
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">{scenario.name}</h2>
                <p className="text-sm text-slate-600">{scenario.description}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Included items
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {scenario.items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

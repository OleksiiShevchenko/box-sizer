"use client";

import Image from "next/image";
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
          className="group text-left"
          onClick={() => onSelect(scenario)}
          data-testid={`scenario-card-${scenario.id}`}
        >
          <Card className="h-full overflow-hidden p-0 transition-shadow hover:shadow-md">
            <Image
              src={scenario.imageSrc}
              alt={`${scenario.name} illustration`}
              width={1696}
              height={960}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full object-cover sm:h-[16.5rem]"
            />
            <div className="flex h-full flex-col gap-5 p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">{scenario.name}</h2>
                <p className="text-sm text-slate-600">{scenario.description}</p>
              </div>
              <span className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-blue-700">
                Select
              </span>
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

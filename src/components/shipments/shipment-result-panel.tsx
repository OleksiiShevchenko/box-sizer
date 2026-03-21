"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BoxVisualization3D } from "@/components/calculator/box-visualization-3d";
import type { PackingResult, UnitSystem } from "@/types";
import { cmToInches, kgToLbs } from "@/types";

interface ShipmentResultPanelProps {
  results: PackingResult[] | null;
  idealResult: PackingResult | null;
  unitSystem: UnitSystem;
}

function ResultCards({
  results,
  unitSystem,
  title,
  banner,
}: {
  results: PackingResult[];
  unitSystem: UnitSystem;
  title: string;
  banner?: string;
}) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{banner}</div>
      ) : null}

      {results.length > 1 ? (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          The shipment requires {results.length} boxes.
        </div>
      ) : null}

      {results.map((result, index) => (
        <Card key={`${result.box.id}-${index}`} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {results.length > 1 ? `Box ${index + 1}` : title}: {result.box.name}
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-500">Dimensions</dt>
              <dd className="text-gray-900">
                {(unitSystem === "in" ? cmToInches(result.box.width) : result.box.width).toFixed(1)} x{" "}
                {(unitSystem === "in" ? cmToInches(result.box.height) : result.box.height).toFixed(1)} x{" "}
                {(unitSystem === "in" ? cmToInches(result.box.depth) : result.box.depth).toFixed(1)} {unitSystem}
              </dd>
              <dt className="text-gray-500">Dimensional weight</dt>
              <dd className="text-gray-900">
                {(unitSystem === "in" ? kgToLbs(result.dimensionalWeight) : result.dimensionalWeight).toFixed(1)} {unitSystem === "in" ? "lbs" : "kg"}
              </dd>
              <dt className="text-gray-500">Items packed</dt>
              <dd className="text-gray-900">
                {result.items.length} unit{result.items.length === 1 ? "" : "s"}
              </dd>
            </dl>
          </div>

          <BoxVisualization3D result={result} unit={unitSystem} size="large" />
        </Card>
      ))}
    </div>
  );
}

export function ShipmentResultPanel({
  results,
  idealResult,
  unitSystem,
}: ShipmentResultPanelProps) {
  const [activeTab, setActiveTab] = useState<"best" | "ideal">("best");

  if ((!results || results.length === 0) && !idealResult) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center text-center">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">No result yet</h2>
          <p className="text-sm text-gray-500">
            Add items on the left and calculate a box to see the packing result.
          </p>
        </div>
      </Card>
    );
  }

  if ((!results || results.length === 0) && idealResult) {
    return (
      <ResultCards
        results={[idealResult]}
        unitSystem={unitSystem}
        title="Ideal Custom Box"
      />
    );
  }

  if (!idealResult || !results || results.length === 0) {
    return (
      <ResultCards
        results={results ?? []}
        unitSystem={unitSystem}
        title="Recommended Box"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            type="button"
            className={`pb-3 text-sm ${
              activeTab === "best"
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("best")}
          >
            Best Available Box
          </button>
          <button
            type="button"
            className={`pb-3 text-sm ${
              activeTab === "ideal"
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("ideal")}
          >
            Ideal Custom Box
          </button>
        </div>
      </div>

      {activeTab === "best" ? (
        <ResultCards
          results={results}
          unitSystem={unitSystem}
          title="Recommended Box"
        />
      ) : (
        <ResultCards
          results={[idealResult]}
          unitSystem={unitSystem}
          title="Ideal Custom Box"
          banner="Adding a box with these dimensions to your packaging options could reduce shipping costs."
        />
      )}
    </div>
  );
}

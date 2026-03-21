"use client";

import { Card } from "@/components/ui/card";
import { BoxVisualization } from "./box-visualization";
import type { PackingResult, UnitSystem } from "@/types";
import { cmToInches, calculateDimensionalWeight } from "@/types";

interface ResultDisplayProps {
  results: PackingResult[];
  unit: UnitSystem;
}

function dim(v: number, unit: UnitSystem): string {
  if (unit === "in") return cmToInches(v).toFixed(1);
  return v.toFixed(1);
}

export function ResultDisplay({ results, unit }: ResultDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Packing Result{results.length > 1 ? "s" : ""}
      </h3>

      {results.length > 1 && (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          Items don&apos;t fit in a single box. {results.length} boxes needed.
        </p>
      )}

      {results.map((result, i) => {
        const dimWeight = calculateDimensionalWeight(
          result.box.width,
          result.box.height,
          result.box.depth,
          unit
        );

        return (
          <Card key={i}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {results.length > 1 ? `Box ${i + 1}: ` : ""}
                  {result.box.name}
                </h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-500">Dimensions</dt>
                  <dd className="text-gray-900">
                    {dim(result.box.width, unit)} x {dim(result.box.height, unit)} x{" "}
                    {dim(result.box.depth, unit)} {unit}
                  </dd>
                  <dt className="text-gray-500">Dimensional Weight</dt>
                  <dd className="text-gray-900">{dimWeight} kg</dd>
                  <dt className="text-gray-500">Items</dt>
                  <dd className="text-gray-900">
                    {result.items.length} unit{result.items.length === 1 ? "" : "s"}
                  </dd>
                </dl>
              </div>
              <BoxVisualization result={result} unit={unit} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

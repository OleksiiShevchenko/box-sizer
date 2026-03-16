import { Card } from "@/components/ui/card";
import { BoxVisualization3D } from "@/components/calculator/box-visualization-3d";
import type { PackingResult, UnitSystem } from "@/types";
import { cmToInches, kgToLbs } from "@/types";

interface ShipmentResultPanelProps {
  results: PackingResult[] | null;
  unitSystem: UnitSystem;
}

export function ShipmentResultPanel({ results, unitSystem }: ShipmentResultPanelProps) {
  if (!results || results.length === 0) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center text-center">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">No result yet</h2>
          <p className="text-sm text-gray-500">
            Add items on the left and calculate the best box to see the packing result.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.length > 1 ? (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          The shipment requires {results.length} boxes.
        </div>
      ) : null}

      {results.map((result, index) => (
        <Card key={`${result.box.id}-${index}`} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {results.length > 1 ? `Box ${index + 1}` : "Recommended Box"}: {result.box.name}
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
              <dd className="text-gray-900">{result.items.length}</dd>
            </dl>
          </div>

          <BoxVisualization3D result={result} unit={unitSystem} size="large" />
        </Card>
      ))}
    </div>
  );
}

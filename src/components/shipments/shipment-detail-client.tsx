"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShipmentDetailForm } from "@/components/shipments/shipment-detail-form";
import { ShipmentResultPanel } from "@/components/shipments/shipment-result-panel";
import type { IShipment, PackingResult, UnitSystem } from "@/types";

interface ShipmentDetailClientProps {
  shipment: IShipment;
  initialResults: PackingResult[] | null;
  initialIdealResult: PackingResult | null;
  hasBoxes: boolean;
  unitSystem: UnitSystem;
}

export function ShipmentDetailClient({
  shipment,
  initialResults,
  initialIdealResult,
  hasBoxes,
  unitSystem,
}: ShipmentDetailClientProps) {
  const [shipmentName, setShipmentName] = useState(shipment.name);
  const [results, setResults] = useState<PackingResult[] | null>(initialResults);
  const [idealResult, setIdealResult] = useState<PackingResult | null>(initialIdealResult);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Shipments", href: "/dashboard" },
          { label: shipmentName || "Untitled Shipment" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ShipmentDetailForm
          shipment={shipment}
          hasBoxes={hasBoxes}
          unitSystem={unitSystem}
          onNameChange={setShipmentName}
          onCalculated={(nextName, nextResults, nextIdealResult) => {
            setShipmentName(nextName);
            setResults(nextResults);
            setIdealResult(nextIdealResult);
          }}
        />
        <ShipmentResultPanel
          results={results}
          idealResult={idealResult}
          unitSystem={unitSystem}
        />
      </div>
    </div>
  );
}

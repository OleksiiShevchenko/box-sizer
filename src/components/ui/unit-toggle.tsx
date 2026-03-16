"use client";

import type { UnitSystem } from "@/types";

interface UnitToggleProps {
  unit: UnitSystem;
  onChange: (unit: UnitSystem) => void;
}

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange("cm")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          unit === "cm"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        metric
      </button>
      <button
        type="button"
        onClick={() => onChange("in")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          unit === "in"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        imperial
      </button>
    </div>
  );
}

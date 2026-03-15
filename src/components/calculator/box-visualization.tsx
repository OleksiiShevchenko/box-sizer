"use client";

import dynamic from "next/dynamic";
import type { PackingResult, UnitSystem } from "@/types";

interface BoxVisualizationProps {
  result: PackingResult;
  unit: UnitSystem;
}

const BoxVisualizationScene = dynamic(
  () => import("./box-visualization-3d").then((mod) => mod.BoxVisualization3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full lg:w-[360px] shrink-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-[280px] animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </div>
    ),
  }
);

export function BoxVisualization({ result, unit }: BoxVisualizationProps) {
  return (
    <BoxVisualizationScene result={result} unit={unit} />
  );
}

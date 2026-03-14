"use client";

import type { PackingResult, UnitSystem } from "@/types";
import { cmToInches } from "@/types";

interface BoxVisualizationProps {
  result: PackingResult;
  unit: UnitSystem;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function BoxVisualization({ result, unit }: BoxVisualizationProps) {
  const { box, items } = result;

  const svgWidth = 320;
  const svgHeight = 240;
  const padding = 20;

  // Scale to fit SVG
  const maxDim = Math.max(box.width, box.depth);
  const scale = (Math.min(svgWidth, svgHeight) - padding * 2) / maxDim;

  const boxW = box.width * scale;
  const boxD = box.depth * scale;

  const offsetX = (svgWidth - boxW) / 2;
  const offsetY = (svgHeight - boxD) / 2;

  function dim(v: number): string {
    if (unit === "in") return cmToInches(v).toFixed(1);
    return v.toFixed(1);
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Top-down view (width x depth)</p>
      <svg
        width={svgWidth}
        height={svgHeight}
        className="border border-gray-200 rounded-lg bg-gray-50"
      >
        {/* Box outline */}
        <rect
          x={offsetX}
          y={offsetY}
          width={boxW}
          height={boxD}
          fill="none"
          stroke="#374151"
          strokeWidth={2}
          strokeDasharray="4"
        />

        {/* Items */}
        {items.map((item, i) => (
          <rect
            key={i}
            x={offsetX + item.x * scale}
            y={offsetY + item.z * scale}
            width={item.width * scale}
            height={item.depth * scale}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.6}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={1}
          />
        ))}

        {/* Labels */}
        <text
          x={offsetX + boxW / 2}
          y={svgHeight - 4}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          {dim(box.width)} {unit}
        </text>
        <text
          x={8}
          y={offsetY + boxD / 2}
          textAnchor="middle"
          className="text-xs fill-gray-500"
          transform={`rotate(-90, 8, ${offsetY + boxD / 2})`}
        >
          {dim(box.depth)} {unit}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length], opacity: 0.6 }}
            />
            <span className="text-gray-600">
              {item.name.replace(/_\d+$/, "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

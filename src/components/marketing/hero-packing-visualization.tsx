"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  HERO_PACKING_RESULT,
  HERO_RECOMMENDED_BOX,
} from "./hero-packing-visualization-data";
import {
  getAutoRotateSpeedRadians,
  HERO_CANVAS_HEIGHT,
  HERO_CANVAS_WIDTH,
} from "@/components/calculator/box-visualization-3d";

const HERO_LEGEND_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

const HeroPackingVisualizationScene = dynamic(
  () =>
    import("@/components/calculator/box-visualization-3d").then(
      (mod) => mod.BoxVisualization3D
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Medium box packing visualization"
        className="w-full max-w-[625px] shrink-0"
        data-testid="hero-packing-visualization"
      >
        <div
          className="aspect-[625/650] w-full animate-pulse rounded-3xl bg-white/20"
          style={{ maxHeight: `${HERO_CANVAS_HEIGHT}px`, maxWidth: `${HERO_CANVAS_WIDTH}px` }}
        />
      </div>
    ),
  }
);

export function HeroPackingVisualization() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const legendItems = HERO_PACKING_RESULT.items
    .map((item, index) => ({
      color: HERO_LEGEND_COLORS[index % HERO_LEGEND_COLORS.length],
      label: item.name.replace(/_\d+$/, ""),
    }))
    .sort((left, right) => {
      const leftNumber = Number.parseInt(left.label.replace(/\D+/g, ""), 10);
      const rightNumber = Number.parseInt(right.label.replace(/\D+/g, ""), 10);

      return leftNumber - rightNumber;
    });

  useEffect(() => {
    let frameId = 0;
    let startTime = 0;

    const tick = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsedSeconds = (timestamp - startTime) / 1000;
      setRotationAngle((elapsedSeconds * getAutoRotateSpeedRadians()) % (Math.PI * 2));
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-5 lg:items-end">
      <div
        aria-label="Medium box packing visualization"
        className="w-full max-w-[625px]"
        data-rotation-angle={rotationAngle.toFixed(3)}
        data-testid="hero-packing-visualization"
      >
        <HeroPackingVisualizationScene
          result={HERO_PACKING_RESULT}
          unit="in"
          size="hero"
          variant="transparent"
          showMeta={false}
          interactive={false}
          autoRotate
          rotationAngle={rotationAngle}
          onAutoRotateFrame={setRotationAngle}
          cameraView="perspective"
        />
      </div>

      <div
        className="w-full max-w-[625px] rounded-2xl border border-black/5 bg-white/90 px-6 py-5 text-left shadow-[0_20px_35px_rgba(25,28,29,0.05)] backdrop-blur-sm"
        data-testid="hero-legend-card"
      >
        <div className="min-w-0">
          <h3
            className="text-lg font-semibold text-gray-900"
            data-testid="hero-recommendation-title"
          >
            Optimal Recommendation: {HERO_RECOMMENDED_BOX.name}
          </h3>
          <p
            className="mt-1 text-lg font-medium text-slate-600 whitespace-nowrap"
            data-testid="hero-savings-line"
          >
            Shipping Savings: <span className="font-semibold text-emerald-700">${HERO_RECOMMENDED_BOX.shippingSavingsUsd.toFixed(2)}</span>
          </p>
        </div>

        <div className="my-3 h-px bg-black/5" />

        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            Dimensions: {HERO_RECOMMENDED_BOX.widthIn.toFixed(1)} x {HERO_RECOMMENDED_BOX.heightIn.toFixed(1)} x{" "}
            {HERO_RECOMMENDED_BOX.depthIn.toFixed(1)} in
          </p>
          <p>{HERO_PACKING_RESULT.items.length} units</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {legendItems.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-1 text-xs"
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color, opacity: 0.6 }}
              />
              <span className="text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

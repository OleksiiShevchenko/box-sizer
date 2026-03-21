"use client";

import { Canvas } from "@react-three/fiber";
import { Edges, OrbitControls } from "@react-three/drei";
import type { PackingResult, UnitSystem } from "@/types";
import { cmToInches } from "@/types";

interface BoxVisualization3DProps {
  result: PackingResult;
  unit: UnitSystem;
  size?: "default" | "large" | "render";
  interactive?: boolean;
  cameraView?: VisualizationCameraView;
  showMeta?: boolean;
}

export type VisualizationCameraView = "perspective" | "front" | "side" | "top";

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

function dim(value: number, unit: UnitSystem): string {
  if (unit === "in") return cmToInches(value).toFixed(1);
  return value.toFixed(1);
}

function BoxScene({ result }: Pick<BoxVisualization3DProps, "result">) {
  const { box, items } = result;
  const boxPosition: [number, number, number] = [
    box.width / 2,
    box.height / 2,
    box.depth / 2,
  ];
  const centeredOffset: [number, number, number] = [
    -box.width / 2,
    -box.height / 2,
    -box.depth / 2,
  ];

  return (
    <group position={centeredOffset}>
      <mesh position={boxPosition}>
        <boxGeometry args={[box.width, box.height, box.depth]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges
          color="#6b7280"
          dashed
          dashSize={0.45}
          gapSize={0.25}
          lineWidth={1}
        />
      </mesh>

      {items.map((item, index) => {
        const color = COLORS[index % COLORS.length];
        const itemPosition: [number, number, number] = [
          item.x + item.width / 2,
          item.y + item.height / 2,
          item.z + item.depth / 2,
        ];

        return (
          <mesh key={`${item.name}-${index}`} position={itemPosition}>
            <boxGeometry args={[item.width, item.height, item.depth]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
            <Edges color={color} lineWidth={1} />
          </mesh>
        );
      })}
    </group>
  );
}

export function getVisualizationCameraPosition(
  result: PackingResult,
  view: VisualizationCameraView
): [number, number, number] {
  const largestDimension = Math.max(result.box.width, result.box.height, result.box.depth);
  const cameraDistance = Math.max(largestDimension * 2.2, 28);

  switch (view) {
    case "front":
      return [0, 0, cameraDistance * 1.2];
    case "side":
      return [cameraDistance * 1.2, 0, 0];
    case "top":
      return [0, cameraDistance * 1.2, 0];
    case "perspective":
    default:
      return [cameraDistance, cameraDistance * 0.8, cameraDistance];
  }
}

export function BoxVisualization3D({
  result,
  unit,
  size = "default",
  interactive = true,
  cameraView = "perspective",
  showMeta = true,
}: BoxVisualization3DProps) {
  const { box, items } = result;
  const largestDimension = Math.max(box.width, box.height, box.depth);
  const cameraDistance = Math.max(largestDimension * 2.2, 28);
  const cameraPosition = getVisualizationCameraPosition(result, cameraView);
  const containerClassName =
    size === "render"
      ? "w-[500px] shrink-0"
      : size === "large"
        ? "w-full lg:w-full shrink-0"
        : "w-full lg:w-[360px] shrink-0";
  const canvasHeightClassName =
    size === "render" ? "h-[500px]" : size === "large" ? "h-[480px]" : "h-[280px]";

  return (
    <div className={containerClassName}>
      {showMeta ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">3D view (width x height x depth)</p>
          <p className="text-xs text-gray-400">Drag to rotate, scroll to zoom</p>
        </div>
      ) : null}

      <div
        className={`${canvasHeightClassName} overflow-hidden rounded-lg border border-gray-200 bg-gray-50`}
      >
        <Canvas
          camera={{ fov: 42, position: cameraPosition, near: 0.1, far: cameraDistance * 10 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={["#f9fafb"]} />
          <BoxScene result={result} />
          {interactive ? (
            <OrbitControls
              enableDamping
              enablePan={false}
              minDistance={Math.max(largestDimension * 0.9, 12)}
              maxDistance={cameraDistance * 2.5}
              target={[0, 0, 0]}
            />
          ) : null}
        </Canvas>
      </div>

      {showMeta ? (
        <>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              {dim(box.width, unit)} x {dim(box.height, unit)} x {dim(box.depth, unit)} {unit}
            </span>
            <span>{items.length} unit{items.length === 1 ? "" : "s"}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div key={`${item.name}-legend-${index}`} className="flex items-center gap-1 text-xs">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length], opacity: 0.6 }}
                />
                <span className="text-gray-600">{item.name.replace(/_\d+$/, "")}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

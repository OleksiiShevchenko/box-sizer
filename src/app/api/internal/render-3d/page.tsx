import { BoxVisualization3D, type VisualizationCameraView } from "@/components/calculator/box-visualization-3d";
import type { PackingResult } from "@/types";

export const dynamic = "force-dynamic";

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value: string | string[] | undefined, fallback = 0) {
  const parsed = Number(getFirstValue(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseView(value: string | string[] | undefined): VisualizationCameraView {
  const raw = getFirstValue(value);
  if (raw === "front" || raw === "side" || raw === "top") {
    return raw;
  }

  return "perspective";
}

export default async function Render3DPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  let items: PackingResult["items"] = [];
  try {
    const rawItems = getFirstValue(params.items);
    items = rawItems ? JSON.parse(rawItems) : [];
  } catch {
    items = [];
  }

  const result: PackingResult = {
    box: {
      id: "render-box",
      name: "Render Box",
      width: parseNumber(params.boxW),
      height: parseNumber(params.boxH),
      depth: parseNumber(params.boxD),
      spacing: parseNumber(params.spacing),
    },
    items,
    dimensionalWeight: 0,
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
      <BoxVisualization3D
        result={result}
        unit="cm"
        size="render"
        interactive={false}
        cameraView={parseView(params.view)}
        showMeta={false}
      />
    </main>
  );
}

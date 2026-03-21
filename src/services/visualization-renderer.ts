import { access } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import type { VisualizationCameraView } from "@/components/calculator/box-visualization-3d";
import type { PackingResult } from "@/types";
import { uploadVisualizationImages } from "@/services/visualization-upload";

const VISUALIZATION_VIEWS: VisualizationCameraView[] = [
  "perspective",
  "front",
  "side",
  "top",
];

const DEFAULT_CHROMIUM_PACK_URL =
  "https://github.com/nicholasgasior/chromium-releases/raw/main/chromium-v143.0.0-pack.tar";

async function canAccessPath(pathname: string) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

async function resolveChromiumExecutablePath() {
  const envPaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROMIUM_EXECUTABLE_PATH,
  ].filter(Boolean) as string[];

  for (const pathname of envPaths) {
    if (await canAccessPath(pathname)) {
      return pathname;
    }
  }

  const macPaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];

  for (const pathname of macPaths) {
    if (await canAccessPath(pathname)) {
      return pathname;
    }
  }

  const packLocation =
    process.env.CHROMIUM_PACK_LOCATION || DEFAULT_CHROMIUM_PACK_URL;
  return chromium.executablePath(packLocation);
}

export async function renderVisualizationImages(baseUrl: string, result: PackingResult) {
  const viewport = {
    width: 500,
    height: 500,
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    isLandscape: true,
  } as const;
  const isLocalChrome = process.platform === "darwin";
  const executablePath = await resolveChromiumExecutablePath();
  const browser = await puppeteer.launch({
    args: isLocalChrome ? [] : chromium.args,
    defaultViewport: viewport,
    executablePath,
    headless: isLocalChrome ? true : chromium.headless,
  });

  try {
    const page = await browser.newPage();
    const items = JSON.stringify(
      result.items.map((item) => ({
        name: item.name,
        width: item.width,
        height: item.height,
        depth: item.depth,
        x: item.x,
        y: item.y,
        z: item.z,
      }))
    );
    const buffers = {} as Record<VisualizationCameraView, Buffer>;

    for (const view of VISUALIZATION_VIEWS) {
      const renderUrl = new URL("/api/internal/render-3d", baseUrl);
      renderUrl.searchParams.set("boxW", String(result.box.width));
      renderUrl.searchParams.set("boxH", String(result.box.height));
      renderUrl.searchParams.set("boxD", String(result.box.depth));
      renderUrl.searchParams.set("spacing", String(result.box.spacing ?? 0));
      renderUrl.searchParams.set("items", items);
      renderUrl.searchParams.set("view", view);

      await page.goto(renderUrl.toString(), { waitUntil: "networkidle0" });
      await page.waitForSelector("canvas", { timeout: 15_000 });
      await new Promise((resolve) => setTimeout(resolve, 750));

      const screenshot = await page.screenshot({
        type: "png",
        clip: {
          x: 0,
          y: 0,
          width: 500,
          height: 500,
        },
      });

      buffers[view] = Buffer.isBuffer(screenshot) ? screenshot : Buffer.from(screenshot);
    }

    return buffers;
  } finally {
    await browser.close();
  }
}

export async function generateAndUploadVisualizations(
  id: string,
  baseUrl: string,
  result: PackingResult
) {
  console.log(`[visualization] starting render for ${id}, baseUrl=${baseUrl}`);
  const images = await renderVisualizationImages(baseUrl, result);
  console.log(`[visualization] render complete for ${id}, uploading ${Object.keys(images).length} images`);
  const urls = await uploadVisualizationImages(id, images);
  console.log(`[visualization] upload complete for ${id}`);
  return urls;
}

import { BlobNotFoundError, head, put } from "@vercel/blob";
import type { VisualizationCameraView } from "@/components/calculator/box-visualization-3d";

const VISUALIZATION_VIEWS: VisualizationCameraView[] = [
  "perspective",
  "front",
  "side",
  "top",
];

export type VisualizationUrls = {
  perspectiveUrl: string;
  frontUrl: string;
  sideUrl: string;
  topUrl: string;
};

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  return token;
}

function getBlobStoreId() {
  const [, , , storeId = ""] = getBlobToken().split("_");
  if (!storeId) {
    throw new Error("Could not determine Blob store ID");
  }

  return storeId;
}

export function getVisualizationPath(id: string, view: VisualizationCameraView) {
  return `visualizations/${id}/${view}.png`;
}

export function predictVisualizationUrls(id: string): VisualizationUrls {
  const storeId = getBlobStoreId();
  const toUrl = (view: VisualizationCameraView) =>
    `https://${storeId}.public.blob.vercel-storage.com/${getVisualizationPath(id, view)}`;

  return {
    perspectiveUrl: toUrl("perspective"),
    frontUrl: toUrl("front"),
    sideUrl: toUrl("side"),
    topUrl: toUrl("top"),
  };
}

export async function uploadVisualizationImages(
  id: string,
  images: Record<VisualizationCameraView, Buffer>
) {
  await Promise.all(
    VISUALIZATION_VIEWS.map(async (view) => {
      await put(getVisualizationPath(id, view), images[view], {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
        contentType: "image/png",
        token: getBlobToken(),
      });
    })
  );

  return predictVisualizationUrls(id);
}

export async function getUploadedVisualizationUrls(id: string) {
  try {
    await head(getVisualizationPath(id, "perspective"), {
      token: getBlobToken(),
    });

    return predictVisualizationUrls(id);
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return null;
    }

    if (
      error instanceof Error &&
      /BLOB_READ_WRITE_TOKEN|Blob store ID/i.test(error.message)
    ) {
      return null;
    }

    throw error;
  }
}

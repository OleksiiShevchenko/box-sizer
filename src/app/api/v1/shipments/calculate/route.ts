import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { apiErrorResponse, badRequest } from "@/lib/api-errors";
import { withApi } from "@/lib/api-middleware";
import { mapPackingResultToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { calculateShipmentBodySchema } from "@/lib/api-schemas";
import { calculateShipmentForUser } from "@/lib/api-shipments";
import { generateAndUploadVisualizations } from "@/services/visualization-renderer";
import { predictVisualizationUrls } from "@/services/visualization-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = withApi(async (request, { api }) => {
  try {
    const body = await request.json();
    const parsed = calculateShipmentBodySchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid calculate body");
    }

    const calculation = await calculateShipmentForUser(api.userId, {
      items: parsed.data.items,
      spacingOverride: parsed.data.spacingOverride ?? null,
      includeIdealBox: parsed.data.includeIdealBox,
    });
    const primaryResult = calculation.results[0] ?? calculation.idealResult ?? null;
    const visualizationId = parsed.data.renderVisualization && primaryResult ? randomUUID() : null;
    const visualization =
      visualizationId && primaryResult
        ? {
            status: "pending" as const,
            ...predictVisualizationUrls(visualizationId),
          }
        : undefined;

    if (visualizationId && primaryResult) {
      after(async () => {
        try {
          await generateAndUploadVisualizations(
            visualizationId,
            request.nextUrl.origin,
            primaryResult
          );
        } catch (error) {
          console.error(error);
        }
      });
    }

    return apiJson({
      result: {
        boxes: calculation.results.map(mapPackingResultToApi),
        ...(parsed.data.includeIdealBox
          ? {
              idealBox: calculation.idealResult
                ? mapPackingResultToApi(calculation.idealResult)
                : null,
            }
          : {}),
      },
      ...(visualization ? { visualization } : {}),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
});

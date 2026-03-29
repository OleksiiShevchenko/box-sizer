import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { apiErrorResponse, badRequest } from "@/lib/api-errors";
import { withApi } from "@/lib/api-middleware";
import {
  convertDimensionFromApi,
  convertPackingPlanItemInputToStorage,
  getMeasurementUnits,
} from "@/lib/api-units";
import { mapPackingResultToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { calculatePackingPlanBodySchema } from "@/lib/api-schemas";
import {
  calculatePackingPlanForUser,
  createPackingPlanCalculationForUser,
} from "@/lib/api-packing-plans";
import { generateAndUploadVisualizations } from "@/services/visualization-renderer";
import { predictVisualizationUrls } from "@/services/visualization-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = withApi(async (request, { api }) => {
  try {
    const body = await request.json();
    const parsed = calculatePackingPlanBodySchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid calculate body");
    }

    const requestUnitSystem = parsed.data.unitSystem;
    const normalizedItems = parsed.data.items.map((item) =>
      convertPackingPlanItemInputToStorage(item, requestUnitSystem)
    );
    const normalizedSpacingOverride =
      parsed.data.spacingOverride == null
        ? null
        : convertDimensionFromApi(parsed.data.spacingOverride, requestUnitSystem);
    const calculation = await calculatePackingPlanForUser(api.userId, {
      items: normalizedItems,
      spacingOverride: normalizedSpacingOverride,
      includeIdealBox: parsed.data.includeIdealBox,
    });
    const packingPlanName = "Untitled Packing Plan";
    const packingPlan = await createPackingPlanCalculationForUser(
      api.userId,
      {
        name: packingPlanName,
        items: normalizedItems,
        spacingOverride: normalizedSpacingOverride,
      },
      calculation.results
    );
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/packing-plans/${packingPlan.id}`);
    const primaryResult = calculation.results[0] ?? calculation.idealResult ?? null;
    const visualizationId =
      parsed.data.renderVisualization && primaryResult ? packingPlan.publicId : null;
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
      id: packingPlan.publicId,
      units: getMeasurementUnits(requestUnitSystem),
      result: {
        boxes: calculation.results.map((result) => mapPackingResultToApi(result, requestUnitSystem)),
        ...(parsed.data.includeIdealBox
          ? {
              idealBox: calculation.idealResult
                ? mapPackingResultToApi(calculation.idealResult, requestUnitSystem)
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

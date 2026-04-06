import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { withApi } from "@/lib/api-middleware";
import {
  convertDimensionFromApi,
  convertPackingPlanItemInputToStorage,
  getMeasurementUnits,
} from "@/lib/api-units";
import { apiErrorResponse, badRequest, forbidden } from "@/lib/api-errors";
import { mapPackingResultToApi, mapPackingPlanToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { packingPlanUpdateBodySchema } from "@/lib/api-schemas";
import {
  calculatePackingPlanForUser,
  getPackingPlanForUser,
  savePackingPlanCalculation,
} from "@/lib/api-packing-plans";
import {
  CalculationQuotaExceededError,
  formatCalculationQuotaExceededMessage,
  performMeteredCalculation,
} from "@/services/subscription";
import { generateAndUploadVisualizations } from "@/services/visualization-renderer";
import {
  getUploadedVisualizationUrls,
  predictVisualizationUrls,
} from "@/services/visualization-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export const GET = withApi(async (_request, ctx) => {
  const { id } = await (ctx.params as Promise<{ id: string }>);
  const packingPlan = await getPackingPlanForUser(ctx.api.userId, id);
  const visualizationUrls = await getUploadedVisualizationUrls(packingPlan.publicId);

  return apiJson(
    {
      ...mapPackingPlanToApi(
        packingPlan,
        ctx.api.unitSystem,
        visualizationUrls ? { visualization: { status: "ready", ...visualizationUrls } } : undefined
      ),
      units: getMeasurementUnits(ctx.api.unitSystem),
    }
  );
});

export const PUT = withApi(async (request, ctx) => {
  try {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const packingPlan = await getPackingPlanForUser(ctx.api.userId, id);
    const body = await request.json();
    const parsed = packingPlanUpdateBodySchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid packing plan body");
    }

    const requestUnitSystem = parsed.data.unitSystem;
    const normalizedItems = parsed.data.items.map((item) =>
      convertPackingPlanItemInputToStorage(item, requestUnitSystem)
    );
    const normalizedSpacingOverride =
      parsed.data.spacingOverride == null
        ? null
        : convertDimensionFromApi(parsed.data.spacingOverride, requestUnitSystem);
    const calculation = await calculatePackingPlanForUser(ctx.api.userId, {
      name: parsed.data.name,
      items: normalizedItems,
      spacingOverride: normalizedSpacingOverride,
      includeIdealBox: true,
    });

    await performMeteredCalculation(ctx.api.userId, (tx) =>
      savePackingPlanCalculation(
        tx,
        packingPlan.id,
        {
          name: parsed.data.name,
          items: normalizedItems,
          spacingOverride: normalizedSpacingOverride,
        },
        calculation.results
      )
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/packing-plans/${packingPlan.id}`);

    const updatedPackingPlan = await getPackingPlanForUser(ctx.api.userId, id);
    const primaryResult = calculation.results[0] ?? calculation.idealResult ?? null;
    const visualization =
      parsed.data.renderVisualization && primaryResult
        ? {
            status: "pending" as const,
            ...predictVisualizationUrls(updatedPackingPlan.publicId),
          }
        : undefined;

    if (visualization && primaryResult) {
      after(async () => {
        try {
          await generateAndUploadVisualizations(
            updatedPackingPlan.publicId,
            request.nextUrl.origin,
            primaryResult
          );
        } catch (error) {
          console.error(error);
        }
      });
    }

    return apiJson({
      packingPlan: mapPackingPlanToApi(
        updatedPackingPlan,
        requestUnitSystem,
        visualization ? { visualization } : undefined
      ),
      result: {
        boxes: calculation.results.map((result) => mapPackingResultToApi(result, requestUnitSystem)),
        idealBox: calculation.idealResult
          ? mapPackingResultToApi(calculation.idealResult, requestUnitSystem)
          : null,
      },
      units: getMeasurementUnits(requestUnitSystem),
      ...(visualization ? { visualization } : {}),
    });
  } catch (error) {
    if (error instanceof CalculationQuotaExceededError) {
      return apiErrorResponse(
        forbidden(formatCalculationQuotaExceededMessage(error.usageLimit), "quota_exceeded")
      );
    }

    return apiErrorResponse(error);
  }
});

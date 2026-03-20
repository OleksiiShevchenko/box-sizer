import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { withApi } from "@/lib/api-middleware";
import {
  convertDimensionFromApi,
  convertShipmentItemInputToStorage,
  getMeasurementUnits,
} from "@/lib/api-units";
import { apiErrorResponse, badRequest } from "@/lib/api-errors";
import { mapPackingResultToApi, mapShipmentToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { shipmentUpdateBodySchema } from "@/lib/api-schemas";
import {
  calculateShipmentForUser,
  getShipmentForUser,
  saveShipmentCalculation,
} from "@/lib/api-shipments";
import { generateAndUploadVisualizations } from "@/services/visualization-renderer";
import {
  getUploadedVisualizationUrls,
  predictVisualizationUrls,
} from "@/services/visualization-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export const GET = withApi(async (_request, ctx) => {
  const { id } = await (ctx.params as Promise<{ id: string }>);
  const shipment = await getShipmentForUser(ctx.api.userId, id);
  const visualizationUrls = await getUploadedVisualizationUrls(shipment.publicId);

  return apiJson(
    {
      ...mapShipmentToApi(
        shipment,
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
    const shipment = await getShipmentForUser(ctx.api.userId, id);
    const body = await request.json();
    const parsed = shipmentUpdateBodySchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid shipment body");
    }

    const requestUnitSystem = parsed.data.unitSystem;
    const normalizedItems = parsed.data.items.map((item) =>
      convertShipmentItemInputToStorage(item, requestUnitSystem)
    );
    const normalizedSpacingOverride =
      parsed.data.spacingOverride == null
        ? null
        : convertDimensionFromApi(parsed.data.spacingOverride, requestUnitSystem);
    const calculation = await calculateShipmentForUser(ctx.api.userId, {
      name: parsed.data.name,
      items: normalizedItems,
      spacingOverride: normalizedSpacingOverride,
      includeIdealBox: true,
    });

    await saveShipmentCalculation(
      shipment,
      {
        name: parsed.data.name,
        items: normalizedItems,
        spacingOverride: normalizedSpacingOverride,
      },
      calculation.results
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/shipments/${shipment.id}`);

    const updatedShipment = await getShipmentForUser(ctx.api.userId, id);
    const primaryResult = calculation.results[0] ?? calculation.idealResult ?? null;
    const visualization =
      parsed.data.renderVisualization && primaryResult
        ? {
            status: "pending" as const,
            ...predictVisualizationUrls(updatedShipment.publicId),
          }
        : undefined;

    if (visualization && primaryResult) {
      after(async () => {
        try {
          await generateAndUploadVisualizations(
            updatedShipment.publicId,
            request.nextUrl.origin,
            primaryResult
          );
        } catch (error) {
          console.error(error);
        }
      });
    }

    return apiJson({
      shipment: mapShipmentToApi(
        updatedShipment,
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
    return apiErrorResponse(error);
  }
});

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { withApi } from "@/lib/api-middleware";
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
    mapShipmentToApi(shipment, visualizationUrls ? { visualization: { status: "ready", ...visualizationUrls } } : undefined)
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

    const calculation = await calculateShipmentForUser(ctx.api.userId, {
      name: parsed.data.name,
      items: parsed.data.items,
      spacingOverride: parsed.data.spacingOverride ?? null,
      includeIdealBox: true,
    });

    await saveShipmentCalculation(
      shipment,
      {
        name: parsed.data.name,
        items: parsed.data.items,
        spacingOverride: parsed.data.spacingOverride ?? null,
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
        visualization ? { visualization } : undefined
      ),
      result: {
        boxes: calculation.results.map(mapPackingResultToApi),
        idealBox: calculation.idealResult ? mapPackingResultToApi(calculation.idealResult) : null,
      },
      ...(visualization ? { visualization } : {}),
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
});

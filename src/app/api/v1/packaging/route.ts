import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { withApi } from "@/lib/api-middleware";
import { convertBoxInputToStorage, getMeasurementUnits } from "@/lib/api-units";
import { badRequest, apiErrorResponse } from "@/lib/api-errors";
import { mapBoxToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { boxBodySchema, paginationQuerySchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parsePagination(request: NextRequest) {
  const parsed = paginationQuerySchema.safeParse({
    page: request.nextUrl.searchParams.get("page") ?? undefined,
    pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid pagination values");
  }

  return parsed.data;
}

export const GET = withApi(async (request, { api }) => {
  const { page, pageSize } = parsePagination(request);
  const skip = (page - 1) * pageSize;
  const [boxes, total] = await Promise.all([
    prisma.box.findMany({
      where: { userId: api.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.box.count({
      where: { userId: api.userId },
    }),
  ]);

  return apiJson({
    data: boxes.map((box) => mapBoxToApi(box, api.unitSystem)),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    units: getMeasurementUnits(api.unitSystem),
  });
});

export const POST = withApi(async (request, { api }) => {
  try {
    const body = await request.json();
    const parsed = boxBodySchema.safeParse(body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid packaging body");
    }

    const requestUnitSystem = parsed.data.unitSystem;
    const normalized = convertBoxInputToStorage(parsed.data, requestUnitSystem);
    const box = await prisma.box.create({
      data: {
        userId: api.userId,
        name: normalized.name,
        width: normalized.width,
        height: normalized.height,
        depth: normalized.depth,
        spacing: normalized.spacing,
        maxWeight: normalized.maxWeight,
      },
    });

    revalidatePath("/settings/packaging");
    revalidatePath("/dashboard");

    return apiJson(
      {
        ...mapBoxToApi(box, requestUnitSystem),
        units: getMeasurementUnits(requestUnitSystem),
      },
      201
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
});

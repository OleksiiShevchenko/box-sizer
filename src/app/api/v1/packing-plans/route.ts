import type { NextRequest } from "next/server";
import { withApi } from "@/lib/api-middleware";
import { getMeasurementUnits } from "@/lib/api-units";
import { badRequest } from "@/lib/api-errors";
import { mapPackingPlanToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { paginationQuerySchema } from "@/lib/api-schemas";
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
  const [packingPlans, total] = await Promise.all([
    prisma.packingPlan.findMany({
      where: { userId: api.userId },
      include: {
        box: true,
        items: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.packingPlan.count({
      where: { userId: api.userId },
    }),
  ]);

  return apiJson({
    data: packingPlans.map((packingPlan) => mapPackingPlanToApi(packingPlan, api.unitSystem)),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    units: getMeasurementUnits(api.unitSystem),
  });
});

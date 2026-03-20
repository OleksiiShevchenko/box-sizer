import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { withApi } from "@/lib/api-middleware";
import { badRequest, apiErrorResponse } from "@/lib/api-errors";
import { mapBoxToApi } from "@/lib/api-mappers";
import { apiPaginated, apiJson } from "@/lib/api-response";
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

  return apiPaginated(boxes.map(mapBoxToApi), total, page, pageSize);
});

export const POST = withApi(async (request, { api }) => {
  try {
    const body = await request.json();
    const parsed = boxBodySchema.safeParse(body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid packaging body");
    }

    const box = await prisma.box.create({
      data: {
        userId: api.userId,
        name: parsed.data.name,
        width: parsed.data.width,
        height: parsed.data.height,
        depth: parsed.data.depth,
        spacing: parsed.data.spacing,
        maxWeight: parsed.data.maxWeight ?? null,
      },
    });

    revalidatePath("/settings/packaging");
    revalidatePath("/dashboard");

    return apiJson(mapBoxToApi(box), 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
});

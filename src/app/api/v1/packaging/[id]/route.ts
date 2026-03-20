import { revalidatePath } from "next/cache";
import { withApi } from "@/lib/api-middleware";
import { apiErrorResponse, badRequest, notFound } from "@/lib/api-errors";
import { mapBoxToApi } from "@/lib/api-mappers";
import { apiJson } from "@/lib/api-response";
import { boxBodySchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function getBoxForRequest(userId: string, publicId: string) {
  const box = await prisma.box.findFirst({
    where: {
      userId,
      publicId,
    },
  });

  if (!box) {
    throw notFound("Packaging not found");
  }

  return box;
}

export const GET = withApi(async (_request, ctx) => {
  const { id } = await (ctx.params as Promise<{ id: string }>);
  const box = await getBoxForRequest(ctx.api.userId, id);

  return apiJson(mapBoxToApi(box));
});

export const PUT = withApi(async (request, ctx) => {
  try {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const box = await getBoxForRequest(ctx.api.userId, id);
    const body = await request.json();
    const parsed = boxBodySchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid packaging body");
    }

    const updated = await prisma.box.update({
      where: { id: box.id },
      data: {
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

    return apiJson(mapBoxToApi(updated));
  } catch (error) {
    return apiErrorResponse(error);
  }
});

export const DELETE = withApi(async (_request, ctx) => {
  try {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const box = await getBoxForRequest(ctx.api.userId, id);
    await prisma.box.delete({
      where: { id: box.id },
    });

    revalidatePath("/settings/packaging");
    revalidatePath("/dashboard");

    return apiJson({ id: box.publicId });
  } catch (error) {
    return apiErrorResponse(error);
  }
});

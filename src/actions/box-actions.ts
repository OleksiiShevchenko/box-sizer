"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";

const createBoxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  depth: z.number().positive("Depth must be positive"),
  maxWeight: z.number().positive("Max weight must be positive").optional(),
});

async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getBoxes() {
  const userId = await getAuthUserId();
  return prisma.box.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBox(formData: FormData) {
  const userId = await getAuthUserId();

  const raw = {
    name: formData.get("name") as string,
    width: parseFloat(formData.get("width") as string),
    height: parseFloat(formData.get("height") as string),
    depth: parseFloat(formData.get("depth") as string),
    maxWeight: formData.get("maxWeight")
      ? parseFloat(formData.get("maxWeight") as string)
      : undefined,
  };

  const parsed = createBoxSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.box.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  revalidatePath("/settings/packaging");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBox(id: string) {
  const userId = await getAuthUserId();

  const box = await prisma.box.findUnique({ where: { id } });
  if (!box || box.userId !== userId) {
    return { error: "Box not found" };
  }

  await prisma.box.delete({ where: { id } });

  revalidatePath("/settings/packaging");
  revalidatePath("/dashboard");
  return { success: true };
}

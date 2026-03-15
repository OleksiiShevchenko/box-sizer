"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";

const createBoxSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  width: z.number({ error: "Width is required" }).positive("Width must be positive"),
  height: z.number({ error: "Height is required" }).positive("Height must be positive"),
  depth: z.number({ error: "Depth is required" }).positive("Depth must be positive"),
  spacing: z
    .number({ error: "Spacing must be non-negative" })
    .nonnegative("Spacing must be non-negative")
    .default(0),
  maxWeight: z
    .number({ error: "Max weight must be positive" })
    .positive("Max weight must be positive")
    .optional(),
});

type BoxFieldErrors = Record<string, string>;

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (value == null) return undefined;

  const parsedValue = value.toString().trim();
  if (parsedValue === "") {
    return undefined;
  }

  const numericValue = Number(parsedValue);
  return Number.isNaN(numericValue) ? NaN : numericValue;
}

function mapZodIssuesToFieldErrors(error: z.ZodError): BoxFieldErrors {
  return error.issues.reduce<BoxFieldErrors>((fieldErrors, issue) => {
    const fieldName =
      typeof issue.path[0] === "string" ? issue.path[0] : "form";

    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }

    return fieldErrors;
  }, {});
}

function parseBoxFormData(formData: FormData) {
  return createBoxSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    width: parseOptionalNumber(formData.get("width")),
    height: parseOptionalNumber(formData.get("height")),
    depth: parseOptionalNumber(formData.get("depth")),
    spacing: parseOptionalNumber(formData.get("spacing")),
    maxWeight: parseOptionalNumber(formData.get("maxWeight")),
  });
}

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
  const parsed = parseBoxFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: mapZodIssuesToFieldErrors(parsed.error) };
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

export async function updateBox(id: string, formData: FormData) {
  const userId = await getAuthUserId();

  const box = await prisma.box.findUnique({ where: { id } });
  if (!box || box.userId !== userId) {
    return { fieldErrors: { form: "Box not found" } };
  }

  const parsed = parseBoxFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: mapZodIssuesToFieldErrors(parsed.error) };
  }

  await prisma.box.update({
    where: { id },
    data: parsed.data,
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

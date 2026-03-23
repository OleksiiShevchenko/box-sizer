"use server";

import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const apiAppNameSchema = z.string().trim().min(1, "Name is required").max(120, "Name is too long");

function mapApiApp(app: {
  id: string;
  publicId: string;
  name: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: app.id,
    publicId: app.publicId,
    name: app.name,
    clientId: app.clientId,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

export async function getApiApps() {
  const userId = await getCurrentUserId();
  const apps = await prisma.apiApp.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return apps.map(mapApiApp);
}

export async function createApiApp(name: string) {
  const userId = await getCurrentUserId();
  const parsedName = apiAppNameSchema.safeParse(name);

  if (!parsedName.success) {
    return { error: parsedName.error.issues[0]?.message ?? "Invalid app name" };
  }

  const clientId = randomUUID();
  const clientSecret = randomBytes(32).toString("hex");
  const clientSecretHash = await bcrypt.hash(clientSecret, 10);

  const app = await prisma.apiApp.create({
    data: {
      userId,
      name: parsedName.data,
      clientId,
      clientSecretHash,
    },
  });

  revalidatePath("/settings/api");

  return {
    app: mapApiApp(app),
    clientSecret,
  };
}

export async function updateApiAppName(publicId: string, name: string) {
  const userId = await getCurrentUserId();
  const parsedName = apiAppNameSchema.safeParse(name);

  if (!parsedName.success) {
    return { error: parsedName.error.issues[0]?.message ?? "Invalid app name" };
  }

  const app = await prisma.apiApp.findFirst({
    where: {
      publicId,
      userId,
    },
  });

  if (!app) {
    return { error: "API app not found" };
  }

  const updated = await prisma.apiApp.update({
    where: { id: app.id },
    data: { name: parsedName.data },
  });

  revalidatePath("/settings/api");

  return {
    app: mapApiApp(updated),
  };
}

export async function deleteApiApp(publicId: string) {
  const userId = await getCurrentUserId();
  const app = await prisma.apiApp.findFirst({
    where: {
      publicId,
      userId,
    },
  });

  if (!app) {
    return { error: "API app not found" };
  }

  await prisma.apiApp.delete({
    where: { id: app.id },
  });

  revalidatePath("/settings/api");

  return { success: true };
}

export async function regenerateClientSecret(publicId: string) {
  const userId = await getCurrentUserId();
  const app = await prisma.apiApp.findFirst({
    where: {
      publicId,
      userId,
    },
  });

  if (!app) {
    return { error: "API app not found" };
  }

  const clientSecret = randomBytes(32).toString("hex");
  const clientSecretHash = await bcrypt.hash(clientSecret, 10);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.apiToken.deleteMany({
      where: { appId: app.id },
    });

    return tx.apiApp.update({
      where: { id: app.id },
      data: { clientSecretHash },
    });
  });

  revalidatePath("/settings/api");

  return {
    app: mapApiApp(updated),
    clientSecret,
  };
}

"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { IProfile, UnitSystem } from "@/types";

const emailSchema = z.string().trim().email("Enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export async function getProfile(): Promise<IProfile> {
  const userId = await getCurrentUserId();
  const [user, googleAccount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }),
    prisma.account.findFirst({
      where: {
        userId,
        provider: "google",
      },
    }),
  ]);

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    isGoogleUser: Boolean(googleAccount),
    hasPassword: Boolean(user.password),
    unitSystem: (user.unitSystem === "in" ? "in" : "cm") as UnitSystem,
  };
}

export async function updateEmail(
  email: string
): Promise<{ success?: true; error?: string }> {
  const userId = await getCurrentUserId();
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { error: parsedEmail.error.issues[0]?.message ?? "Invalid email" };
  }

  const [user, googleAccount, existingUser] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }),
    prisma.account.findFirst({
      where: {
        userId,
        provider: "google",
      },
    }),
    prisma.user.findUnique({
      where: { email: parsedEmail.data },
    }),
  ]);

  if (googleAccount) {
    return { error: "Email is managed by Google SSO for this account" };
  }

  if (existingUser && existingUser.id !== user.id) {
    return { error: "That email address is already in use" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: parsedEmail.data,
    },
  });

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function updatePassword(
  currentPassword: string,
  nextPassword: string
): Promise<{ success?: true; error?: string }> {
  const userId = await getCurrentUserId();
  const parsedPassword = passwordSchema.safeParse(nextPassword);
  if (!parsedPassword.success) {
    return {
      error: parsedPassword.error.issues[0]?.message ?? "Invalid password",
    };
  }

  const [user, googleAccount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }),
    prisma.account.findFirst({
      where: {
        userId,
        provider: "google",
      },
    }),
  ]);

  if (googleAccount || !user.password) {
    return { error: "Password changes are not available for this account" };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(parsedPassword.data, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function getUnitSystem(): Promise<UnitSystem> {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { unitSystem: true },
  });
  return user.unitSystem === "in" ? "in" : "cm";
}

export async function updateUnitSystem(
  unitSystem: string
): Promise<{ success?: true; error?: string }> {
  if (unitSystem !== "cm" && unitSystem !== "in") {
    return { error: "Invalid unit system" };
  }

  const userId = await getCurrentUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { unitSystem },
  });

  revalidatePath("/settings/profile");
  revalidatePath("/settings/boxes");
  revalidatePath("/dashboard");
  return { success: true };
}

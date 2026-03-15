"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { IProfile } from "@/types";

const emailSchema = z.string().trim().email("Enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export async function getProfile(): Promise<IProfile> {
  const userId = await getAuthUserId();
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
  };
}

export async function updateEmail(
  email: string
): Promise<{ success?: true; error?: string }> {
  const userId = await getAuthUserId();
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
  const userId = await getAuthUserId();
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

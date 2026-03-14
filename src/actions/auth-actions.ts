"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/resend";
import { z } from "zod/v4";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUp(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  await sendVerificationEmail(email, token);

  return { success: true };
}

export async function confirmEmail(token: string, email: string) {
  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
    },
  });

  if (!record) {
    return { error: "Invalid or expired verification link." };
  }

  if (record.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: email, token },
      },
    });
    return { error: "Verification link has expired. Please sign up again." };
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: { identifier: email, token },
    },
  });

  return { success: true };
}

"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/resend";
import { getStarterUsagePeriod } from "@/services/subscription";
import { z } from "zod/v4";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const IMPERIAL_COUNTRIES = new Set([
  "US", "LR", "MM",
]);
const VERIFICATION_EMAIL_ERROR = "Failed to send verification email. Please try again.";

export async function signUp(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const locale = (formData.get("locale") as string) ?? "";

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

  // Detect unit system from browser locale (e.g. "en-US" → "US")
  const countryCode = locale.split("-").pop()?.toUpperCase() ?? "";
  const unitSystem = IMPERIAL_COUNTRIES.has(countryCode) ? "in" : "cm";
  const createdAt = new Date();
  const starterPeriod = getStarterUsagePeriod(createdAt, createdAt);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      unitSystem,
      createdAt,
      subscription: {
        create: {
          tier: "starter",
          status: "active",
          currentPeriodStart: starterPeriod.start,
          currentPeriodEnd: starterPeriod.end,
        },
      },
    },
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      type: "email_verification",
      expires,
    },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({
        where: { identifier: email, type: "email_verification" },
      }),
      prisma.user.delete({
        where: { email },
      }),
    ]);

    return { error: VERIFICATION_EMAIL_ERROR };
  }

  return { success: true };
}

export async function confirmEmail(token: string, email: string) {
  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      type: "email_verification",
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

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();

  const parsed = z.email().safeParse(email);
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Only send for users with a password (not Google-only accounts).
  // Always return success to prevent email enumeration.
  if (user?.password) {
    // Remove any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, type: "password_reset" },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: { identifier: email, token, type: "password_reset", expires },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email, token, type: "password_reset" },
      });
      return { error: "Failed to send reset email. Please try again." };
    }
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const raw = {
    token: formData.get("token") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { token, email, password } = parsed.data;

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token, type: "password_reset" },
  });

  if (!record) {
    return { error: "Invalid or expired reset link." };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return { error: "Reset link has expired. Please request a new one." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return { success: true };
}

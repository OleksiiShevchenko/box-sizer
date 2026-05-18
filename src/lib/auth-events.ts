import type { Account, User } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getStarterUsagePeriod } from "@/services/subscription";
import { trackUserLogin, trackUserRegistered } from "@/lib/auth-tracking";
import { sendSignupAdminNotification } from "@/lib/resend";

export async function onCreateUser({ user }: { user: User }): Promise<void> {
  if (!user.id || !user.email) return;

  const existing = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { userId: true },
  });
  if (!existing) {
    const createdAt = new Date();
    const starterPeriod = getStarterUsagePeriod(createdAt, createdAt);
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: "starter",
        status: "active",
        currentPeriodStart: starterPeriod.start,
        currentPeriodEnd: starterPeriod.end,
      },
    });
  }

  try {
    await sendSignupAdminNotification(user.email);
  } catch (err) {
    console.error("[auth] sendSignupAdminNotification failed for Google OAuth signup", err);
  }

  try {
    await trackUserRegistered({
      user: { id: user.id, email: user.email },
      method: "google",
      provider: "google",
      tier: "starter",
    });
  } catch (err) {
    // Never let an analytics outage abort OAuth sign-up — NextAuth would
    // surface the error to the user and leave them with a created account
    // they can't sign in with.
    console.error("[auth] trackUserRegistered failed for Google OAuth signup", err);
  }
}

interface SignInEventArgs {
  user: User;
  account?: Account | null;
  isNewUser?: boolean;
}

export async function onSignIn({
  user,
  account,
  isNewUser,
}: SignInEventArgs): Promise<void> {
  if (account?.provider !== "google") return;
  if (isNewUser) return;
  if (!user?.id || !user?.email) return;

  try {
    await trackUserLogin({
      user: { id: user.id, email: user.email },
      method: "google",
      provider: "google",
    });
  } catch (err) {
    console.error("[auth] trackUserLogin failed for Google OAuth login", err);
  }
}

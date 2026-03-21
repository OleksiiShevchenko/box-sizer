"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getPriceIdForSelection,
  isBillingInterval,
  isSubscriptionTier,
  type BillingInterval,
  type SubscriptionTier,
  type SubscriptionStatus,
} from "@/lib/subscription-plans";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateStripeCustomer,
  getSubscriptionInfoForUser,
  getUserSubscription,
} from "@/services/subscription";
import type { ISubscriptionInfo } from "@/types";

type StripeSubscriptionSnapshot = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start?: number;
  current_period_end?: number;
};

function normalizeAppUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

async function getAppUrl(): Promise<string> {
  const configuredUrl =
    normalizeAppUrl(process.env.NEXTAUTH_URL) ??
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAppUrl(process.env.VERCEL_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

function normalizeStatus(status: string | null | undefined): SubscriptionStatus {
  if (status === "past_due" || status === "incomplete" || status === "canceled") {
    return status;
  }

  return "active";
}

function unixSecondsToDate(value: number | null | undefined): Date | null {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

async function syncSubscriptionSnapshot(userId: string, subscription: {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start?: number;
  current_period_end?: number;
}) {
  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: subscription.id,
      status: normalizeStatus(subscription.status),
      currentPeriodStart: unixSecondsToDate(subscription.current_period_start),
      currentPeriodEnd: unixSecondsToDate(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function createCheckoutSession(
  tier: SubscriptionTier,
  interval: BillingInterval
): Promise<{ url?: string; error?: string }> {
  if (!isSubscriptionTier(tier) || !isBillingInterval(interval) || tier === "starter") {
    return { error: "Invalid subscription selection" };
  }

  const userId = await getAuthUserId();
  const appUrl = await getAppUrl();
  const priceId = getPriceIdForSelection(tier, interval);

  if (!priceId) {
    return { error: "The selected Stripe price is not configured" };
  }

  const { stripeCustomerId } = await getOrCreateStripeCustomer(userId);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: userId,
    success_url: `${appUrl}/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancel`,
    metadata: {
      userId,
      tier,
      billingInterval: interval,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
        billingInterval: interval,
      },
    },
  });

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL" };
  }

  return { url: session.url };
}

export async function createBillingPortalSession(): Promise<{ url?: string; error?: string }> {
  const userId = await getAuthUserId();
  const appUrl = await getAppUrl();
  const { stripeCustomerId } = await getOrCreateStripeCustomer(userId);
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/settings/billing?portal=return`,
  });

  return { url: session.url };
}

export async function getSubscriptionInfo(): Promise<ISubscriptionInfo> {
  const userId = await getAuthUserId();
  return getSubscriptionInfoForUser(userId);
}

export async function cancelSubscription(): Promise<{
  success?: true;
  error?: string;
  subscription?: ISubscriptionInfo;
}> {
  const userId = await getAuthUserId();
  const subscription = await getUserSubscription(userId);

  if (!subscription.stripeSubscriptionId) {
    return { error: "No active paid subscription found" };
  }

  const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  await syncSubscriptionSnapshot(userId, updated as StripeSubscriptionSnapshot);

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  revalidatePath("/settings/billing");

  return {
    success: true,
    subscription: await getSubscriptionInfoForUser(userId),
  };
}

export async function resumeSubscription(): Promise<{
  success?: true;
  error?: string;
  subscription?: ISubscriptionInfo;
}> {
  const userId = await getAuthUserId();
  const subscription = await getUserSubscription(userId);

  if (!subscription.stripeSubscriptionId) {
    return { error: "No cancellable subscription found" };
  }

  const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
  await syncSubscriptionSnapshot(userId, updated as StripeSubscriptionSnapshot);

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
  revalidatePath("/settings/billing");

  return {
    success: true,
    subscription: await getSubscriptionInfoForUser(userId),
  };
}

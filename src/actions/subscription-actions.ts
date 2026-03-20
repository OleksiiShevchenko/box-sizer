"use server";

import { revalidatePath } from "next/cache";
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

function getAppUrl(): string {
  return process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
    success_url: `${getAppUrl()}/settings/billing?checkout=success`,
    cancel_url: `${getAppUrl()}/settings/billing?checkout=cancel`,
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
  const { stripeCustomerId } = await getOrCreateStripeCustomer(userId);
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getAppUrl()}/settings/billing?portal=return`,
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

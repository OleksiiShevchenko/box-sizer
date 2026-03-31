import type { Subscription } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getPlanForTier,
  type BillingInterval,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/subscription-plans";
import { stripe } from "@/lib/stripe";
import { notifyQuotaReached } from "@/services/email-notifications";

export interface UserSubscription {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  tier: SubscriptionTier;
  billingInterval: BillingInterval | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionInfo extends UserSubscription {
  usageCount: number;
  usageLimit: number | null;
  hasApiAccess: boolean;
  planName: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
}

function normalizeStatus(value: string | null | undefined): SubscriptionStatus {
  if (value === "past_due" || value === "incomplete" || value === "canceled") {
    return value;
  }

  return "active";
}

function normalizeBillingInterval(value: string | null | undefined): BillingInterval | null {
  if (value === "monthly" || value === "annual") {
    return value;
  }

  return null;
}

function normalizeSubscription(userId: string, subscription: Subscription | null): UserSubscription {
  if (!subscription) {
    return {
      userId,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  return {
    userId,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    stripePriceId: subscription.stripePriceId,
    tier: getPlanForTier(subscription.tier).tier,
    billingInterval: normalizeBillingInterval(subscription.billingInterval),
    status: normalizeStatus(subscription.status),
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

function getCurrentMonthRange(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { start, end };
}

export function getNextMonthStart(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export function formatUsagePeriodKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");

  return `${year}-${month}`;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return normalizeSubscription(userId, subscription);
}

export async function getCalculationUsageCount(
  userId: string,
  now = new Date()
): Promise<number> {
  const { start, end } = getCurrentMonthRange(now);

  return prisma.calculationUsage.count({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });
}

export async function canPerformCalculation(userId: string): Promise<boolean> {
  const [subscription, usageCount] = await Promise.all([
    getUserSubscription(userId),
    getCalculationUsageCount(userId),
  ]);
  const plan = getPlanForTier(subscription.tier);

  if (!Number.isFinite(plan.calculationLimit)) {
    return true;
  }

  return usageCount < plan.calculationLimit;
}

export async function recordCalculationUsage(userId: string) {
  return prisma.calculationUsage.create({
    data: { userId },
  });
}

export async function getOrCreateStripeCustomer(
  userId: string
): Promise<{ stripeCustomerId: string; subscription: UserSubscription }> {
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription?.stripeCustomerId) {
    return {
      stripeCustomerId: existingSubscription.stripeCustomerId,
      subscription: normalizeSubscription(userId, existingSubscription),
    };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      email: true,
      name: true,
    },
  });

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: {
      userId,
    },
  });

  const subscription = existingSubscription
    ? await prisma.subscription.update({
        where: { userId },
        data: {
          stripeCustomerId: customer.id,
          tier: "starter",
          status: "active",
        },
      })
    : await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
          tier: "starter",
          status: "active",
        },
      });

  return {
    stripeCustomerId: customer.id,
    subscription: normalizeSubscription(userId, subscription),
  };
}

export async function getSubscriptionInfoForUser(userId: string): Promise<SubscriptionInfo> {
  const [subscription, usageCount] = await Promise.all([
    getUserSubscription(userId),
    getCalculationUsageCount(userId),
  ]);
  const plan = getPlanForTier(subscription.tier);

  return {
    ...subscription,
    usageCount,
    usageLimit: Number.isFinite(plan.calculationLimit) ? plan.calculationLimit : null,
    hasApiAccess: plan.hasApiAccess,
    planName: plan.name,
    monthlyPriceCents: plan.monthlyPriceCents,
    annualPriceCents: plan.annualPriceCents,
  };
}

export async function notifyQuotaReachedIfNeeded(
  userId: string,
  now = new Date()
): Promise<void> {
  const subscriptionInfo = await getSubscriptionInfoForUser(userId);

  if (subscriptionInfo.usageLimit === null || subscriptionInfo.usageCount < subscriptionInfo.usageLimit) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    return;
  }

  try {
    const recommendedUpgradeTier =
      subscriptionInfo.tier === "starter"
        ? "pro"
        : subscriptionInfo.tier === "pro"
          ? "business"
          : null;

    await notifyQuotaReached({
      userId,
      email: user.email,
      tier: subscriptionInfo.tier,
      usageCount: subscriptionInfo.usageCount,
      usageLimit: subscriptionInfo.usageLimit,
      quotaResetDate: getNextMonthStart(now),
      recommendedUpgradeTier,
      periodKey: formatUsagePeriodKey(now),
    });
  } catch (error) {
    console.error(error);
  }
}

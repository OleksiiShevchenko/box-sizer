import { Prisma, type Subscription } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getPlanForTier,
  type BillingInterval,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/subscription-plans";
import { stripe } from "@/lib/stripe";
import { notifyQuotaReached } from "@/services/email-notifications";

type DbClient = Prisma.TransactionClient | typeof prisma;
type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

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

export interface UsagePeriod {
  start: Date;
  end: Date;
}

export class CalculationQuotaExceededError extends Error {
  readonly usageLimit: number;

  constructor(usageLimit: number) {
    super(formatCalculationQuotaExceededMessage(usageLimit));
    this.name = "CalculationQuotaExceededError";
    this.usageLimit = usageLimit;
  }
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

function getDaysInUtcMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addUtcMonthsClamped(value: Date, months: number): Date {
  const monthIndex = value.getUTCFullYear() * 12 + value.getUTCMonth() + months;
  const normalizedMonth = ((monthIndex % 12) + 12) % 12;
  const year = (monthIndex - normalizedMonth) / 12;
  const day = Math.min(value.getUTCDate(), getDaysInUtcMonth(year, normalizedMonth));

  return new Date(
    Date.UTC(
      year,
      normalizedMonth,
      day,
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds()
    )
  );
}

function sameInstant(left: Date | null | undefined, right: Date | null | undefined): boolean {
  return left?.getTime() === right?.getTime();
}

function isStarterTier(subscription: Subscription | UserSubscription | null): boolean {
  return getPlanForTier(subscription?.tier).tier === "starter";
}

function isWithinPeriod(period: UsagePeriod, now: Date): boolean {
  const time = now.getTime();
  return time >= period.start.getTime() && time < period.end.getTime();
}

export function getStarterUsagePeriod(anchor: Date, now = new Date()): UsagePeriod {
  let start = new Date(anchor);
  let end = addUtcMonthsClamped(start, 1);

  while (now.getTime() >= end.getTime()) {
    start = end;
    end = addUtcMonthsClamped(start, 1);
  }

  while (now.getTime() < start.getTime()) {
    end = start;
    start = addUtcMonthsClamped(start, -1);
  }

  return { start, end };
}

export function formatUsagePeriodKey(start: Date, end: Date): string {
  return `${start.toISOString()}_${end.toISOString()}`;
}

export function formatCalculationQuotaExceededMessage(usageLimit: number): string {
  return `You have used all ${usageLimit} calculations for the current billing period. Upgrade your plan to continue.`;
}

function getUsageWhereClause(userId: string, period: UsagePeriod) {
  return {
    userId,
    createdAt: {
      gte: period.start,
      lt: period.end,
    },
  };
}

function buildStarterSubscriptionData(userId: string, createdAt: Date, now: Date) {
  const period = getStarterUsagePeriod(createdAt, now);

  return {
    userId,
    tier: "starter" as const,
    billingInterval: null,
    status: "active" as const,
    stripePriceId: null,
    stripeSubscriptionId: null,
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    cancelAtPeriodEnd: false,
  };
}

async function fetchStripeBillingPeriod(subscriptionId: string): Promise<UsagePeriod> {
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId
  ) as StripeSubscriptionWithPeriods;
  const start = typeof stripeSubscription.current_period_start === "number"
    ? new Date(stripeSubscription.current_period_start * 1000)
    : null;
  const end = typeof stripeSubscription.current_period_end === "number"
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null;

  if (!start || !end) {
    throw new Error("Subscription billing period is unavailable");
  }

  return { start, end };
}

async function resolveUsagePeriod(
  db: DbClient,
  userId: string,
  now = new Date(),
  options?: {
    allowStripeRefresh?: boolean;
  }
): Promise<{ subscription: UserSubscription; period: UsagePeriod }> {
  const [user, subscription] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { createdAt: true },
    }),
    db.subscription.findUnique({
      where: { userId },
    }),
  ]);

  if (!subscription) {
    const created = await db.subscription.create({
      data: {
        ...buildStarterSubscriptionData(userId, user.createdAt, now),
        stripeCustomerId: null,
      },
    });
    const normalized = normalizeSubscription(userId, created);

    return {
      subscription: normalized,
      period: {
        start: created.currentPeriodStart!,
        end: created.currentPeriodEnd!,
      },
    };
  }

  if (isStarterTier(subscription)) {
    const expectedPeriod = getStarterUsagePeriod(user.createdAt, now);

    if (
      !sameInstant(subscription.currentPeriodStart, expectedPeriod.start) ||
      !sameInstant(subscription.currentPeriodEnd, expectedPeriod.end) ||
      normalizeStatus(subscription.status) !== "active"
    ) {
      const updated = await db.subscription.update({
        where: { userId },
        data: {
          currentPeriodStart: expectedPeriod.start,
          currentPeriodEnd: expectedPeriod.end,
          status: "active",
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: null,
          stripePriceId: null,
        },
      });

      return {
        subscription: normalizeSubscription(userId, updated),
        period: expectedPeriod,
      };
    }

    return {
      subscription: normalizeSubscription(userId, subscription),
      period: {
        start: subscription.currentPeriodStart!,
        end: subscription.currentPeriodEnd!,
      },
    };
  }

  const existingPeriod =
    subscription.currentPeriodStart && subscription.currentPeriodEnd
      ? {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd,
        }
      : null;

  if (existingPeriod && isWithinPeriod(existingPeriod, now)) {
    return {
      subscription: normalizeSubscription(userId, subscription),
      period: existingPeriod,
    };
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error("Subscription billing period is unavailable");
  }

  if (options?.allowStripeRefresh === false) {
    throw new Error("Subscription billing period is unavailable");
  }

  const stripePeriod = await fetchStripeBillingPeriod(subscription.stripeSubscriptionId);
  const updated = await db.subscription.update({
    where: { userId },
    data: {
      currentPeriodStart: stripePeriod.start,
      currentPeriodEnd: stripePeriod.end,
    },
  });

  return {
    subscription: normalizeSubscription(userId, updated),
    period: stripePeriod,
  };
}

async function getUsageSnapshot(userId: string, now = new Date()) {
  const { subscription, period } = await resolveUsagePeriod(prisma, userId, now);
  const usageCount = await prisma.calculationUsage.count({
    where: getUsageWhereClause(userId, period),
  });

  return { subscription, period, usageCount };
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const { subscription } = await resolveUsagePeriod(prisma, userId);
  return subscription;
}

export async function getCalculationUsageCount(
  userId: string,
  now = new Date()
): Promise<number> {
  const { usageCount } = await getUsageSnapshot(userId, now);
  return usageCount;
}

export async function getOrCreateStripeCustomer(
  userId: string
): Promise<{ stripeCustomerId: string; subscription: UserSubscription }> {
  const { subscription: existingSubscription } = await resolveUsagePeriod(prisma, userId);

  if (existingSubscription.stripeCustomerId) {
    return {
      stripeCustomerId: existingSubscription.stripeCustomerId,
      subscription: existingSubscription,
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

  const subscription = await prisma.subscription.update({
    where: { userId },
    data: {
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
  const { subscription, usageCount } = await getUsageSnapshot(userId);
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

export async function performMeteredCalculation<T>(
  userId: string,
  run: (tx: Prisma.TransactionClient) => Promise<T>,
  now = new Date()
): Promise<T> {
  // Refresh any stale paid billing window before opening the serializable transaction so
  // database locks are not held during Stripe network round-trips.
  await resolveUsagePeriod(prisma, userId, now);

  return prisma.$transaction(
    async (tx) => {
      const { subscription, period } = await resolveUsagePeriod(tx, userId, now, {
        allowStripeRefresh: false,
      });
      const plan = getPlanForTier(subscription.tier);

      if (Number.isFinite(plan.calculationLimit)) {
        const usageCount = await tx.calculationUsage.count({
          where: getUsageWhereClause(userId, period),
        });

        if (usageCount >= plan.calculationLimit) {
          throw new CalculationQuotaExceededError(plan.calculationLimit);
        }
      }

      const result = await run(tx);

      await tx.calculationUsage.create({
        data: { userId },
      });

      return result;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function notifyQuotaReachedIfNeeded(
  userId: string,
  _now = new Date()
): Promise<void> {
  void _now;
  const subscriptionInfo = await getSubscriptionInfoForUser(userId);

  if (subscriptionInfo.usageLimit === null || subscriptionInfo.usageCount < subscriptionInfo.usageLimit) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email || !subscriptionInfo.currentPeriodStart || !subscriptionInfo.currentPeriodEnd) {
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
      quotaResetDate: subscriptionInfo.currentPeriodEnd,
      recommendedUpgradeTier,
      periodKey: formatUsagePeriodKey(
        subscriptionInfo.currentPeriodStart,
        subscriptionInfo.currentPeriodEnd
      ),
    });
  } catch (error) {
    console.error(error);
  }
}

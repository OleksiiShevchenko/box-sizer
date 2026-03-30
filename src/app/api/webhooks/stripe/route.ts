import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getPlanForTier,
  getPlanFromPriceId,
  type BillingInterval,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/subscription-plans";
import { stripe } from "@/lib/stripe";
import {
  notifySubscriptionPurchaseSuccess,
  notifySubscriptionRenewalFailure,
  notifySubscriptionRenewalSuccess,
} from "@/services/email-notifications";

export const runtime = "nodejs";

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

type NotificationContext = {
  userId: string;
  email: string;
  planName: string;
  billingInterval: BillingInterval | null;
  currentPeriodEnd: Date | null;
};

function unixSecondsToDate(value: number | null | undefined): Date | null {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

function normalizeStatus(value: string): SubscriptionStatus {
  if (value === "past_due" || value === "incomplete" || value === "canceled") {
    return value;
  }

  return "active";
}

function normalizeSubscriptionTier(value: string | null | undefined): SubscriptionTier | null {
  if (value === "starter" || value === "pro" || value === "business") {
    return value;
  }

  return null;
}

function normalizeBillingInterval(value: string | null | undefined): BillingInterval | null {
  if (value === "monthly" || value === "annual") {
    return value;
  }

  return null;
}

async function upsertSubscriptionFromStripe(subscription: StripeSubscriptionWithPeriods) {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const mappedPlan = getPlanFromPriceId(priceId);
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const data = {
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    tier: mappedPlan?.tier ?? "starter",
    billingInterval: mappedPlan?.interval ?? null,
    status: normalizeStatus(subscription.status),
    currentPeriodStart: unixSecondsToDate(subscription.current_period_start),
    currentPeriodEnd: unixSecondsToDate(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  const existing = await prisma.subscription.findFirst({
    where: {
      OR: [{ stripeCustomerId }, { stripeSubscriptionId: subscription.id }],
    },
    select: { userId: true },
  });

  const metadataUserId = subscription.metadata.userId;

  if (existing?.userId) {
    await prisma.subscription.update({
      where: { userId: existing.userId },
      data,
    });
    return;
  }

  if (!metadataUserId) {
    return;
  }

  await prisma.subscription.upsert({
    where: { userId: metadataUserId },
    update: data,
    create: {
      userId: metadataUserId,
      ...data,
    },
  });
}

async function resetSubscriptionToStarter(subscription: StripeSubscriptionWithPeriods) {
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await prisma.subscription.updateMany({
    where: {
      OR: [{ stripeSubscriptionId: subscription.id }, { stripeCustomerId }],
    },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });
}

async function markInvoiceAsPastDue(invoice: StripeInvoiceWithSubscription) {
  const stripeCustomerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const filters = [];

  if (stripeCustomerId) {
    filters.push({ stripeCustomerId });
  }

  if (stripeSubscriptionId) {
    filters.push({ stripeSubscriptionId });
  }

  if (filters.length === 0) {
    return;
  }

  await prisma.subscription.updateMany({
    where: { OR: filters },
    data: { status: "past_due" },
  });
}

async function findStoredSubscriptionContext(args: {
  userId?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<NotificationContext | null> {
  if (args.userId) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: args.userId },
      select: {
        userId: true,
        billingInterval: true,
        currentPeriodEnd: true,
        tier: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (subscription?.user.email) {
      return {
        userId: subscription.userId,
        email: subscription.user.email,
        planName: getPlanForTier(subscription.tier).name,
        billingInterval: normalizeBillingInterval(subscription.billingInterval),
        currentPeriodEnd: subscription.currentPeriodEnd,
      };
    }
  }

  const filters = [];

  if (args.stripeCustomerId) {
    filters.push({ stripeCustomerId: args.stripeCustomerId });
  }

  if (args.stripeSubscriptionId) {
    filters.push({ stripeSubscriptionId: args.stripeSubscriptionId });
  }

  if (filters.length === 0) {
    return null;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { OR: filters },
    select: {
      userId: true,
      billingInterval: true,
      currentPeriodEnd: true,
      tier: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!subscription?.user.email) {
    return null;
  }

  return {
    userId: subscription.userId,
    email: subscription.user.email,
    planName: getPlanForTier(subscription.tier).name,
    billingInterval: normalizeBillingInterval(subscription.billingInterval),
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}

async function getCheckoutSessionNotificationContext(
  session: Stripe.Checkout.Session
): Promise<NotificationContext | null> {
  const metadataUserId = session.metadata?.userId;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const storedContext = await findStoredSubscriptionContext({
    userId: metadataUserId,
    stripeCustomerId,
    stripeSubscriptionId,
  });

  const metadataTier = session.metadata?.tier ?? null;
  const metadataInterval = session.metadata?.billingInterval ?? null;
  const lineItemPriceId =
    "line_items" in session ? session.line_items?.data[0]?.price?.id ?? null : null;
  const mappedPlan = getPlanFromPriceId(lineItemPriceId);

  const fallbackTier: SubscriptionTier =
    normalizeSubscriptionTier(metadataTier) ?? mappedPlan?.tier ?? "starter";
  const fallbackInterval: BillingInterval | null =
    normalizeBillingInterval(metadataInterval) ?? mappedPlan?.interval ?? null;

  if (storedContext) {
    return {
      ...storedContext,
      planName:
        storedContext.planName === getPlanForTier("starter").name && fallbackTier !== "starter"
          ? getPlanForTier(fallbackTier).name
          : storedContext.planName,
      billingInterval: storedContext.billingInterval ?? fallbackInterval,
    };
  }

  if (!metadataUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: metadataUserId },
    select: { email: true },
  });

  if (!user?.email) {
    return null;
  }

  return {
    userId: metadataUserId,
    email: user.email,
    planName: getPlanForTier(fallbackTier).name,
    billingInterval: fallbackInterval,
    currentPeriodEnd: null,
  };
}

async function getInvoiceNotificationContext(
  invoice: StripeInvoiceWithSubscription
): Promise<NotificationContext | null> {
  const stripeCustomerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id ?? null;

  return findStoredSubscriptionContext({
    stripeCustomerId,
    stripeSubscriptionId,
  });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.mode !== "subscription") {
    return;
  }

  const context = await getCheckoutSessionNotificationContext(session);

  if (!context) {
    return;
  }

  await notifySubscriptionPurchaseSuccess({
    ...context,
    eventId: event.id,
  });
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as StripeInvoiceWithSubscription;

  if (!invoice.subscription || invoice.billing_reason !== "subscription_cycle") {
    return;
  }

  const context = await getInvoiceNotificationContext(invoice);

  if (!context) {
    return;
  }

  await notifySubscriptionRenewalSuccess({
    ...context,
    eventId: event.id,
  });
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as StripeInvoiceWithSubscription;

  await markInvoiceAsPastDue(invoice);

  if (!invoice.subscription) {
    return;
  }

  const context = await getInvoiceNotificationContext(invoice);

  if (!context) {
    return;
  }

  await notifySubscriptionRenewalFailure({
    ...context,
    eventId: event.id,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe webhook configuration" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await resetSubscriptionToStarter(event.data.object as StripeSubscriptionWithPeriods);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

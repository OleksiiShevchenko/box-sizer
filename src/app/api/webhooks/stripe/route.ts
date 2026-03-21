import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getPlanFromPriceId, type SubscriptionStatus } from "@/lib/subscription-plans";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
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
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await resetSubscriptionToStarter(event.data.object as StripeSubscriptionWithPeriods);
      break;
    case "invoice.payment_failed":
      await markInvoiceAsPastDue(event.data.object as StripeInvoiceWithSubscription);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

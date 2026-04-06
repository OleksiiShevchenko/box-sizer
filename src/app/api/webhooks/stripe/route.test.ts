import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  notifySubscriptionPurchaseSuccess,
  notifySubscriptionRenewalFailure,
  notifySubscriptionRenewalSuccess,
} from "@/services/email-notifications";
import { POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    paymentIntents: {
      retrieve: jest.fn(),
    },
    charges: {
      retrieve: jest.fn(),
    },
  },
}));

jest.mock("@/lib/posthog-server", () => ({
  getPostHogClient: () => ({
    capture: jest.fn(),
  }),
}));

jest.mock("@/services/email-notifications", () => ({
  notifySubscriptionPurchaseSuccess: jest.fn(),
  notifySubscriptionRenewalFailure: jest.fn(),
  notifySubscriptionRenewalSuccess: jest.fn(),
}));

const subscriptionFindFirst = prisma.subscription.findFirst as unknown as jest.Mock;
const subscriptionFindUnique = prisma.subscription.findUnique as unknown as jest.Mock;
const subscriptionUpsert = prisma.subscription.upsert as unknown as jest.Mock;
const subscriptionUpdateMany = prisma.subscription.updateMany as unknown as jest.Mock;
const userFindUnique = prisma.user.findUnique as unknown as jest.Mock;
const constructEvent = stripe.webhooks.constructEvent as unknown as jest.Mock;
const paymentIntentRetrieve = stripe.paymentIntents.retrieve as unknown as jest.Mock;
const chargeRetrieve = stripe.charges.retrieve as unknown as jest.Mock;
const mockedNotifyPurchase = jest.mocked(notifySubscriptionPurchaseSuccess);
const mockedNotifyRenewalFailure = jest.mocked(notifySubscriptionRenewalFailure);
const mockedNotifyRenewalSuccess = jest.mocked(notifySubscriptionRenewalSuccess);

describe("Stripe webhook route", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID = "price_growth_monthly";
  });

  it("upserts subscription state from a subscription.updated event", async () => {
    constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          items: { data: [{ price: { id: "price_growth_monthly" } }] },
          status: "active",
          current_period_start: 1710000000,
          current_period_end: 1712600000,
          cancel_at_period_end: false,
          metadata: { userId: "user-1" },
        },
      },
    } as never);
    subscriptionFindFirst.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(subscriptionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
      })
    );
  });

  it("sends a purchase success notification for completed subscription checkout", async () => {
    constructEvent.mockReturnValue({
      id: "evt_purchase",
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          customer: "cus_123",
          subscription: "sub_123",
          metadata: {
            userId: "user-1",
            tier: "growth",
            billingInterval: "monthly",
          },
        },
      },
    } as never);
    subscriptionFindUnique.mockResolvedValue(null);
    subscriptionFindFirst.mockResolvedValue(null);
    userFindUnique.mockResolvedValue({ email: "alex@example.com" });

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(mockedNotifyPurchase).toHaveBeenCalledWith({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: null,
      eventId: "evt_purchase",
    });
  });

  it("sends renewal success notifications with receipt metadata from Stripe", async () => {
    constructEvent.mockReturnValue({
      id: "evt_success",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
          billing_reason: "subscription_cycle",
          amount_paid: 2900,
          hosted_invoice_url: "https://pay.stripe.com/invoice/123",
          invoice_pdf: "https://stripe.com/invoice.pdf",
          payment_intent: "pi_123",
        },
      },
    } as never);
    subscriptionFindFirst.mockResolvedValue({
      userId: "user-1",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      tier: "growth",
      user: {
        email: "alex@example.com",
      },
    });
    paymentIntentRetrieve.mockResolvedValue({
      payment_method: {
        card: {
          brand: "visa",
          last4: "4242",
        },
      },
    });

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(mockedNotifyRenewalSuccess).toHaveBeenCalledWith({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      eventId: "evt_success",
      amountPaidCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      hostedInvoiceUrl: "https://pay.stripe.com/invoice/123",
      invoicePdfUrl: "https://stripe.com/invoice.pdf",
    });
  });

  it("does not send renewal success notifications for non-renewal invoice reasons", async () => {
    constructEvent.mockReturnValue({
      id: "evt_success",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
          billing_reason: "subscription_create",
        },
      },
    } as never);

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(mockedNotifyRenewalSuccess).not.toHaveBeenCalled();
  });

  it("marks matching subscriptions as past due on invoice failures and uses charge fallback", async () => {
    constructEvent.mockReturnValue({
      id: "evt_failed",
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
          amount_due: 2900,
          next_payment_attempt: 1775121600,
          charge: "ch_123",
        },
      },
    } as never);
    subscriptionFindFirst.mockResolvedValue({
      userId: "user-1",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      tier: "growth",
      user: {
        email: "alex@example.com",
      },
    });
    chargeRetrieve.mockResolvedValue({
      payment_method_details: {
        card: {
          brand: "visa",
          last4: "4242",
        },
      },
    });

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: "{}",
      })
    );

    expect(response.status).toBe(200);
    expect(subscriptionUpdateMany).toHaveBeenCalledWith({
      where: {
        OR: [{ stripeCustomerId: "cus_123" }, { stripeSubscriptionId: "sub_123" }],
      },
      data: { status: "past_due" },
    });
    expect(mockedNotifyRenewalFailure).toHaveBeenCalledWith({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      eventId: "evt_failed",
      amountDueCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      nextRetryAt: new Date(1775121600 * 1000),
    });
  });
});

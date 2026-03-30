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
  },
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
const mockedNotifyPurchase = jest.mocked(notifySubscriptionPurchaseSuccess);
const mockedNotifyRenewalFailure = jest.mocked(notifySubscriptionRenewalFailure);
const mockedNotifyRenewalSuccess = jest.mocked(notifySubscriptionRenewalSuccess);

describe("Stripe webhook route", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
  });

  it("upserts subscription state from a subscription.updated event", async () => {
    constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          items: { data: [{ price: { id: "price_pro_monthly" } }] },
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
            tier: "pro",
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
      planName: "Pro",
      billingInterval: "monthly",
      currentPeriodEnd: null,
      eventId: "evt_purchase",
    });
  });

  it("sends a renewal success notification for subscription cycle invoices", async () => {
    constructEvent.mockReturnValue({
      id: "evt_success",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
          billing_reason: "subscription_cycle",
        },
      },
    } as never);
    subscriptionFindFirst.mockResolvedValue({
      userId: "user-1",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      tier: "pro",
      user: {
        email: "alex@example.com",
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
      planName: "Pro",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      eventId: "evt_success",
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

  it("marks matching subscriptions as past due on invoice failures", async () => {
    constructEvent.mockReturnValue({
      id: "evt_failed",
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    } as never);
    subscriptionFindFirst.mockResolvedValue({
      userId: "user-1",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      tier: "pro",
      user: {
        email: "alex@example.com",
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
      planName: "Pro",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      eventId: "evt_failed",
    });
  });
});

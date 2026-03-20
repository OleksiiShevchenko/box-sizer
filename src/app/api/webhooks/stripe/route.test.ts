import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      updateMany: jest.fn(),
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

const subscriptionFindFirst = prisma.subscription.findFirst as unknown as jest.Mock;
const subscriptionUpsert = prisma.subscription.upsert as unknown as jest.Mock;
const subscriptionUpdateMany = prisma.subscription.updateMany as unknown as jest.Mock;
const constructEvent = stripe.webhooks.constructEvent as unknown as jest.Mock;

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

  it("marks matching subscriptions as past due on invoice failures", async () => {
    constructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
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
    expect(subscriptionUpdateMany).toHaveBeenCalledWith({
      where: {
        OR: [{ stripeCustomerId: "cus_123" }, { stripeSubscriptionId: "sub_123" }],
      },
      data: { status: "past_due" },
    });
  });
});

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import {
  getOrCreateStripeCustomer,
  getSubscriptionInfoForUser,
  getUserSubscription,
} from "@/services/subscription";
import {
  cancelSubscription,
  createBillingPortalSession,
  createCheckoutSession,
  getSubscriptionInfo,
  resumeSubscription,
} from "./subscription-actions";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    subscriptions: {
      update: jest.fn(),
    },
  },
}));

jest.mock("@/services/subscription", () => ({
  getOrCreateStripeCustomer: jest.fn(),
  getSubscriptionInfoForUser: jest.fn(),
  getUserSubscription: jest.fn(),
}));

const mockedAuth = jest.mocked(auth);
const subscriptionUpdate = prisma.subscription.update as unknown as jest.Mock;
const checkoutSessionCreate = stripe.checkout.sessions.create as unknown as jest.Mock;
const billingPortalCreate = stripe.billingPortal.sessions.create as unknown as jest.Mock;
const stripeSubscriptionUpdate = stripe.subscriptions.update as unknown as jest.Mock;
const mockedHeaders = headers as unknown as jest.Mock;
const mockedSubscriptionService = {
  getOrCreateStripeCustomer: jest.mocked(getOrCreateStripeCustomer),
  getSubscriptionInfoForUser: jest.mocked(getSubscriptionInfoForUser),
  getUserSubscription: jest.mocked(getUserSubscription),
};

describe("subscription actions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID = "price_growth_monthly";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    process.env.NEXTAUTH_URL = "";
    process.env.NEXT_PUBLIC_APP_URL = "";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "";
    process.env.VERCEL_URL = "";
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", tier: "starter" },
    } as never);
    mockedHeaders.mockResolvedValue(
      new Headers({
        host: "localhost:3000",
        "x-forwarded-proto": "http",
      })
    );
  });

  it("creates a Stripe checkout session for a paid plan", async () => {
    mockedSubscriptionService.getOrCreateStripeCustomer.mockResolvedValue({
      stripeCustomerId: "cus_123",
      subscription: {} as never,
    });
    checkoutSessionCreate.mockResolvedValue({
      url: "https://checkout.stripe.test/session",
    } as never);

    await expect(createCheckoutSession("growth", "monthly")).resolves.toEqual({
      url: "https://checkout.stripe.test/session",
    });
    expect(checkoutSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_123",
        line_items: [{ price: "price_growth_monthly", quantity: 1 }],
      })
    );
  });

  it("normalizes host-only app urls before creating Stripe sessions", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "packwell.io";
    mockedSubscriptionService.getOrCreateStripeCustomer.mockResolvedValue({
      stripeCustomerId: "cus_123",
      subscription: {} as never,
    });
    checkoutSessionCreate.mockResolvedValue({
      url: "https://checkout.stripe.test/session",
    } as never);

    await createCheckoutSession("growth", "monthly");

    expect(checkoutSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://packwell.io/settings/billing?checkout=success",
        cancel_url: "https://packwell.io/settings/billing?checkout=cancel",
      })
    );
  });

  it("creates a billing portal session", async () => {
    mockedSubscriptionService.getOrCreateStripeCustomer.mockResolvedValue({
      stripeCustomerId: "cus_123",
      subscription: {} as never,
    });
    billingPortalCreate.mockResolvedValue({
      url: "https://billing.stripe.test/session",
    } as never);

    await expect(createBillingPortalSession()).resolves.toEqual({
      url: "https://billing.stripe.test/session",
    });
  });

  it("returns the current subscription info for the logged-in user", async () => {
    mockedSubscriptionService.getSubscriptionInfoForUser.mockResolvedValue({
      userId: "user-1",
      tier: "starter",
      planName: "Starter",
      status: "active",
      billingInterval: null,
      usageCount: 3,
      usageLimit: 15,
      hasApiAccess: false,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      monthlyPriceCents: 0,
      annualPriceCents: 0,
    } as never);

    await expect(getSubscriptionInfo()).resolves.toMatchObject({
      tier: "starter",
      usageCount: 3,
    });
  });

  it("cancels and resumes a Stripe subscription", async () => {
    mockedSubscriptionService.getUserSubscription
      .mockResolvedValueOnce({
        stripeSubscriptionId: "sub_123",
      } as never)
      .mockResolvedValueOnce({
        stripeSubscriptionId: "sub_123",
      } as never);
    stripeSubscriptionUpdate
      .mockResolvedValueOnce({
        id: "sub_123",
        status: "active",
        current_period_start: 1710000000,
        current_period_end: 1712600000,
        cancel_at_period_end: true,
      } as never)
      .mockResolvedValueOnce({
        id: "sub_123",
        status: "active",
        current_period_start: 1710000000,
        current_period_end: 1712600000,
        cancel_at_period_end: false,
      } as never);
    mockedSubscriptionService.getSubscriptionInfoForUser
      .mockResolvedValueOnce({
        cancelAtPeriodEnd: true,
      } as never)
      .mockResolvedValueOnce({
        cancelAtPeriodEnd: false,
      } as never);

    await expect(cancelSubscription()).resolves.toMatchObject({ success: true });
    await expect(resumeSubscription()).resolves.toMatchObject({ success: true });
    expect(subscriptionUpdate).toHaveBeenCalledTimes(2);
  });
});

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  CalculationQuotaExceededError,
  addUtcMonthsClamped,
  formatCalculationQuotaExceededMessage,
  formatUsagePeriodKey,
  getCalculationUsageCount,
  getOrCreateStripeCustomer,
  getStarterUsagePeriod,
  getSubscriptionInfoForUser,
  getUserSubscription,
  notifyQuotaReachedIfNeeded,
  performMeteredCalculation,
} from "./subscription";
import { notifyQuotaReached } from "@/services/email-notifications";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    calculationUsage: {
      count: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  },
}));

jest.mock("@/services/email-notifications", () => ({
  notifyQuotaReached: jest.fn(),
}));

const prismaMock = prisma as unknown as {
  $transaction: jest.Mock;
  subscription: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  calculationUsage: {
    count: jest.Mock;
    create: jest.Mock;
  };
  user: {
    findUniqueOrThrow: jest.Mock;
    findUnique: jest.Mock;
  };
};
const stripeCustomerCreate = stripe.customers.create as jest.MockedFunction<
  typeof stripe.customers.create
>;
const stripeSubscriptionRetrieve = stripe.subscriptions.retrieve as jest.MockedFunction<
  typeof stripe.subscriptions.retrieve
>;
const mockedNotifyQuotaReached = jest.mocked(notifyQuotaReached);

describe("subscription service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    prismaMock.$transaction.mockImplementation(async (input: unknown) => {
      if (typeof input === "function") {
        return input({
          subscription: prismaMock.subscription,
          calculationUsage: prismaMock.calculationUsage,
          user: prismaMock.user,
        });
      }

      return Promise.all(input as Promise<unknown>[]);
    });
  });

  it("creates a starter subscription row when one is missing", async () => {
    const createdAt = new Date("2026-03-19T12:00:00.000Z");
    const expectedPeriod = getStarterUsagePeriod(createdAt);
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({ createdAt } as never);
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.subscription.create.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: expectedPeriod.start,
      currentPeriodEnd: expectedPeriod.end,
      cancelAtPeriodEnd: false,
      createdAt,
      updatedAt: createdAt,
    } as never);

    await expect(getUserSubscription("user-1")).resolves.toMatchObject({
      userId: "user-1",
      tier: "starter",
      currentPeriodStart: expectedPeriod.start,
      currentPeriodEnd: expectedPeriod.end,
    });

    expect(prismaMock.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        stripeCustomerId: null,
        currentPeriodStart: expectedPeriod.start,
        currentPeriodEnd: expectedPeriod.end,
      }),
    });
  });

  it("counts usage inside the active Stripe billing period", async () => {
    const currentPeriodStart = new Date("2026-03-15T08:00:00.000Z");
    const currentPeriodEnd = new Date("2026-04-15T08:00:00.000Z");
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(7);

    await expect(
      getCalculationUsageCount("user-1", new Date("2026-03-19T12:00:00.000Z"))
    ).resolves.toBe(7);

    expect(prismaMock.calculationUsage.count).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        createdAt: {
          gte: currentPeriodStart,
          lt: currentPeriodEnd,
        },
      },
    });
  });

  it("backfills missing paid subscription periods from Stripe", async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    stripeSubscriptionRetrieve.mockResolvedValue({
      id: "sub_123",
      current_period_start: 1710489600,
      current_period_end: 1713168000,
    } as never);
    prismaMock.subscription.update.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: new Date("2024-03-15T00:00:00.000Z"),
      currentPeriodEnd: new Date("2024-04-15T00:00:00.000Z"),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await getUserSubscription("user-1");

    expect(stripeSubscriptionRetrieve).toHaveBeenCalledWith("sub_123");
    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      data: {
        currentPeriodStart: new Date("2024-03-15T08:00:00.000Z"),
        currentPeriodEnd: new Date("2024-04-15T08:00:00.000Z"),
      },
    });
  });

  it("creates a Stripe customer against an existing starter subscription", async () => {
    const createdAt = new Date("2026-03-19T12:00:00.000Z");
    const currentPeriod = getStarterUsagePeriod(createdAt);
    prismaMock.user.findUniqueOrThrow
      .mockResolvedValueOnce({ createdAt } as never)
      .mockResolvedValueOnce({
        email: "alex@example.com",
        name: "Alex",
      } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: currentPeriod.start,
      currentPeriodEnd: currentPeriod.end,
      cancelAtPeriodEnd: false,
      createdAt,
      updatedAt: createdAt,
    } as never);
    stripeCustomerCreate.mockResolvedValue({ id: "cus_new" } as never);
    prismaMock.subscription.update.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_new",
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: currentPeriod.start,
      currentPeriodEnd: currentPeriod.end,
      cancelAtPeriodEnd: false,
      createdAt,
      updatedAt: createdAt,
    } as never);

    const result = await getOrCreateStripeCustomer("user-1");

    expect(result.stripeCustomerId).toBe("cus_new");
    expect(stripeCustomerCreate).toHaveBeenCalledWith({
      email: "alex@example.com",
      name: "Alex",
      metadata: { userId: "user-1" },
    });
  });

  it("builds subscription info with the current period usage count", async () => {
    const currentPeriodStart = new Date("2026-03-15T08:00:00.000Z");
    const currentPeriodEnd = new Date("2026-04-15T08:00:00.000Z");
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(12);

    await expect(getSubscriptionInfoForUser("user-1")).resolves.toMatchObject({
      tier: "growth",
      usageCount: 12,
      usageLimit: 500,
      currentPeriodStart,
      currentPeriodEnd,
    });
  });

  it("records usage only after a metered transaction succeeds", async () => {
    const currentPeriodStart = new Date("2026-03-15T08:00:00.000Z");
    const currentPeriodEnd = new Date("2026-04-15T08:00:00.000Z");
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(12);
    prismaMock.calculationUsage.create.mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      createdAt: new Date(),
    } as never);

    await expect(
      performMeteredCalculation("user-1", async () => ({ ok: true }))
    ).resolves.toEqual({ ok: true });

    expect(prismaMock.calculationUsage.create).toHaveBeenCalledWith({
      data: { userId: "user-1" },
    });
  });

  it("refreshes stale paid billing periods before opening the metered transaction", async () => {
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique
      .mockResolvedValueOnce({
        id: "sub-1",
        userId: "user-1",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_growth_monthly",
        tier: "growth",
        billingInterval: "monthly",
        status: "active",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)
      .mockResolvedValueOnce({
        id: "sub-1",
        userId: "user-1",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        stripePriceId: "price_growth_monthly",
        tier: "growth",
        billingInterval: "monthly",
        status: "active",
        currentPeriodStart: new Date("2026-03-15T08:00:00.000Z"),
        currentPeriodEnd: new Date("2026-04-15T08:00:00.000Z"),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);
    stripeSubscriptionRetrieve.mockResolvedValue({
      id: "sub_123",
      current_period_start: 1773561600,
      current_period_end: 1776240000,
    } as never);
    prismaMock.subscription.update.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: new Date("2026-03-15T08:00:00.000Z"),
      currentPeriodEnd: new Date("2026-04-15T08:00:00.000Z"),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(12);
    prismaMock.calculationUsage.create.mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      createdAt: new Date(),
    } as never);

    await performMeteredCalculation("user-1", async () => ({ ok: true }));

    expect(stripeSubscriptionRetrieve).toHaveBeenCalledTimes(1);
    expect(prismaMock.subscription.findUnique).toHaveBeenCalledTimes(2);
  });

  it("does not record usage when the metered transaction exceeds quota", async () => {
    const currentPeriodStart = new Date("2026-03-15T08:00:00.000Z");
    const currentPeriodEnd = new Date("2026-04-15T08:00:00.000Z");
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(50);

    await expect(
      performMeteredCalculation("user-1", async () => ({ ok: true }))
    ).rejects.toThrow(CalculationQuotaExceededError);
    expect(prismaMock.calculationUsage.create).not.toHaveBeenCalled();
  });

  it("formats starter periods in UTC and clamps month boundaries", () => {
    const anchor = new Date("2026-01-31T18:45:00.000Z");
    const current = new Date("2026-02-28T18:44:59.000Z");
    const period = getStarterUsagePeriod(anchor, current);

    expect(addUtcMonthsClamped(anchor, 1)).toEqual(new Date("2026-02-28T18:45:00.000Z"));
    expect(period).toEqual({
      start: anchor,
      end: new Date("2026-02-28T18:45:00.000Z"),
    });
  });

  it("formats usage period keys from explicit period boundaries", () => {
    expect(
      formatUsagePeriodKey(
        new Date("2026-03-19T12:00:00.000Z"),
        new Date("2026-04-19T12:00:00.000Z")
      )
    ).toBe("2026-03-19T12:00:00.000Z_2026-04-19T12:00:00.000Z");
  });

  it("sends the quota email once usage is exhausted for the current billing period", async () => {
    const currentPeriodStart = new Date("2026-03-15T08:00:00.000Z");
    const currentPeriodEnd = new Date("2026-04-15T08:00:00.000Z");
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_growth_monthly",
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(500);
    prismaMock.user.findUnique.mockResolvedValue({ email: "alex@example.com" } as never);

    await notifyQuotaReachedIfNeeded("user-1", new Date("2026-03-19T12:00:00.000Z"));

    expect(mockedNotifyQuotaReached).toHaveBeenCalledWith({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      usageCount: 500,
      usageLimit: 500,
      quotaResetDate: currentPeriodEnd,
      recommendedUpgradeTier: "pro",
      periodKey: formatUsagePeriodKey(currentPeriodStart, currentPeriodEnd),
    });
  });

  it("formats the current billing period quota error message", () => {
    expect(formatCalculationQuotaExceededMessage(50)).toBe(
      "You have used all 50 calculations for the current billing period. Upgrade your plan to continue."
    );
  });

  it("falls back to starter period when paid tier has no stripeSubscriptionId yet", async () => {
    const createdAt = new Date("2026-03-19T12:00:00.000Z");
    prismaMock.user.findUniqueOrThrow.mockResolvedValue({
      createdAt,
    } as never);
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "growth",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    prismaMock.calculationUsage.count.mockResolvedValue(0);

    const now = new Date("2026-04-01T12:00:00.000Z");
    const result = await getCalculationUsageCount("user-1", now);

    expect(result).toBe(0);
    expect(stripeSubscriptionRetrieve).not.toHaveBeenCalled();
  });
});

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  canPerformCalculation,
  formatUsagePeriodKey,
  getCalculationUsageCount,
  getOrCreateStripeCustomer,
  getSubscriptionInfoForUser,
  getUserSubscription,
  notifyQuotaReachedIfNeeded,
  recordCalculationUsage,
} from "./subscription";
import { notifyQuotaReached } from "@/services/email-notifications";

jest.mock("@/lib/prisma", () => ({
  prisma: {
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
  },
}));

jest.mock("@/services/email-notifications", () => ({
  notifyQuotaReached: jest.fn(),
}));

const subscriptionFindUnique = prisma.subscription.findUnique as unknown as jest.Mock;
const subscriptionCreate = prisma.subscription.create as unknown as jest.Mock;
const calculationUsageCount = prisma.calculationUsage.count as unknown as jest.Mock;
const calculationUsageCreate = prisma.calculationUsage.create as unknown as jest.Mock;
const userFindUniqueOrThrow = prisma.user.findUniqueOrThrow as unknown as jest.Mock;
const userFindUnique = prisma.user.findUnique as unknown as jest.Mock;
const stripeCustomerCreate = stripe.customers.create as unknown as jest.Mock;
const mockedNotifyQuotaReached = jest.mocked(notifyQuotaReached);

describe("subscription service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns starter defaults when no subscription row exists", async () => {
    subscriptionFindUnique.mockResolvedValue(null);

    await expect(getUserSubscription("user-1")).resolves.toMatchObject({
      userId: "user-1",
      tier: "starter",
      status: "active",
      stripeCustomerId: null,
    });
  });

  it("returns the stored subscription when present", async () => {
    subscriptionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_pro_monthly",
      tier: "pro",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: new Date("2026-03-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-04-01T00:00:00.000Z"),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(getUserSubscription("user-1")).resolves.toMatchObject({
      tier: "pro",
      stripeCustomerId: "cus_123",
      billingInterval: "monthly",
    });
  });

  it("counts only the current calendar month", async () => {
    calculationUsageCount.mockResolvedValue(7);

    await expect(
      getCalculationUsageCount("user-1", new Date("2026-03-19T12:00:00.000Z"))
    ).resolves.toBe(7);
    const expectedStart = new Date(2026, 2, 1);
    const expectedEnd = new Date(2026, 3, 1);

    expect(calculationUsageCount).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        createdAt: {
          gte: expectedStart,
          lt: expectedEnd,
        },
      },
    });
  });

  it("enforces limits for capped plans and allows unlimited business usage", async () => {
    subscriptionFindUnique
      .mockResolvedValueOnce({
        id: "sub-1",
        userId: "user-1",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: null,
        stripePriceId: null,
        tier: "starter",
        billingInterval: null,
        status: "active",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "sub-2",
        userId: "user-2",
        stripeCustomerId: "cus_456",
        stripeSubscriptionId: null,
        stripePriceId: null,
        tier: "business",
        billingInterval: null,
        status: "active",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    calculationUsageCount.mockResolvedValueOnce(15).mockResolvedValueOnce(999);

    await expect(canPerformCalculation("user-1")).resolves.toBe(false);
    await expect(canPerformCalculation("user-2")).resolves.toBe(true);
  });

  it("records calculation usage", async () => {
    calculationUsageCreate.mockResolvedValue({
      id: "usage-1",
      userId: "user-1",
      createdAt: new Date(),
    });

    await recordCalculationUsage("user-1");

    expect(calculationUsageCreate).toHaveBeenCalledWith({
      data: { userId: "user-1" },
    });
  });

  it("returns an existing Stripe customer without creating a new one", async () => {
    subscriptionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_existing",
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getOrCreateStripeCustomer("user-1");

    expect(result.stripeCustomerId).toBe("cus_existing");
    expect(stripeCustomerCreate).not.toHaveBeenCalled();
  });

  it("creates a Stripe customer and lazy subscription row when absent", async () => {
    subscriptionFindUnique.mockResolvedValue(null);
    userFindUniqueOrThrow.mockResolvedValue({
      email: "alex@example.com",
      name: "Alex",
    } as never);
    stripeCustomerCreate.mockResolvedValue({ id: "cus_new" } as never);
    subscriptionCreate.mockResolvedValue({
      id: "sub-new",
      userId: "user-1",
      stripeCustomerId: "cus_new",
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "starter",
      billingInterval: null,
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getOrCreateStripeCustomer("user-1");

    expect(stripeCustomerCreate).toHaveBeenCalledWith({
      email: "alex@example.com",
      name: "Alex",
      metadata: { userId: "user-1" },
    });
    expect(result.stripeCustomerId).toBe("cus_new");
  });

  it("builds subscription info for UI consumption", async () => {
    subscriptionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_pro_monthly",
      tier: "pro",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    calculationUsageCount.mockResolvedValue(12);

    await expect(getSubscriptionInfoForUser("user-1")).resolves.toMatchObject({
      tier: "pro",
      usageCount: 12,
      usageLimit: 300,
      hasApiAccess: true,
      planName: "Pro",
    });
  });

  it("formats usage period keys by calendar month", () => {
    expect(formatUsagePeriodKey(new Date("2026-03-19T12:00:00.000Z"))).toBe("2026-03");
  });

  it("sends the quota email once usage is exhausted for the month", async () => {
    subscriptionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_pro_monthly",
      tier: "pro",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    calculationUsageCount.mockResolvedValue(300);
    userFindUnique.mockResolvedValue({ email: "alex@example.com" });

    await notifyQuotaReachedIfNeeded("user-1", new Date("2026-03-19T12:00:00.000Z"));

    expect(mockedNotifyQuotaReached).toHaveBeenCalledWith({
      userId: "user-1",
      email: "alex@example.com",
      planName: "Pro",
      usageCount: 300,
      usageLimit: 300,
      periodKey: "2026-03",
    });
  });

  it("skips quota emails for unlimited plans", async () => {
    subscriptionFindUnique.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_business_monthly",
      tier: "business",
      billingInterval: "monthly",
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    calculationUsageCount.mockResolvedValue(999);

    await notifyQuotaReachedIfNeeded("user-1", new Date("2026-03-19T12:00:00.000Z"));

    expect(mockedNotifyQuotaReached).not.toHaveBeenCalled();
  });
});

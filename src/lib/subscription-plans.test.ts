import {
  SUBSCRIPTION_PLANS,
  getVisiblePlans,
  getPlanForTier,
  getPlanFromPriceId,
  getPriceIdForSelection,
} from "./subscription-plans";

describe("subscription plans", () => {
  beforeEach(() => {
    process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID = "price_growth_monthly";
    process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID = "price_growth_annual";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";
  });

  it("defines all supported tiers", () => {
    expect(Object.keys(SUBSCRIPTION_PLANS)).toEqual(["starter", "growth", "pro"]);
    expect(getVisiblePlans().map((plan) => plan.tier)).toEqual(["starter", "growth", "pro"]);
  });

  it("keeps starter free and growth/pro annual pricing discounted", () => {
    expect(SUBSCRIPTION_PLANS.starter.monthlyPriceCents).toBe(0);
    expect(SUBSCRIPTION_PLANS.starter.annualPriceCents).toBe(0);
    expect(SUBSCRIPTION_PLANS.growth.annualPriceCents).toBe(28884);
    expect(SUBSCRIPTION_PLANS.pro.annualPriceCents).toBe(98604);
  });

  it("tracks API access and unlimited pro calculations", () => {
    expect(SUBSCRIPTION_PLANS.starter.hasApiAccess).toBe(false);
    expect(SUBSCRIPTION_PLANS.growth.hasApiAccess).toBe(true);
    expect(SUBSCRIPTION_PLANS.pro.hasApiAccess).toBe(true);
    expect(SUBSCRIPTION_PLANS.starter.calculationLimit).toBe(15);
    expect(SUBSCRIPTION_PLANS.growth.calculationLimit).toBe(300);
    expect(SUBSCRIPTION_PLANS.pro.calculationLimit).toBe(Number.POSITIVE_INFINITY);
  });

  it("stores shared marketing metadata alongside billing metadata", () => {
    expect(SUBSCRIPTION_PLANS.starter.featureBullets).toContain("15 calculations per month");
    expect(SUBSCRIPTION_PLANS.pro.badgeText).toBe("Most popular");
    expect(SUBSCRIPTION_PLANS.growth.marketingCtaLabel).toBe("Choose Growth");
  });

  it("maps price IDs to plan selections", () => {
    expect(getPriceIdForSelection("growth", "monthly")).toBe("price_growth_monthly");
    expect(getPriceIdForSelection("pro", "monthly")).toBe("price_pro_monthly");
    expect(getPlanFromPriceId("price_pro_annual")).toEqual({
      tier: "pro",
      interval: "annual",
    });
    expect(getPlanForTier("unknown").tier).toBe("starter");
  });
});

import {
  SUBSCRIPTION_PLANS,
  getVisiblePlans,
  getPlanForTier,
  getPlanFromPriceId,
  getPriceIdForSelection,
} from "./subscription-plans";

describe("subscription plans", () => {
  beforeEach(() => {
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = "price_pro_annual";
    process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID = "price_business_monthly";
    process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID = "price_business_annual";
  });

  it("defines all supported tiers", () => {
    expect(Object.keys(SUBSCRIPTION_PLANS)).toEqual(["starter", "pro", "business"]);
    expect(getVisiblePlans().map((plan) => plan.tier)).toEqual(["starter", "pro", "business"]);
  });

  it("keeps starter free and pro/business annual pricing discounted", () => {
    expect(SUBSCRIPTION_PLANS.starter.monthlyPriceCents).toBe(0);
    expect(SUBSCRIPTION_PLANS.starter.annualPriceCents).toBe(0);
    expect(SUBSCRIPTION_PLANS.pro.annualPriceCents).toBe(28884);
    expect(SUBSCRIPTION_PLANS.business.annualPriceCents).toBe(98604);
  });

  it("tracks API access and unlimited business calculations", () => {
    expect(SUBSCRIPTION_PLANS.starter.hasApiAccess).toBe(false);
    expect(SUBSCRIPTION_PLANS.pro.hasApiAccess).toBe(true);
    expect(SUBSCRIPTION_PLANS.business.hasApiAccess).toBe(true);
    expect(SUBSCRIPTION_PLANS.starter.calculationLimit).toBe(15);
    expect(SUBSCRIPTION_PLANS.pro.calculationLimit).toBe(300);
    expect(SUBSCRIPTION_PLANS.business.calculationLimit).toBe(Number.POSITIVE_INFINITY);
  });

  it("stores shared marketing metadata alongside billing metadata", () => {
    expect(SUBSCRIPTION_PLANS.starter.featureBullets).toContain("15 calculations per month");
    expect(SUBSCRIPTION_PLANS.pro.badgeText).toBe("Most popular");
    expect(SUBSCRIPTION_PLANS.business.marketingCtaLabel).toBe("Choose Business");
  });

  it("maps price IDs to plan selections", () => {
    expect(getPriceIdForSelection("pro", "monthly")).toBe("price_pro_monthly");
    expect(getPlanFromPriceId("price_business_annual")).toEqual({
      tier: "business",
      interval: "annual",
    });
    expect(getPlanForTier("unknown").tier).toBe("starter");
  });
});

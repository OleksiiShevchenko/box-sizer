export const SUBSCRIPTION_TIERS = ["starter", "growth", "pro"] as const;
export const BILLING_INTERVALS = ["monthly", "annual"] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];
export type BillingInterval = (typeof BILLING_INTERVALS)[number];
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete";

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  calculationLimit: number;
  hasApiAccess: boolean;
  featureBullets: string[];
  marketingCtaLabel: string;
  badgeText?: string | null;
  isHighlighted?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  starter: {
    tier: "starter",
    name: "Starter",
    description: "Run occasional box calculations at no cost.",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    calculationLimit: 15,
    hasApiAccess: false,
    featureBullets: [
      "15 calculations per month",
      "Saved boxes and packing plans",
      "No API access on this plan",
    ],
    marketingCtaLabel: "Start Free",
  },
  growth: {
    tier: "growth",
    name: "Growth",
    description: "For growing teams that need frequent optimization.",
    monthlyPriceCents: 2900,
    annualPriceCents: 28884,
    calculationLimit: 300,
    hasApiAccess: true,
    featureBullets: [
      "300 calculations per month",
      "Saved boxes and packing plans",
      "API access included",
    ],
    marketingCtaLabel: "Choose Growth",
  },
  pro: {
    tier: "pro",
    name: "Pro",
    description: "Unlimited calculations with API access for operations teams.",
    monthlyPriceCents: 9900,
    annualPriceCents: 98604,
    calculationLimit: Number.POSITIVE_INFINITY,
    hasApiAccess: true,
    featureBullets: [
      "Unlimited calculations",
      "Saved boxes and packing plans",
      "API access included",
    ],
    marketingCtaLabel: "Choose Pro",
    badgeText: "Most popular",
    isHighlighted: true,
  },
};

const PRICE_ENV_KEYS: Record<
  Exclude<SubscriptionTier, "starter">,
  Record<BillingInterval, string>
> = {
  growth: {
    monthly: "STRIPE_GROWTH_MONTHLY_PRICE_ID",
    annual: "STRIPE_GROWTH_ANNUAL_PRICE_ID",
  },
  pro: {
    monthly: "STRIPE_PRO_MONTHLY_PRICE_ID",
    annual: "STRIPE_PRO_ANNUAL_PRICE_ID",
  },
};

export function isSubscriptionTier(value: string): value is SubscriptionTier {
  return SUBSCRIPTION_TIERS.includes(value as SubscriptionTier);
}

export function isBillingInterval(value: string): value is BillingInterval {
  return BILLING_INTERVALS.includes(value as BillingInterval);
}

export function getVisiblePlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_TIERS.map((tier) => SUBSCRIPTION_PLANS[tier]);
}

export function getPlanForTier(tier: string | null | undefined): SubscriptionPlan {
  if (tier === "business") {
    return SUBSCRIPTION_PLANS.pro;
  }

  if (tier && isSubscriptionTier(tier)) {
    return SUBSCRIPTION_PLANS[tier];
  }

  return SUBSCRIPTION_PLANS.starter;
}

export function getPriceIdForSelection(
  tier: SubscriptionTier,
  interval: BillingInterval
): string | null {
  if (tier === "starter") {
    return null;
  }

  return process.env[PRICE_ENV_KEYS[tier][interval]] ?? null;
}

export function getPlanFromPriceId(priceId: string | null | undefined): {
  tier: SubscriptionTier;
  interval: BillingInterval;
} | null {
  if (!priceId) {
    return null;
  }

  for (const tier of ["growth", "pro"] as const) {
    for (const interval of BILLING_INTERVALS) {
      if (process.env[PRICE_ENV_KEYS[tier][interval]] === priceId) {
        return { tier, interval };
      }
    }
  }

  return null;
}

export function formatPrice(priceCents: number): string {
  if (priceCents === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

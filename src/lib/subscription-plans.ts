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
    description: "For small teams validating pack-rate improvements.",
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    calculationLimit: 50,
    hasApiAccess: true,
    featureBullets: [
      "up to 50 packing plans/mo",
      "REST API access",
      "3D visualization",
    ],
    marketingCtaLabel: "Start free",
  },
  growth: {
    tier: "growth",
    name: "Growth",
    description: "For teams automating box choice across daily operations.",
    monthlyPriceCents: 4900,
    annualPriceCents: 49000,
    calculationLimit: 500,
    hasApiAccess: true,
    featureBullets: [
      "up to 500 packing plans/mo",
      "REST API access",
      "3D visualization",
      "email support",
    ],
    marketingCtaLabel: "Choose Growth",
  },
  pro: {
    tier: "pro",
    name: "Pro",
    description: "For high-volume ops teams optimizing cost by lane, box type, and SLA.",
    monthlyPriceCents: 14900,
    annualPriceCents: 149000,
    calculationLimit: 2000,
    hasApiAccess: true,
    featureBullets: [
      "up to 2,000 packing plans/mo",
      "REST API access",
      "3D visualization",
      "priority support",
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

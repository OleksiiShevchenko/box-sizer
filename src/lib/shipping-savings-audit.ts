import { calculateCarrierDimensionalWeights } from "@/lib/dimensional-weight";

/**
 * Shipping-savings audit estimate engine.
 *
 * Calibrated from an analysis of 10,538 real delivered shipments rated against UPS
 * (negotiated rates) both with and without package dimensions — isolating the pure
 * dimensional-weight premium (same rate, same service, same weight; dimensions toggled).
 *
 * Per-segment representative parcels and domestic premium %s are derived from a
 * 720-product packed-dimension dataset; international premium %s and average shipment
 * costs come from the same UPS rating study. See data/derive_calibration.js.
 */

export type ProductSegment =
  | "apparel"
  | "drinkware_bags"
  | "promo_mixed"
  | "dense_heavy";

export type IntlShareTier = "none" | "some" | "lots";

export interface SegmentConfig {
  id: ProductSegment;
  label: string;
  description: string;
  /** Representative single-parcel dimensions (inches) + physical weight (lb). */
  parcel: { length: number; width: number; height: number; weightLb: number };
  /** Dimensional-weight premium as a % of shipping spend, by lane (empirical median). */
  domesticPremiumPct: number;
  intlPremiumPct: number;
}

export const SEGMENTS: Record<ProductSegment, SegmentConfig> = {
  apparel: {
    id: "apparel",
    label: "Apparel & soft goods",
    description: "T-shirts, hoodies, totes, blankets",
    parcel: { length: 10, width: 8, height: 1.5, weightLb: 0.5 },
    domesticPremiumPct: 2.5,
    intlPremiumPct: 51.6,
  },
  drinkware_bags: {
    id: "drinkware_bags",
    label: "Drinkware & bags",
    description: "Mugs, bottles, tumblers, backpacks",
    parcel: { length: 8, width: 4, height: 3.3, weightLb: 0.65 },
    domesticPremiumPct: 6, // bulky-but-light; modest domestic exposure
    intlPremiumPct: 45,
  },
  promo_mixed: {
    id: "promo_mixed",
    label: "Promo, mixed merch & gift boxes",
    description: "Pens, notebooks, stickers, multi-item gift kits",
    parcel: { length: 9, width: 6, height: 4, weightLb: 0.9 },
    domesticPremiumPct: 11.3,
    intlPremiumPct: 93.8,
  },
  dense_heavy: {
    id: "dense_heavy",
    label: "Dense / heavy goods",
    description: "Electronics, books, tools, hardware",
    // Genuinely dense goods: physical weight dominates billable weight, so dim weight rarely bites.
    parcel: { length: 8, width: 6, height: 4, weightLb: 8 },
    domesticPremiumPct: 0,
    intlPremiumPct: 14,
  },
};

export const INTL_SHARE: Record<IntlShareTier, { label: string; share: number }> = {
  none: { label: "All / mostly domestic", share: 0 },
  some: { label: "Some international (~10–25%)", share: 0.175 },
  lots: { label: "A lot international (25%+)", share: 0.4 },
};

// Average UPS cost per shipment (negotiated), from the rating study.
const AVG_COST_USD = { domestic: 12.69, intl: 70.69 };

// Below these, we show the honest "you're likely already accurate" result instead of a scary number.
const LOW_EXPOSURE_PCT = 2;
const LOW_EXPOSURE_MONTHLY_USD = 75;

export interface AuditInput {
  monthlyShipments: number;
  segment: ProductSegment;
  intlShare: IntlShareTier;
}

export interface AuditEstimate {
  monthlyShipments: number;
  intlSharePct: number;
  effectivePremiumPct: number;
  monthlyShippingSpendUsd: number;
  monthlyLeakUsd: number;
  annualLeakUsd: number;
  lowExposure: boolean;
  parcel: {
    length: number;
    width: number;
    height: number;
    physicalWeightLb: number;
    billableWeightLb: number;
    billableMultiple: number;
  };
}

export function computeAuditEstimate(input: AuditInput): AuditEstimate {
  const seg = SEGMENTS[input.segment];
  const intlShare = INTL_SHARE[input.intlShare].share;
  const domesticShare = 1 - intlShare;

  const effectivePremiumPct =
    domesticShare * seg.domesticPremiumPct + intlShare * seg.intlPremiumPct;

  const monthlyShippingSpendUsd =
    input.monthlyShipments *
    (domesticShare * AVG_COST_USD.domestic + intlShare * AVG_COST_USD.intl);

  const monthlyLeakUsd = (monthlyShippingSpendUsd * effectivePremiumPct) / 100;
  const annualLeakUsd = monthlyLeakUsd * 12;

  const lowExposure =
    effectivePremiumPct < LOW_EXPOSURE_PCT ||
    monthlyLeakUsd < LOW_EXPOSURE_MONTHLY_USD;

  // Representative-parcel "aha": physical vs UPS billable weight for this segment.
  const ups = calculateCarrierDimensionalWeights({
    unitSystem: "in",
    actualWeight: seg.parcel.weightLb,
    length: seg.parcel.length,
    width: seg.parcel.width,
    height: seg.parcel.height,
  }).find((r) => r.carrier === "UPS")!;

  return {
    monthlyShipments: input.monthlyShipments,
    intlSharePct: Math.round(intlShare * 100),
    effectivePremiumPct: Math.round(effectivePremiumPct * 10) / 10,
    monthlyShippingSpendUsd: Math.round(monthlyShippingSpendUsd),
    monthlyLeakUsd: Math.round(monthlyLeakUsd),
    annualLeakUsd: Math.round(annualLeakUsd),
    lowExposure,
    parcel: {
      length: seg.parcel.length,
      width: seg.parcel.width,
      height: seg.parcel.height,
      physicalWeightLb: seg.parcel.weightLb,
      billableWeightLb: ups.billableWeight,
      billableMultiple:
        Math.round((ups.billableWeight / Math.max(0.1, seg.parcel.weightLb)) * 10) / 10,
    },
  };
}

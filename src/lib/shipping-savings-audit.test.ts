import { describe, expect, it } from "@jest/globals";
import { computeAuditEstimate } from "@/lib/shipping-savings-audit";

describe("shipping savings audit estimate", () => {
  it("produces a meaningful leak for light promo goods", () => {
    const e = computeAuditEstimate({
      monthlyShipments: 500,
      segment: "promo_mixed",
      intlShare: "none",
    });
    expect(e.monthlyLeakUsd).toBeGreaterThan(0);
    expect(e.effectivePremiumPct).toBeCloseTo(11.3, 1);
    expect(e.lowExposure).toBe(false);
    expect(e.annualLeakUsd).toBe(e.monthlyLeakUsd * 12);
  });

  it("flags dense/heavy domestic goods as low exposure (honest path)", () => {
    const e = computeAuditEstimate({
      monthlyShipments: 500,
      segment: "dense_heavy",
      intlShare: "none",
    });
    expect(e.effectivePremiumPct).toBe(0);
    expect(e.lowExposure).toBe(true);
  });

  it("international share sharply increases the premium", () => {
    const domestic = computeAuditEstimate({
      monthlyShipments: 500,
      segment: "apparel",
      intlShare: "none",
    });
    const intl = computeAuditEstimate({
      monthlyShipments: 500,
      segment: "apparel",
      intlShare: "lots",
    });
    expect(intl.effectivePremiumPct).toBeGreaterThan(domestic.effectivePremiumPct * 3);
    expect(intl.monthlyLeakUsd).toBeGreaterThan(domestic.monthlyLeakUsd);
  });

  it("reports a representative parcel where billable exceeds physical weight", () => {
    const e = computeAuditEstimate({
      monthlyShipments: 100,
      segment: "apparel",
      intlShare: "none",
    });
    expect(e.parcel.billableWeightLb).toBeGreaterThanOrEqual(e.parcel.physicalWeightLb);
    expect(e.parcel.billableMultiple).toBeGreaterThanOrEqual(1);
  });
});

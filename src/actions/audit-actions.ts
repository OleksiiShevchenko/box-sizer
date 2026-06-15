"use server";

import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendAuditLeadAdminNotification } from "@/lib/resend";
import { computeAuditEstimate, SEGMENTS, INTL_SHARE } from "@/lib/shipping-savings-audit";

const submitAuditLeadSchema = z.object({
  email: z.string().email().max(320),
  monthlyShipments: z.number().int().min(1).max(10_000_000),
  segment: z.enum(["apparel", "drinkware_bags", "promo_mixed", "dense_heavy"]),
  intlShare: z.enum(["none", "some", "lots"]),
});

export async function submitAuditLead(input: {
  email: string;
  monthlyShipments: number;
  segment: string;
  intlShare: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = submitAuditLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { email, monthlyShipments, segment, intlShare } = parsed.data;
  // Recompute server-side — never trust client numbers.
  const estimate = computeAuditEstimate({ monthlyShipments, segment, intlShare });

  try {
    await prisma.auditLead.create({
      data: {
        email,
        monthlyShipments,
        segment,
        intlShare,
        effectivePremiumPct: estimate.effectivePremiumPct,
        monthlyLeakUsd: estimate.monthlyLeakUsd,
        annualLeakUsd: estimate.annualLeakUsd,
        lowExposure: estimate.lowExposure,
      },
    });
  } catch {
    return { ok: false, error: "We couldn't save your request. Please try again." };
  }

  try {
    getPostHogClient().capture({
      distinctId: email,
      event: "shipping_savings_audit_lead_submitted",
      properties: {
        segment: SEGMENTS[segment].label,
        intl_share: INTL_SHARE[intlShare].label,
        monthly_shipments: monthlyShipments,
        monthly_leak_usd: estimate.monthlyLeakUsd,
        annual_leak_usd: estimate.annualLeakUsd,
        low_exposure: estimate.lowExposure,
      },
    });
  } catch {
    // analytics best-effort
  }

  await sendAuditLeadAdminNotification({
    email,
    monthlyShipments,
    segment: SEGMENTS[segment].label,
    intlShare: INTL_SHARE[intlShare].label,
    monthlyLeakUsd: estimate.monthlyLeakUsd,
    annualLeakUsd: estimate.annualLeakUsd,
  });

  return { ok: true };
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { submitAuditLead } from "@/actions/audit-actions";
import {
  computeAuditEstimate,
  INTL_SHARE,
  SEGMENTS,
  type IntlShareTier,
  type ProductSegment,
} from "@/lib/shipping-savings-audit";

const SEGMENT_ORDER: ProductSegment[] = [
  "apparel",
  "drinkware_bags",
  "promo_mixed",
  "dense_heavy",
];
const INTL_ORDER: IntlShareTier[] = ["none", "some", "lots"];

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function parsePositiveInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

export function ShippingSavingsAudit() {
  const [shipmentsRaw, setShipmentsRaw] = useState("");
  const [segment, setSegment] = useState<ProductSegment | null>(null);
  const [intlShare, setIntlShare] = useState<IntlShareTier | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const monthlyShipments = parsePositiveInt(shipmentsRaw);
  const estimate = useMemo(() => {
    if (monthlyShipments == null || !segment || !intlShare) return null;
    return computeAuditEstimate({ monthlyShipments, segment, intlShare });
  }, [monthlyShipments, segment, intlShare]);

  useEffect(() => {
    if (!estimate) return;
    posthog.capture("shipping_savings_audit_estimate_viewed", {
      monthly_shipments: estimate.monthlyShipments,
      segment,
      intl_share: intlShare,
      monthly_leak_usd: estimate.monthlyLeakUsd,
      low_exposure: estimate.lowExposure,
    });
    // capture once per distinct estimate
  }, [estimate, segment, intlShare]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!estimate || monthlyShipments == null || !segment || !intlShare) return;
    setStatus("submitting");
    setErrorMsg(null);
    const result = await submitAuditLead({ email, monthlyShipments, segment, intlShare });
    if (result.ok) {
      setStatus("done");
      posthog.capture("shipping_savings_audit_lead_submitted", { segment, intl_share: intlShare });
    } else {
      setStatus("error");
      setErrorMsg(result.error);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {/* Questions */}
      <div className="rounded-lg border border-outline-variant/70 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold text-on-background">Three quick questions</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Get a directional estimate of how much dimensional weight is costing you.
        </p>

        <div className="mt-6 space-y-6">
          {/* 1. shipments */}
          <div className="space-y-1.5">
            <label htmlFor="audit-shipments" className="block text-sm font-semibold text-slate-800">
              1. How many orders do you ship per month?
            </label>
            <input
              id="audit-shipments"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={shipmentsRaw}
              onChange={(e) => setShipmentsRaw(e.target.value)}
              placeholder="e.g. 500"
              className="block min-h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          {/* 2. segment */}
          <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-slate-800">
              2. What do you mostly ship?
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {SEGMENT_ORDER.map((id) => {
                const seg = SEGMENTS[id];
                const selected = segment === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSegment(id)}
                    aria-pressed={selected}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-on-background">{seg.label}</span>
                    <span className="mt-0.5 block text-xs text-on-surface-variant">{seg.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. intl share */}
          <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-slate-800">
              3. How much do you ship internationally or by air?
            </span>
            <div className="inline-flex w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-1">
              {INTL_ORDER.map((id) => {
                const selected = intlShare === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIntlShare(id)}
                    aria-pressed={selected}
                    className={`min-h-10 flex-1 rounded-md px-2 text-xs font-semibold transition-colors sm:text-sm ${
                      selected ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-background"
                    }`}
                  >
                    {INTL_SHARE[id].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Estimate + email gate */}
      <section aria-labelledby="audit-result-heading">
        <div className="rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          <h2 id="audit-result-heading" className="text-2xl font-extrabold text-on-background">
            Your estimated shipping leak
          </h2>

          {!estimate ? (
            <p className="mt-4 text-sm text-on-surface-variant">
              Answer the three questions and we&apos;ll estimate how much you&apos;re likely
              under-collecting at checkout because carriers bill on dimensional weight, not
              physical weight.
            </p>
          ) : estimate.lowExposure ? (
            <div className="mt-4">
              <p className="text-base leading-7 text-on-surface-variant">
                Good news — based on what you ship, your dimensional-weight exposure looks{" "}
                <strong className="text-on-background">small</strong>. Your products are dense or
                ship in right-sized boxes, so the carrier&apos;s billable weight rarely exceeds the
                physical weight you quote.
              </p>
              <div className="mt-4 rounded-lg border border-outline-variant/60 bg-white p-4">
                <p className="text-sm text-on-surface-variant">
                  Estimated leak: <strong className="text-on-background">{usd(estimate.monthlyLeakUsd)}/mo</strong>{" "}
                  (~{estimate.effectivePremiumPct}% of shipping spend)
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                  You&apos;re likely overpaying / under-collecting
                </p>
                <p className="mt-1 text-5xl font-extrabold leading-none text-on-background">
                  {usd(estimate.monthlyLeakUsd)}
                  <span className="text-2xl font-bold text-on-surface-variant">/mo</span>
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  ≈ <strong className="text-on-background">{usd(estimate.annualLeakUsd)}/yr</strong>, or{" "}
                  ~{estimate.effectivePremiumPct}% of your shipping spend
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-outline-variant/60 bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant">
                    Typical parcel
                  </p>
                  <p className="mt-1 text-sm text-on-background">
                    weighs{" "}
                    <strong>{estimate.parcel.physicalWeightLb} lb</strong>, billed at{" "}
                    <strong>{estimate.parcel.billableWeightLb} lb</strong>
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {estimate.parcel.billableMultiple}× the physical weight
                  </p>
                </div>
                <div className="rounded-lg border border-outline-variant/60 bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-on-surface-variant">
                    Monthly shipping
                  </p>
                  <p className="mt-1 text-sm text-on-background">
                    ~{usd(estimate.monthlyShippingSpendUsd)} across {estimate.monthlyShipments.toLocaleString()} orders
                  </p>
                  {estimate.intlSharePct > 0 ? (
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      most exposure sits in your international orders
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Email gate */}
          {estimate ? (
            status === "done" ? (
              <div className="mt-6 rounded-lg border border-green-600/30 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-800">
                  Thanks — we&apos;ll reach out to run your detailed audit.
                </p>
                <p className="mt-1 text-sm text-green-700">
                  We&apos;ll analyze your actual SKUs and box mix and send back exact numbers.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 border-t border-outline-variant/60 pt-6">
                <label htmlFor="audit-email" className="block text-sm font-semibold text-slate-800">
                  Get your full audit — we&apos;ll analyze your actual SKUs and box mix
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="audit-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="block min-h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                  />
                  <Button type="submit" size="lg" disabled={status === "submitting"} className="shrink-0">
                    {status === "submitting" ? "Sending…" : "Get my full audit"}
                  </Button>
                </div>
                {status === "error" && errorMsg ? (
                  <p className="mt-2 text-xs font-medium text-red-600">{errorMsg}</p>
                ) : null}
                <p className="mt-2 text-xs text-on-surface-variant">
                  Directional estimate based on analysis of 10,000+ real shipments. Your detailed
                  audit uses your own data.
                </p>
              </form>
            )
          ) : null}
        </div>
      </section>
    </div>
  );
}

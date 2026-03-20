"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/actions/subscription-actions";
import {
  BILLING_INTERVALS,
  SUBSCRIPTION_PLANS,
  formatPrice,
  type BillingInterval,
  type SubscriptionTier,
} from "@/lib/subscription-plans";

interface PricingClientProps {
  currentTier: SubscriptionTier | null;
  currentInterval: BillingInterval | null;
  isAuthenticated: boolean;
}

export function PricingClient({
  currentTier,
  currentInterval,
  isAuthenticated,
}: PricingClientProps) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    currentInterval ?? "monthly"
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSelectPlan(tier: SubscriptionTier) {
    if (tier === "starter") {
      router.push(isAuthenticated ? "/dashboard" : "/signup");
      return;
    }

    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(tier, billingInterval);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {BILLING_INTERVALS.map((interval) => (
            <button
              key={interval}
              type="button"
              onClick={() => setBillingInterval(interval)}
              className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors ${
                billingInterval === interval
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
          const isCurrentPlan = currentTier === plan.tier;
          const priceCents =
            billingInterval === "annual" ? plan.annualPriceCents : plan.monthlyPriceCents;
          const periodLabel = plan.monthlyPriceCents === 0 ? "" : ` / ${billingInterval === "annual" ? "year" : "month"}`;

          return (
            <div
              key={plan.tier}
              className={`rounded-[2rem] border p-8 shadow-sm transition-transform ${
                isCurrentPlan
                  ? "border-blue-500 bg-blue-50/70"
                  : "border-slate-200 bg-white hover:-translate-y-1"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{plan.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
                </div>
                {isCurrentPlan ? (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Current
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <p className="text-4xl font-semibold text-slate-950">
                  {formatPrice(priceCents)}
                  {periodLabel ? (
                    <span className="text-base font-medium text-slate-500">{periodLabel}</span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {Number.isFinite(plan.calculationLimit)
                    ? `${plan.calculationLimit} calculations per month`
                    : "Unlimited calculations"}
                </p>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-slate-600">
                <li>Saved boxes and shipments</li>
                <li>
                  {plan.hasApiAccess ? "API access included" : "No API access on this plan"}
                </li>
                <li>
                  {billingInterval === "annual" && plan.monthlyPriceCents > 0
                    ? "Annual billing includes a 17% discount."
                    : "Stripe-hosted billing checkout."}
                </li>
              </ul>

              <div className="mt-8">
                {plan.tier === "starter" && currentTier && currentTier !== "starter" ? (
                  <Link
                    href="/settings/billing"
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                  >
                    Manage in Billing
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={isPending || isCurrentPlan}
                    onClick={() => handleSelectPlan(plan.tier)}
                    className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors ${
                      isCurrentPlan
                        ? "bg-slate-200 text-slate-500"
                        : plan.tier === "starter"
                          ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : !isAuthenticated
                        ? plan.tier === "starter"
                          ? "Get Started"
                          : "Sign Up"
                        : "Select Plan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

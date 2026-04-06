"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import posthog from "posthog-js";
import { createCheckoutSession } from "@/actions/subscription-actions";
import {
  BILLING_INTERVALS,
  getVisiblePlans,
  type BillingInterval,
  type SubscriptionTier,
} from "@/lib/subscription-plans";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
import { PricingCard, ScaleCard } from "./pricing-card";

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
  const plans = getVisiblePlans();
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
    posthog.capture("checkout_initiated", { tier, billing_interval: billingInterval });
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
    <div className="flex w-full flex-col items-center gap-8">
      <div className="inline-flex rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
        {BILLING_INTERVALS.map((interval) => (
          <button
            key={interval}
            type="button"
            onClick={() => setBillingInterval(interval)}
            className={`rounded-full px-5 py-2 text-[14px] font-medium capitalize transition-colors ${
              billingInterval === interval
                ? "bg-[#1E293B] text-white"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {interval}
          </button>
        ))}
      </div>

      {error ? (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentTier === plan.tier;
          const priceCents =
            billingInterval === "annual" ? plan.annualPriceCents : plan.monthlyPriceCents;
          const periodLabel =
            priceCents > 0
              ? `/ ${billingInterval === "annual" ? "year" : "mo"}`
              : null;

          return (
            <PricingCard
              key={plan.tier}
              plan={plan}
              priceCents={priceCents}
              periodLabel={periodLabel}
              badge={isCurrentPlan ? "Current" : plan.badgeText}
              action={
                plan.tier === "starter" && currentTier && currentTier !== "starter" ? (
                  <Link
                    href="/settings/billing"
                    className="block w-full rounded-[10px] border border-[#E2E8F0] px-5 py-3.5 text-center text-[15px] font-bold text-[#1E293B] transition-colors hover:bg-slate-50"
                  >
                    Manage in Billing
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={isPending || isCurrentPlan}
                    onClick={() => handleSelectPlan(plan.tier)}
                    className={
                      isCurrentPlan
                        ? "w-full rounded-[10px] bg-[#E2E8F0] px-5 py-3.5 text-center text-[15px] font-bold text-[#94A3B8]"
                        : plan.isHighlighted
                          ? "w-full rounded-[10px] bg-[#2563EB] px-5 py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                          : "w-full rounded-[10px] border border-[#E2E8F0] px-5 py-3.5 text-center text-[15px] font-bold text-[#1E293B] transition-colors hover:bg-slate-50"
                    }
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : !isAuthenticated
                        ? plan.tier === "starter"
                          ? "Get Started"
                          : "Sign Up"
                        : "Select Plan"}
                  </button>
                )
              }
            />
          );
        })}
        <ScaleCard
          action={
            <DemoBookingButton
              className="w-full rounded-[10px] border border-[#E2E8F0] px-5 py-3.5 text-center text-[15px] font-bold text-[#1E293B] transition-colors hover:bg-slate-50"
            >
              Contact sales
            </DemoBookingButton>
          }
        />
      </div>
    </div>
  );
}

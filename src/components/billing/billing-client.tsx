"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelSubscription,
  createBillingPortalSession,
  resumeSubscription,
} from "@/actions/subscription-actions";
import { Card } from "@/components/ui/card";
import type { ISubscriptionInfo } from "@/types";

interface BillingClientProps {
  initialSubscription: ISubscriptionInfo;
  banner: string | null;
}

function formatDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function BillingClient({ initialSubscription, banner }: BillingClientProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState(initialSubscription);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const renewalLabel = subscription.currentPeriodEnd
    ? subscription.cancelAtPeriodEnd
      ? `Access ends on ${formatDate(subscription.currentPeriodEnd)}`
      : `Renews on ${formatDate(subscription.currentPeriodEnd)}`
    : null;

  function handleManageBilling() {
    setError(null);
    startTransition(async () => {
      const result = await createBillingPortalSession();
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.subscription) {
        setSubscription(result.subscription);
        router.refresh();
      }
    });
  }

  function handleResume() {
    setError(null);
    startTransition(async () => {
      const result = await resumeSubscription();
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.subscription) {
        setSubscription(result.subscription);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {banner ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {banner}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Current Plan
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {subscription.planName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Status: {subscription.status.replace("_", " ")}
            </p>
            {subscription.billingInterval ? (
              <p className="mt-1 text-sm text-slate-600 capitalize">
                Billing interval: {subscription.billingInterval}
              </p>
            ) : null}
            {renewalLabel ? <p className="mt-1 text-sm text-slate-600">{renewalLabel}</p> : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              Change Plan
            </Link>
            {subscription.tier !== "starter" ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleManageBilling}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                Manage Payment Method
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Calculations this month</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {subscription.usageCount}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Monthly limit</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {subscription.usageLimit ?? "Unlimited"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">API access</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {subscription.hasApiAccess ? "Enabled" : "Not included"}
            </p>
          </div>
        </div>

        {subscription.tier !== "starter" ? (
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            {subscription.cancelAtPeriodEnd ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleResume}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                Resume Subscription
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancel}
                className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

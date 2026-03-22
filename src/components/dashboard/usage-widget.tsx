import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ISubscriptionInfo } from "@/types";

interface UsageWidgetProps {
  subscriptionInfo: ISubscriptionInfo;
}

export function UsageWidget({ subscriptionInfo }: UsageWidgetProps) {
  if (subscriptionInfo.usageLimit === null) {
    return null;
  }

  const progress = Math.min(
    100,
    Math.round((subscriptionInfo.usageCount / subscriptionInfo.usageLimit) * 100)
  );

  return (
    <Card className="space-y-5 border-blue-100 bg-gradient-to-br from-white to-blue-50/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Monthly Usage
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            {subscriptionInfo.usageCount} / {subscriptionInfo.usageLimit} calculations used
          </h2>
        </div>
        {subscriptionInfo.tier === "starter" ? (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Upgrade Plan
          </Link>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-600">Usage this month</span>
          <span className="font-medium text-slate-900">{progress}%</span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Monthly usage"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-slate-600">
        {subscriptionInfo.tier === "starter"
          ? "Starter includes 15 calculations per month."
          : "Upgrade to Business for unlimited calculations and API access."}
      </p>
    </Card>
  );
}

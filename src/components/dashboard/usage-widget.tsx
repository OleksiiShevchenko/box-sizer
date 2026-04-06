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
    <Card className="space-y-4 border-slate-200 bg-white p-5 shadow-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Current Period Usage
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {subscriptionInfo.usageCount} / {subscriptionInfo.usageLimit} calculations used
          </h2>
        </div>
        {subscriptionInfo.tier === "starter" ? (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
            Upgrade Plan
          </Link>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">Usage this billing period</span>
          <span className="font-medium text-slate-700">{progress}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Current period usage"
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

      <p className="text-xs text-slate-400">
        {subscriptionInfo.tier === "starter"
          ? "Starter includes 15 calculations per billing period."
          : "Upgrade to Pro for unlimited calculations and API access."}
      </p>
    </Card>
  );
}

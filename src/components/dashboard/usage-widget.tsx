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
    <Card className="space-y-4 bg-slate-900 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
            Monthly Usage
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {subscriptionInfo.usageCount} / {subscriptionInfo.usageLimit} calculations used
          </h2>
        </div>
        {subscriptionInfo.tier === "starter" ? (
          <Link
            href="/pricing"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Upgrade Plan
          </Link>
        ) : null}
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-blue-400 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-slate-300">
        {subscriptionInfo.tier === "starter"
          ? "Starter includes 15 calculations per month."
          : "Upgrade to Business for unlimited calculations and API access."}
      </p>
    </Card>
  );
}

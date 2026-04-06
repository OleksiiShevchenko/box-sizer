import { auth } from "@/lib/auth";
import { getSubscriptionInfoForUser } from "@/services/subscription";
import { PricingClient } from "@/components/pricing/pricing-client";

export default async function PricingPage() {
  const session = await auth();
  const subscriptionInfo = session?.user?.id
    ? await getSubscriptionInfoForUser(session.user.id)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
            Pricing
          </p>
          <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
            Subscription plans for box teams of different sizes.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
            Start free, move to Growth for consistent volume, or unlock Pro for
            unlimited calculations and API access.
          </p>
        </div>

        <PricingClient
          currentInterval={subscriptionInfo?.billingInterval ?? null}
          currentTier={subscriptionInfo?.tier ?? null}
          isAuthenticated={Boolean(session?.user)}
        />
      </div>
    </div>
  );
}

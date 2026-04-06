import { auth } from "@/lib/auth";
import { getSubscriptionInfoForUser } from "@/services/subscription";
import { PricingClient } from "@/components/pricing/pricing-client";

export default async function PricingPage() {
  const session = await auth();
  const subscriptionInfo = session?.user?.id
    ? await getSubscriptionInfoForUser(session.user.id)
    : null;

  return (
    <section className="min-h-screen bg-[#F8F9FA] px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-[1232px] flex-col items-center">
        <div className="mb-16 flex max-w-[760px] flex-col items-center gap-3.5 text-center">
          <h1 className="text-[48px] font-extrabold leading-[1.05] tracking-[-1.2px] text-[#1E293B]">
            Simple pricing that scales with your usage
          </h1>
          <p className="max-w-[720px] text-[18px] leading-[1.55] text-[#64748B]">
            Choose a plan that fits your packing volume today, then unlock
            automation and analytics as your operation expands.
          </p>
        </div>

        <PricingClient
          currentInterval={subscriptionInfo?.billingInterval ?? null}
          currentTier={subscriptionInfo?.tier ?? null}
          isAuthenticated={Boolean(session?.user)}
        />
      </div>
    </section>
  );
}

import Link from "next/link";
import { getVisiblePlans } from "@/lib/subscription-plans";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
import { PricingCard, ScaleCard } from "./pricing-card";

export function MarketingPricingSection() {
  const plans = getVisiblePlans();

  return (
    <section id="pricing" className="bg-surface-container-low px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-[1232px] flex-col items-center">
        <div
          className="mb-16 flex max-w-[760px] flex-col items-center gap-3.5 text-center"
          data-reveal="up"
        >
          <h2 className="text-[48px] font-extrabold leading-[1.05] tracking-[-1.2px] text-[#1E293B]">
            Simple pricing that scales with your usage
          </h2>
          <p className="max-w-[720px] text-[18px] leading-[1.55] text-[#64748B]">
            Choose a plan that fits your packing volume today, then unlock automation and
            analytics as your operation expands.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-reveal="up">
          {plans.map((plan) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
              priceCents={plan.monthlyPriceCents}
              periodLabel={plan.monthlyPriceCents > 0 ? "/ mo" : null}
              badge={plan.badgeText}
              action={
                <Link
                  href="/signup"
                  className={
                    plan.isHighlighted
                      ? "w-full rounded-[10px] bg-[#2563EB] px-5 py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                      : "w-full rounded-[10px] border border-[#E2E8F0] px-5 py-3.5 text-center text-[15px] font-bold text-[#1E293B] transition-colors hover:bg-slate-50"
                  }
                >
                  {plan.marketingCtaLabel}
                </Link>
              }
            />
          ))}
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
    </section>
  );
}

import Link from "next/link";
import {
  formatPrice,
  getVisiblePlans,
  type SubscriptionPlan,
} from "@/lib/subscription-plans";

function getPriceLabel(plan: SubscriptionPlan): string {
  return formatPrice(plan.monthlyPriceCents);
}

export function MarketingPricingSection() {
  const plans = getVisiblePlans();

  return (
    <section id="pricing" className="bg-[#F8F9FA] px-6 py-24 md:py-32">
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

        <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3" data-reveal="up">
          {plans.map((plan) => {
            const isHighlighted = plan.isHighlighted;

            return (
              <div
                key={plan.tier}
                className={
                  isHighlighted
                    ? "relative flex flex-col gap-[18px] rounded-[22px] border-2 border-[#2563EB] bg-[#F7FBFF] p-6 shadow-[0_1px_6px_rgba(37,99,235,0.09),0_18px_40px_-18px_rgba(37,99,235,0.15)]"
                    : "flex flex-col gap-[22px] rounded-[20px] border border-[#E2E8F0] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.06)]"
                }
              >
                {plan.badgeText ? (
                  <span className="absolute right-6 top-6 rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-bold text-white">
                    {plan.badgeText}
                  </span>
                ) : null}

                <div className={isHighlighted ? "flex flex-col gap-[18px]" : "flex flex-col gap-[22px]"}>
                  <h3 className="text-[20px] font-bold text-[#1E293B]">{plan.name}</h3>
                  <p className="text-[14px] leading-[1.5] text-[#64748B]">{plan.description}</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[34px] font-bold text-[#1E293B]">{getPriceLabel(plan)}</span>
                    {plan.monthlyPriceCents > 0 ? (
                      <span className="mb-1 text-[15px] font-medium text-[#94A3B8]">/ mo</span>
                    ) : null}
                  </div>
                </div>

                <div className={isHighlighted ? "h-px bg-[#D6E8FF]" : "h-px bg-[#E2E8F0]"} />

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.featureBullets.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-center gap-2 text-[14px] ${
                        isHighlighted ? "text-[#64748B]" : "text-[#1E293B]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#16A34A]">
                        check
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={
                    isHighlighted
                      ? "w-full rounded-[10px] bg-[#2563EB] px-5 py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                      : "w-full rounded-[10px] border border-[#E2E8F0] px-5 py-3.5 text-center text-[15px] font-bold text-[#1E293B] transition-colors hover:bg-slate-50"
                  }
                >
                  {plan.marketingCtaLabel}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

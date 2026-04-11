import type { ReactNode } from "react";
import type { SubscriptionPlan } from "@/lib/subscription-plans";
import { formatPrice } from "@/lib/subscription-plans";

interface PricingCardProps {
  plan: SubscriptionPlan;
  priceCents: number;
  periodLabel: string | null;
  badge?: string | null;
  action: ReactNode;
}

export function PricingCard({ plan, priceCents, periodLabel, badge, action }: PricingCardProps) {
  const isHighlighted = plan.isHighlighted;

  return (
    <div
      className={
        isHighlighted
          ? "relative flex flex-col gap-[18px] rounded-[22px] border-2 border-[#2563EB] bg-[#F7FBFF] p-6 shadow-[0_1px_6px_rgba(37,99,235,0.09),0_18px_40px_-18px_rgba(37,99,235,0.15)]"
          : "relative flex flex-col gap-[22px] rounded-[20px] border border-[#E2E8F0] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.06)]"
      }
    >
      {badge ? (
        <span className="absolute right-6 top-6 rounded-full bg-[#2563EB] px-3 py-1.5 text-[12px] font-bold text-white">
          {badge}
        </span>
      ) : null}

      <div className={isHighlighted ? "flex flex-col gap-[18px]" : "flex flex-col gap-[22px]"}>
        <h3 className="text-[20px] font-bold text-[#1E293B]">{plan.name}</h3>
        <p className="text-[14px] leading-[1.5] text-[#64748B]">{plan.description}</p>
        <div className="flex items-end gap-1.5">
          <span className={`${isHighlighted ? "text-[36px]" : "text-[34px]"} font-bold text-[#1E293B]`}>
            {formatPrice(priceCents)}
          </span>
          {periodLabel ? (
            <span className="mb-1 text-[15px] font-medium text-[#94A3B8]">{periodLabel}</span>
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

      {action}
    </div>
  );
}

export function ScaleCard({ action }: { action: ReactNode }) {
  return (
    <div className="flex flex-col gap-[22px] rounded-[20px] border border-[#E2E8F0] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-[22px]">
        <h3 className="text-[20px] font-bold text-[#1E293B]">Scale</h3>
        <p className="text-[14px] leading-[1.5] text-[#64748B]">
          For enterprise teams needing tailored rollout, governance, and long-term support.
        </p>
        <div className="flex items-end gap-1.5">
          <span className="whitespace-nowrap text-[30px] font-bold text-[#1E293B]">Custom pricing</span>
        </div>
      </div>

      <div className="h-px bg-[#E2E8F0]" />

      <ul className="flex flex-1 flex-col gap-3">
        <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
          <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
          Unlimited usage
        </li>
        <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
          <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
          SLA
        </li>
        <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
          <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
          Custom integrations
        </li>
      </ul>

      {action}
    </div>
  );
}

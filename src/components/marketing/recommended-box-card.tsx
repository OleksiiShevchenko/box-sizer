type RecommendedBoxCardProps = {
  className?: string;
};

export function RecommendedBoxCard({ className }: RecommendedBoxCardProps) {
  const wrapperClassName = [
    "relative z-10 flex w-full max-w-[292px] shrink-0 flex-col gap-3 rounded-[16px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_18px_34px_-18px_rgba(0,0,0,0.08)] md:rotate-[4deg]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={wrapperClassName}
      data-reveal="right"
      data-testid="cta-recommended-box-card"
    >
      <span className="text-[13px] font-bold text-[#64748B] leading-[1.33]">
        Recommended Box
      </span>
      <p className="text-[23px] font-extrabold text-[#0F172A] leading-[1.2]">
        Medium (14&times;10&times;8)
      </p>
      <div className="h-px bg-[#E2E8F0]" />
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between">
          <span className="text-[13px] text-[#64748B]">Dim Weight</span>
          <span className="text-[13px] font-semibold text-[#0F172A]">4.2 lb</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[13px] text-[#64748B]">Shipping</span>
          <span className="text-[13px] font-semibold text-[#0F172A]">$10.20</span>
        </div>
      </div>
      <div className="h-px bg-[#E2E8F0]" />
      <div className="flex items-center gap-1.5">
        <span
          className="material-symbols-outlined text-[14px] text-[#94A3B8]"
          aria-hidden="true"
        >
          arrow_forward
        </span>
        <span className="text-[12px] text-[#94A3B8]">vs Large Box ($14.50)</span>
      </div>
      <div className="bg-[#ECFDF5] rounded-full px-3 py-2 flex items-center gap-1.5 self-start">
        <span
          className="material-symbols-outlined text-[15px] text-[#16A34A]"
          aria-hidden="true"
        >
          paid
        </span>
        <span className="text-[14px] font-bold text-[#16A34A]">
          Save $4.22 per shipment
        </span>
      </div>
      <p className="text-[12px] font-bold text-[#94A3B8]">Calculated instantly</p>
    </div>
  );
}

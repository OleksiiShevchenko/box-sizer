import type { Metadata } from "next";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { MarketingHeader, MarketingFooter } from "@/components/marketing/marketing-shell";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
import { HowPackwellWorksSection } from "@/components/marketing/how-packwell-works-section";
import { UseCasesSection } from "@/components/marketing/use-cases-section";
import { RecommendedBoxCard } from "@/components/marketing/recommended-box-card";
import { DimensionalWeightDemoLink } from "@/components/tools/dimensional-weight-demo-link";
import { ShippingSavingsAudit } from "@/components/tools/shipping-savings-audit";

export const metadata: Metadata = {
  title: "Shipping Savings Audit | Packwell",
  description:
    "Find out how much dimensional weight is costing you. Answer 3 questions for an instant estimate of the shipping margin you're losing by quoting on physical weight instead of billable weight.",
};

const seoSections = [
  {
    title: "The hidden shipping leak",
    body: "Carriers bill on billable weight — the greater of physical and dimensional weight. If your checkout quotes shipping on product weight or a flat rate, the carrier invoice can come back higher and you eat the gap on every order.",
  },
  {
    title: "Where it hurts most",
    body: "Light, bulky, or mixed shipments — apparel, promo, gift boxes — and anything moving internationally or by air. In our analysis of 10,000+ shipments, international orders billed ~70% higher once dimensional weight was applied.",
  },
  {
    title: "How to stop it",
    body: "Know the box before checkout. Packwell calculates the right box for each order's actual products, so you can charge accurate shipping and stop under-collecting — especially on mixed and international shipments.",
  },
];

export default function ShippingSavingsAuditPage() {
  return (
    <ScrollReveal>
      <div className="overflow-x-clip bg-surface font-sans text-on-surface antialiased">
        <MarketingHeader />

        <main>
          {/* 1. Audit */}
          <section
            id="audit"
            className="bg-surface-container-low px-6 pb-20 pt-32 md:pb-28 md:pt-40"
          >
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                  Shipping savings audit
                </p>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight text-on-background md:text-5xl">
                  How much are you losing to dimensional weight?
                </h1>
                <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                  If you quote shipping on physical weight or a flat rate, you&apos;re likely
                  under-collecting — carriers bill on the higher dimensional weight. Answer three
                  questions for a directional estimate.
                </p>
              </div>
              <ShippingSavingsAudit />
            </div>
          </section>

          {/* 2. Educational content */}
          <section className="bg-surface px-6 py-20 md:py-28">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 max-w-3xl">
                <h2 className="text-4xl font-extrabold leading-tight text-on-background md:text-5xl">
                  Why dimensional weight quietly drains margin
                </h2>
                <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                  The carrier charges correctly. The leak is in what you quoted at checkout.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {seoSections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-lg border border-outline-variant/60 bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-2xl font-extrabold leading-tight text-on-background">
                      {section.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-on-surface-variant">
                      {section.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* 3. How Packwell works */}
          <HowPackwellWorksSection />

          {/* 4. Use Cases */}
          <UseCasesSection />

          {/* 5. CTA */}
          <section className="bg-surface-container-lowest px-6 py-20 md:py-28">
            <div className="mx-auto max-w-[1232px]">
              <div
                className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20"
                style={{
                  backgroundImage:
                    "radial-gradient(900px circle at 78% 12%, rgba(59,130,246,0.28), transparent 55%), radial-gradient(700px circle at 22% 90%, rgba(37,99,235,0.18), transparent 60%)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(148,163,184,0.6) 1px, transparent 1px)",
                    backgroundSize: "72px 100%",
                  }}
                />

                <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-fixed-dim">
                      Get the full picture
                    </p>
                    <h2 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[56px]">
                      Stop under-charging for{" "}
                      <span className="text-primary-fixed">shipping</span>.
                    </h2>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                      Packwell calculates the right box for each order&apos;s actual products, so you
                      charge accurate shipping before checkout and fulfillment &mdash; for ecommerce
                      brands, 3PLs, and gifting platforms.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <DimensionalWeightDemoLink className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-bold text-slate-950 transition-colors hover:bg-slate-100">
                        See Box Optimization Demo
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                          arrow_forward
                        </span>
                      </DimensionalWeightDemoLink>
                      <DemoBookingButton className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-transparent px-6 text-base font-bold text-white transition-colors hover:bg-white/5">
                        Talk to sales
                      </DemoBookingButton>
                    </div>

                    <div className="mt-10 border-t border-white/10 pt-6">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                          Calibrated for
                        </p>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white">
                          <span>UPS</span>
                          <span>FedEx</span>
                          <span>USPS</span>
                          <span>DHL</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="justify-self-center lg:justify-self-end">
                    <RecommendedBoxCard />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <MarketingFooter />
      </div>
    </ScrollReveal>
  );
}

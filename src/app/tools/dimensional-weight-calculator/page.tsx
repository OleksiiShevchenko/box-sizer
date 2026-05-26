import type { Metadata } from "next";
import Link from "next/link";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { InstantScrollLink } from "@/components/layout/instant-scroll-link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
import { TypicalShippingScenarioSection } from "@/components/marketing/typical-shipping-scenario-section";
import { HowPackwellWorksSection } from "@/components/marketing/how-packwell-works-section";
import { UseCasesSection } from "@/components/marketing/use-cases-section";
import { RecommendedBoxCard } from "@/components/marketing/recommended-box-card";
import { DimensionalWeightCalculator } from "@/components/tools/dimensional-weight-calculator";
import { DimensionalWeightDemoLink } from "@/components/tools/dimensional-weight-demo-link";

export const metadata: Metadata = {
  title: "Dimensional Weight Calculator | Packwell",
  description:
    "Calculate dimensional weight and estimated billable weight for UPS, FedEx, USPS, and DHL. See how package size affects shipping weight and box selection.",
};

const seoSections = [
  {
    title: "What is dimensional weight?",
    body: "Dimensional weight is a billing weight based on how much space a package occupies. Carriers compare dimensional weight with the actual scale weight and often charge against the higher number. For bulky ecommerce shipments, the box can matter as much as the product weight.",
  },
  {
    title: "Why carriers use dimensional weight",
    body: "Delivery trucks, planes, and sorting facilities run out of space before they run out of weight capacity. Dimensional weight gives carriers a way to price large, lightweight parcels that consume valuable network capacity.",
  },
  {
    title: "Why ecommerce stores undercharge for shipping",
    body: "Many checkout estimates use product weight, a default package, or rough averages. If the warehouse ships in a larger box, the carrier invoice can be based on a higher dimensional weight than the checkout estimate expected.",
  },
];

function MarketingHeader() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="shrink-0" aria-label="Packwell home">
          <PackwellLogo className="h-8 w-auto text-slate-900" />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/#features" className="text-slate-600 transition-colors hover:text-blue-600">
            Product
          </Link>
          <Link href="/#use-cases" className="text-slate-600 transition-colors hover:text-blue-600">
            Use Cases
          </Link>
          <Link href="/#how-it-works" className="text-slate-600 transition-colors hover:text-blue-600">
            How it works
          </Link>
          <Link href="/#pricing" className="text-slate-600 transition-colors hover:text-blue-600">
            Pricing
          </Link>
          <Link
            href="/api/v1/docs#description/introduction"
            className="text-slate-600 transition-colors hover:text-blue-600"
          >
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function MarketingFooter() {
  return (
    <footer className="w-full bg-slate-50 pb-8 pt-16">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-8 px-8 md:flex-nowrap md:justify-between">
        <div className="w-full md:w-[300px] md:shrink-0">
          <div className="mb-4">
            <Link href="/" className="inline-flex" aria-label="Packwell home">
              <PackwellLogo className="h-7 w-auto text-slate-900" />
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Smart packing for ecommerce &mdash; reduce shipping costs and
            eliminate wasted space.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase text-slate-400">
            Product
          </h2>
          <ul className="space-y-3">
            <li>
              <Link href="/#features" className="text-sm text-slate-500 transition-colors hover:text-slate-900">
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/api/v1/docs#description/introduction"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                API Documentation
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="text-sm text-slate-500 transition-colors hover:text-slate-900">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase text-slate-400">
            Contact
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-slate-500">
              <span className="material-symbols-outlined text-sm">mail</span>
              <a href="mailto:support@packwell.io" className="hover:text-slate-700">
                support@packwell.io
              </a>
            </li>
            <li className="pt-1">
              <DemoBookingButton className="cursor-pointer text-sm font-bold text-blue-600">
                Book a Demo
              </DemoBookingButton>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase text-slate-400">
            Legal
          </h2>
          <ul className="space-y-3">
            <li>
              <InstantScrollLink
                href="/privacy-policy"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                Privacy Policy
              </InstantScrollLink>
            </li>
            <li>
              <InstantScrollLink
                href="/terms-of-service"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                Terms of Service
              </InstantScrollLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-slate-200 px-8 pt-6 text-xs text-slate-400">
        <p>&copy; 2026 Packwell. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function DimensionalWeightCalculatorPage() {
  return (
    <ScrollReveal>
      <div className="overflow-x-clip bg-surface font-sans text-on-surface antialiased">
        <MarketingHeader />

        <main>
          {/* 1. Calculator */}
          <section
            id="calculator"
            className="bg-surface-container-low px-6 pb-20 pt-32 md:pb-28 md:pt-40"
          >
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 max-w-3xl">
                <h1 className="text-4xl font-extrabold leading-tight text-on-background md:text-5xl">
                  Dimensional Weight Calculator
                </h1>
                <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                  Compare estimated dimensional weight across UPS, FedEx, USPS,
                  and DHL without connecting carrier accounts.
                </p>
              </div>
              <DimensionalWeightCalculator />
            </div>
          </section>

          {/* 2. Educational content */}
          <section className="bg-surface px-6 py-20 md:py-28">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 max-w-3xl">
                <h2 className="text-4xl font-extrabold leading-tight text-on-background md:text-5xl">
                  Understanding dimensional weight
                </h2>
                <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                  Learn how package dimensions affect billable shipping weight
                  and carrier charges.
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

          {/* 3. Typical Shipping Scenario */}
          <TypicalShippingScenarioSection />

          {/* 4. How Packwell works */}
          <HowPackwellWorksSection />

          {/* 5. Use Cases */}
          <UseCasesSection />

          {/* 6. CTA */}
          <section className="bg-surface-container-lowest px-6 py-20 md:py-28">
            <div className="mx-auto max-w-[1232px]">
              <div
                className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20"
                style={{
                  backgroundImage:
                    "radial-gradient(900px circle at 78% 12%, rgba(59,130,246,0.28), transparent 55%), radial-gradient(700px circle at 22% 90%, rgba(37,99,235,0.18), transparent 60%)",
                }}
              >
                {/* Vertical grid lines */}
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
                      Get started
                    </p>
                    <h2 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[56px]">
                      Stop guessing which{" "}
                      <span className="text-primary-fixed">box</span> to use.
                    </h2>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                      Packwell reduces dimensional weight charges by selecting
                      the right packaging before checkout and fulfillment
                      &mdash; for ecommerce brands, 3PLs, and gifting platforms.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <DimensionalWeightDemoLink className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-bold text-slate-950 transition-colors hover:bg-slate-100">
                        See Box Optimization Demo
                        <span
                          className="material-symbols-outlined text-[20px]"
                          aria-hidden="true"
                        >
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

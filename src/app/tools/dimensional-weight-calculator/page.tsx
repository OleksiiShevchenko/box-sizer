import type { Metadata } from "next";
import Link from "next/link";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { InstantScrollLink } from "@/components/layout/instant-scroll-link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
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
    title: "Why do carriers use dimensional weight?",
    body: "Delivery trucks, planes, and sorting facilities run out of space before they run out of weight capacity. Dimensional weight gives carriers a way to price large, lightweight parcels that consume valuable network capacity.",
  },
  {
    title: "Why ecommerce stores undercharge for shipping",
    body: "Many checkout estimates use product weight, a default package, or rough averages. If the warehouse ships in a larger box, the carrier invoice can be based on a higher dimensional weight than the checkout estimate expected.",
  },
  {
    title: "How box size affects billable weight",
    body: "Length, width, and height are multiplied together before the divisor is applied, so small increases across multiple sides can create a large jump in dimensional weight. Reducing empty space is often the fastest way to lower billable weight.",
  },
  {
    title: "How to reduce dimensional weight",
    body: "Measure products accurately, keep a practical box catalog, reduce void fill, and pack multi-item orders into the smallest box that still protects the shipment. Review high-volume SKUs and subscription kits first because repeated savings compound quickly.",
  },
  {
    title: "How Packwell helps with box sizing",
    body: "Packwell evaluates item dimensions, quantities, and available packaging before fulfillment. It helps ecommerce operators, warehouse teams, 3PLs, and subscription box businesses pick the right box before checkout and before labels are purchased.",
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

          <section className="bg-surface-container-lowest px-6 py-20 md:py-28">
            <div className="mx-auto max-w-[1232px]">
              <div className="flex flex-col items-start gap-8 rounded-lg bg-primary-fixed px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between md:px-14 md:py-14">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
                    Want to know the right box before checkout?
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-slate-700">
                    Dimensional weight is only part of the problem. Packwell
                    helps you select the best box for every order so checkout
                    shipping estimates are closer to what carriers actually
                    charge.
                  </p>
                </div>
                <DimensionalWeightDemoLink className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-on-primary transition-colors hover:bg-primary-container">
                  Try Packwell Demo
                </DimensionalWeightDemoLink>
              </div>
            </div>
          </section>

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

              <div className="grid gap-5 md:grid-cols-2">
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
        </main>

        <MarketingFooter />
      </div>
    </ScrollReveal>
  );
}

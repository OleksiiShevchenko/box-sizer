import { auth } from "@/lib/auth";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
import { HeroPackingVisualization } from "@/components/marketing/hero-packing-visualization";
import { MarketingPricingSection } from "@/components/pricing/marketing-pricing-section";
import { TypicalShippingScenarioSection } from "@/components/marketing/typical-shipping-scenario-section";
import { HowPackwellWorksSection } from "@/components/marketing/how-packwell-works-section";
import { UseCasesSection } from "@/components/marketing/use-cases-section";
import { RecommendedBoxCard } from "@/components/marketing/recommended-box-card";
import { InstantScrollLink } from "@/components/layout/instant-scroll-link";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <ScrollReveal>
      <div className="overflow-x-clip bg-surface font-sans text-on-surface antialiased">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
            <Link href="/" className="shrink-0">
              <PackwellLogo className="h-8 w-auto text-slate-900" />
            </Link>
            <div className="hidden md:flex gap-8 items-center tracking-tight text-sm font-medium">
              <a
                href="#features"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Product
              </a>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                How it works
              </a>
              <a
                href="#use-cases"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Use cases
              </a>
              <a
                href="#pricing"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </a>
              <Link
                href="/api/v1/docs#description/introduction"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                API Docs
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-on-primary px-5 py-2 rounded-lg font-medium text-sm hover:bg-primary-container transition-all duration-200 ease-in-out"
              >
                Start Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-surface-container-lowest px-6 pt-[calc(var(--spacing)*30)] pb-20 md:pt-36 md:pb-32"
          data-testid="home-hero"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7" data-reveal="left">
              <h1 className="mb-6 text-[1.85rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-on-background min-[360px]:text-[2.15rem] sm:text-5xl md:text-7xl">
                <span className="block whitespace-nowrap">Stop shipping air.</span>
                <span className="block whitespace-nowrap text-primary">
                  Pack smarter.
                </span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                Calculate the exact box for every order before it ships. Charge
                accurate shipping, reduce dimensional weight, and eliminate
                wasted space.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <Link
                  href="/demo"
                  className="bg-primary text-on-primary px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
                >
                  Try Interactive Demo
                </Link>
                <Link
                  href="/signup"
                  className="bg-surface-container-high text-on-surface px-8 py-4 rounded-lg font-semibold text-lg hover:bg-surface-container-highest transition-all border border-outline-variant/30"
                >
                  Start Free
                </Link>
              </div>
            </div>
            <div
              className="relative flex justify-center lg:col-span-5 lg:self-start lg:justify-end"
              data-reveal="right"
            >
              <HeroPackingVisualization />
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 md:py-32 bg-surface-container-low px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-reveal="left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                Shipping costs shouldn&apos;t be a guessing game.
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span
                    className="material-symbols-outlined pt-[3px] text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <div>
                    <p className="font-bold text-lg">Undercharge Customers</p>
                    <p className="text-on-surface-variant">
                      Lose margin on every order when estimated shipping doesn&apos;t cover
                      dimensional weight charges.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span
                    className="material-symbols-outlined pt-[3px] text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <div>
                    <p className="font-bold text-lg">Oversized Boxes</p>
                    <p className="text-on-surface-variant">
                      Pay to ship empty space. Every cubic inch of void fill is money wasted
                      on air.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span
                    className="material-symbols-outlined pt-[3px] text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <div>
                    <p className="font-bold text-lg">Inconsistent Packing</p>
                    <p className="text-on-surface-variant">
                      Unpredictable costs when every warehouse worker picks a different box
                      for the same order.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative" data-reveal="right">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg rotate-2">
                <div className="flex items-center justify-between border-b border-surface-container p-4 mb-4">
                  <div>
                    <span className="font-mono text-sm">Carrier Invoice #8291</span>
                    <p className="text-xs text-[#5f6368]">Size correction increased postage</p>
                  </div>
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-lg text-xs font-bold">
                    OVERCHARGE
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center bg-surface p-3 rounded">
                    <span className="text-sm font-medium">
                      Estimated (10x10x10)
                    </span>
                    <span className="font-bold">$12.50</span>
                  </div>
                  <div className="flex justify-between items-center bg-error-container/20 p-3 rounded border border-error/20">
                    <span className="text-sm font-bold text-error">
                      Actual (14x12x12)
                    </span>
                    <span className="font-bold text-error">$19.85</span>
                  </div>
                  <div className="text-right pt-4">
                    <p className="text-xs text-on-surface-variant">Lost Margin</p>
                    <p className="text-2xl font-bold text-error">$7.35</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout vs Carrier Pricing */}
        <TypicalShippingScenarioSection />

        {/* Features Section */}
        <section
          id="features"
          className="bg-surface-container-low px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28"
        >
          <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,450px)] lg:gap-16 xl:gap-20">
            {/* Left column */}
            <div className="min-w-0 flex flex-col gap-10 lg:gap-12">
              <div data-reveal="left" className="max-w-[720px]">
                <h2 className="mb-3 text-[34px] font-extrabold leading-[1.02] tracking-[-0.9px] text-[#1E293B] sm:text-[38px] lg:text-[42px]">
                  What you get for every shipment
                </h2>
                <p className="text-[16px] leading-[1.65] text-[#64748B] sm:text-[18px]">
                  Turn item dimensions, weights, available boxes, and packing rules into
                  the outputs your team needs: the recommended box, accurate carrier quote
                  inputs, and a clear 3D packing plan.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5" data-reveal="left">
                {[
                  {
                    icon: "inventory_2",
                    iconBg: "bg-[#dbe1ff]",
                    iconColor: "text-[#2563EB]",
                    title: "Recommended box",
                    desc: "Match each shipment to the best available box using item dimensions, weight, quantity, available packaging, and packing rules.",
                  },
                  {
                    icon: "local_shipping",
                    iconBg: "bg-[#6bff8f]",
                    iconColor: "text-[#006e2f]",
                    title: "Accurate carrier quotes",
                    desc: "Use the recommended box, actual weight, and dimensional weight to calculate shipping cost before the order ships.",
                  },
                  {
                    icon: "view_in_ar",
                    iconBg: "bg-[#dce2f7]",
                    iconColor: "text-[#4e5566]",
                    title: "3D packing plan",
                    desc: "Give your team a visual packing layout showing how items should fit inside the selected box.",
                  },
                  {
                    icon: "integration_instructions",
                    iconBg: "bg-[#dbe1ff]",
                    iconColor: "text-[#2563EB]",
                    title: "UI and API access",
                    desc: "Run calculations in the Packwell web app or connect the API to checkout, order management, warehouse, or shipping workflows.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="flex h-full flex-col gap-4 rounded-[24px] border border-[#E2E8F0] bg-[#F8F9FA] p-5 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.45)] sm:p-6"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg}`}>
                      <span className={`material-symbols-outlined text-[22px] ${card.iconColor}`}>{card.icon}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[16px] font-bold text-[#191c1d] sm:text-[17px]">{card.title}</h4>
                      <p className="text-[14px] leading-[1.55] text-[#424655]">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right column - Product diagram */}
            <div className="min-w-0 flex flex-col justify-start lg:pt-1" data-reveal="right">
              <div
                className="relative mx-auto aspect-[450/760] w-full max-w-[450px]"
                data-testid="packwell-product-diagram"
                aria-label="Packwell product inputs and outputs diagram"
              >
                <svg
                  className="absolute inset-0 h-full w-full overflow-visible"
                  viewBox="0 0 450 760"
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <marker
                      id="packwell-arrowhead"
                      markerWidth="8"
                      markerHeight="8"
                      refX="7"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M0.5 0.75L7 4L0.5 7.25Z" fill="#2563EB" />
                    </marker>
                    <marker
                      id="packwell-output-arrowhead"
                      markerWidth="9"
                      markerHeight="9"
                      refX="8.2"
                      refY="4.5"
                      orient="auto"
                    >
                      <path d="M0.8 0.8L8.2 4.5L0.8 8.2Z" fill="#2563EB" />
                    </marker>
                  </defs>
                  <g stroke="#2563EB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" opacity="0.48">
                    <path d="M225 76C225 155 225 260 225 343" markerEnd="url(#packwell-arrowhead)" />
                    <path d="M99 190C132 246 152 306 174 345" markerEnd="url(#packwell-arrowhead)" />
                    <path d="M347 190C318 246 298 306 276 345" markerEnd="url(#packwell-arrowhead)" />
                    <path d="M106 296C138 315 152 355 170 390" markerEnd="url(#packwell-arrowhead)" />
                    <path d="M351 296C312 315 298 355 280 390" markerEnd="url(#packwell-arrowhead)" />
                  </g>
                  <path
                    d="M225 506V552"
                    stroke="#2563EB"
                    strokeLinecap="round"
                    strokeWidth="1.9"
                    opacity="0.7"
                    markerEnd="url(#packwell-output-arrowhead)"
                  />
                </svg>

                {[
                  {
                    label: "Dimensions & weights",
                    icon: "straighten",
                    className: "left-[18%] top-0 w-[64%]",
                  },
                  {
                    label: "Quantities",
                    icon: "inventory",
                    className: "left-[2%] top-[15%] w-[40%]",
                  },
                  {
                    label: "Available boxes",
                    icon: "inventory_2",
                    className: "right-[2%] top-[15%] w-[42%]",
                  },
                  {
                    label: "Products to ship",
                    icon: "shopping_bag",
                    className: "left-[2%] top-[29%] w-[43%]",
                  },
                  {
                    label: "Packing rules",
                    icon: "checklist",
                    className: "right-[2%] top-[29%] w-[40%]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`absolute z-10 flex min-h-14 items-center gap-2.5 rounded-xl border border-[#D7DEE8] bg-white px-3.5 py-3 text-[#1E293B] shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)] ${item.className}`}
                  >
                    <span className="material-symbols-outlined shrink-0 text-[22px] text-[#2563EB]" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-bold leading-tight tracking-[-0.1px] sm:text-[14px]">
                      {item.label}
                    </span>
                  </div>
                ))}

                <div className="absolute left-1/2 top-[45%] z-20 flex w-[86%] -translate-x-1/2 flex-col items-center gap-3 text-center">
                  <Image
                    src="/marketing/packwell-calculation-icon.svg"
                    alt=""
                    width={90}
                    height={90}
                    className="h-auto w-[23%] object-contain"
                    data-testid="packwell-calculation-icon"
                  />
                  <p className="text-[22px] font-extrabold leading-none tracking-[-0.4px] text-[#1E293B] sm:text-[26px]">
                    Packwell calculation
                  </p>
                </div>

                <div className="absolute inset-x-0 top-[74.5%] z-10 mx-auto flex w-[78%] flex-col gap-3">
                  {[
                    { label: "Recommended box", icon: "inventory_2" },
                    { label: "Quote-ready package data", icon: "request_quote" },
                    { label: "3D packing plan", icon: "view_in_ar" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex min-h-14 items-center gap-3 rounded-xl border border-[#D7DEE8] bg-white px-4 py-3 text-[#1E293B] shadow-[0_18px_35px_-28px_rgba(15,23,42,0.55)]"
                    >
                      <span className="material-symbols-outlined shrink-0 text-[24px] text-[#2563EB]" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="text-[14px] font-bold leading-tight sm:text-[15px]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowPackwellWorksSection />

        {/* Use Cases Section */}
        <UseCasesSection />

        <MarketingPricingSection />

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 bg-surface-container-low">
          <div className="max-w-[1232px] mx-auto">
            <div className="relative flex flex-col items-start gap-12 overflow-hidden rounded-[24px] bg-[#DBE1FF] px-6 py-10 sm:px-10 sm:py-12 md:flex-row md:items-center md:justify-between md:gap-8 md:px-16 md:py-16">
              <div className="relative z-10 flex max-w-[700px] flex-col gap-6" data-reveal="left">
                <h2 className="text-[42px] font-bold leading-none text-[#0F172A] sm:text-[48px]">
                  Start packing smarter today.
                </h2>
                <p className="text-[18px] text-[#475569] leading-[1.56] max-w-[620px]">
                  Every mismatched box is money lost on dimensional weight charges and
                  wasted packaging. Packwell picks the right carton for every order
                  automatically.
                </p>
                <div className="flex w-full flex-col gap-4 pt-4 sm:w-auto sm:flex-row">
                  <Link
                    href="/signup"
                    className="rounded-lg bg-[#2563EB] px-8 py-4 text-center text-[16px] font-bold whitespace-nowrap text-white transition-colors hover:bg-[#1d4ed8]"
                  >
                    Start free
                  </Link>
                  <DemoBookingButton
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-6 py-4 text-center text-[16px] font-bold whitespace-nowrap text-[#1E293B] transition-colors hover:bg-slate-50"
                  >
                    Contact Sales
                  </DemoBookingButton>
                </div>
              </div>
              {/* Recommended Box Card */}
              <RecommendedBoxCard className="mt-2 self-center md:mt-0 md:self-auto" />
              {/* Abstract Glow */}
              <div className="absolute top-28 right-60 w-96 h-96 bg-[#2563EB] opacity-20 blur-[88px] rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-50 w-full pt-16 pb-8">
          <div className="flex flex-wrap md:flex-nowrap md:justify-between gap-8 max-w-7xl mx-auto px-8">
            <div className="w-full md:w-[300px] md:shrink-0">
              <div className="mb-4">
                <Link href="/" className="inline-flex">
                  <PackwellLogo className="h-7 w-auto text-slate-900" />
                </Link>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Smart packing for ecommerce &mdash; reduce shipping costs and eliminate wasted space.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">
                Product
              </h5>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    href="/api/v1/docs#description/introduction"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    API Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">
                Contact
              </h5>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <a href="mailto:support@packwell.io" className="hover:text-slate-700">
                    support@packwell.io
                  </a>
                </li>
                <li className="pt-1">
                  <DemoBookingButton className="text-blue-600 font-bold text-sm cursor-pointer">
                    Book a Demo
                  </DemoBookingButton>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">
                Legal
              </h5>
              <ul className="space-y-3">
                <li>
                  <InstantScrollLink
                    href="/privacy-policy"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    Privacy Policy
                  </InstantScrollLink>
                </li>
                <li>
                  <InstantScrollLink
                    href="/terms-of-service"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    Terms of Service
                  </InstantScrollLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-8 mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400">
            <p>&copy; 2026 Packwell. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ScrollReveal>
  );
}

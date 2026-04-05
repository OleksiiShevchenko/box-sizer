import { auth } from "@/lib/auth";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <ScrollReveal>
      <div className="bg-surface font-sans text-on-surface antialiased">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
            <PackwellLogo className="h-8 w-auto text-slate-900" />
            <div className="hidden md:flex gap-8 items-center tracking-tight text-sm font-medium">
              <a
                href="#features"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Product
              </a>
              <a
                href="#use-cases"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Use Cases
              </a>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </a>
              <Link
                href="/api/v1/docs"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Docs
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
        <section className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-36 md:pb-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7" data-reveal="left">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-background mb-6 leading-[1.1]">
                Stop shipping air.{" "}
                <br />
                <span className="text-primary">Pack smarter.</span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                Calculate the exact box for every order before it ships. Charge
                accurate shipping, reduce dimensional weight, and eliminate
                wasted space.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <Link
                  href="/signup"
                  className="bg-primary text-on-primary px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
                >
                  Start Free
                </Link>
                <Link
                  href="#"
                  className="bg-surface-container-high text-on-surface px-8 py-4 rounded-lg font-semibold text-lg hover:bg-surface-container-highest transition-all border border-outline-variant/30"
                >
                  Book a Demo
                </Link>
              </div>
              <p className="text-xs text-on-surface-variant/80 flex flex-wrap items-center gap-[18px]">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant/80">check</span>
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant/80">bolt</span>
                  API in minutes
                </span>
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-4">
                Used by ecommerce brands and fulfillment teams optimizing shipping costs.
              </p>
            </div>
            <div className="relative lg:col-span-5" data-reveal="right">
              {/* Box Recommendation Card */}
              <div className="relative bg-white p-8 rounded-xl shadow-[0_20px_35px_rgba(25,28,29,0.05)]" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="mb-[22px]">
                  <span className="text-xs font-bold tracking-[1.2px] text-secondary mb-1 block">
                    Optimal Recommendation
                  </span>
                  <h3 className="text-2xl font-bold">Box Type: Large 4(16X14X8)</h3>
                </div>
                <div className="rounded-lg mb-[22px] overflow-hidden relative" style={{ paddingTop: "104%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Packwell box visualization"
                    className="w-full h-auto absolute left-0"
                    style={{ top: "-25%" }}
                    src="/hero-box.png"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-[22px]">
                  <div className="bg-surface p-[14px_16px] rounded-lg">
                    <p className="text-xs text-on-surface-variant">
                      Shipping Savings
                    </p>
                    <p className="text-xl font-bold text-secondary mt-1">-$4.22</p>
                  </div>
                  <div className="bg-surface p-[14px_16px] rounded-lg">
                    <p className="text-xs text-on-surface-variant">
                      Fill Saved
                    </p>
                    <p className="text-xl font-bold text-primary mt-1">62%</p>
                  </div>
                </div>
                {/* JSON Block */}
                <div className="bg-[#2e3132] p-[12px_16px_16px_16px] rounded-lg font-mono text-[10px] leading-[1.625] overflow-hidden">
                  <div className="flex gap-2 mb-[10px]">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <code className="text-[#6bff8f] whitespace-pre">{`"result": {
  "id": "f7599914-5cdb-4f73-9b39-3d81003e7b42",
  "name": "Large 4",
  "width": 16,
  "height": 14,
  "depth": 8,
  "dimensionalWeight": 9.7
}`}</code>
                </div>
              </div>
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
                    className="material-symbols-outlined text-error"
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
                    className="material-symbols-outlined text-error"
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
                    className="material-symbols-outlined text-error"
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

        {/* Stop undercharging for shipping */}
        <section className="py-24 md:py-32 px-6 bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" data-reveal="up">
              Stop undercharging for shipping
            </h2>
            <p className="text-lg text-on-surface-variant mb-16 max-w-2xl mx-auto" data-reveal="up">
              Calculate the exact box and dimensional weight before checkout &mdash; so you never
              lose margin.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center" data-reveal="up">
              <div className="bg-surface-container-low rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-surface-container rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#3B82F6] text-2xl">shopping_cart</span>
                </div>
                <h4 className="font-bold mb-1">Ecommerce Cart</h4>
                <p className="text-sm text-on-surface-variant">Customer adds items to their order</p>
              </div>
              <div className="relative">
                <div className="hidden md:flex absolute left-[-2rem] top-1/2 -translate-y-1/2 text-on-surface-variant/30">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
                <div className="bg-primary rounded-2xl p-8 text-center text-on-primary">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-on-primary text-2xl">memory</span>
                  </div>
                  <h4 className="font-bold mb-1">Packwell API</h4>
                  <p className="text-sm text-on-primary/80">Calculates optimal box &amp; dimensional weight</p>
                </div>
                <div className="hidden md:flex absolute right-[-2rem] top-1/2 -translate-y-1/2 text-on-surface-variant/30">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-surface-container rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#16A34A] text-2xl">package_2</span>
                </div>
                <h4 className="font-bold mb-1">Output</h4>
                <p className="text-sm text-on-surface-variant">Box dimensions + accurate shipping cost</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-24 md:py-32 bg-surface-container-low px-6">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-6"
              data-reveal="up"
            >
              Built for teams that ship complex orders
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {[
                {
                  icon: "shopping_cart",
                  iconBg: "bg-surface-container",
                  iconColor: "text-[#2563EB]",
                  title: "Ecommerce Brands",
                  desc: "Show accurate shipping at checkout. Stop eating margin on every order.",
                },
                {
                  icon: "package_2",
                  iconBg: "bg-[#0F5FD3]",
                  iconColor: "text-white",
                  title: "Promotional & Gifting",
                  desc: "Complex kits with mixed items. Optimize box selection across warehouse distributions.",
                },
                {
                  icon: "bar_chart_4_bars",
                  iconBg: "bg-[#0B7A36]",
                  iconColor: "text-white",
                  title: "3PL Warehouses",
                  desc: "Standardize packing decisions across shifts and locations. Consistent box selection every time.",
                },
                {
                  icon: "redeem",
                  iconBg: "bg-surface-container",
                  iconColor: "text-[#D97706]",
                  title: "Subscription Brands",
                  desc: "Design packaging around your recurring SKU mix. Optimize box inventory for predictable orders.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-lg transition-shadow"
                  data-reveal="up"
                >
                  <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined ${card.iconColor}`}>
                      {card.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Turn packaging into a cost advantage */}
        <section className="py-20 px-6">
          <div className="max-w-[1120px] mx-auto flex flex-col items-center gap-12">
            <h2 className="text-[48px] font-extrabold tracking-[-1.2px] leading-[1.1] text-center text-[#1E293B] max-w-[600px]" data-reveal="up">
              Turn packaging into{"\n"}a cost advantage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {[
                {
                  icon: "attach_money",
                  iconBg: "bg-[#DCFCE7]",
                  iconColor: "text-[#16A34A]",
                  title: "Stop losing money on shipping",
                  desc: "Kill hidden shipping surcharges before they eat your profit.",
                },
                {
                  icon: "unfold_less",
                  iconBg: "bg-[#EFF6FF]",
                  iconColor: "text-[#3B82F6]",
                  title: "Reduce shipping costs",
                  desc: "Shrink box dimensions to hit lower carrier weight tiers.",
                },
                {
                  icon: "bolt",
                  iconBg: "bg-[#FFFBEB]",
                  iconColor: "text-[#F59E0B]",
                  title: "Automate manual work",
                  desc: 'Remove the "best guess" from the packing table for good.',
                },
                {
                  icon: "bar_chart",
                  iconBg: "bg-[#DBEAFE]",
                  iconColor: "text-[#2563EB]",
                  title: "Unlock packaging insights",
                  desc: "Identify which custom boxes are actually saving you money.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 flex items-center gap-4"
                  data-reveal="up"
                >
                  <div className={`w-12 h-12 ${item.iconBg} rounded-[12px] flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${item.iconColor} text-[24px]`}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[16px] font-bold text-[#1E293B]">{item.title}</h4>
                    <p className="text-[14px] text-[#64748B] leading-[1.5]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Savings Calculator Section */}
        <section className="py-24 md:py-32 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-reveal="left">
              <span className="text-sm font-bold text-[#64748B]">
                Example savings
              </span>
              <h2 className="text-[42px] font-extrabold tracking-[-1px] mt-2 mb-5 leading-[1.05] text-[#1E293B]">
                How much can you save?
              </h2>
              <p className="text-[17px] text-[#475569] mb-8 leading-relaxed">
                Reduce shipping costs by optimizing box selection and eliminating wasted space.
              </p>
              <div className="bg-white border border-[#E2E8F0] rounded-[18px] p-5 mb-6">
                <h4 className="font-bold text-[17px] text-[#1E293B] mb-3">If you ship 1,000 orders per month:</h4>
                <ul className="space-y-2 text-[#64748B] text-[15px]">
                  <li>• Save $2–$5 per shipment</li>
                  <li>• Reduce dimensional weight charges</li>
                  <li>• Eliminate oversized boxes</li>
                </ul>
              </div>
              <div className="bg-[#F8FAFC] border border-[#DCFCE7] rounded-[18px] p-5">
                <span className="text-[13px] font-bold text-[#475569]">Result</span>
                <p className="text-[30px] font-extrabold text-[#15803D] leading-[1.05] mt-1">$2,000–$5,000 saved per month</p>
              </div>
            </div>
            <div data-reveal="right">
              <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 flex flex-col gap-5 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.06)]">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-bold text-[#64748B]">Order</span>
                    <h3 className="text-[20px] font-extrabold text-[#1E293B]">Hoodie + Mug + Notebook</h3>
                  </div>
                  <div className="w-10 h-10 bg-[#F8FAFC] rounded-[10px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#2563EB] text-lg">package_2</span>
                  </div>
                </div>
                {/* Compare Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-[#E2E8F0] rounded-[16px] p-[18px] flex flex-col gap-3">
                    <h4 className="text-[18px] font-extrabold text-[#1E293B]">Without Packwell</h4>
                    <p className="text-[16px] text-[#475569]">Box: Large</p>
                    <p className="text-[18px] font-extrabold text-[#DC2626]">Shipping: $14.50</p>
                  </div>
                  <div className="bg-[#F6FBF7] border border-[#D1FAE5] rounded-[16px] p-[18px] flex flex-col gap-3">
                    <h4 className="text-[18px] font-extrabold text-[#166534]">With Packwell</h4>
                    <p className="text-[16px] text-[#166534]">Box: Medium</p>
                    <p className="text-[18px] font-extrabold text-[#16A34A]">Shipping: $10.20</p>
                  </div>
                </div>
                {/* Savings Band */}
                <div className="bg-[#1F2937] rounded-[16px] px-[18px] py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#16A34A] rounded-[10px] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-lg">paid</span>
                    </div>
                    <span className="text-[15px] font-bold text-[#CBD5E1]">Savings</span>
                  </div>
                  <span className="text-[24px] font-extrabold text-[#4ADE80]">$4.30 per shipment</span>
                </div>
                {/* Footnote */}
                <p className="text-[12px] text-[#94A3B8]">
                  Estimates based on typical ecommerce shipments
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32 px-6 bg-[#F8F9FA]">
          <div className="max-w-[1232px] mx-auto flex flex-col items-center gap-20">
            <h2
              className="text-[48px] font-extrabold tracking-[-1.2px] leading-none text-center text-[#1E293B]"
              data-reveal="up"
            >
              How Packwell works
            </h2>
            {/* Steps */}
            <div className="relative w-full h-44" data-reveal="up">
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-[13%] right-[13%] h-0.5 bg-[#E2E8F0]"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 w-full h-full">
                {[
                  { num: "1", icon: "shopping_cart", title: "Provide items\nin the order" },
                  { num: "2", icon: "pageview", title: "Packwell calculates\nbest box & layout" },
                  { num: "3", icon: "straighten", title: "Receive dimensions\n+ packing plan" },
                  { num: "4", icon: "warehouse", title: "Use in checkout\nor warehouse" },
                ].map((step) => (
                  <div key={step.num} className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#EFF6FF] rounded-full flex flex-col items-center justify-center gap-1">
                      <span className="text-[36px] font-bold leading-none text-[#2563EB]">{step.num}</span>
                      <span className="material-symbols-outlined text-[20px] text-[#64748B]">{step.icon}</span>
                    </div>
                    <p className="text-[16px] font-semibold text-[#1E293B] text-center leading-normal mt-3 whitespace-pre-line">{step.title}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Flow Diagram */}
            <div
              className="bg-[#EDEEEF] rounded-[16px] p-8 flex flex-wrap items-center justify-center gap-6 w-full max-w-[960px]"
              data-reveal="up"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#64748B]">shopping_cart</span>
                <span className="text-[14px] font-semibold text-[#1E293B]">Cart</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#64748B] opacity-30">chevron_right</span>
              <div className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-[14px] font-bold">
                Packwell API
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#64748B] opacity-30">chevron_right</span>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#64748B]">package_2</span>
                <span className="text-[14px] font-semibold text-[#1E293B]">Box</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#64748B] opacity-30">chevron_right</span>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#64748B]">3d_rotation</span>
                <span className="text-[14px] font-semibold text-[#1E293B]">3D</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#64748B] opacity-30">chevron_right</span>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#16A34A]">attach_money</span>
                <span className="text-[14px] font-semibold text-[#1E293B]">Cost</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28">
          <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,450px)] lg:gap-16 xl:gap-20">
            {/* Left column */}
            <div className="flex flex-col gap-10 lg:gap-12">
              <div data-reveal="left" className="max-w-[720px]">
                <h2 className="mb-3 text-[34px] font-extrabold leading-[1.02] tracking-[-0.9px] text-[#1E293B] sm:text-[38px] lg:text-[42px]">
                  Everything you need to ship smarter
                </h2>
                <p className="text-[16px] leading-[1.65] text-[#64748B] sm:text-[18px]">
                  From intelligent box matching to real-time 3D verification, Packwell gives
                  your warehouse the tools to cut waste and speed up every order.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5" data-reveal="left">
                {[
                  {
                    icon: "bolt",
                    iconBg: "bg-[#dbe1ff]",
                    iconColor: "text-[#2563EB]",
                    title: "Lightning Fast API",
                    desc: "Packing calculations in under 50ms for high-volume checkouts.",
                  },
                  {
                    icon: "rule",
                    iconBg: "bg-[#6bff8f]",
                    iconColor: "text-[#006e2f]",
                    title: "Custom Logic Rules",
                    desc: "Define nesting, stacking, and fragility rules per SKU.",
                  },
                  {
                    icon: "3d_rotation",
                    iconBg: "bg-[#dce2f7]",
                    iconColor: "text-[#4e5566]",
                    title: "3D Visualizer",
                    desc: "Review orientation, void fill, and fragile-item spacing before the order reaches the floor.",
                  },
                  {
                    icon: "auto_awesome",
                    iconBg: "bg-[#dbe1ff]",
                    iconColor: "text-[#2563EB]",
                    title: "Smart Selection",
                    desc: "Surface the best box from live inventory so every order lands inside the lowest-cost fit.",
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
            {/* Right column - API response */}
            <div className="flex flex-col justify-start lg:pt-4" data-reveal="right">
              <div className="overflow-hidden rounded-[12px] bg-[#2e3132] shadow-[0_25px_44px_-12px_rgba(0,0,0,0.25)] lg:sticky lg:top-24">
                {/* Header bar */}
                <div className="flex flex-col gap-2 border-b border-white/[0.01] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <span className="overflow-x-auto font-mono text-[11px] leading-[1.5] text-[#f0f1f2] sm:text-[12px] sm:leading-[1.33]">
                    POST /api/v1/packing-plans/calculate
                  </span>
                  <span className="w-fit rounded-lg bg-[#6bff8f] px-2 py-0.5 text-[10px] font-bold text-[#002109]">
                    200 OK
                  </span>
                </div>
                {/* JSON body */}
                <div className="overflow-x-auto p-4 sm:p-6">
                  <pre className="min-w-[300px] font-mono text-[11px] leading-[1.5] whitespace-pre-wrap text-[#f0f1f2] sm:text-[12px] sm:leading-[1.33]">{`{
  "id": "fcaf6650-e07f-4768-b5c7-11d6991e73be",
  "units": {
     "unitSystem": "cm",
     "dimension": "cm",
     "weight": "g",
     "dimensionalWeight": "kg"
  },
  "result": {
     "box": {
        "id": "f7599914-5cdb-4f73-9b39-3d81003e7b42",
        "name": "Small Box",
        "width": 30,
        "height": 20,
        "depth": 45,
        "spacing": 0.25,
        "maxWeight": 1.3,
        "dimensionalWeight": 6
     },
     "visualization": {
        "status": "pending",
        "perspectiveUrl": "https://packwell.io/4a66f77.png",
        "frontUrl": "https://packwell.io/4a66f7a.png",
        "sideUrl": "https://packwell.io/4a6617a.png",
        "topUrl": "https://packwell.io/4a66477a.png"
     }
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 px-6 bg-[#F8F9FA]">
          <div className="max-w-[1232px] mx-auto flex flex-col items-center">
            <div className="text-center mb-16 max-w-[760px] flex flex-col items-center gap-3.5" data-reveal="up">
              <h2 className="text-[48px] font-extrabold tracking-[-1.2px] leading-[1.05] text-[#1E293B]">
                Simple pricing that scales with your usage
              </h2>
              <p className="text-[18px] text-[#64748B] leading-[1.55] max-w-[720px]">
                Choose a plan that fits your packing volume today, then unlock automation and
                analytics as your operation expands.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full" data-reveal="up">
              {/* Starter */}
              <div className="bg-white rounded-[20px] p-7 flex flex-col gap-[22px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-[22px]">
                  <h3 className="text-[20px] font-bold text-[#1E293B]">Starter</h3>
                  <p className="text-[14px] text-[#64748B] leading-[1.5]">
                    For small teams validating pack-rate improvements.
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[34px] font-bold text-[#1E293B]">Free</span>
                  </div>
                </div>
                <div className="h-px bg-[#E2E8F0]"></div>
                <ul className="flex flex-col gap-3 flex-1">
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    up to 50 packing plans/month
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    REST API access
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    3D visualization
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3.5 px-5 rounded-[10px] border border-[#E2E8F0] text-center text-[15px] font-bold text-[#1E293B] hover:bg-slate-50 transition-colors"
                >
                  Start free
                </Link>
              </div>
              {/* Growth */}
              <div className="bg-white rounded-[20px] p-7 flex flex-col gap-[22px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-[22px]">
                  <h3 className="text-[20px] font-bold text-[#1E293B]">Growth</h3>
                  <p className="text-[14px] text-[#64748B] leading-[1.5]">
                    For teams automating box choice across daily operations.
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[34px] font-bold text-[#1E293B]">$49</span>
                    <span className="text-[15px] font-medium text-[#94A3B8] mb-1">/ mo</span>
                  </div>
                </div>
                <div className="h-px bg-[#E2E8F0]"></div>
                <ul className="flex flex-col gap-3 flex-1">
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    up to 500 packing plans/month
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    REST API access
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    3D visualization
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#1E293B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    email support
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3.5 px-5 rounded-[10px] border border-[#E2E8F0] text-center text-[15px] font-bold text-[#1E293B] hover:bg-slate-50 transition-colors"
                >
                  Choose Growth
                </Link>
              </div>
              {/* Pro */}
              <div className="bg-[#F7FBFF] rounded-[22px] p-6 flex flex-col gap-[18px] border-2 border-[#2563EB] relative shadow-[0_1px_6px_rgba(37,99,235,0.09),0_18px_40px_-18px_rgba(37,99,235,0.15)]">
                <span className="absolute top-6 right-6 bg-[#2563EB] text-white px-3 py-1.5 rounded-full text-[12px] font-bold">
                  Most popular
                </span>
                <div className="flex flex-col gap-[18px]">
                  <h3 className="text-[20px] font-bold text-[#1E293B]">Pro</h3>
                  <p className="text-[14px] text-[#64748B] leading-[1.5]">
                    For high-volume ops teams optimizing cost by lane, box type, and SLA.
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[36px] font-bold text-[#1E293B]">$149</span>
                    <span className="text-[15px] font-medium text-[#94A3B8] mb-1">/ mo</span>
                  </div>
                </div>
                <div className="h-px bg-[#D6E8FF]"></div>
                <ul className="flex flex-col gap-3 flex-1">
                  <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    up to 2,000 packing plans/mo
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    REST API access
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    3D visualization
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-[#64748B]">
                    <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check</span>
                    priority support
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3.5 px-5 rounded-[10px] bg-[#2563EB] text-center text-[15px] font-bold text-white hover:bg-[#1d4ed8] transition-colors"
                >
                  Choose Pro
                </Link>
              </div>
              {/* Scale */}
              <div className="bg-white rounded-[20px] p-7 flex flex-col gap-[22px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-[22px]">
                  <h3 className="text-[20px] font-bold text-[#1E293B]">Scale</h3>
                  <p className="text-[14px] text-[#64748B] leading-[1.5]">
                    For enterprise teams needing tailored rollout, governance, and long-term support.
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-[30px] font-bold text-[#1E293B] whitespace-nowrap">Custom pricing</span>
                  </div>
                </div>
                <div className="h-px bg-[#E2E8F0]"></div>
                <ul className="flex flex-col gap-3 flex-1">
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
                <button
                  className="w-full py-3.5 px-5 rounded-[10px] border border-[#E2E8F0] text-center text-[15px] font-bold text-[#1E293B] hover:bg-slate-50 transition-colors"
                >
                  Contact sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[1232px] mx-auto">
            <div className="bg-[#DBE1FF] rounded-[24px] px-16 py-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
              <div className="relative z-10 max-w-[700px] flex flex-col gap-6" data-reveal="left">
                <h2 className="text-[48px] font-bold text-[#0F172A] leading-none">
                  Start packing smarter today.
                </h2>
                <p className="text-[18px] text-[#475569] leading-[1.56] max-w-[620px]">
                  Every mismatched box is money lost on dimensional weight charges and
                  wasted packaging. Packwell picks the right carton for every order
                  automatically.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/signup"
                    className="bg-[#2563EB] text-white px-8 py-4 rounded-lg text-[16px] font-bold hover:bg-[#1d4ed8] transition-colors"
                  >
                    Start free
                  </Link>
                  <Link
                    href="#"
                    className="bg-white text-[#1E293B] px-6 py-4 rounded-lg text-[16px] font-bold border border-[#E2E8F0] hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
              {/* Recommended Box Card */}
              <div
                className="relative z-10 bg-white p-6 rounded-[16px] w-[292px] shrink-0 flex flex-col gap-3 rotate-[4deg] shadow-[0_4px_12px_rgba(0,0,0,0.06),0_18px_34px_-18px_rgba(0,0,0,0.08)]"
                data-reveal="right"
              >
                <span className="text-[13px] font-bold text-[#64748B] leading-[1.33]">Recommended Box</span>
                <p className="text-[23px] font-extrabold text-[#0F172A] leading-[1.2]">Medium (14&times;10&times;8)</p>
                <div className="h-px bg-[#E2E8F0]"></div>
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
                <div className="h-px bg-[#E2E8F0]"></div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#94A3B8]">arrow_forward</span>
                  <span className="text-[12px] text-[#94A3B8]">vs Large Box ($14.50)</span>
                </div>
                <div className="bg-[#ECFDF5] rounded-full px-3 py-2 flex items-center gap-1.5 self-start">
                  <span className="material-symbols-outlined text-[15px] text-[#16A34A]">paid</span>
                  <span className="text-[14px] font-bold text-[#16A34A]">Save $4.22 per shipment</span>
                </div>
                <p className="text-[12px] font-bold text-[#94A3B8]">Calculated instantly</p>
              </div>
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
                <PackwellLogo className="h-7 w-auto text-slate-900" />
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
                    href="/api/v1/docs"
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
                  support@packwell.io
                </li>
                <li className="pt-1">
                  <span className="text-blue-600 font-bold text-sm cursor-pointer">
                    Book a Demo
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">
                Legal
              </h5>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-slate-500 hover:text-slate-900 transition-all duration-300 text-sm"
                  >
                    Terms of Service
                  </Link>
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

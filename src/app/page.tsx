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
        <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-48 md:pb-32">
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
              <p className="text-sm text-on-surface-variant flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                  API in minutes
                </span>
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-4">
                Used by ecommerce brands and fulfillment teams optimizing shipping costs.
              </p>
            </div>
            <div className="relative lg:col-span-5" data-reveal="right">
              {/* Box Recommendation Card */}
              <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.05)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-1 block">
                      Optimal Recommendation
                    </span>
                    <h3 className="text-2xl font-bold">Box Type: Large 4(16X14X8)</h3>
                  </div>
                </div>
                <div className="aspect-[4/3] bg-surface-container-low rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Packwell box visualization"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    src="/hero-box.png"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-surface p-4 rounded-lg">
                    <p className="text-xs text-on-surface-variant">
                      Shipping Savings
                    </p>
                    <p className="text-xl font-bold text-secondary">-$4.22</p>
                  </div>
                  <div className="bg-surface p-4 rounded-lg">
                    <p className="text-xs text-on-surface-variant">
                      Fill Saved
                    </p>
                    <p className="text-xl font-bold text-primary">62%</p>
                  </div>
                </div>
                {/* JSON Block */}
                <div className="bg-inverse-surface p-4 rounded-lg font-mono text-[10px] leading-relaxed overflow-hidden">
                  <div className="flex gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <code className="text-inverse-on-surface">
                    {`{`}<br />
                    {`  `}<span className="text-secondary-fixed">&quot;id&quot;</span>{`: `}<span className="text-primary-fixed">&quot;f7fdee8-6a06-4f75-b0d8-b818bbb17b4f&quot;</span>{`,`}<br />
                    {`  `}<span className="text-secondary-fixed">&quot;utilization&quot;</span>{`: `}<span className="text-primary-fixed">0.982</span>{`,`}<br />
                    {`  `}<span className="text-secondary-fixed">&quot;name&quot;</span>{`: `}<span className="text-primary-fixed">&quot;Small 3&quot;</span>{`,`}<br />
                    {`  `}<span className="text-secondary-fixed">&quot;items&quot;</span>{`: `}<span className="text-primary-fixed">4</span>{`,`}<br />
                    {`  `}<span className="text-secondary-fixed">&quot;dimensions&quot;</span>{`: `}<span className="text-primary-fixed">[16, 14, 8]</span><br />
                    {`}`}
                  </code>
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
                    <span className="font-mono text-sm font-bold">Carrier Invoice #8291</span>
                    <p className="text-xs text-on-surface-variant">Bill correction: Reweighed package</p>
                  </div>
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-xs font-bold">
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
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">shopping_cart</span>
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
                    <span className="material-symbols-outlined text-on-primary text-2xl">inventory_2</span>
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
                  <span className="material-symbols-outlined text-secondary text-2xl">check_circle</span>
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
                  iconColor: "text-primary",
                  title: "Ecommerce Brands",
                  desc: "Show accurate shipping at checkout. Stop eating margin on every order.",
                },
                {
                  icon: "redeem",
                  iconColor: "text-error",
                  title: "Promotional & Gifting",
                  desc: "Complex kits with mixed items. Optimize box selection across warehouse distributions.",
                },
                {
                  icon: "warehouse",
                  iconColor: "text-amber-600",
                  title: "3PL Warehouses",
                  desc: "Standardize packing decisions across shifts and locations. Consistent box selection every time.",
                },
                {
                  icon: "autorenew",
                  iconColor: "text-secondary",
                  title: "Subscription Brands",
                  desc: "Design packaging around your recurring SKU mix. Optimize box inventory for predictable orders.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-surface-container-lowest rounded-xl p-8 hover:shadow-lg transition-shadow"
                  data-reveal="up"
                >
                  <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4">
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
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16" data-reveal="up">
              Turn packaging into a cost advantage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: "attach_money",
                  iconBg: "bg-secondary-fixed",
                  iconColor: "text-secondary",
                  title: "Stop losing money on shipping",
                  desc: "Kill hidden shipping surcharges before they eat your profit.",
                },
                {
                  icon: "local_shipping",
                  iconBg: "bg-primary-fixed",
                  iconColor: "text-primary",
                  title: "Reduce shipping costs",
                  desc: "Shrink box dimensions to hit lower carrier weight tiers.",
                },
                {
                  icon: "precision_manufacturing",
                  iconBg: "bg-amber-100",
                  iconColor: "text-amber-700",
                  title: "Automate manual work",
                  desc: 'Remove the "best guess" from the packing table for good.',
                },
                {
                  icon: "bar_chart",
                  iconBg: "bg-primary-fixed",
                  iconColor: "text-primary",
                  title: "Unlock packaging insights",
                  desc: "Identify which custom boxes are actually saving you money.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-surface-container-low rounded-xl p-8 flex gap-4 items-start hover:bg-surface-container-high transition-colors"
                  data-reveal="up"
                >
                  <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${item.iconColor} text-xl`}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
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
              <span className="text-sm font-medium text-on-surface-variant uppercase tracking-widest">
                Example savings
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-2 mb-6 leading-tight">
                How much can you save?
              </h2>
              <p className="text-on-surface-variant mb-8 max-w-md">
                Reduce shipping costs by optimizing box selection and eliminating wasted space.
              </p>
              <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
                <h4 className="font-bold mb-4">If you ship 1,000 orders per month:</h4>
                <ul className="space-y-2 text-on-surface-variant text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">+</span> Save $2–$5 per shipment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">+</span> Reduce dimensional weight charges
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary">+</span> Eliminate oversized boxes
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary-fixed rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant uppercase tracking-widest">Result</span>
                  <p className="text-2xl md:text-3xl font-bold text-secondary">$2,000–$5,000 saved per month</p>
                </div>
              </div>
            </div>
            <div data-reveal="right">
              <div className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-surface-container">
                  <span className="text-xs text-on-surface-variant uppercase tracking-widest">Order</span>
                  <h3 className="text-xl font-bold mt-1">Hoodie + Mug + Notebook</h3>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-6 border-r border-surface-container">
                    <h4 className="font-bold text-sm mb-3">Without Packwell</h4>
                    <p className="text-sm text-on-surface-variant">Box: <span className="font-medium text-on-surface">Large</span></p>
                    <p className="text-sm font-bold text-error mt-2">Shipping: $14.50</p>
                  </div>
                  <div className="p-6 bg-surface-container-low">
                    <h4 className="font-bold text-sm text-primary mb-3">With Packwell</h4>
                    <p className="text-sm text-on-surface-variant">Box: <span className="font-medium text-on-surface">Medium</span></p>
                    <p className="text-sm font-bold text-secondary mt-2">Shipping: $10.20</p>
                  </div>
                </div>
                <div className="bg-inverse-surface p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary text-sm">savings</span>
                  </div>
                  <span className="text-inverse-on-surface text-sm">Savings</span>
                  <span className="text-secondary-fixed font-bold text-lg ml-auto">$4.30 per shipment</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/60 px-4 py-2 text-right">
                  *Estimates based on typical ecommerce shipments
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32 px-6 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-20"
              data-reveal="up"
            >
              How Packwell works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-outline-variant/30"></div>
              {[
                {
                  num: "1",
                  icon: "list_alt",
                  title: "Provide items in the order",
                },
                {
                  num: "2",
                  icon: "precision_manufacturing",
                  title: "Packwell calculates best box & layout",
                },
                {
                  num: "3",
                  icon: "output",
                  title: "Receive dimensions + packing plan",
                },
                {
                  num: "4",
                  icon: "local_shipping",
                  title: "Use in checkout or warehouse",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="relative z-10 text-center"
                  data-reveal="up"
                >
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-surface shadow-xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-xl font-bold text-primary">
                      {step.num}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium">{step.title}</p>
                </div>
              ))}
            </div>
            {/* Flow Diagram */}
            <div
              className="mt-24 p-8 bg-surface-container rounded-2xl max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12"
              data-reveal="up"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                <span className="text-xs font-bold">Cart</span>
              </div>
              <span className="material-symbols-outlined opacity-30">trending_flat</span>
              <div className="bg-primary text-on-primary px-4 py-2 rounded font-mono text-sm font-bold">
                Packwell API
              </div>
              <span className="material-symbols-outlined opacity-30">trending_flat</span>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
                <span className="text-xs font-bold">Box</span>
              </div>
              <span className="material-symbols-outlined opacity-30">trending_flat</span>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl">view_in_ar</span>
                <span className="text-xs font-bold">3D</span>
              </div>
              <span className="material-symbols-outlined opacity-30">trending_flat</span>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-3xl">payments</span>
                <span className="text-xs font-bold">Cost</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7" data-reveal="left">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Everything you need to ship smarter
              </h2>
              <p className="text-lg text-on-surface-variant mb-12 max-w-xl">
                From intelligent box matching to real-time 3D verification, Packwell gives
                your warehouse the tools to cut waste and speed up every order.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">api</span>
                  </div>
                  <h4 className="font-bold">Lightning Fast API</h4>
                  <p className="text-on-surface-variant text-sm">
                    Packing calculations in under 50ms for high-volume checkouts.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">rule</span>
                  </div>
                  <h4 className="font-bold">Custom Logic Rules</h4>
                  <p className="text-on-surface-variant text-sm">
                    Define nesting, stacking, and fragility rules per SKU.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">3d_rotation</span>
                  </div>
                  <h4 className="font-bold">3D Visualizer</h4>
                  <p className="text-on-surface-variant text-sm">
                    Review orientation, void fill, and fragile-item spacing before the order reaches the floor.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  </div>
                  <h4 className="font-bold">Smart Selection</h4>
                  <p className="text-on-surface-variant text-sm">
                    Surface the best box from live inventory so every order lands inside the lowest-cost fit.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5" data-reveal="right">
              <div className="bg-inverse-surface rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                  <span className="text-inverse-on-surface font-mono text-xs">
                    POST /api/v1/packing-plans/calculate
                  </span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded text-[10px] font-bold">
                    200 OK
                  </span>
                </div>
                <div className="p-6 font-mono text-xs text-inverse-on-surface flex-1 overflow-auto">
                  <pre className="whitespace-pre-wrap">
{`{
  `}<span className="text-secondary-fixed">&quot;id&quot;</span>{`: `}<span className="text-primary-fixed">&quot;f7f08050-a0f7-4f05-b0c7-1bf5901a72be&quot;</span>{`,
  `}<span className="text-secondary-fixed">&quot;utilization&quot;</span>{`: `}<span className="text-primary-fixed">0.982</span>{`,
  `}<span className="text-secondary-fixed">&quot;container&quot;</span>{`: {
    `}<span className="text-secondary-fixed">&quot;name&quot;</span>{`: `}<span className="text-primary-fixed">&quot;Small 3&quot;</span>{`,
    `}<span className="text-secondary-fixed">&quot;dimensions&quot;</span>{`: {
      `}<span className="text-secondary-fixed">&quot;length&quot;</span>{`: `}<span className="text-primary-fixed">16</span>{`,
      `}<span className="text-secondary-fixed">&quot;width&quot;</span>{`: `}<span className="text-primary-fixed">14</span>{`,
      `}<span className="text-secondary-fixed">&quot;height&quot;</span>{`: `}<span className="text-primary-fixed">8</span>{`
    }
  },
  `}<span className="text-secondary-fixed">&quot;items&quot;</span>{`: [
    {
      `}<span className="text-secondary-fixed">&quot;sku&quot;</span>{`: `}<span className="text-primary-fixed">&quot;PRD-01&quot;</span>{`,
      `}<span className="text-secondary-fixed">&quot;position&quot;</span>{`: [`}<span className="text-primary-fixed">0, 0, 0</span>{`],
      `}<span className="text-secondary-fixed">&quot;rotation&quot;</span>{`: `}<span className="text-primary-fixed">90</span>{`
    }
  ],
  `}<span className="text-secondary-fixed">&quot;visualization&quot;</span>{`: {
    `}<span className="text-secondary-fixed">&quot;status&quot;</span>{`: `}<span className="text-primary-fixed">&quot;pending&quot;</span>{`,
    `}<span className="text-secondary-fixed">&quot;urls&quot;</span>{`: {
      `}<span className="text-secondary-fixed">&quot;png&quot;</span>{`: `}<span className="text-primary-fixed">&quot;https://packwell.io/...&quot;</span>{`
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16" data-reveal="up">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Simple pricing that scales with your usage
              </h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
                Choose a plan that fits your packing volume today, then unlock automation and
                analytics as your operation expands.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-reveal="up">
              {/* Starter */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col border border-outline-variant/20">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  For small teams validating pack-rate improvements.
                </p>
                <p className="text-4xl font-extrabold mb-1">Free</p>
                <div className="h-5"></div>
                <ul className="space-y-3 mt-6 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Up to 50 packing plans/month
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    REST API access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    3D visualization
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-lg border border-outline-variant/30 text-center font-semibold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Start free
                </Link>
              </div>
              {/* Growth */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col border border-outline-variant/20">
                <h3 className="text-xl font-bold mb-2">Growth</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  For teams automating box choice across daily operations.
                </p>
                <p className="text-4xl font-extrabold mb-1">$49<span className="text-base font-medium text-on-surface-variant">/mo</span></p>
                <div className="h-5"></div>
                <ul className="space-y-3 mt-6 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Up to 500 packing plans/month
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    REST API access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    3D visualization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Email support
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-lg border border-outline-variant/30 text-center font-semibold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Choose Growth
                </Link>
              </div>
              {/* Pro */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col border-2 border-primary relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-0.5 rounded-full text-xs font-bold">
                  Most popular
                </span>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  For high-volume ops teams optimizing cost by lane, box type, and SLA.
                </p>
                <p className="text-4xl font-extrabold mb-1">$149<span className="text-base font-medium text-on-surface-variant">/mo</span></p>
                <div className="h-5"></div>
                <ul className="space-y-3 mt-6 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Up to 2,000 packing plans/mo
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    REST API access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    3D visualization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-lg bg-primary text-on-primary text-center font-semibold text-sm hover:bg-primary-container transition-colors"
                >
                  Choose Pro
                </Link>
              </div>
              {/* Scale */}
              <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col border border-outline-variant/20">
                <h3 className="text-xl font-bold mb-2">Scale</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  For enterprise teams needing tailored rollout, governance, and long-term support.
                </p>
                <p className="text-3xl font-extrabold mb-1">Custom pricing</p>
                <div className="h-5"></div>
                <ul className="space-y-3 mt-6 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Unlimited usage
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    SLA
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-lg">check</span>
                    Custom integrations
                  </li>
                </ul>
                <button
                  className="w-full py-3 rounded-lg border border-outline-variant/30 text-center font-semibold text-sm hover:bg-surface-container-high transition-colors"
                >
                  Contact sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary-fixed rounded-3xl p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="relative z-10 max-w-xl" data-reveal="left">
                <h2 className="text-4xl md:text-5xl font-bold text-on-primary-fixed mb-6 leading-tight">
                  Start packing smarter today.
                </h2>
                <p className="text-lg text-on-primary-fixed-variant mb-10">
                  Every mismatched box is money lost on dimensional weight charges and
                  wasted packaging. Packwell picks the right carton for every order
                  automatically.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all"
                  >
                    Start free
                  </Link>
                  <Link
                    href="#"
                    className="bg-white/20 text-on-primary-fixed border border-on-primary-fixed/30 px-8 py-4 rounded-lg font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                  >
                    Contact Sales{" "}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
              {/* Recommended Box Card */}
              <div
                className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl rotate-3 max-w-xs w-full"
                data-reveal="right"
              >
                <span className="text-xs text-on-surface-variant uppercase tracking-widest">Recommended Box</span>
                <p className="text-xl font-bold mt-1 mb-4">Medium (14&times;10&times;8)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Dim Weight</span>
                    <span className="font-medium">4.2 lb</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="font-medium">$10.20</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-surface-container text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    vs Large Box ($14.55)
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm font-bold text-secondary">Save $4.22 per shipment</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/60 mt-2">Calculated instantly</p>
              </div>
              {/* Abstract Glow */}
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary opacity-20 blur-[100px] rounded-full"></div>
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
                  hello@packwell.io
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

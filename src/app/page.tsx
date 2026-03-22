import { auth } from "@/lib/auth";
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
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
          <div className="text-xl font-bold tracking-tighter text-slate-900">
            Packwell
          </div>
          <div className="hidden md:flex gap-8 items-center tracking-tight text-sm font-medium">
            <Link
              href="#"
              className="text-blue-600 font-semibold transition-colors"
            >
              Product
            </Link>
            <Link
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              API
            </Link>
            <Link
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Pricing
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
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7" data-reveal="left">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-background mb-6 leading-[1.1]">
              Stop shipping air. <br />
              <span className="text-primary">Start packing smart.</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
              Calculate optimal box dimensions for every order instantly. Reduce
              dimensional weight costs, minimize waste, and automate your packing
              logic.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="bg-primary text-on-primary px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
              <Link
                href="#"
                className="bg-surface-container-high text-on-surface px-8 py-4 rounded-lg font-semibold text-lg hover:bg-surface-container-highest transition-all"
              >
                Book a Demo
              </Link>
            </div>
          </div>
          <div className="relative lg:col-span-5" data-reveal="right">
            {/* 3D Box Illustration Card */}
            <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.05)] transform hover:-rotate-1 transition-transform duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-1 block">
                    Optimal Recommendation
                  </span>
                  <h3 className="text-2xl font-bold">Box Type: BW-42</h3>
                </div>
                <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-bold">
                  98% Fill Rate
                </div>
              </div>
              <div className="aspect-square bg-surface-container-low rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Packwell box visualization"
                  className="absolute inset-0 h-full w-full object-cover object-center -translate-y-[11px] sm:-translate-y-2 lg:-translate-y-1"
                  src="/hero-box.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/50 to-transparent"></div>
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
                    Void Fill Saved
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
                  <span className="text-secondary-fixed">
                    &quot;suggestion&quot;
                  </span>
                  : &#123;
                  <br />
                  {"  "}
                  <span className="text-secondary-fixed">
                    &quot;id&quot;
                  </span>
                  :{" "}
                  <span className="text-primary-fixed">
                    &quot;BW-42&quot;
                  </span>
                  ,
                  <br />
                  {"  "}
                  <span className="text-secondary-fixed">
                    &quot;dimensions&quot;
                  </span>
                  :{" "}
                  <span className="text-primary-fixed">[12, 8, 4]</span>,
                  <br />
                  {"  "}
                  <span className="text-secondary-fixed">
                    &quot;utilization&quot;
                  </span>
                  : <span className="text-primary-fixed">0.982</span>
                  <br />
                  &#125;
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
                  style={{
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  error
                </span>
                <div>
                  <p className="font-bold text-lg">Undercharge Customers</p>
                  <p className="text-on-surface-variant">
                    Losing money on every label because the box was bigger than
                    estimated at checkout.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className="material-symbols-outlined text-error"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  error
                </span>
                <div>
                  <p className="font-bold text-lg">Oversized Boxes</p>
                  <p className="text-on-surface-variant">
                    Paying to ship air and wasting expensive void fill in every
                    single parcel.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className="material-symbols-outlined text-error"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  error
                </span>
                <div>
                  <p className="font-bold text-lg">Inconsistent Packing</p>
                  <p className="text-on-surface-variant">
                    Warehouse teams choosing random boxes, leading to high damage
                    rates and soaring costs.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative" data-reveal="right">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg rotate-2">
              <div className="flex items-center justify-between border-b border-surface-container p-4 mb-4">
                <span className="font-mono text-sm">
                  Carrier Invoice #8291
                </span>
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

      {/* Solution Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-reveal="up">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Packwell brings precision to packaging.
            </h2>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
              Our intelligence engine processes item dimensions, weights, and
              fragilities to output the perfect container every time.
            </p>
          </div>
          <div
            className="bg-inverse-surface rounded-2xl p-4 md:p-12 overflow-hidden relative"
            data-reveal="zoom"
          >
            <div className="absolute top-0 right-0 p-8">
              <span className="text-secondary-fixed text-sm font-mono tracking-tighter">
                {"// Solution: Optimized"}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Optimized Packing Visualization"
                  className="rounded-xl shadow-2xl"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCypos--rKTJu5HQIggm_coGNrhB3DUEoI5P9Dt7vpwcbhiotYgsoLxmSvlcu9a0U9_j5vEqFOsga5ENZ2CbE5o9e3OEhXRPgutGqBV5hKVMW8bPXot0LrZU5eScMNsLzTM9bwqMamtaMcgp67P8CubWBMM6ZVPbo7Z3B0zfW2pkUB9CrBbDA2nHIv1L_3HFd56pvzK1sscfjo-ZRz2ZdXQSvK1ljT9euPfORwWn9fNOCotIg1J4DlrEvBsrteDwYiDLA88p6H6GZLC"
                />
              </div>
              <div className="text-inverse-on-surface space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-fixed px-3 py-1 rounded-full text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>{" "}
                    Zero Waste Goal
                  </div>
                  <h3 className="text-3xl font-bold">
                    Tightly Engineered Fulfillment
                  </h3>
                  <p className="text-lg opacity-80 leading-relaxed">
                    By predicting the exact volumetric requirement before the
                    order hits the warehouse floor, you eliminate decision
                    fatigue for staff and unnecessary DIM weight costs.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-2xl font-bold text-secondary-fixed">
                      15%
                    </p>
                    <p className="text-sm opacity-60">Avg. Shipping Savings</p>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-2xl font-bold text-secondary-fixed">
                      30%
                    </p>
                    <p className="text-sm opacity-60">Less Void Fill Used</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section (Bento Grid) */}
      <section className="py-24 md:py-32 bg-surface px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-16"
            data-reveal="up"
          >
            Built for modern commerce.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Case 1 */}
            <div
              className="md:col-span-8 bg-surface-container-low rounded-xl p-8 hover:bg-surface-container-high transition-colors group"
              data-reveal="left"
            >
              <div className="max-w-md">
                <span className="material-symbols-outlined text-primary mb-4 text-4xl">
                  shopping_cart
                </span>
                <h3 className="text-2xl font-bold mb-3">Accurate Checkout</h3>
                <p className="text-on-surface-variant mb-6">
                  Stop guessing at shipping rates. Calculate precise box sizes in
                  the cart to provide real-time, profitable carrier quotes to
                  your customers.
                </p>
                <span className="text-primary font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Learn more{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
            {/* Case 2 */}
            <div
              className="md:col-span-4 bg-primary text-on-primary rounded-xl p-8 flex flex-col justify-end"
              data-reveal="right"
            >
              <span className="material-symbols-outlined text-on-primary mb-4 text-4xl">
                inventory_2
              </span>
              <h3 className="text-2xl font-bold mb-3">Warehouse Logic</h3>
              <p className="text-on-primary/80">
                Give your pickers digital packing instructions. No more
                &apos;trying&apos; boxes to see what fits.
              </p>
            </div>
            {/* Case 3 */}
            <div
              className="md:col-span-4 bg-secondary text-on-secondary rounded-xl p-8"
              data-reveal="left"
            >
              <span className="material-symbols-outlined text-on-secondary mb-4 text-4xl">
                insights
              </span>
              <h3 className="text-2xl font-bold mb-3">Cost Optimization</h3>
              <p className="text-on-secondary/80">
                Identify which box sizes you actually need. Rationalize your
                packaging inventory based on real order data.
              </p>
            </div>
            {/* Case 4 */}
            <div
              className="md:col-span-8 bg-surface-container-low rounded-xl p-8 hover:bg-surface-container-high transition-colors group"
              data-reveal="right"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-primary mb-4 text-4xl">
                    architecture
                  </span>
                  <h3 className="text-2xl font-bold mb-3">Kit Design</h3>
                  <p className="text-on-surface-variant mb-6">
                    Simulation tools for subscription brands. See how your
                    monthly kits will fit before you buy the custom packaging.
                  </p>
                  <span className="text-primary font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                    Try Simulator{" "}
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </span>
                </div>
                <div className="flex-1 w-full bg-white rounded-lg p-4 shadow-sm border border-black/5">
                  <div className="h-4 w-3/4 bg-surface-container rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-surface-container rounded mb-4"></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square bg-primary-fixed rounded"></div>
                    <div className="aspect-square bg-secondary-fixed rounded"></div>
                    <div className="aspect-square bg-tertiary-fixed rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6 bg-surface-container-lowest">
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
            {/* Steps */}
            {[
              {
                num: "01",
                title: "Define Products",
                desc: "Sync your catalog dimensions and fragile flags.",
              },
              {
                num: "02",
                title: "Send API Call",
                desc: "Post order lines to our packing engine.",
              },
              {
                num: "03",
                title: "Get Result",
                desc: "Receive the perfect box ID and 3D coords.",
              },
              {
                num: "04",
                title: "Ship Smarter",
                desc: "Use data in WMS, ERP, or Checkout.",
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
                <h4 className="font-bold mb-2">{step.title}</h4>
                <p className="text-sm text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
          {/* Flow Diagram */}
          <div
            className="mt-24 p-8 bg-surface-container rounded-2xl max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12"
            data-reveal="zoom"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl">
                shopping_cart
              </span>
              <span className="text-xs font-bold">CART</span>
            </div>
            <span className="material-symbols-outlined opacity-30">
              trending_flat
            </span>
            <div className="bg-primary text-on-primary px-4 py-2 rounded font-mono text-sm font-bold">
              API
            </div>
            <span className="material-symbols-outlined opacity-30">
              trending_flat
            </span>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl">
                inventory_2
              </span>
              <span className="text-xs font-bold">BOX-ID</span>
            </div>
            <span className="material-symbols-outlined opacity-30">
              trending_flat
            </span>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl">
                view_in_ar
              </span>
              <span className="text-xs font-bold">3D MAP</span>
            </div>
            <span className="material-symbols-outlined opacity-30">
              trending_flat
            </span>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-3xl">
                payments
              </span>
              <span className="text-xs font-bold">MIN COST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7" data-reveal="left">
            <h2 className="text-4xl font-bold mb-12">
              Powerful packing intelligence.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    api
                  </span>
                </div>
                <h4 className="font-bold">Lightning Fast API</h4>
                <p className="text-on-surface-variant text-sm">
                  Packing calculations in under 50ms for high-volume checkouts.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">
                    rule
                  </span>
                </div>
                <h4 className="font-bold">Custom Logic Rules</h4>
                <p className="text-on-surface-variant text-sm">
                  Define nesting, stacking, and fragility rules per SKU.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">
                    3d_rotation
                  </span>
                </div>
                <h4 className="font-bold">3D Visualizer</h4>
                <p className="text-on-surface-variant text-sm">
                  Beautiful visual packing instructions for warehouse teams.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    auto_awesome
                  </span>
                </div>
                <h4 className="font-bold">Smart Selection</h4>
                <p className="text-on-surface-variant text-sm">
                  Automatically chooses between box, mailer, or envelope.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5" data-reveal="right">
            <div className="bg-inverse-surface rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
              <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <span className="text-inverse-on-surface font-mono text-xs">
                  POST /api/v1/pack
                </span>
                <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded text-[10px] font-bold">
                  200 OK
                </span>
              </div>
              <div className="p-6 font-mono text-xs text-inverse-on-surface flex-1 overflow-auto">
                <pre>
                  {`{
  `}
                  <span className="text-secondary-fixed">
                    &quot;status&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;success&quot;
                  </span>
                  {`,
  `}
                  <span className="text-secondary-fixed">
                    &quot;container&quot;
                  </span>
                  {`: {
    `}
                  <span className="text-secondary-fixed">&quot;id&quot;</span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;S_BOX_02&quot;
                  </span>
                  {`,
    `}
                  <span className="text-secondary-fixed">&quot;type&quot;</span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;corrugated&quot;
                  </span>
                  {`,
    `}
                  <span className="text-secondary-fixed">
                    &quot;weight_limit&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;20kg&quot;
                  </span>
                  {`
  },
  `}
                  <span className="text-secondary-fixed">
                    &quot;items&quot;
                  </span>
                  {`: [
    {
      `}
                  <span className="text-secondary-fixed">&quot;sku&quot;</span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;PRD-01&quot;
                  </span>
                  {`,
      `}
                  <span className="text-secondary-fixed">
                    &quot;position&quot;
                  </span>
                  {`: [`}
                  <span className="text-primary-fixed">0, 0, 0</span>
                  {`],
      `}
                  <span className="text-secondary-fixed">
                    &quot;rotation&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">&quot;90&quot;</span>
                  {`
    },
    {
      `}
                  <span className="text-secondary-fixed">&quot;sku&quot;</span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;PRD-04&quot;
                  </span>
                  {`,
      `}
                  <span className="text-secondary-fixed">
                    &quot;position&quot;
                  </span>
                  {`: [`}
                  <span className="text-primary-fixed">0, 5, 0</span>
                  {`],
      `}
                  <span className="text-secondary-fixed">
                    &quot;rotation&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">&quot;0&quot;</span>
                  {`
    }
  ],
  `}
                  <span className="text-secondary-fixed">
                    &quot;cost_analysis&quot;
                  </span>
                  {`: {
    `}
                  <span className="text-secondary-fixed">
                    &quot;dim_weight&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;4.2lb&quot;
                  </span>
                  {`,
    `}
                  <span className="text-secondary-fixed">
                    &quot;actual_weight&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;3.8lb&quot;
                  </span>
                  {`,
    `}
                  <span className="text-secondary-fixed">
                    &quot;efficiency&quot;
                  </span>
                  {`: `}
                  <span className="text-primary-fixed">
                    &quot;0.94&quot;
                  </span>
                  {`
  }
}`}
                </pre>
              </div>
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
                Join 500+ ecommerce brands saving thousands on shipping every
                month. No complex setup, just pure logic.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all"
                >
                  Start Free Trial
                </Link>
                <span className="text-on-primary-fixed font-bold px-8 py-4 flex items-center gap-2 cursor-pointer">
                  Contact Sales{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
            {/* Savings Card */}
            <div
              className="relative z-10 bg-white p-8 rounded-2xl shadow-2xl rotate-3 max-w-xs"
              data-reveal="right"
            >
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">
                Monthly Optimization
              </p>
              <p className="text-4xl font-extrabold text-secondary mb-4">
                $12,430
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-60">Labels Processed</span>
                  <span className="font-bold">42,501</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-60">DIM Efficiency</span>
                  <span className="font-bold text-secondary">+22%</span>
                </div>
              </div>
            </div>
            {/* Abstract Glow */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary opacity-20 blur-[100px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 w-full pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8">
          <div className="col-span-1" data-reveal="up">
            <div className="text-lg font-bold text-slate-900 mb-6">
              Packwell
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Advanced packing intelligence for modern fulfillment. Engineering
              the air out of the global supply chain.
            </p>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                <span className="material-symbols-outlined text-sm">
                  share
                </span>
              </span>
            </div>
          </div>
          <div className="col-span-1" data-reveal="up">
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">
              Product
            </h5>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  API Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1" data-reveal="up">
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">
              Resources
            </h5>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  Case Studies
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  API Status
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition-all duration-300"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1" data-reveal="up">
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-400">
              Contact
            </h5>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-slate-500">
                <span className="material-symbols-outlined text-sm">mail</span>
                hello@packwell.io
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                Mon-Fri, 9am - 6pm EST
              </li>
              <li className="pt-2">
                <span className="text-blue-600 font-bold cursor-pointer">
                  Book a Demo
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400"
          data-reveal="up"
        >
          <p>&copy; 2024 Packwell Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Cookie Settings
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </ScrollReveal>
  );
}

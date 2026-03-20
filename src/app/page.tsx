import { auth } from "@/lib/auth";
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/subscription-plans";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#f3f4f6_100%)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
              Box Sizer
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur">
                Stripe-powered subscriptions and usage-aware packaging workflows
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
                Choose the right carton before the warehouse does.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Save product dimensions, compare box fits, and control shipping spend with
                calculation tracking built in.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
              >
                Start Free
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                View Pricing
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/40">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Why teams switch</p>
            <div className="mt-8 grid gap-5">
              {[
                "Track shipment calculations by month and keep teams within plan limits.",
                "Offer Stripe Checkout and Customer Portal with no custom card UI to maintain low PCI scope.",
                "Save shipment scenarios and packaging data in one place for repeatable operations.",
              ].map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-200"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Plan-aware calculations",
              description:
                "Starter, Pro, and Business tiers enforce monthly usage without fragile counters.",
            },
            {
              title: "Hosted billing",
              description:
                "Checkout and payment method updates stay inside Stripe-hosted surfaces.",
            },
            {
              title: "Saved shipment history",
              description:
                "Keep shipment definitions, item stacking rules, and best-box decisions together.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur"
            >
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Pricing
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                Scale from ad hoc box checks to operational throughput.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
            >
              Compare full plan details
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <div
                key={plan.tier}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                  <p className="text-sm font-medium text-slate-500">
                    {plan.tier === "starter" ? "15 / month" : plan.tier === "pro" ? "300 / month" : "Unlimited"}
                  </p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-950">
                  {formatPrice(plan.monthlyPriceCents)}
                  {plan.monthlyPriceCents > 0 ? (
                    <span className="text-base font-medium text-slate-500"> / month</span>
                  ) : null}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-200 py-8 text-sm text-slate-500">
          Box Sizer helps teams choose better-fit packaging with Stripe-hosted billing and
          server-side usage controls.
        </footer>
      </div>
    </div>
  );
}

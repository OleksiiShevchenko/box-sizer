import Link from "next/link";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { InstantScrollLink } from "@/components/layout/instant-scroll-link";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";

export function MarketingHeader() {
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

export function MarketingFooter() {
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
            Tools
          </h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/tools/dimensional-weight-calculator"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                Dimensional Weight Calculator
              </Link>
            </li>
            <li>
              <Link
                href="/shipping-savings-audit"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                Shipping Savings Audit
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

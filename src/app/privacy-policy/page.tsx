import type { Metadata } from "next";
import Link from "next/link";
import { PackwellLogo } from "@/components/layout/packwell-logo";

export const metadata: Metadata = {
  title: "Privacy Policy | Packwell",
  description:
    "Read how Packwell collects, uses, and protects information across the platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 antialiased">
      <nav className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link aria-label="Go to Packwell homepage" href="/">
            <PackwellLogo className="h-8 w-auto text-slate-900" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-primary-container"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:pt-40">
        <p className="mb-2 text-sm font-medium text-slate-400">Legal</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mb-12 text-sm text-slate-400">
          Last updated: March 29, 2026
        </p>

        <div className="space-y-10 text-base leading-7">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              1. Introduction
            </h2>
            <p>
              This Privacy Policy explains how Packwell (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;) collects, uses, and protects your information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              2. Information We Collect
            </h2>
            <p>We collect the following categories of information:</p>
            <p className="mt-3">
              <strong>Information you provide</strong> &mdash; Name, email
              address, account credentials, and payment details processed by
              third-party providers.
            </p>
            <p className="mt-3">
              <strong>Usage data</strong> &mdash; IP address, browser type,
              device information, pages visited, and interactions.
            </p>
            <p className="mt-3">
              <strong>Customer data</strong> &mdash; Product dimensions,
              packaging configurations, and calculation inputs.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              3. How We Use Information
            </h2>
            <p>We use your data to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Provide and maintain the Service</li>
              <li>Process payments</li>
              <li>Improve product functionality</li>
              <li>Communicate with you for support and updates</li>
              <li>Analyze usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              4. Sharing of Information
            </h2>
            <p>
              We do not sell your data. We may share data with:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Payment processors, including Stripe</li>
              <li>Hosting providers</li>
              <li>Analytics tools</li>
            </ul>
            <p className="mt-3">
              All third parties are required to protect your data.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              5. Data Retention
            </h2>
            <p>
              We retain your information as long as necessary to provide the
              Service and comply with legal obligations. You may request deletion
              at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              6. Cookies &amp; Tracking
            </h2>
            <p>We use cookies to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Improve user experience</li>
              <li>Analyze traffic</li>
              <li>Enable core functionality</li>
            </ul>
            <p className="mt-3">
              You can control cookies via your browser settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              7. Data Security
            </h2>
            <p>
              We implement reasonable security measures to protect your data, but
              no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              8. Your Rights
            </h2>
            <p>
              If you are subject to California privacy rights or GDPR-style
              protections, you may have the right to:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Access your data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion</li>
              <li>Opt out of certain processing</li>
            </ul>
            <p className="mt-3">To exercise your rights, contact us.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our Service is not intended for children under 13. We do not
              knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              10. International Users
            </h2>
            <p>
              If you access Packwell from outside the United States, your data
              may be transferred to and processed in the United States.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              11. Changes to Privacy Policy
            </h2>
            <p>
              We may update this policy periodically. Updates will be posted on
              this page.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              12. Contact
            </h2>
            <p>
              For questions about this Privacy Policy, contact{" "}
              <a
                href="mailto:hello@packwell.io"
                className="text-primary hover:underline"
              >
                hello@packwell.io
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 md:flex-row">
          <p>&copy; 2026 Packwell. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-slate-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

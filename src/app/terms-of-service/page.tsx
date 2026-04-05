import type { Metadata } from "next";
import Link from "next/link";
import { PackwellLogo } from "@/components/layout/packwell-logo";

export const metadata: Metadata = {
  title: "Terms of Service | Packwell",
  description:
    "Read the Packwell Terms of Service and conditions for using the platform.",
};

export default function TermsOfServicePage() {
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
          Terms of Service
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
              Welcome to Packwell. These Terms of Service (&ldquo;Terms&rdquo;)
              govern your use of the Packwell website and services (the
              &ldquo;Service&rdquo;) operated by Packwell Inc. (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            </p>
            <p className="mt-3">
              By accessing or using Packwell, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              2. Description of Service
            </h2>
            <p>
              Packwell provides software tools that help users calculate optimal
              packaging configurations, including box size optimization and
              packing simulations.
            </p>
            <p className="mt-3">
              We may update or modify features at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              3. Eligibility
            </h2>
            <p>
              You must be at least 18 years old and capable of entering into
              legally binding agreements to use this Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              4. Accounts
            </h2>
            <p>
              To use certain features, you may be required to create an account.
              You agree to:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Provide accurate and complete information</li>
              <li>Keep your login credentials secure</li>
              <li>Notify us of any unauthorized access</li>
            </ul>
            <p className="mt-3">
              You are responsible for all activity under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              5. Payments &amp; Billing
            </h2>
            <p>If you purchase a paid plan:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>
                Payments are processed via third-party providers, including
                Stripe
              </li>
              <li>
                Fees are billed in advance on a monthly or annual basis
              </li>
              <li>
                All payments are non-refundable unless otherwise stated
              </li>
            </ul>
            <p className="mt-3">
              We reserve the right to change pricing with notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              6. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Use the Service for unlawful purposes</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Interfere with system integrity or security</li>
              <li>Use the Service to process harmful or misleading data</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              7. Intellectual Property
            </h2>
            <p>
              All content, software, and technology provided by Packwell are
              owned by us or our licensors.
            </p>
            <p className="mt-3">
              You are granted a limited, non-exclusive, non-transferable license
              to use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              8. User Data
            </h2>
            <p>
              You retain ownership of the data you input into Packwell. By using
              the Service, you grant us a limited license to:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Process your data to provide the Service</li>
              <li>Improve functionality and performance</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              9. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as
              available.&rdquo; We do not guarantee:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Accuracy of packing calculations</li>
              <li>
                Suitability for specific logistics or shipping requirements
              </li>
              <li>Error-free or uninterrupted service</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we are not liable for:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, revenue, or data</li>
              <li>
                Errors in packing recommendations leading to shipping issues
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              11. Termination
            </h2>
            <p>
              We may suspend or terminate your access at any time if you violate
              these Terms. You may stop using the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              12. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the State of California,
              United States.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              13. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              Service constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
              14. Contact
            </h2>
            <p>
              For questions about these Terms, contact{" "}
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

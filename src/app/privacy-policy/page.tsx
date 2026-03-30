import type { Metadata } from "next";
import Link from "next/link";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

type PrivacySection = {
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const privacySections: PrivacySection[] = [
  {
    number: "01",
    title: "Introduction",
    paragraphs: [
      "This Privacy Policy explains how Packwell (\"we\", \"us\") collects, uses, and protects your information.",
    ],
  },
  {
    number: "02",
    title: "Information We Collect",
    paragraphs: [
      "We collect the following categories of information:",
      "Information you provide",
      "Usage data",
      "Customer data",
    ],
    bullets: [
      "Name, email address, account credentials, and payment details processed by third-party providers",
      "IP address, browser type, device information, pages visited, and interactions",
      "Product dimensions, packaging configurations, and calculation inputs",
    ],
  },
  {
    number: "03",
    title: "How We Use Information",
    paragraphs: ["We use your data to:"],
    bullets: [
      "Provide and maintain the Service",
      "Process payments",
      "Improve product functionality",
      "Communicate with you for support and updates",
      "Analyze usage patterns",
    ],
  },
  {
    number: "04",
    title: "Sharing of Information",
    paragraphs: [
      "We do not sell your data.",
      "We may share data with:",
      "All third parties are required to protect your data.",
    ],
    bullets: [
      "Payment processors, including Stripe",
      "Hosting providers",
      "Analytics tools",
    ],
  },
  {
    number: "05",
    title: "Data Retention",
    paragraphs: [
      "We retain your information as long as necessary to provide the Service and comply with legal obligations.",
      "You may request deletion at any time.",
    ],
  },
  {
    number: "06",
    title: "Cookies & Tracking",
    paragraphs: [
      "We use cookies to:",
      "You can control cookies via your browser settings.",
    ],
    bullets: [
      "Improve user experience",
      "Analyze traffic",
      "Enable core functionality",
    ],
  },
  {
    number: "07",
    title: "Data Security",
    paragraphs: [
      "We implement reasonable security measures to protect your data, but no system is 100% secure.",
    ],
  },
  {
    number: "08",
    title: "Your Rights",
    paragraphs: [
      "If you are subject to California privacy rights or GDPR-style protections, you may have the right to:",
      "To exercise your rights, contact us.",
    ],
    bullets: [
      "Access your data",
      "Correct inaccurate data",
      "Request deletion",
      "Opt out of certain processing",
    ],
  },
  {
    number: "09",
    title: "Children's Privacy",
    paragraphs: [
      "Our Service is not intended for children under 13. We do not knowingly collect data from children.",
    ],
  },
  {
    number: "10",
    title: "International Users",
    paragraphs: [
      "If you access Packwell from outside the United States, your data may be transferred to and processed in the United States.",
    ],
  },
  {
    number: "11",
    title: "Changes to Privacy Policy",
    paragraphs: [
      "We may update this policy periodically. Updates will be posted on this page.",
    ],
  },
  {
    number: "12",
    title: "Contact",
    paragraphs: [
      "For questions about this Privacy Policy, contact hello@packwell.io.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy | Packwell",
  description: "Read how Packwell collects, uses, and protects information across the platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <ScrollReveal>
      <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
        <nav className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link aria-label="Go to Packwell homepage" href="/">
              <PackwellLogo className="h-8 w-auto text-slate-900" />
            </Link>
            <div className="hidden items-center gap-8 text-sm font-medium tracking-tight md:flex">
              <Link
                href="/"
                className="text-slate-600 transition-colors hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-slate-600 transition-colors hover:text-blue-600"
              >
                Pricing
              </Link>
              <Link
                href="/privacy-policy"
                className="font-semibold text-blue-600 transition-colors"
              >
                Privacy
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
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary transition-all duration-200 ease-in-out hover:bg-primary-container"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <main>
          <section className="relative overflow-hidden px-6 pb-16 pt-32 md:pt-44">
            <div className="absolute inset-x-0 top-12 -z-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(0,75,195,0.16),_transparent_60%)]" />
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end">
              <div className="relative lg:col-span-7" data-reveal="left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-on-primary-fixed-variant">
                  Privacy
                </div>
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-on-background md:text-7xl md:leading-[1.05]">
                  Privacy
                  <span className="block text-primary">Policy</span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-on-surface-variant md:text-xl">
                  This policy explains what Packwell collects, how that data is
                  used, and the choices available to customers using the
                  platform.
                </p>
              </div>

              <div className="relative lg:col-span-5" data-reveal="right">
                <div className="rounded-2xl bg-inverse-surface p-8 text-inverse-on-surface shadow-[0_20px_40px_rgba(25,28,29,0.08)]">
                  <div className="mb-6 flex items-start justify-between gap-6">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-secondary-fixed">
                        Last Updated
                      </p>
                      <p className="text-2xl font-bold">March 29, 2026</p>
                    </div>
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-sm font-bold text-on-secondary-container">
                      Active
                    </span>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-inverse-on-surface/80">
                    <p>Applies to all Packwell accounts, site visits, and product usage.</p>
                    <p>Privacy requests can be sent to hello@packwell.io.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 pb-24 md:pb-32">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
              {privacySections.map((section, index) => (
                <article
                  key={section.number}
                  className={`rounded-2xl border border-black/5 p-8 shadow-sm ${
                    index % 3 === 0
                      ? "bg-surface-container-lowest"
                      : index % 3 === 1
                        ? "bg-surface-container-low"
                        : "bg-white"
                  }`}
                  data-reveal={index % 2 === 0 ? "left" : "right"}
                >
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                      {section.number}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4 text-base leading-7 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets ? (
                    <ul className="mt-5 space-y-3 text-base leading-7 text-slate-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="w-full bg-slate-50 pb-10 pt-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-4">
            <div className="col-span-1" data-reveal="up">
              <div className="mb-6">
                <PackwellLogo className="h-7 w-auto text-slate-900" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                Advanced packing intelligence for modern fulfillment. Engineering
                the air out of the global supply chain.
              </p>
            </div>
            <div className="col-span-1" data-reveal="up">
              <h5 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                Product
              </h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-slate-500 transition-all duration-300 hover:text-slate-900"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-500 transition-all duration-300 hover:text-slate-900"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-1" data-reveal="up">
              <h5 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                Legal
              </h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-slate-500 transition-all duration-300 hover:text-slate-900"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-slate-500 transition-all duration-300 hover:text-slate-900"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-1" data-reveal="up">
              <h5 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
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
              </ul>
            </div>
          </div>
          <div
            className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200 px-8 pt-8 text-xs text-slate-400 md:flex-row"
            data-reveal="up"
          >
            <p>&copy; 2026 Packwell Inc. All rights reserved.</p>
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
    </ScrollReveal>
  );
}

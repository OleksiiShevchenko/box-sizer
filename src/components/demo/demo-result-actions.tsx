"use client";

import Link from "next/link";
import { DemoBookingButton } from "@/components/marketing/demo-booking-button";
import type { DemoScenario } from "@/lib/demo-scenarios";

interface DemoResultActionsProps {
  scenario: DemoScenario;
  onSignupClick: (scenario: DemoScenario) => void;
  onBookDemoClick: (scenario: DemoScenario) => void;
  onStartOver: () => void;
}

export function DemoResultActions({
  scenario,
  onSignupClick,
  onBookDemoClick,
  onStartOver,
}: DemoResultActionsProps) {
  return (
    <div
      className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="demo-result-actions"
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 self-start text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        onClick={onStartOver}
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
          <path
            d="M9 14 4 9m0 0 5-5M4 9h10a6 6 0 1 1 0 12h-1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        Start over
      </button>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <DemoBookingButton
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          onClick={() => onBookDemoClick(scenario)}
        >
          Book a Demo
        </DemoBookingButton>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          onClick={() => onSignupClick(scenario)}
        >
          Start Free
        </Link>
      </div>
    </div>
  );
}

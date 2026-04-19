"use client";

interface DemoStepperProps {
  currentStep: 1 | 2 | 3;
  onStepSelect?: (step: 1 | 2 | 3) => void;
}

const STEPS = [
  { id: 1, label: "Select scenario" },
  { id: 2, label: "Edit quantities" },
  { id: 3, label: "View result" },
] as const;

export function DemoStepper({ currentStep, onStepSelect }: DemoStepperProps) {
  return (
    <ol
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm sm:gap-x-4 sm:px-5"
      data-testid="demo-stepper"
    >
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = step.id < currentStep;
        const isHighlighted = isActive || isComplete;
        const [primaryLabel, secondaryLabel] = step.label.split(" ");

        return (
          <li
            key={step.id}
            aria-current={isActive ? "step" : undefined}
            className={`flex items-center ${
              isHighlighted ? "text-blue-700" : "text-slate-500"
            }`}
            data-testid={`demo-step-${step.id}`}
          >
            <span
              className={`mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                isHighlighted
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-500"
              }`}
            >
              {step.id}
            </span>
            {isHighlighted && onStepSelect ? (
              <button
                type="button"
                className="whitespace-nowrap transition-colors hover:text-blue-800"
                onClick={() => onStepSelect(step.id)}
              >
                {primaryLabel}
                {secondaryLabel ? (
                  <span className="ml-1 hidden sm:inline">{secondaryLabel}</span>
                ) : null}
              </button>
            ) : (
              <span className="whitespace-nowrap">
                {primaryLabel}
                {secondaryLabel ? (
                  <span className="ml-1 hidden sm:inline">{secondaryLabel}</span>
                ) : null}
              </span>
            )}
            {index < STEPS.length - 1 ? (
              <svg
                aria-hidden="true"
                className="ml-3 h-5 w-5 shrink-0 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m7 16 4-4-4-4m6 8 4-4-4-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

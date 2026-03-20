"use client";

interface YesNoToggleProps {
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function YesNoToggle({ id, value, onChange }: YesNoToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
      <button
        id={`${id}-yes`}
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          value
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Yes
      </button>
      <button
        id={`${id}-no`}
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          !value
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        No
      </button>
    </div>
  );
}

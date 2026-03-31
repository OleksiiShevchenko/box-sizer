import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, tooltip, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="flex items-center gap-1 text-[13px] font-medium text-slate-800">
            {label}
            {tooltip && (
              <span
                title={tooltip}
                className="inline-flex cursor-help text-slate-400 hover:text-slate-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : "false"}
          className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
            error
              ? "border-red-600 focus:border-red-600 focus:ring-red-600/10"
              : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/15"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

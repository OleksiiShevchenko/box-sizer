interface PackwellLogoProps {
  className?: string;
  title?: string;
}

export function PackwellLogo({
  className = "",
  title = "Packwell",
}: PackwellLogoProps) {
  return (
    <span
      aria-label={title}
      role="img"
      className={`inline-flex h-7 items-center gap-2 text-slate-800 ${className}`}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3 4.5 6.75 12 10.5l7.5-3.75L12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 6.75V15.75L12 19.5L19.5 15.75V6.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 10.5V19.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[16px] leading-none font-bold tracking-[-0.02em] text-slate-800">
        Packwell
      </span>
    </span>
  );
}

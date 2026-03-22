interface PackwellLogoProps {
  className?: string;
  title?: string;
}

export function PackwellLogo({
  className = "h-8 w-auto",
  title = "Packwell",
}: PackwellLogoProps) {
  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox="0 0 316 84"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <text
        x="0"
        y="62"
        fill="currentColor"
        fontFamily="Inter, var(--font-geist-sans), sans-serif"
        fontSize="64"
        fontWeight="800"
        letterSpacing="-2.5"
      >
        Packwell
      </text>
    </svg>
  );
}

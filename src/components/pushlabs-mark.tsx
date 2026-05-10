type Props = {
  className?: string;
  size?: number;
};

/**
 * Pushlabs "PL" monogram — gray P with the inner counter cut out as a neon L.
 * This is the in-app approximation of the brand mark; for the PDF and emails,
 * upload the actual PNG/SVG via the Settings page.
 */
export function PushlabsMark({ className, size = 32 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pushlabs"
    >
      <rect width="64" height="64" rx="10" fill="#0b0b10" />
      {/* P body */}
      <path
        d="M16 12h20a14 14 0 0 1 0 28H24v12h-8V12z"
        fill="#454552"
      />
      {/* L cut-out in neon */}
      <path
        d="M24 22h10v14h10v8H24V22z"
        fill="#caff3d"
      />
    </svg>
  );
}

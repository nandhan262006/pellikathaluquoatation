/**
 * Thin-stroke inline SVG icon set for the quotation document.
 * No emoji; if an icon key is unknown, a restrained dot fallback renders.
 */
import type { SVGProps } from "react";

const PATHS: Record<string, React.ReactNode> = {
  camera: (
    <>
      <path d="M5 8h2.5l1.5-2.5h6L16.5 8H19a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.2" />
      <circle cx="17" cy="10.5" r="0.4" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6.5" width="13" height="11" rx="1.6" />
      <path d="M16 10.5l5-2.5v8l-5-2.5" />
      <path d="M10 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
    </>
  ),
  music: (
    <>
      <path d="M9 17.5V5.8L20 4v12" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  bowl: (
    <>
      <path d="M4 11.5h16a8 8 0 0 1-16 0z" />
      <path d="M12 11.5V8" />
      <path d="M10 5.5c0-1.5.8-2 .8-3M13.5 6c0-1.5.8-2 .8-3" />
      <path d="M2.5 14.5h19" />
    </>
  ),
  bride: (
    <>
      <circle cx="12" cy="7" r="2.8" />
      <path d="M5.5 20c0-3.8 2.9-5.8 6.5-5.8s6.5 2 6.5 5.8" />
      <path d="M9.5 4.8c1.4-1.6 3.6-1.6 5 0" />
      <path d="M7.5 11.5c.8 1.4 2.4 2.2 4.5 2.2s3.7-.8 4.5-2.2" />
    </>
  ),
  groom: (
    <>
      <circle cx="12" cy="7.5" r="2.8" />
      <path d="M5.5 20c0-3.8 2.9-5.8 6.5-5.8s6.5 2 6.5 5.8" />
      <path d="M8.2 6.2c.4-2.6 7.2-2.6 7.6 0" />
      <path d="M9 5.5h6" />
    </>
  ),
  henna: (
    <>
      <path d="M7.5 21v-9.5" />
      <path d="M7.5 11.5V6a1.4 1.4 0 0 1 2.8 0v5.5" />
      <path d="M10.3 11V5a1.4 1.4 0 0 1 2.8 0v6" />
      <path d="M13.1 11V6a1.4 1.4 0 0 1 2.8 0v7.5" />
      <path d="M15.9 13.5V9.8a1.4 1.4 0 0 1 2.8 0v3.2a8 8 0 0 1-2.3 5.6L15.9 21h-8.4" />
    </>
  ),
  rings: (
    <>
      <circle cx="9.2" cy="14.5" r="4.7" />
      <circle cx="14.8" cy="14.5" r="4.7" />
      <path d="M12 5.5l1.6 2h-3.2l1.6-2z" />
    </>
  ),
  plane: (
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="1.8" />
      <path d="M2.5 9.8h19" />
      <path d="M6 15h4" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5 5 19" />
      <circle cx="6.8" cy="6.8" r="2.3" />
      <circle cx="17.2" cy="17.2" r="2.3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="1.8" />
      <path d="M8 2.8V7M16 2.8V7M3.5 10.5h17" />
    </>
  ),
  close: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </>
  ),
  drone: (
    <>
      <circle cx="5.2" cy="5.2" r="2.2" />
      <circle cx="18.8" cy="5.2" r="2.2" />
      <circle cx="5.2" cy="18.8" r="2.2" />
      <circle cx="18.8" cy="18.8" r="2.2" />
      <path d="M6.8 6.8l3.4 3.4M17.2 6.8l-3.4 3.4M6.8 17.2l3.4-3.4M17.2 17.2l-3.4-3.4" />
      <rect x="10.2" y="10.2" width="3.6" height="3.6" rx="1" />
    </>
  ),
  phone: (
    <path d="M21.5 16.7v2.8a1.9 1.9 0 0 1-2.1 1.9 19 19 0 0 1-8.3-3 18.6 18.6 0 0 1-5.7-5.7 19 19 0 0 1-3-8.4 1.9 1.9 0 0 1 1.9-2.1h2.8a1.9 1.9 0 0 1 1.9 1.6c.1.9.3 1.9.6 2.8a1.9 1.9 0 0 1-.4 2L8 8a15.2 15.2 0 0 0 5.7 5.7l1.3-1.3a1.9 1.9 0 0 1 2-.4c.9.3 1.9.5 2.8.6a1.9 1.9 0 0 1 1.7 2z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.8" />
      <path d="m21.5 7.5-9.5 6-9.5-6" />
    </>
  ),
  pin: (
    <>
      <path d="M19.5 10c0 5.7-7.5 11.5-7.5 11.5S4.5 15.7 4.5 10a7.5 7.5 0 0 1 15 0z" />
      <circle cx="12" cy="10" r="2.8" />
    </>
  ),
  stream: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="1.8" />
      <path d="M8 21h8M12 17v4" />
      <path d="M10 8.2l4 2.3-4 2.3v-4.6z" />
    </>
  ),
  album: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2.5H20V22H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2.5z" />
      <path d="M9 7h7" />
    </>
  ),
  screen: (
    <>
      <rect x="2.5" y="3.5" width="19" height="13" rx="1.8" />
      <path d="M8 21h8M12 16.5V21" />
      <path d="M6.5 7.5h11M6.5 10.5h7" />
    </>
  ),
  couple: (
    <>
      <circle cx="8.5" cy="7" r="2.6" />
      <circle cx="15.5" cy="7" r="2.6" />
      <path d="M3.5 20.5c0-3.6 2.1-5.6 5-5.6 1.5 0 2.8.5 3.7 1.5" />
      <path d="M11.8 16.4c.9-1 2.2-1.5 3.7-1.5 2.9 0 5 2 5 5.6" />
    </>
  ),
  social: (
    <>
      <path d="M20.5 11.3a8.2 8.2 0 0 1-8.2 8.2 8 8 0 0 1-4.1-1.1L3.5 19.7l1.3-4.6a8.2 8.2 0 1 1 15.7-3.8z" />
      <path d="M8.5 11h7M8.5 13.8h4.5" />
    </>
  ),
};

const FALLBACK = (
  <>
    <circle cx="12" cy="12" r="2" />
  </>
);

export type QuoteIconName = keyof typeof PATHS;

interface QuoteIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export function QuoteIcon({ name, size = 18, ...rest }: QuoteIconProps) {
  const body = PATHS[name] ?? FALLBACK;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {body}
    </svg>
  );
}

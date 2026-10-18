/**
 * A4 page shell + shared ornaments for the quotation document.
 */
import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";

/** Knot watermark rendered behind the content of every page. */
function KnotWatermark() {
  return (
    <Image
      src="/knot-watermark.webp"
      alt=""
      width={700}
      height={700}
      aria-hidden
      className="q-watermark"
    />
  );
}

/** Small kalash ornament used in the footer of every page. */
export function Kalash({ height = 26 }: { height?: number }) {
  return (
    <Image
      src="/kalash.webp"
      alt=""
      width={594}
      height={600}
      aria-hidden
      style={{ height, width: "auto", display: "inline-block", color: "var(--gold)" }}
    />
  );
}

/** Small gold lotus glyph used in footers and dividers. */
export function Lotus({ size = 14, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      <path d="M12 4.5c1.8 2.5 2.7 5 2.7 7.3a2.7 2.7 0 0 1-5.4 0c0-2.3.9-4.8 2.7-7.3z" />
      <path d="M8.3 8.1c-.2 2.9.6 5.2 2.2 6.8-2.6-.2-4.6-1.7-5.4-4 .9-.9 2-1.7 3.2-2.8z" />
      <path d="M15.7 8.1c.2 2.9-.6 5.2-2.2 6.8 2.6-.2 4.6-1.7 5.4-4-.9-.9-2-1.7-3.2-2.8z" />
      <path d="M4.5 13.5c2.2 3.2 4.7 4.7 7.5 4.7s5.3-1.5 7.5-4.7" />
      <path d="M12 18.2v2" />
    </svg>
  );
}

/** Horizontal ornament: line — diamond — line. */
export function OrnamentDivider({ width = 180 }: { width?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gold)", width, justifyContent: "center" }}>
      <span style={{ height: 1, background: "var(--line)", flex: 1 }} />
      <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
        <path d="M12 2l2.5 10L12 22l-2.5-10L12 2z" />
      </svg>
      <span style={{ height: 1, background: "var(--line)", flex: 1 }} />
    </div>
  );
}

interface QuotePageProps {
  /** Zero-based page index; rendered as 01, 02, … */
  number: number;
  /** Uppercase section label shown upper-right. */
  label: string;
  /** Footer style; default is the studio lotus footer. */
  footer?: ReactNode;
  /** Skip the default content zone wrapper (for free-form pages like the cover). */
  bare?: boolean;
  /** Render the knot watermark (default true; cover opts out). */
  watermark?: boolean;
  /**
   * Bottom edge (px) of the content zone. Raise it to reserve space for
   * corner artwork so growing content never flows over the illustration.
   */
  bodyBottom?: number;
  /**
   * Corner artwork rendered as a direct child of the page (outside the
   * clipped content zone), positioned absolute against the page itself.
   */
  art?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function QuotePage({
  number,
  label,
  footer,
  bare,
  watermark = true,
  bodyBottom,
  art,
  children,
  className,
}: QuotePageProps) {
  const num = String(number + 1).padStart(2, "0");
  return (
    <div className={`qpage ${className ?? ""}`}>
      {watermark && <KnotWatermark />}
      {art}
      <div className="qframe" />
      <header className="qhead">
        <span className="qnum">{num}</span>
        <span className="qlabel">{label}</span>
      </header>
      {bare ? (
        children
      ) : (
        <div className="qbody" style={bodyBottom !== undefined ? { bottom: bodyBottom } : undefined}>
          {children}
        </div>
      )}
      <footer className="qfoot">
        {footer ?? (
          <>
            <span>Pelli Kathalu</span>
            <span className="qfoot-lotus">
              <Kalash height={26} />
            </span>
            <span>Prem &amp; Pavan</span>
          </>
        )}
      </footer>
    </div>
  );
}

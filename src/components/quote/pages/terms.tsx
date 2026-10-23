import Image from "next/image";
import { QuoteIcon } from "../icons";
import { QuotePage } from "../page-shell";
import type { QuoteTerm } from "@/lib/quote/types";

export function TermsPage({
  number,
  terms,
  continued = false,
}: {
  number: number;
  terms: QuoteTerm[];
  continued?: boolean;
}) {
  return (
    <QuotePage
      number={number}
      label="Terms & Conditions"
      bodyBottom={280}
      art={
        /* Couple illustration in the bottom-right corner */
        <Image
          unoptimized
          src="/quote-art/7thpage.png"
          alt=""
          width={640}
          height={427}
          style={{
            position: "absolute",
            right: 0,
            bottom: 40,
            width: 320,
            height: "auto",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      }
    >
      <div style={{ padding: continued ? "2px 18px 0" : "4px 18px 0", position: "relative", zIndex: 2 }}>
        {continued && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ height: 1, background: "var(--line)", width: 60 }} />
            <span className="q-smallcaps" style={{ fontSize: 9.5 }}>
              Terms &amp; Conditions — Continued
            </span>
            <span style={{ height: 1, background: "var(--line)", width: 60 }} />
          </div>
        )}
        {terms.map((term, i) => (
          <div
            key={term.id}
            className="q-term-row"
            style={{ borderBottom: i < terms.length - 1 ? "1px solid var(--line-fine)" : "none" }}
          >
            <span className="q-term-icon">
              <QuoteIcon name={term.icon} size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}
              >
                {term.title}
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.65, marginTop: 5, color: "var(--ink-soft)" }}>
                {term.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </QuotePage>
  );
}

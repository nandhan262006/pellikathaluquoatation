import Image from "next/image";
import { QuoteIcon } from "../icons";
import { QuotePage } from "../page-shell";
import type { QuotationData } from "@/lib/quote/types";

export function TermsPage({ data, number }: { data: QuotationData; number: number }) {
  return (
    <QuotePage
      number={number}
      label="Terms & Conditions"
      bodyBottom={280}
      art={
        /* Couple illustration in the bottom-right corner */
        <Image
          src="/7THPAGE.webp"
          alt=""
          width={1536}
          height={1024}
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
      <div style={{ padding: "4px 18px 0", position: "relative", zIndex: 2 }}>
        {data.terms.map((term, i) => (
          <div
            key={term.id}
            className="q-term-row"
            style={{ borderBottom: i < data.terms.length - 1 ? "1px solid var(--line-fine)" : "none" }}
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

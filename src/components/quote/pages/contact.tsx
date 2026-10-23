import Image from "next/image";
import { QuoteIcon, QuoteIcon as Icon } from "../icons";
import { QuotePage, OrnamentDivider } from "../page-shell";
import type { QuotationData } from "@/lib/quote/types";

export function ContactPage({ data, number }: { data: QuotationData; number: number }) {
  return (
    <QuotePage
      number={number}
      label="Get In Touch"
      bodyBottom={275}
      art={
        <>
          {/* Top gold arch */}
          <Image
          unoptimized
            src="/quote-art/borderlastpage.png"
            alt=""
            width={1120}
            height={747}
            style={{
              position: "absolute",
              top: 26,
              left: "50%",
              transform: "translateX(-50%)",
              width: 560,
              height: "auto",
              objectFit: "contain",
              zIndex: 1,
            }}
          />
          {/* Festive elephant walking in from the bottom-left */}
          <Image
          unoptimized
            src="/quote-art/elephant.png"
            alt=""
            width={520}
            height={410}
            style={{
              position: "absolute",
              left: 26,
              bottom: 54,
              width: 260,
              height: "auto",
              objectFit: "contain",
              zIndex: 2,
            }}
          />
        </>
      }
      footer={
        <>
          <span>People</span>
          <span style={{ color: "var(--gold)" }}>|</span>
          <span>Rituals</span>
          <span style={{ color: "var(--gold)" }}>|</span>
          <span>Relationships</span>
          <span style={{ color: "var(--gold)" }}>|</span>
          <span>Timeless Stories</span>
        </>
      }
      >
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 22px" }}>
        <h1
          className="qserif"
          style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.15, marginTop: 235 }}
        >
          Let&apos;s Create
          <br />
          Timeless
          <br />
          Stories
          <br />
          <span className="q-italic">Together</span>
        </h1>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <OrnamentDivider width={160} />
        </div>

        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <div className="q-contact-row">
            <span className="q-contact-icon">
              <QuoteIcon name="phone" size={13} />
            </span>
            <span style={{ fontSize: 12 }}>{data.contactPhone}</span>
          </div>
          <div className="q-contact-row">
            <span className="q-contact-icon">
              <Icon name="mail" size={13} />
            </span>
            <span style={{ fontSize: 12 }}>{data.contactEmail}</span>
          </div>
          <div className="q-contact-row">
            <span className="q-contact-icon">
              <Icon name="pin" size={13} />
            </span>
            <span style={{ fontSize: 11.5, letterSpacing: 1.5 }}>{data.contactStudio}</span>
          </div>
        </div>
      </div>
    </QuotePage>
  );
}

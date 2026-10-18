import Image from "next/image";
import { QuoteIcon } from "../icons";
import { QuotePage } from "../page-shell";
import type { QuotationData } from "@/lib/quote/types";

export function DeliverablesPage({ data, number }: { data: QuotationData; number: number }) {
  return (
    <QuotePage
      number={number}
      label="Deliverables"
      bodyBottom={336}
      art={
        /* Shehnai players in the bottom-right corner */
        <Image
          src="/sanai.png"
          alt=""
          width={1024}
          height={1536}
          style={{
            position: "absolute",
            right: 20,
            bottom: 24,
            width: 200,
            height: "auto",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      }
    >
      <div style={{ position: "relative", zIndex: 2, padding: "6px 18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 className="q-h1">
            Moments
            <br />
            to <span className="q-italic">Relive</span>
          </h1>
          <div style={{ textAlign: "right", paddingTop: 10 }}>
            {data.deliverablesSideText.map((w) => (
              <div key={w} className="q-smallcaps" style={{ lineHeight: 1.75 }}>
                {w}
              </div>
            ))}
          </div>
        </div>

        {/* Photos / Videos columns */}
        <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
          <div style={{ flex: 1 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                border: "1px solid var(--line)",
                borderRadius: 9,
                color: "var(--ink)",
                background: "rgba(255,255,255,0.35)",
              }}
            >
              <QuoteIcon name="camera" size={22} />
            </span>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2.5,
                marginTop: 14,
                textTransform: "uppercase",
              }}
            >
              {data.photosTitle}
            </div>
            <div
              className="q-smallcaps"
              style={{ marginTop: 6, fontWeight: 600, color: "var(--ink)", fontSize: 11 }}
            >
              {data.photosApprox}
            </div>
            <div
              className="q-smallcaps"
              style={{ marginTop: 3, fontWeight: 600, color: "var(--ink)", fontSize: 11 }}
            >
              Edited high resolution images.
            </div>
            <p style={{ fontSize: 11.5, lineHeight: 1.7, marginTop: 14, color: "var(--ink-soft)" }}>
              {data.photosBody}
            </p>
          </div>

          <div style={{ width: 1, background: "var(--line-fine)", alignSelf: "stretch" }} />

          <div style={{ flex: 1 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                border: "1px solid var(--line)",
                borderRadius: 9,
                color: "var(--ink)",
                background: "rgba(255,255,255,0.35)",
              }}
            >
              <QuoteIcon name="video" size={22} />
            </span>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2.5,
                marginTop: 14,
                textTransform: "uppercase",
              }}
            >
              {data.videosTitle}
            </div>
            <div
              className="q-smallcaps"
              style={{ marginTop: 6, fontWeight: 600, color: "var(--ink)", fontSize: 11, whiteSpace: "pre-line" }}
            >
              {data.videosApprox}
            </div>
            <p style={{ fontSize: 11.5, lineHeight: 1.7, marginTop: 14, color: "var(--ink-soft)" }}>
              {data.videosBody}
            </p>
          </div>
        </div>

        {/* CHARGES */}
        <div style={{ textAlign: "center", marginTop: 30, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
            <span style={{ height: 1, background: "var(--line)", width: 110 }} />
            <span className="q-smallcaps" style={{ color: "var(--gold)", fontWeight: 600 }}>
              Charges
            </span>
            <span style={{ height: 1, background: "var(--line)", width: 110 }} />
          </div>
        </div>

        <div className="q-charge-box">
          {data.charges.map((c) => (
            <div key={c.id} className="q-charge-row">
              <span style={{ fontSize: 11.5, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>
                {c.label}
              </span>
              <span className="qserif" style={{ fontSize: 20, fontWeight: 600 }}>
                {c.amount}
              </span>
            </div>
          ))}
          <div className="q-total-row" style={{ flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: 2 }}>TOTAL</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.85, marginTop: 3 }}>
                ({data.totalWords})
              </div>
            </div>
            <span className="qserif" style={{ fontSize: 21, fontWeight: 600 }}>
              {data.total}
            </span>
          </div>
        </div>

        <p className="q-smallcaps" style={{ marginTop: 14, textAlign: "center", fontSize: 9.5 }}>
          {data.exclusionsNote}
        </p>
      </div>
    </QuotePage>
  );
}

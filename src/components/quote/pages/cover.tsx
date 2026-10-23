import Image from "next/image";
import { Lotus, QuotePage } from "../page-shell";

interface CoverProps {
  data: import("@/lib/quote/types").QuotationData;
  number: number;
}

export function CoverPage({ data, number }: CoverProps) {
  return (
    <QuotePage number={number} label="Quotation" footer={<></>} bare watermark={false}>
      {/* Full-page arch + bottom lotus (floral-free variant) */}
      <Image
          unoptimized
        src="/quote-art/borderfirst.png"
        alt=""
        width={1024}
        height={1536}
        priority
        style={{
          position: "absolute",
          inset: "8px 10px",
          width: "calc(100% - 20px)",
          height: "calc(100% - 16px)",
          objectFit: "contain",
          zIndex: 1,
        }}
      />

      {/* Forest green circle panel */}
      <div
        className="q-cover-circle"
        style={{
          position: "absolute",
          top: 190,
          left: "50%",
          transform: "translateX(-50%)",
          width: 380,
          height: 380,
          zIndex: 2,
          gap: 4,
        }}
      >
        <span
          className="qserif"
          style={{ fontStyle: "italic", fontSize: 19, color: "#DCC9A6" }}
        >
          weddings by
        </span>
        <span
          className="qserif"
          style={{ fontSize: 46, fontWeight: 500, lineHeight: 1.05, color: "#F3ECDD" }}
        >
          Pelli Kathalu
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: 150,
            marginTop: 12,
            color: "#DCC9A6",
          }}
        >
          <span style={{ height: 1, background: "rgba(243,236,221,0.35)", flex: 1 }} />
          <Lotus size={13} />
          <span style={{ height: 1, background: "rgba(243,236,221,0.35)", flex: 1 }} />
        </span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginTop: 10,
            color: "#F3ECDD",
          }}
        >
          Prem &amp; Pavan
        </span>
        {data.clientName && (
          <span
            style={{
              fontSize: 8.5,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginTop: 18,
              color: "#C9B896",
            }}
          >
            Prepared for {data.clientName}
          </span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <div
          className="qserif"
          style={{
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: 9,
            lineHeight: 1.5,
            color: "var(--ink)",
          }}
        >
          WEDDING
          <br />
          PHOTOGRAPHY
          <br />
          QUOTATION
        </div>
      </div>

      {/* Lower-left word stack */}
      <div style={{ position: "absolute", left: 62, bottom: 108, zIndex: 2 }}>
        {["People", "Emotions", "Rituals", "Timeless", "Stories"].map((w) => (
          <div key={w} className="q-smallcaps" style={{ lineHeight: 1.9 }}>
            {w}
          </div>
        ))}
      </div>

      {/* Lower-right word stack */}
      <div
        style={{
          position: "absolute",
          right: 62,
          bottom: 108,
          zIndex: 2,
          textAlign: "right",
        }}
      >
        {["More", "than", "Photos"].map((w) => (
          <div key={w} className="q-smallcaps" style={{ lineHeight: 1.9 }}>
            {w}
          </div>
        ))}
        <div className="q-smallcaps" style={{ lineHeight: 1.9, marginTop: 6 }}>
          A Legacy
        </div>
        <div className="q-smallcaps" style={{ lineHeight: 1.9 }}>
          of Love
        </div>
      </div>
    </QuotePage>
  );
}

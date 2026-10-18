import Image from "next/image";
import { QuotePage, OrnamentDivider } from "../page-shell";
import type { QuotationData } from "@/lib/quote/types";

export function AboutPage({ data, number }: { data: QuotationData; number: number }) {
  return (
    <QuotePage
      number={number}
      label="About Us"
      bodyBottom={320}
      art={
        <>
          {/* Right-side gold arch */}
          <Image
            src="/borderlastpage.png"
            alt=""
            width={1536}
            height={1024}
            style={{
              position: "absolute",
              right: -20,
              top: 40,
              width: 490,
              height: "auto",
              objectFit: "contain",
              opacity: 0.8,
              zIndex: 1,
            }}
          />

          {/* Heritage couple illustration under the arch */}
          <Image
            src="/couple.png"
            alt=""
            width={941}
            height={597}
            style={{
              position: "absolute",
              right: 40,
              bottom: 90,
              width: 360,
              height: "auto",
              objectFit: "contain",
              zIndex: 1,
            }}
          />
        </>
      }
    >

      <div style={{ position: "relative", zIndex: 2, maxWidth: 430 }}>
        <h1 className="q-h1" style={{ marginTop: 24, fontSize: 54 }}>
          {data.aboutHeading[0]}
          <br />
          <span style={{ fontWeight: 600, fontStyle: "italic" }}>{data.aboutHeading[1]}</span>
        </h1>

        <div style={{ margin: "30px 0 34px" }}>
          <OrnamentDivider width={170} />
        </div>

        {data.aboutParagraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 13.5, lineHeight: 1.85, marginBottom: 20, color: "var(--ink)" }}>
            {p}
          </p>
        ))}
      </div>
    </QuotePage>
  );
}

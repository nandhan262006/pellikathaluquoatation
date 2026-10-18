import Image from "next/image";
import { QuoteIcon } from "../icons";
import { QuotePage } from "../page-shell";
import type { QuotationData } from "@/lib/quote/types";

export function TimelinePage({ data, number }: { data: QuotationData; number: number }) {
  return (
    <QuotePage
      number={number}
      label="Delivery Timeline"
      bodyBottom={240}
      art={
        /* Wedding scene illustration along the bottom-right of the page */
        <Image
          src="/lastpage.webp"
          alt=""
          width={1536}
          height={1024}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 340,
            height: "auto",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      }
    >
      <div style={{ position: "relative", zIndex: 2, padding: "6px 18px 0" }}>
        <h1 className="q-h1">
          From Our Lens
          <br />
          to Your <span className="q-italic">Legacy</span>
        </h1>

        <table className="qtable" style={{ tableLayout: "fixed", marginTop: 30 }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "36%" }} />
            <col style={{ width: "24%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Output</th>
              <th>Timeline</th>
              <th>Revisions</th>
            </tr>
          </thead>
          <tbody>
            {data.timeline.map((row, i) => (
              <tr key={row.id} className={i % 2 === 1 ? "qrow-alt" : ""}>
                <td>
                  <span style={{ fontWeight: 600, letterSpacing: 1.5, fontSize: 11, textTransform: "uppercase" }}>
                    {row.output}
                  </span>
                  {row.outputDetail && (
                    <span style={{ display: "block", fontSize: 10, color: "var(--ink-soft)", marginTop: 2 }}>
                      {row.outputDetail}
                    </span>
                  )}
                </td>
                <td style={{ fontSize: 11.5 }}>{row.time}</td>
                <td style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{row.revisions}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="q-info-panel" style={{ marginTop: 26, maxWidth: 430 }}>
          <span className="qtable-icon" style={{ color: "var(--gold)" }}>
            <QuoteIcon name="calendar" size={20} />
          </span>
          <p style={{ fontSize: 11, lineHeight: 1.6, color: "var(--ink)" }}>{data.timelineNote}</p>
        </div>
      </div>
    </QuotePage>
  );
}

import Image from "next/image";
import { QuoteIcon } from "../icons";
import { QuotePage } from "../page-shell";
import type { QuotationData } from "@/lib/quote/types";

export function PlanPage({ data, number }: { data: QuotationData; number: number }) {
  return (
    <QuotePage
      number={number}
      label="Our Plan"
      bodyBottom={282}
      art={
        /* Festive drums in the bottom-right corner */
        <Image
          src="/drums.webp"
          alt=""
          width={761}
          height={800}
          style={{
            position: "absolute",
            right: 26,
            bottom: 62,
            width: 200,
            height: "auto",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      }
    >
      <div style={{ padding: "14px 18px 0" }}>
        <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, lineHeight: 1.2 }}>
          {data.greetingLabel}
        </p>
        <p className="q-italic" style={{ fontSize: 34, marginTop: 2 }}>
          {data.greetingName},
        </p>

        <p style={{ fontSize: 12.5, lineHeight: 1.75, marginTop: 18, maxWidth: 520, color: "var(--ink)" }}>
          {data.planIntro}
        </p>

        {/* THE TEAM */}
        <div style={{ textAlign: "center", marginTop: 38, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
            <span style={{ height: 1, background: "var(--line)", width: 70 }} />
            <span
              className="qserif"
              style={{ fontSize: 19, letterSpacing: 7, fontWeight: 500, color: "var(--ink)" }}
            >
              THE TEAM
            </span>
            <span style={{ height: 1, background: "var(--line)", width: 70 }} />
          </div>
          <div className="q-smallcaps" style={{ marginTop: 8, fontSize: 8.5 }}>
            {data.teamSubline}
          </div>
        </div>

        {/* Event schedule table */}
        <table className="qtable" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "42%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "40%" }} />
          </colgroup>
          <tbody>
            {data.events.map((ev, i) => (
              <tr key={ev.id} className={i % 2 === 1 ? "qrow-alt" : ""}>
                <td style={{ borderLeft: "none" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="qtable-icon">
                      <QuoteIcon name={ev.icon} size={17} />
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        letterSpacing: 1.5,
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {ev.name}
                    </span>
                  </span>
                </td>
                <td style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{ev.date || "—"}</td>
                <td style={{ borderRight: "none", fontSize: 11.5 }}>{ev.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QuotePage>
  );
}

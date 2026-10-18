import Image from "next/image";
import { QuoteIcon } from "../icons";
import { QuotePage } from "../page-shell";
import type { QuotationData, QuoteService } from "@/lib/quote/types";
import type { AddonDensity } from "@/lib/quote/paginate";

export function AddonsPage({
  data,
  number,
  services,
  density,
  continued,
}: {
  data: QuotationData;
  number: number;
  services: QuoteService[];
  density: AddonDensity;
  continued: boolean;
}) {
  const tableClass =
    density === "compact" ? "qtable qtable--compact" : density === "tight" ? "qtable qtable--tight" : "qtable";

  return (
    <QuotePage
      number={number}
      label="Add Ons"
      art={
        /* Saptapadi artwork anchored in the bottom-right of every add-on page */
        <Image
          src="/7steps.png"
          alt=""
          width={731}
          height={732}
          style={{
            position: "absolute",
            right: 24,
            bottom: 60,
            width: 200,
            height: "auto",
            objectFit: "contain",
            zIndex: 1,
          }}
        />
      }
    >
      <div style={{ position: "relative", zIndex: 2, padding: continued ? "2px 18px 0" : "6px 18px 0" }}>
        <h1 className="q-h1" style={{ fontSize: continued ? 34 : 46 }}>
          Enhance
          <br />
          Your <span className="q-italic">Story</span>
          {continued && (
            <span className="q-smallcaps" style={{ fontSize: 9, marginLeft: 14, letterSpacing: 2 }}>
              — Continued
            </span>
          )}
        </h1>

        {!continued && (
          <p className="q-smallcaps" style={{ marginTop: 12, fontSize: 9.5 }}>
            {data.addonsIntro}
          </p>
        )}

        <table className={tableClass} style={{ tableLayout: "fixed", marginTop: 26 }}>
          <colgroup>
            <col style={{ width: "54%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
              <th>Included</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.id} className={i % 2 === 1 ? "qrow-alt" : ""}>
                <td>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="qtable-icon">
                      <QuoteIcon name={s.icon} size={16} />
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        letterSpacing: 1.5,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        lineHeight: 1.4,
                      }}
                    >
                      {s.name}
                      {s.unit && density !== "roomy" && (
                        <span style={{ display: "block", fontWeight: 400, letterSpacing: 0.5, textTransform: "none", fontSize: 9.5, color: "var(--ink-soft)" }}>
                          {s.unit}
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <td style={{ fontSize: 11 }}>
                  {s.price}
                  {s.unit && density === "roomy" && (
                    <span style={{ display: "block", fontSize: 9.5, color: "var(--ink-soft)", marginTop: 2 }}>
                      ({s.unit})
                    </span>
                  )}
                </td>
                <td style={{ fontSize: 11, color: s.included ? "var(--forest)" : "var(--ink-soft)", fontWeight: s.included ? 700 : 500 }}>
                  {s.included ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QuotePage>
  );
}

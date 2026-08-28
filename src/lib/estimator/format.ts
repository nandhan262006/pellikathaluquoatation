import type { Market } from "./types";

export const MARKET_LABELS: Record<Market, string> = {
  IN: "India",
  US: "United States",
};

export const COUNTRY_CODES: Record<Market, string> = {
  IN: "+91",
  US: "+1",
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
});

function currencyFormatter(market: Market): Intl.NumberFormat {
  return market === "US" ? usdFormatter : inrFormatter;
}

/** Currency-symbol format: ₹1,23,000 (IN) or $1,500 (US). */
export function formatMoney(amount: number, market: Market): string {
  return currencyFormatter(market).format(Math.round(amount));
}

/** Plain "Rs." / "$" format used in the PDF and long-form views. */
export function formatMoneyPlain(amount: number, market: Market): string {
  const n = Math.round(amount);
  if (market === "US") {
    return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;
  }
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  return `Rs. ${formatted}`;
}

/** Compact format for tight UI: ₹1.2L / $1.2k. */
export function formatMoneyCompact(amount: number, market: Market): string {
  const n = Math.round(amount);
  if (market === "US") {
    if (n < 1000) return `$${n}`;
    const k = n / 1000;
    const text = k.toFixed(1).replace(/\.0$/, "");
    return `$${text}k`;
  }
  return formatINRCompact(n);
}

export function formatINR(amount: number): string {
  return inrFormatter.format(Math.round(amount));
}

export function formatINRPlain(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount));
  return `Rs. ${formatted}`;
}

export function formatINRCompact(amount: number): string {
  const n = Math.round(amount);
  if (n < 1000) return `\u20b9${n}`;
  if (n < 100000) return `\u20b9${Math.round(n / 1000)}k`;
  if (n < 10000000) {
    const lakhs = n / 100000;
    const text = lakhs.toFixed(1).replace(/\.0$/, "");
    return `\u20b9${text}L`;
  }
  const crores = n / 10000000;
  const text = crores.toFixed(1).replace(/\.0$/, "");
  return `\u20b9${text}Cr`;
}
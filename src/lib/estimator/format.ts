const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
});

/** Country code shown next to client phone numbers. */
export const COUNTRY_CODE = "+91";

/** Currency-symbol format: ₹1,23,000 */
export function formatMoney(amount: number): string {
  return inrFormatter.format(Math.round(amount));
}

/** Plain "Rs." format used in the PDF and long-form views. */
export function formatMoneyPlain(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount));
  return `Rs. ${formatted}`;
}

export function formatINR(amount: number): string {
  return inrFormatter.format(Math.round(amount));
}

export function formatINRPlain(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount));
  return `Rs. ${formatted}`;
}

/** Compact format for tight UI: ₹1.2L */
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

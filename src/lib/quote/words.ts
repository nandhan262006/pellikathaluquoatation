/**
 * Number-to-words in the Indian numbering system, for the TOTAL row
 * (e.g. 525000 -> "FIVE LAKHS TWENTY FIVE THOUSAND ONLY").
 */

const ONES = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
  "SEVENTEEN", "EIGHTEEN", "NINETEEN",
];

const TENS = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  const o = ONES[n % 10];
  return o ? `${t} ${o}` : t;
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${ONES[h]} HUNDRED`);
  if (rest > 0) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/** US/USD amounts use international words (e.g. "FIVE THOUSAND ONLY"). */
export function usdWords(n: number): string {
  if (n === 0) return "ZERO";
  const billion = Math.floor(n / 1_000_000_000);
  const million = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (billion) parts.push(`${threeDigits(billion)} BILLION`);
  if (million) parts.push(`${threeDigits(million)} MILLION`);
  if (thousand) parts.push(`${threeDigits(thousand)} THOUSAND`);
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ");
}

/** INR amounts use the lakh/crore system (e.g. 5,25,000 -> FIVE LAKHS ...). */
export function inrWords(n: number): string {
  if (n === 0) return "ZERO";
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${inrWords(crore)} CRORE${crore > 1 ? "S" : ""}`);
  if (lakh) parts.push(`${twoDigits(lakh)} LAKH${lakh > 1 ? "S" : ""}`);
  if (thousand) parts.push(`${twoDigits(thousand)} THOUSAND`);
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ");
}

export function amountWords(amount: number, market: "IN" | "US"): string {
  const n = Math.round(amount);
  return `${market === "US" ? usdWords(n) : inrWords(n)} ONLY`;
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

/**
 * Minimal root layout for print-only routes rendered by the headless PDF
 * renderer. Loads ONLY the fonts the quotation document uses — no Geist,
 * no Toaster, no app chrome — so the renderer's networkidle0 wait settles
 * as fast as possible.
 *
 * Static (non-variable) woff2 instances via next/font/local: Chromium's PDF
 * engine cannot embed variable fonts (Type 3 fallback renders blurry).
 */
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "../fonts/cormorantgaramond-normal-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/cormorantgaramond-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorantgaramond-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorantgaramond-normal-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cormorantgaramond-normal-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/cormorantgaramond-italic-300.woff2", weight: "300", style: "italic" },
    { path: "../fonts/cormorantgaramond-italic-400.woff2", weight: "400", style: "italic" },
    { path: "../fonts/cormorantgaramond-italic-600.woff2", weight: "600", style: "italic" },
    { path: "../fonts/cormorantgaramond-italic-700.woff2", weight: "700", style: "italic" },
  ],
});

const lora = localFont({
  variable: "--font-lora",
  src: [
    { path: "../fonts/lora-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/lora-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/lora-normal-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/lora-normal-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/lora-italic-400.woff2", weight: "400", style: "italic" },
    { path: "../fonts/lora-italic-600.woff2", weight: "600", style: "italic" },
  ],
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";

/**
 * Static (non-variable) woff2 instances, self-hosted via next/font/local.
 *
 * IMPORTANT: do NOT switch these back to next/font/google. Google serves
 * variable fonts to modern user agents, and Chromium's PDF engine cannot
 * embed variable fonts — it falls back to Type 3 glyph outlines, which
 * render blurry / clipped in most PDF viewers. Static instances embed as
 * CID TrueType and print crisp.
 */
const geistSans = localFont({
  variable: "--font-geist-sans",
  src: [
    { path: "./fonts/geist-normal-400.woff2", weight: "400" },
    { path: "./fonts/geist-normal-500.woff2", weight: "500" },
    { path: "./fonts/geist-normal-600.woff2", weight: "600" },
    { path: "./fonts/geist-normal-700.woff2", weight: "700" },
  ],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [{ path: "./fonts/geistmono-normal-400.woff2", weight: "400" }],
});

const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "./fonts/cormorantgaramond-normal-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/cormorantgaramond-normal-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorantgaramond-normal-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorantgaramond-normal-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorantgaramond-normal-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cormorantgaramond-italic-300.woff2", weight: "300", style: "italic" },
    { path: "./fonts/cormorantgaramond-italic-400.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorantgaramond-italic-600.woff2", weight: "600", style: "italic" },
    { path: "./fonts/cormorantgaramond-italic-700.woff2", weight: "700", style: "italic" },
  ],
});

const lora = localFont({
  variable: "--font-lora",
  src: [
    { path: "./fonts/lora-normal-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/lora-normal-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/lora-normal-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/lora-normal-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/lora-italic-400.woff2", weight: "400", style: "italic" },
    { path: "./fonts/lora-italic-600.woff2", weight: "600", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: "Pellikathalu - Photography Booking",
  description: "Pellikathalu is a premier photography studio in Hyderabad, Telangana. Book professional photography and videography sessions online.",
  metadataBase: new URL("https://www.pellikathalu.co"),
  openGraph: {
    title: "Pellikathalu - Photography Booking",
    description: "Pellikathalu is a premier photography studio in Hyderabad, Telangana. Book professional photography and videography sessions online.",
    siteName: "Pellikathalu",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${lora.variable} h-full antialiased`}
    >
      {/* Fixed viewport height: pages scroll inside overflow-y-auto
          containers (html/body have overflow: hidden in globals.css). */}
      <body className="h-dvh w-full flex flex-col">
        <div className="min-h-0 flex-1 flex flex-col">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

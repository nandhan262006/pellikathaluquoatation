import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen w-full flex flex-col">
        <div className="min-h-0 flex-1 flex flex-col">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

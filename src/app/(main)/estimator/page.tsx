import type { Metadata } from "next";
import { Estimator } from "@/components/estimator/estimator";
import { loadTemplates } from "@/lib/estimator/templates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Cost Estimator | Pellikathalu",
  description:
    "Build your photography and videography package at Pellikathalu, Hyderabad and get an instant rough estimate.",
  openGraph: {
    title: "Event Cost Estimator | Pellikathalu",
    description:
      "Build your photography and videography package at Pellikathalu, Hyderabad and get an instant rough estimate.",
    siteName: "Pellikathalu",
    locale: "en_IN",
    type: "website",
  },
};

export default async function EstimatorPage() {
  const templates = await loadTemplates();
  return <Estimator templates={templates} />;
}

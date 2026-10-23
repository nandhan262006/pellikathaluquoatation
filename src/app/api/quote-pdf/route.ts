import { existsSync } from "node:fs";
import { NextRequest } from "next/server";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { estimateLead } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signPdfToken } from "@/lib/quote/pdf-token";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** System Chrome for local dev; @sparticuz/chromium in production. */
async function resolveExecutablePath(): Promise<{
  path: string;
  args: string[];
}> {
  const { default: chromium } = await import("@sparticuz/chromium");
  if (process.env.NODE_ENV !== "production") {
    for (const p of [
      process.env.CHROME_PATH,
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
    ]) {
      if (p && existsSync(p)) return { path: p, args: chromium.args };
    }
  }
  return { path: await chromium.executablePath(), args: chromium.args };
}

export async function GET(req: NextRequest) {
  await requireAdmin();

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const db = getDb();
  const lead = (
    await db.select().from(estimateLead).where(eq(estimateLead.id, id))
  )[0];
  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  let browser: import("puppeteer-core").Browser | null = null;
  try {
    const [{ default: puppeteer }, { token, exp }] = await Promise.all([
      import("puppeteer-core"),
      Promise.resolve(signPdfToken(id)),
    ]);
    const { path: executablePath, args } = await resolveExecutablePath();

    browser = await puppeteer.launch({
      executablePath,
      args,
      headless: true,
    });
    const page = await browser.newPage();
    const origin = new URL(req.url).origin;
    await page.goto(`${origin}/pdf/quotation/${id}?token=${token}&exp=${exp}`, {
      waitUntil: "networkidle0",
      timeout: 45_000,
    });
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      timeout: 45_000,
    });
    await browser.close();
    browser = null;

    const filename = `${lead.clientName.replace(/[^a-zA-Z0-9]+/g, "-") || "Client"}-Quotation.pdf`;
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Quote PDF generation failed:", e);
    return Response.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { writeFile, unlink, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { NextRequest } from "next/server";
import { requireAdmin, getDb } from "@/lib/db-utils";
import { estimateLead } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signPdfToken } from "@/lib/quote/pdf-token";
import { getCachedPdf, setCachedPdf } from "@/lib/quote/pdf-cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EXTRA_ARGS = ["--disable-dev-shm-usage"];

/**
 * Warm-instance state for repeated PDF renders. Vercel lambdas freeze
 * between invocations and Chromium's child process is killed while frozen,
 * leaving a stale `Browser` object behind — so a live-process health check
 * is required before reuse, and generation retries once on a dead session.
 */
type PdfGlobal = typeof globalThis & {
  __quotePdf?: {
    browser?: import("puppeteer-core").Browser | null;
    browserPromise?: Promise<import("puppeteer-core").Browser> | null;
    execArgs?: { path: string; args: string[] } | null;
    gsAvailable?: boolean | null;
  };
};
const g = globalThis as PdfGlobal;
g.__quotePdf ??= {};
const pdfGlobal = g.__quotePdf;

function discardBrowser() {
  pdfGlobal.browser = null;
  pdfGlobal.browserPromise = null;
}

/**
 * System Chrome for local dev; @sparticuz/chromium in production.
 * IMPORTANT: always launch with the full `chromium.args` set — those flags
 * (SwiftShader/software-GL defaults) are what keep headless Chromium stable
 * in the lambda. Overriding them with a custom subset crashes the process
 * on every launch (Target.createTarget: Target closed).
 */
async function resolveExecutablePath(): Promise<{
  path: string;
  args: string[];
}> {
  if (pdfGlobal.execArgs) return pdfGlobal.execArgs;
  const { default: chromium } = await import("@sparticuz/chromium");
  const args = Array.isArray(chromium.args) ? [...chromium.args] : [];
  let exec = await chromium.executablePath();
  if (process.env.NODE_ENV !== "production") {
    for (const p of [
      process.env.CHROME_PATH,
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]) {
      if (p && existsSync(p)) {
        exec = p;
        break;
      }
    }
  }
  const resolved = { path: exec, args };
  pdfGlobal.execArgs = resolved;
  return resolved;
}

async function launchBrowser(): Promise<import("puppeteer-core").Browser> {
  const [{ default: puppeteer }, { path, args }] = await Promise.all([
    import("puppeteer-core"),
    resolveExecutablePath(),
  ]);
  const browser = await puppeteer.launch({
    executablePath: path,
    args: [...(args || []), ...EXTRA_ARGS],
    headless: true,
  });
  pdfGlobal.browser = browser;
  browser.on("disconnected", discardBrowser);
  return browser;
}

async function getHealthyBrowser(): Promise<import("puppeteer-core").Browser> {
  const existing = pdfGlobal.browser;
  if (existing?.connected) {
    // version() traverses the websocket into the actual process; a browser
    // killed by a lambda freeze reports connected===true but fails this.
    const alive = await existing.version().catch(() => null);
    if (alive) return existing;
    await existing.close().catch(() => {});
    discardBrowser();
  } else {
    discardBrowser();
  }
  if (!pdfGlobal.browserPromise) {
    pdfGlobal.browserPromise = launchBrowser().catch((e) => {
      discardBrowser();
      throw e;
    });
  }
  return pdfGlobal.browserPromise;
}

/** Ghostscript is not present in the Vercel lambda; check once. */
function isGsAvailable(): boolean {
  if (pdfGlobal.gsAvailable != null) return pdfGlobal.gsAvailable;
  const found = ["/usr/bin/gs", "/usr/local/bin/gs", "/bin/gs"].some((p) =>
    existsSync(p),
  );
  pdfGlobal.gsAvailable = found;
  return found;
}

function optimizePdfWithGhostscript(input: Uint8Array): Promise<Uint8Array> {
  if (!isGsAvailable()) return Promise.resolve(input);
  return new Promise((resolve, reject) => {
    const id = randomUUID();
    const inPath = join(tmpdir(), `quote-${id}.pdf`);
    const outPath = join(tmpdir(), `quote-${id}-opt.pdf`);
    writeFile(inPath, input)
      .then(() => {
        const gs = spawn("gs", [
          "-sDEVICE=pdfwrite",
          "-dCompatibilityLevel=1.4",
          "-dPDFSETTINGS=/ebook",
          "-dNOPAUSE",
          "-dQUIET",
          "-dBATCH",
          "-dAutoRotatePages=/None",
          "-dColorImageDownsampleType=/Bicubic",
          "-dColorImageResolution=150",
          "-dGrayImageDownsampleType=/Bicubic",
          "-dGrayImageResolution=150",
          "-dMonoImageDownsampleType=/Bicubic",
          "-dMonoImageResolution=300",
          "-dCompressFonts=true",
          "-dSubsetFonts=true",
          "-dEmbedAllFonts=true",
          `-sOutputFile=${outPath}`,
          inPath,
        ]);
        gs.on("error", (err) => {
          Promise.allSettled([unlink(inPath), unlink(outPath)]).then(() =>
            reject(err),
          );
        });
        gs.on("close", async (code) => {
          try {
            if (code === 0 && existsSync(outPath)) {
              const buf = await readFile(outPath);
              await Promise.allSettled([unlink(inPath), unlink(outPath)]);
              resolve(new Uint8Array(buf));
            } else {
              await Promise.allSettled([unlink(inPath), unlink(outPath)]);
              resolve(input);
            }
          } catch (e) {
            reject(e);
          }
        });
      })
      .catch(reject);
  });
}

/** Session-death errors that a discarded/stale browser leaves behind. */
function isSessionDeath(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("Session closed") ||
    msg.includes("TargetCloseError") ||
    msg.includes("detached Browser") ||
    msg.includes("target was detached") ||
    msg.includes("Failed to launch")
  );
}

async function renderWithBrowser(
  leadId: number,
  originBase: string,
  lead: { clientName: string },
): Promise<{ buf: Uint8Array; filename: string }> {
  const { token, exp } = signPdfToken(leadId);
  const browser = await getHealthyBrowser();
  let page: import("puppeteer-core").Page | null = null;
  try {
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(45000);
    await page.setDefaultTimeout(45000);

    await page.goto(
      `${originBase}/pdf/quotation/${leadId}?token=${token}&exp=${exp}`,
      {
        // networkidle0 resolves only after EVERY resource (all quote-art
        // images, fonts, CSS) has finished its network request — the page
        // is then physically complete. Do NOT use in-page evaluate() waits:
        // this Chromium build (headless shell, --single-process) hangs or
        // crashes the renderer on inline evaluation, which froze generation
        // until the lambda timeout in production.
        waitUntil: "networkidle0",
        timeout: 45000,
      },
    );
    // Short settle in the Node process so pending paints flush before print.
    await new Promise((r) => setTimeout(r, 300));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 45000,
    });
    await page.close().catch(() => {});
    page = null;

    let optimized: Uint8Array;
    try {
      optimized = await optimizePdfWithGhostscript(pdf);
    } catch (e) {
      console.error("PDF optimization failed, falling back to original:", e);
      optimized = pdf;
    }

    const filename = `${lead.clientName.replace(/[^a-zA-Z0-9]+/g, "-") || "Client"}-Quotation.pdf`;
    return { buf: optimized, filename };
  } catch (e) {
    if (isSessionDeath(e)) {
      // The browser process is dying/dead — force the next call to relaunch.
      await browser.close().catch(() => {});
      discardBrowser();
    }
    throw e;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

async function generateQuotationPdf(
  leadId: number,
  originBase: string,
  lead: { clientName: string },
): Promise<{ buf: Uint8Array; filename: string }> {
  try {
    return await renderWithBrowser(leadId, originBase, lead);
  } catch (e) {
    // One retry with a fresh browser after a stale session death.
    if (isSessionDeath(e)) {
      console.warn("Quotation PDF renderer died; relaunching once…");
      return await renderWithBrowser(leadId, originBase, lead);
    }
    throw e;
  }
}

function pdfResponse(
  buf: Uint8Array,
  filename: string,
  etag: string,
): Response {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buf.byteLength),
      "ETag": etag,
      "Accept-Ranges": "bytes",
      // no-cache (not max-age): every download must revalidate by ETag.
      // max-age would let the browser serve a stale PDF for up to 5 minutes
      // after admin saves edits, since the dialog fetches this URL directly.
      // Unchanged quotes revalidate to a cheap 304; changed ones get 200.
      "Cache-Control": "private, no-cache",
    },
  });
}

function conditionalResponse(
  req: NextRequest,
  etag: string,
): Response | null {
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        "ETag": etag,
        "Cache-Control": "private, no-cache",
        "Accept-Ranges": "bytes",
      },
    });
  }
  return null;
}

function rangeResponse(
  req: NextRequest,
  buf: Uint8Array,
  filename: string,
  etag: string,
): Response | null {
  const range = req.headers.get("range");
  if (!range?.startsWith("bytes=")) return null;
  const parts = range.replace("bytes=", "").split("-");
  const start = parseInt(parts[0] ?? "", 10);
  const end = parts[1] ? parseInt(parts[1], 10) : buf.byteLength - 1;
  if (Number.isNaN(start) || start >= buf.byteLength) return null;
  const safeEnd = Math.min(end, buf.byteLength - 1);
  const chunk = buf.slice(start, safeEnd + 1);
  return new Response(new Uint8Array(chunk), {
    status: 206,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Range": `bytes ${start}-${safeEnd}/${buf.byteLength}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(chunk.byteLength),
      "ETag": etag,
      "Cache-Control": "private, no-cache",
    },
  });
}

export async function GET(req: NextRequest) {
  // requireAdmin throws; caught here so anonymous pings get a clean 401
  // (and stop spamming an unhandled-error stack into the Vercel logs).
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  // Keyed by quotationData content; saveQuotation() invalidates on edit.
  const cacheStamp = lead.quotationData?.length ?? 0;

  const respond = (buf: Uint8Array, filename: string, etag: string) => {
    const notModified = conditionalResponse(req, etag);
    if (notModified) return notModified;
    const partial = rangeResponse(req, buf, filename, etag);
    if (partial) return partial;
    return pdfResponse(buf, filename, etag);
  };

  const cached = getCachedPdf(id, cacheStamp);
  if (cached) {
    return respond(cached.buf, cached.filename, cached.etag);
  }

  const fwdHost =
    req.headers.get("x-forwarded-host") ?? req.nextUrl.host ?? "";
  const fwdProto =
    req.headers.get("x-forwarded-proto") ??
    (req.nextUrl.protocol.replace(":", "") || "https");
  const origin =
    fwdHost && !fwdHost.includes("localhost")
      ? `${fwdProto}://${fwdHost}`
      : new URL(req.url).origin;

  try {
    const { buf, filename } = await generateQuotationPdf(id, origin, lead);
    const { etag } = setCachedPdf(id, cacheStamp, buf, filename);
    return respond(buf, filename, etag);
  } catch (e) {
    console.error("Quote PDF generation failed:", e);
    return Response.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}

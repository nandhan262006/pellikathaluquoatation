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

/**
 * Warm-instance state. On Vercel, a lambda instance serves many requests;
 * re-extracting Chromium and relaunching the browser on every invocation is
 * the single biggest source of "PDF takes forever to start loading". Store
 * the browser (and the extracted executable path) on globalThis so warm
 * invocations reuse it.
 */
type PdfGlobal = typeof globalThis & {
  __quotePdf?: {
    browser?: import("puppeteer-core").Browser | null;
    browserPromise?: Promise<import("puppeteer-core").Browser> | null;
    execPath?: string | null;
    gsAvailable?: boolean | null;
  };
};
const g = globalThis as PdfGlobal;
g.__quotePdf ??= {};
const pdfGlobal = g.__quotePdf;

const EXTRA_ARGS = [
  "--disable-dev-shm-usage",
  "--disable-setuid-sandbox",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-software-rasterizer",
];

/** System Chrome for local dev; @sparticuz/chromium in production. */
async function resolveExecutablePath(): Promise<{
  path: string;
  args: string[];
}> {
  if (pdfGlobal.execPath) {
    return { path: pdfGlobal.execPath, args: [] };
  }
  const { default: chromium } = await import("@sparticuz/chromium");
  if (process.env.NODE_ENV !== "production") {
    for (const p of [
      process.env.CHROME_PATH,
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]) {
      if (p && existsSync(p)) {
        pdfGlobal.execPath = p;
        return { path: p, args: [] };
      }
    }
  }
  const path = await chromium.executablePath();
  pdfGlobal.execPath = path;
  return { path, args: [] };
}

async function getBrowser(): Promise<import("puppeteer-core").Browser> {
  const existing = pdfGlobal.browser;
  if (existing && existing.connected) {
    return existing;
  }
  pdfGlobal.browser = null;

  if (!pdfGlobal.browserPromise) {
    const [{ default: puppeteer }, { path, args }] = await Promise.all([
      import("puppeteer-core"),
      resolveExecutablePath(),
    ]);
    pdfGlobal.browserPromise = puppeteer
      .launch({
        executablePath: path,
        args: [...(args || []), ...EXTRA_ARGS],
        headless: true,
      })
      .then((b) => {
        pdfGlobal.browser = b;
        b.on("disconnected", () => {
          pdfGlobal.browser = null;
          pdfGlobal.browserPromise = null;
        });
        return b;
      })
      .catch((e) => {
        pdfGlobal.browserPromise = null;
        throw e;
      });
  }
  return pdfGlobal.browserPromise;
}

/** Ghostscript is NOT present in the Vercel lambda filesystem. */
function isGsAvailable(): boolean {
  if (pdfGlobal.gsAvailable !== null && pdfGlobal.gsAvailable !== undefined) {
    return pdfGlobal.gsAvailable;
  }
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

async function generateQuotationPdf(leadId: number, originBase?: string): Promise<{
  buf: Uint8Array;
  filename: string;
}> {
  const db = getDb();
  const lead = (
    await db.select().from(estimateLead).where(eq(estimateLead.id, leadId))
  )[0];
  if (!lead) {
    throw new Error("Lead not found");
  }

  let page: import("puppeteer-core").Page | null = null;
  try {
    const { token, exp } = signPdfToken(leadId);
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(45000);
    await page.setDefaultTimeout(45000);

    const origin =
      originBase && !originBase.includes("localhost")
        ? originBase
        : originBase || "http://localhost:3000";

    await page.emulateMediaType("print");
    await page.goto(
      `${origin}/pdf/quotation/${leadId}?token=${token}&exp=${exp}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      },
    );
    await page
      .evaluate(async () => {
        // Wait for every image (quote-art artwork) to be fully decoded,
        // then fonts, then a short settle. Chromium's PDF engine rasterizes
        // whatever is on screen; half-loaded images end up blank or late.
        const imgs = Array.from(document.images);
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((res) => {
                  img.addEventListener("load", () => res(), { once: true });
                  img.addEventListener("error", () => res(), { once: true });
                }),
          ),
        );
        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise((r) => setTimeout(r, 200));
      })
      .catch(() => {});
    // Belt-and-braces: short network idle so any late requests settle.
    await page
      .waitForNetworkIdle({ idleTime: 300, timeout: 5000 })
      .catch(() => {});

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      timeout: 45000,
    });
    await page.close();
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
  } finally {
    if (page) await page.close().catch(() => {});
  }
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

  // Try cache first — keyed by quotationData content, invalidated on save
  const cacheStamp = lead.quotationData?.length ?? 0;
  const cached = getCachedPdf(id, cacheStamp);
  if (cached) {
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === cached.etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "ETag": cached.etag,
          "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
          "Accept-Ranges": "bytes",
        },
      });
    }

    const range = req.headers.get("range");
    if (range && range.startsWith("bytes=")) {
      const parts = range.replace("bytes=", "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : cached.buf.byteLength - 1;
      if (!isNaN(start) && start < cached.buf.byteLength) {
        const chunk = cached.buf.slice(start, end + 1);
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${cached.filename}"`,
            "Content-Range": `bytes ${start}-${end}/${cached.buf.byteLength}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunk.byteLength),
            "ETag": cached.etag,
            "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
          },
        });
      }
    }

    return new Response(new Uint8Array(cached.buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cached.filename}"`,
        "Content-Length": String(cached.buf.byteLength),
        "ETag": cached.etag,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
      },
    });
  }

  // Compute origin
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
    const { buf, filename } = await generateQuotationPdf(id, origin);
    const cachedResult = setCachedPdf(id, cacheStamp, buf, filename);

    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === cachedResult.etag) {
      return new Response(null, {
        status: 304,
        headers: {
          "ETag": cachedResult.etag,
          "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
          "Accept-Ranges": "bytes",
        },
      });
    }

    const range = req.headers.get("range");
    if (range && range.startsWith("bytes=")) {
      const parts = range.replace("bytes=", "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : cachedResult.buf.byteLength - 1;
      if (!isNaN(start) && start < cachedResult.buf.byteLength) {
        const chunk = cachedResult.buf.slice(start, end + 1);
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${cachedResult.filename}"`,
            "Content-Range": `bytes ${start}-${end}/${cachedResult.buf.byteLength}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunk.byteLength),
            "ETag": cachedResult.etag,
            "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
          },
        });
      }
    }

    return new Response(new Uint8Array(cachedResult.buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cachedResult.filename}"`,
        "Content-Length": String(cachedResult.buf.byteLength),
        "ETag": cachedResult.etag,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    console.error("Quote PDF generation failed:", e);
    return Response.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}

/**
 * One-time build tooling: convert quotation artwork from webp to print-optimized
 * palette PNGs in public/quote-art/.
 *
 * Why: Chromium's print-to-PDF engine cannot embed webp — it decodes each image
 * to raw RGBA and re-encodes as full-color PNG inside the PDF (~500-700KB per
 * artwork). Palette PNGs keep alpha AND survive Skia's PDF embedding as an
 * indexed colorspace (~5x smaller). Sources are downscaled to the largest print
 * size they are ever displayed at (display CSS px x ~3 ~= 300dpi).
 *
 * Usage: node scripts/optimize-quote-art.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "public");
const outDir = path.join(root, "public", "quote-art");
mkdirSync(outDir, { recursive: true });

/**
 * displayW = widest CSS-px the artwork is ever rendered at in the quotation
 * document (checked against src/components/quote/pages/*). capW = displayW x 2
 * (~192 dpi effective at print). Empirically Chrome embeds ALL artwork as
 * flattened RGB + SMask (palette never survives), so pixel dimensions are the
 * only size lever; these are soft watercolor-style ornaments where 192dpi is
 * visually indistinguishable from 300dpi.
 */
const ARTWORKS = [
  { file: "borderfirst.webp", displayW: 774, out: "borderfirst.png" },
  { file: "borderlastpage.webp", displayW: 560, out: "borderlastpage.png" },
  { file: "couple.webp", displayW: 360, out: "couple.png" },
  { file: "7steps.webp", displayW: 200, out: "7steps.png" },
  { file: "ELEPHANT.webp", displayW: 260, out: "elephant.png" },
  { file: "sanai.webp", displayW: 200, out: "sanai.png" },
  { file: "drums.webp", displayW: 200, out: "drums.png" },
  { file: "7THPAGE.webp", displayW: 320, out: "7thpage.png" },
  { file: "lastpage.webp", displayW: 340, out: "lastpage.png" },
  { file: "knot-watermark.webp", displayW: 794, out: "knot-watermark.png" },
  { file: "kalash.webp", displayW: 30, out: "kalash.png" },
];

for (const { file, displayW, out } of ARTWORKS) {
  const capW = Math.round(displayW * 2);
  const input = path.join(srcDir, file);
  const img = sharp(input);
  const meta = await img.metadata();
  const width = Math.min(meta.width, capW);
  const pipeline = width < meta.width ? sharp(input).resize({ width }) : sharp(input);
  await pipeline
    .png({ palette: true, colors: 256, compressionLevel: 9, effort: 10 })
    .toFile(path.join(outDir, out));
  const outMeta = await sharp(path.join(outDir, out)).metadata();
  console.log(
    `${file} ${meta.width}x${meta.height} -> ${out} ${outMeta.width}x${outMeta.height}`,
  );
}

console.log("Done.");

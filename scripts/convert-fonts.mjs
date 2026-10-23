/**
 * One-time build tooling: convert the self-hosted static woff2 fonts to raw
 * TTF so jsPDF can embed them (jsPDF cannot read woff/woff2).
 *
 * Usage: node scripts/convert-fonts.mjs
 */
import wawoff2 from "wawoff2";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src", "app", "fonts");
const outDir = path.join(root, "public", "fonts-ttf");
mkdirSync(outDir, { recursive: true });

for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".woff2"))) {
  const ttf = await wawoff2.decompress(readFileSync(path.join(srcDir, f)));
  const out = path.join(outDir, f.replace(".woff2", ".ttf"));
  writeFileSync(out, Buffer.from(ttf));
  console.log(f, "->", path.basename(out));
}
console.log("Done.");

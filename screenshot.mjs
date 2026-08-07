import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "temporary screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label]");
  process.exit(1);
}

let n = 1;
while (fs.existsSync(path.join(outDir, `screenshot-${n}${label ? "-" + label : ""}.png`))) {
  n++;
}
const outFile = path.join(outDir, `screenshot-${n}${label ? "-" + label : ""}.png`);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

// Full-page capture never scrolls the live layout viewport, so
// IntersectionObserver-driven reveal animations below the fold never fire.
// Force the settled end-state directly (transitions/delays neutralized, since
// staggered items can carry transition-delay up to ~0.55s) so the screenshot
// shows real content, not mid-animation/invisible elements.
await page.evaluate(() => {
  const style = document.createElement("style");
  style.textContent = "*, *::before, *::after { transition-delay: 0s !important; transition-duration: 0s !important; animation-duration: 0s !important; }";
  document.head.appendChild(style);
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => el.classList.add("is-visible"));
});
await new Promise((r) => setTimeout(r, 150));

await page.screenshot({ path: outFile, fullPage: true });
await browser.close();

console.log(`Saved: ${outFile}`);

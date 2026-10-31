// Favicon and Open Graph image from the beaver sprite (specs/04-pages.md, Q4.24).
// Run with `npm run brand`; commit the files it writes to public/.
import { mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

import { beaverHead, beaverRows, spriteRects } from '../src/components/beaver.ts';
import { CLOUD, SUN } from '../src/components/pixelIcons.ts';

const OG_LIMIT_KB = 300;

function svg(rows, { cropX = 0, size = rows[0].length, offsetY = 0, extra = '' } = {}) {
  const rects = spriteRects(rows)
    .map(([x, y, w, fill]) => `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${fill}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cropX} ${-offsetY} ${size} ${size}" shape-rendering="crispEdges">${extra}${rects}</svg>\n`;
}

function iconSvg(icon, cell, colors) {
  const rects = icon.rects
    .map(([x, y, w, h, fill]) => {
      const color = colors[fill] ?? fill;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${icon.width} ${icon.height}" width="${icon.width * cell}" height="${icon.height * cell}" shape-rendering="crispEdges">${rects}</svg>`;
}

// Favicon: the head (20 wide, 9 tall) cropped to a 16x16 square, columns 3 to 18.
const head = beaverHead();
const favicon = svg(head, { cropX: 3, size: 16, offsetY: 3.5 });
writeFileSync('public/favicon.svg', favicon);

// Open Graph image: Day palette, name, role, domain, the beaver, a sun, and clouds.
const font = (path) => pathToFileURL(join('node_modules', path)).href;
const cloudColors = {
  'var(--cloud-outline)': '#5c6066',
  'var(--card)': '#ffffff',
  'var(--chip)': '#e3f1fe',
};
const beaver = svg(beaverRows('open'))
  .replace('<svg ', '<svg width="320" height="272" ')
  .replace(/viewBox="[^"]+"/, 'viewBox="0 0 20 17"');
const og = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Jersey 10'; src: url('${font('@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'Manrope'; font-weight: 200 800; src: url('${font('@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2')}') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #e3f1fe; position: relative; font-family: 'Manrope'; color: #232629; }
  .text { position: absolute; left: 80px; top: 150px; width: 640px; }
  .name { font-family: 'Jersey 10'; font-size: 104px; line-height: .85; }
  .role { font-family: 'Jersey 10'; font-size: 64px; line-height: 1; color: #d4430c; margin-top: 18px; }
  .domain { margin-top: 36px; font-size: 28px; font-weight: 700; color: #5c6066; }
  .sun { position: absolute; right: 90px; top: 50px; }
  .cloud { position: absolute; }
  .beaver { position: absolute; right: 150px; bottom: 96px; }
  .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 96px; background: #6c3200; }
  .ground::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 16px; background: #6abf4b; }
</style></head><body>
  <div class="sun">${iconSvg(SUN, 10, { currentColor: '#ff5e24' })}</div>
  <div class="cloud" style="left: 760px; top: 70px">${iconSvg(CLOUD, 6, cloudColors)}</div>
  <div class="cloud" style="left: 560px; top: 410px">${iconSvg(CLOUD, 4, cloudColors)}</div>
  <div class="text">
    <div class="name">Alvin Reihansyah Makarim</div>
    <div class="role">Full-Stack Developer</div>
    <div class="domain">alvinreihans.web.id</div>
  </div>
  <div class="beaver">${beaver}</div>
  <div class="ground"></div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'brand-'));
const page = join(dir, 'og.html');
writeFileSync(page, og);

const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await tab.goto(pathToFileURL(page).href);
  // Runs in the page: wait for Jersey 10 and Manrope before the screenshot.
  await tab.evaluate('document.fonts.ready');
  await tab.screenshot({ path: 'public/og-image.png' });

  // PNG favicons: 32x32 transparent, and 180x180 on the Day background for iOS.
  for (const [size, background, file] of [
    [32, 'transparent', 'public/favicon-32.png'],
    [180, '#e3f1fe', 'public/apple-touch-icon.png'],
  ]) {
    const icon = await browser.newPage({ viewport: { width: size, height: size } });
    const inner = size === 180 ? 140 : 32;
    await icon.setContent(
      `<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${background}">` +
        favicon.replace('<svg ', `<svg width="${inner}" height="${inner}" `) +
        '</body>',
    );
    await icon.screenshot({ path: file, omitBackground: background === 'transparent' });
  }
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}

const ogKb = statSync('public/og-image.png').size / 1024;
console.log(
  `brand: favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.png (${ogKb.toFixed(0)} KB)`,
);
if (ogKb > OG_LIMIT_KB) {
  console.error(`brand: og-image.png is over ${OG_LIMIT_KB} KB`);
  process.exit(1);
}

// The Content-Security-Policy in vercel.json allows the inline scripts (the theme and scene
// script in index.html, and the language picker in prerendered pages) by their SHA-256 hashes
// (specs/05-deployment.md, Q5.6; specs/08-prerender.md). If a script changes, its hash must
// too, or the policy blocks it in production. Line endings are normalised to LF first, because
// Vercel builds from the repository (LF) while a Windows checkout may have CRLF.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';

const HEADERS = ['Content-Security-Policy', 'Content-Security-Policy-Report-Only'];

// Every prerendered page, not only index.html.
const pages = readdirSync('dist', { recursive: true })
  .map(String)
  .filter((file) => file.endsWith('.html'));
const inline = new Set(
  pages.flatMap((file) =>
    [
      ...readFileSync(`dist/${file}`, 'utf8')
        .replace(/\r\n/g, '\n')
        .matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
    ].map((m) => m[1]),
  ),
);

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const policy = vercel.headers
  .flatMap((rule) => rule.headers)
  .find((header) => HEADERS.includes(header.key))?.value;
if (!policy) {
  console.error('check-csp: no Content-Security-Policy header in vercel.json');
  process.exit(1);
}

const missing = [...inline]
  .map((script) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`)
  .filter((hash) => !policy.includes(hash));
if (missing.length) {
  console.error(`check-csp: add ${missing.join(', ')} to script-src in vercel.json`);
  process.exit(1);
}
console.log(
  `check-csp: ${inline.size} inline script(s) in ${pages.length} page(s) allowed by hash`,
);

// The Content-Security-Policy in vercel.json allows the inline theme script in index.html by
// its SHA-256 hash (specs/05-deployment.md, Q5.6). If the script changes, the hash must too,
// or the policy blocks it in production. Line endings are normalised to LF first, because
// Vercel builds from the repository (LF) while a Windows checkout may have CRLF.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const HEADERS = ['Content-Security-Policy', 'Content-Security-Policy-Report-Only'];

const html = readFileSync('dist/index.html', 'utf8').replace(/\r\n/g, '\n');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
  (m) => m[1],
);

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const policy = vercel.headers
  .flatMap((rule) => rule.headers)
  .find((header) => HEADERS.includes(header.key))?.value;
if (!policy) {
  console.error('check-csp: no Content-Security-Policy header in vercel.json');
  process.exit(1);
}

const missing = inline
  .map((script) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`)
  .filter((hash) => !policy.includes(hash));
if (missing.length) {
  console.error(`check-csp: add ${missing.join(', ')} to script-src in vercel.json`);
  process.exit(1);
}
console.log(`check-csp: ${inline.length} inline script(s) allowed by hash`);

// Initial JavaScript budget from specs/05-deployment.md: under 170 KB gzip.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 170;
const html = readFileSync('dist/index.html', 'utf8');

// Scripts that load on the first visit: the entry module plus its modulepreload links.
const files = [
  ...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g),
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g),
].map((m) => m[1]);

const totalKb =
  files.reduce((sum, file) => sum + gzipSync(readFileSync(join('dist', file))).length, 0) / 1024;

const summary = `initial JS ${totalKb.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB, ${files.length} file(s))`;
if (totalKb > BUDGET_KB) {
  console.error(`check-size: over budget, ${summary}`);
  process.exit(1);
}
console.log(`check-size: ${summary}`);

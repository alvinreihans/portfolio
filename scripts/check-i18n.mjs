import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { compareLocales, flatten } from './i18n-compare.mjs';

const LOCALES_DIR = 'src/locales';

function load(lang) {
  const dir = join(LOCALES_DIR, lang);
  const out = {};
  if (!existsSync(dir)) return out;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    flatten(basename(file, '.json'), JSON.parse(readFileSync(join(dir, file), 'utf8')), '', out);
  }
  return out;
}

if (!existsSync(LOCALES_DIR)) {
  console.log('check-i18n: no locale files yet, nothing to compare.');
  process.exit(0);
}

const problems = compareLocales(load('id'), load('en'));
if (problems.length > 0) {
  console.error(
    `check-i18n: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join('\n'),
  );
  process.exit(1);
}
console.log('check-i18n: id and en match.');

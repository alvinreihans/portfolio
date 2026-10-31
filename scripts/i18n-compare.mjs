// Comparison rules for check-i18n (specs/03-i18n.md, "Pemeriksaan otomatis").

const PLACEHOLDER = /\{\{\s*([\w.]+)\s*\}\}/g;

// Keys that intentionally exist in one language only (specs/04-pages.md).
export const ONE_SIDED_KEYS = new Set(['project:noEnglish']);

/** Flattens nested translation objects into `namespace:a.b.c` keys, skipping `_review`. */
export function flatten(namespace, value, prefix = '', out = {}) {
  for (const [key, child] of Object.entries(value)) {
    if (key === '_review') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      flatten(namespace, child, path, out);
    } else {
      out[`${namespace}:${path}`] = child;
    }
  }
  return out;
}

function placeholders(text) {
  return [...String(text).matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
}

/** Returns a list of human-readable problems; empty means both languages match. */
export function compareLocales(id, en) {
  const problems = [];
  const keys = new Set([...Object.keys(id), ...Object.keys(en)]);

  for (const key of [...keys].sort()) {
    if (ONE_SIDED_KEYS.has(key)) continue;
    if (!(key in id)) problems.push(`${key}: missing in id`);
    else if (!(key in en)) problems.push(`${key}: missing in en`);
    else {
      for (const [lang, text] of [
        ['id', id[key]],
        ['en', en[key]],
      ]) {
        if (typeof text !== 'string' || text.trim() === '')
          problems.push(`${key}: empty in ${lang}`);
      }
      if (placeholders(id[key]).join() !== placeholders(en[key]).join()) {
        problems.push(`${key}: placeholders differ between id and en`);
      }
    }
  }
  return problems;
}

// Writes a prerendered HTML file for every page (specs/08-prerender.md). Each file holds the
// page in both languages as <template> elements; a small script picks one before first paint,
// so the URL stays the same for both languages. Runs after `vite build` and the SSR build.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://alvinreihans.web.id';
const SSR_DIR = 'dist-prerender';
const { render, PAGES, NOT_FOUND_PATH } = await import(
  pathToFileURL(join(SSR_DIR, 'entry-prerender.js')).href
);

// Picks the language with the rules of src/i18n/detect.ts (saved choice, then the first
// Indonesian or English browser language, then English), moves that template into #root, and
// sets lang and title. Static, so the Content-Security-Policy allows it by one hash.
const PICK_LANGUAGE = `(function () {
  var lang = null;
  try {
    lang = localStorage.getItem('lang');
  } catch (e) {}
  if (lang !== 'id' && lang !== 'en') {
    lang = 'en';
    var tags = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < tags.length; i++) {
      var code = String(tags[i] || '').toLowerCase().split('-')[0];
      if (code === 'id' || code === 'in') { lang = 'id'; break; }
      if (code === 'en') { lang = 'en'; break; }
    }
  }
  var templates = document.querySelectorAll('template[data-lang]');
  for (var j = 0; j < templates.length; j++) {
    var template = templates[j];
    if (template.getAttribute('data-lang') === lang) {
      document.getElementById('root').appendChild(template.content);
      document.documentElement.lang = lang;
      document.title = template.getAttribute('data-title');
    }
    template.remove();
  }
})();`;

const template = readFileSync('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: no empty #root');

const escapeAttr = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

async function page(path, notFound) {
  const [id, en] = await Promise.all([render(path, 'id'), render(path, 'en')]);
  const url = SITE + (path === '/' ? '/' : path);
  let html = template
    .replace(
      '<div id="root"></div>',
      [
        '<div id="root"></div>',
        `<template data-lang="id" data-title="${escapeAttr(id.title)}">${id.html}</template>`,
        `<template data-lang="en" data-title="${escapeAttr(en.title)}">${en.html}</template>`,
        `<script>${PICK_LANGUAGE}</script>`,
      ].join(''),
    )
    // Static metadata stays English (Q3.7); the script switches the title for Indonesian.
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(en.title)}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escapeAttr(en.title)}`);
  if (notFound) {
    // Not a real page: keep it out of search results (specs/05-deployment.md).
    html = html
      .replace(/\s*<link rel="canonical"[^>]*>/, '')
      .replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>');
  } else {
    html = html
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
  }
  return html;
}

const written = [];
for (const path of PAGES) {
  const file = path === '/' ? 'dist/index.html' : join('dist', path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, await page(path, false));
  written.push(file);
}
writeFileSync('dist/404.html', await page(NOT_FOUND_PATH, true));
written.push('dist/404.html');

rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: ${written.length} pages in two languages`);

// Writes public/sitemap.xml before each build (specs/05-deployment.md): the home page, the CV,
// and one URL per project folder, so a new project needs no change here.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://alvinreihans.web.id';
const PROJECTS = 'src/content/projects';

const slugs = readdirSync(PROJECTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => JSON.parse(readFileSync(`${PROJECTS}/${entry.name}/meta.json`, 'utf8')))
  .sort((a, b) => a.order - b.order)
  .map((meta) => meta.slug);

const paths = ['/', '/cv', ...slugs.map((slug) => `/projects/${slug}`)];
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${SITE}${path}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync('public/sitemap.xml', xml);
console.log(`generate-sitemap: ${paths.length} URLs`);

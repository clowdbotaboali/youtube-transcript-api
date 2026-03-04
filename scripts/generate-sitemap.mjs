import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SEO_CONFIG, getSitemapEntries } from '../frontend/src/seo/seoCatalog.js';

const SITEMAP_PATH = path.resolve(process.cwd(), 'frontend', 'public', 'sitemap.xml');
const MAX_URLS_PER_FILE = 45000;
const today = new Date().toISOString().slice(0, 10);

const staticEntries = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/en', changefreq: 'weekly', priority: '0.9' },
  { path: '/ar', changefreq: 'weekly', priority: '0.9' },
  { path: '/fr', changefreq: 'weekly', priority: '0.9' },
  { path: '/tool', changefreq: 'weekly', priority: '0.95' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.3' }
];

function normalizePath(pathname) {
  const raw = String(pathname || '/').trim();
  if (!raw) return '/';
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  if (withLeading === '/') return '/';
  return withLeading.replace(/\/+$/, '');
}

function escapeXml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function uniqueEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = normalizePath(entry.path);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toUrlNode(entry) {
  const normalizedPath = normalizePath(entry.path);
  return [
    '  <url>',
    `    <loc>${escapeXml(`${SEO_CONFIG.SITE_ORIGIN}${normalizedPath}`)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>'
  ].join('\n');
}

function toUrlSetXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];
  entries.forEach((entry) => lines.push(toUrlNode(entry)));
  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const seoEntries = getSitemapEntries();
  const allEntries = uniqueEntries([...staticEntries, ...seoEntries]);

  if (allEntries.length > MAX_URLS_PER_FILE) {
    throw new Error(
      `Sitemap contains ${allEntries.length} URLs which exceeds limit ${MAX_URLS_PER_FILE}. Implement sitemap index splitting.`
    );
  }

  const xml = toUrlSetXml(allEntries);
  await writeFile(SITEMAP_PATH, xml, 'utf8');

  console.log(`[sitemap] generated ${allEntries.length} URLs -> ${SITEMAP_PATH}`);
}

main().catch((error) => {
  console.error('[sitemap] generation failed:', error);
  process.exitCode = 1;
});


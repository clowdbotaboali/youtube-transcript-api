import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { SEO_CONFIG, getSitemapEntries } from '../frontend/src/seo/seoCatalog.js';
import { getInsightPaths } from '../frontend/src/content/insights.js';

const SITEMAP_PATH = path.resolve(process.cwd(), 'scripts', '.cache', 'sitemap.build.xml');
const MAX_URLS_PER_FILE = 45000;
const today = new Date().toISOString().slice(0, 10);

const staticEntries = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/en', changefreq: 'weekly', priority: '0.9' },
  { path: '/ar', changefreq: 'weekly', priority: '0.9' },
  { path: '/fr', changefreq: 'weekly', priority: '0.9' },
  { path: '/tool', changefreq: 'weekly', priority: '0.95' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/insights', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.3' }
];

async function loadTranscriptSitemapEntries() {
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseServiceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!supabaseUrl || !supabaseServiceKey) return [];

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('seo_transcript_pages')
      .select('slug, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(42000);
    if (error) {
      return [];
    }
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row) => ({
      path: `/transcript/${String(row.slug || '').trim()}`,
      changefreq: 'daily',
      priority: '0.8',
      lastmod: new Date(row.updated_at || row.created_at || Date.now()).toISOString().slice(0, 10)
    }));
  } catch {
    return [];
  }
}

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
  const lastmod = String(entry.lastmod || today).trim() || today;
  return [
    '  <url>',
    `    <loc>${escapeXml(`${SEO_CONFIG.SITE_ORIGIN}${normalizedPath}`)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
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
  const insightEntries = getInsightPaths().map((entryPath) => ({
    path: entryPath,
    changefreq: 'monthly',
    priority: '0.6'
  }));
  const transcriptEntries = await loadTranscriptSitemapEntries();
  const allEntries = uniqueEntries([...staticEntries, ...insightEntries, ...seoEntries, ...transcriptEntries]);

  if (allEntries.length > MAX_URLS_PER_FILE) {
    throw new Error(
      `Sitemap contains ${allEntries.length} URLs which exceeds limit ${MAX_URLS_PER_FILE}. Implement sitemap index splitting.`
    );
  }

  const xml = toUrlSetXml(allEntries);
  await mkdir(path.dirname(SITEMAP_PATH), { recursive: true });
  await writeFile(SITEMAP_PATH, xml, 'utf8');

  console.log(`[sitemap] generated ${allEntries.length} URLs -> ${SITEMAP_PATH}`);
}

main().catch((error) => {
  console.error('[sitemap] generation failed:', error);
  process.exitCode = 1;
});

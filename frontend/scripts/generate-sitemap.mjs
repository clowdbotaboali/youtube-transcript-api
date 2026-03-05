import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { SEO_CONFIG, getSitemapEntries } from '../src/seo/seoCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../../scripts/.cache');

const MAX_URLS_PER_FILE = 45000;
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const staticEntries = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/en/', changefreq: 'weekly', priority: '0.9' },
  { path: '/ar/', changefreq: 'weekly', priority: '0.9' },
  { path: '/fr/', changefreq: 'weekly', priority: '0.9' },
  { path: '/tool', changefreq: 'weekly', priority: '0.95' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.7' },
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
    if (error) return [];

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
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withSlash === '/') return '/';
  return withSlash.replace(/\/+$/, '');
}

function toXmlUrl(entry) {
  const normalizedPath = normalizePath(entry.path);
  const lastmod = String(entry.lastmod || today).trim() || today;
  return [
    '  <url>',
    `    <loc>${SEO_CONFIG.SITE_ORIGIN}${normalizedPath}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>'
  ].join('\n');
}

function toUrlsetXml(entries) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  entries.forEach((entry) => lines.push(toXmlUrl(entry)));
  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

function toSitemapIndexXml(files) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  files.forEach((file) => {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${SEO_CONFIG.SITE_ORIGIN}/${file}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push('  </sitemap>');
  });
  lines.push('</sitemapindex>');
  return `${lines.join('\n')}\n`;
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

async function cleanupOldSitemapChunks() {
  await mkdir(publicDir, { recursive: true });
  const names = await readdir(publicDir);
  const chunkFiles = names.filter((name) => /^sitemap-\d+\.xml$/i.test(name));
  await Promise.all(chunkFiles.map((file) => unlink(path.join(publicDir, file))));
}

async function main() {
  await cleanupOldSitemapChunks();

  const dynamicEntries = getSitemapEntries();
  const transcriptEntries = await loadTranscriptSitemapEntries();
  const allEntries = uniqueEntries([...staticEntries, ...dynamicEntries, ...transcriptEntries]);

  if (allEntries.length <= MAX_URLS_PER_FILE) {
    const xml = toUrlsetXml(allEntries);
    await writeFile(path.join(publicDir, 'sitemap.build.xml'), xml, 'utf8');
    return;
  }

  const chunkFiles = [];
  for (let i = 0; i < allEntries.length; i += MAX_URLS_PER_FILE) {
    const chunkIndex = Math.floor(i / MAX_URLS_PER_FILE) + 1;
    const chunkName = `sitemap-${chunkIndex}.xml`;
    chunkFiles.push(chunkName);
    const xml = toUrlsetXml(allEntries.slice(i, i + MAX_URLS_PER_FILE));
    await writeFile(path.join(publicDir, chunkName), xml, 'utf8');
  }

  const indexXml = toSitemapIndexXml(chunkFiles);
  await writeFile(path.join(publicDir, 'sitemap.build.xml'), indexXml, 'utf8');
}

main().catch((error) => {
  console.error('[sitemap] generation failed:', error);
  process.exitCode = 1;
});

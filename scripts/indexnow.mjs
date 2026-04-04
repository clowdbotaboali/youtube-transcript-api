import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'www.transcripta.tech';
const SITEMAP_PATH = path.resolve(process.cwd(), 'scripts', '.cache', 'sitemap.build.xml');
const REPORT_DIR = path.resolve(process.cwd(), 'scripts', '.cache');
const STATE_PATH = path.resolve(REPORT_DIR, 'indexnow-state.json');
const URL_HEALTH_REPORT_PATH = path.resolve(REPORT_DIR, 'url-health-report.json');
const MAX_URLS_PER_REQUEST = 10000;

function extractLocUrls(xml) {
  const matches = [...String(xml || '').matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((match) => String(match[1] || '').trim()).filter(Boolean);
}

async function readJsonIfExists(filePath, fallback = null) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function splitIntoChunks(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function submitChunk(indexNowKey, urls) {
  const payload = {
    host: HOST,
    key: indexNowKey,
    urlList: urls
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: body.replace(/\s+/g, ' ').trim().slice(0, 200)
  };
}

async function printFinalReport(indexNowSubmissions) {
  const sitemapXml = await readFile(SITEMAP_PATH, 'utf8');
  const totalSitemapUrls = extractLocUrls(sitemapXml).length;
  const healthReport = await readJsonIfExists(URL_HEALTH_REPORT_PATH, {
    totalUrls: totalSitemapUrls,
    ok200: 0,
    redirects: 0,
    errors: 0
  });

  console.log('--- SEO Automation Report ---');
  console.log(`Total sitemap URLs: ${healthReport.totalUrls ?? totalSitemapUrls}`);
  console.log(`Healthy URLs: ${healthReport.ok200 ?? 0}`);
  console.log(`Redirect URLs: ${healthReport.redirects ?? 0}`);
  console.log(`Errors: ${healthReport.errors ?? 0}`);
  console.log(`IndexNow submissions: ${indexNowSubmissions}`);
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });

  const sitemapXml = await readFile(SITEMAP_PATH, 'utf8');
  const currentUrls = extractLocUrls(sitemapXml);

  if (currentUrls.length === 0) {
    throw new Error(`No URLs found in sitemap: ${SITEMAP_PATH}`);
  }

  const previousState = await readJsonIfExists(STATE_PATH, { urls: [] });
  const previousUrls = new Set(Array.isArray(previousState?.urls) ? previousState.urls : []);
  const newUrls = currentUrls.filter((url) => !previousUrls.has(url));

  const indexNowKey = String(process.env.INDEXNOW_KEY || '').trim();
  if (!indexNowKey) {
    console.warn('[seo:indexnow] INDEXNOW_KEY is not set. Skipping submission.');
    await writeFile(
      STATE_PATH,
      JSON.stringify({ updatedAt: new Date().toISOString(), urls: currentUrls }, null, 2),
      'utf8'
    );
    await printFinalReport(0);
    return;
  }

  if (newUrls.length === 0) {
    console.log('[seo:indexnow] no new URLs to submit.');
    await printFinalReport(0);
    return;
  }

  let submittedCount = 0;
  let failedSubmissions = 0;
  const chunks = splitIntoChunks(newUrls, MAX_URLS_PER_REQUEST);
  for (const chunk of chunks) {
    const result = await submitChunk(indexNowKey, chunk);
    console.log(`[seo:indexnow] status=${result.status} ok=${result.ok} body="${result.body}"`);
    if (!result.ok) {
      failedSubmissions += 1;
      console.warn(`[seo:indexnow] submission failed for ${chunk.length} URL(s). They will be retried on the next run.`);
      continue;
    }
    submittedCount += chunk.length;
  }

  if (failedSubmissions === 0) {
    await writeFile(
      STATE_PATH,
      JSON.stringify({ updatedAt: new Date().toISOString(), urls: currentUrls }, null, 2),
      'utf8'
    );
  } else {
    console.warn('[seo:indexnow] state file was not updated because some submissions failed.');
  }

  await printFinalReport(submittedCount);
}

main().catch((error) => {
  console.error('[seo:indexnow] failed:', error);
  process.exitCode = 1;
});

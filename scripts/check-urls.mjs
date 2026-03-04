import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITEMAP_PATH = path.resolve(process.cwd(), 'frontend', 'public', 'sitemap.xml');
const REPORT_DIR = path.resolve(process.cwd(), 'scripts', '.cache');
const REPORT_PATH = path.resolve(REPORT_DIR, 'url-health-report.json');
const CONCURRENCY = Number(process.env.URL_CHECK_CONCURRENCY || 12);
const REQUEST_TIMEOUT_MS = Number(process.env.URL_CHECK_TIMEOUT_MS || 15000);

function extractLocUrls(xml) {
  const matches = [...String(xml || '').matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((match) => String(match[1] || '').trim()).filter(Boolean);
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    return {
      url,
      status: response.status,
      redirected: response.redirected
    };
  } catch (error) {
    return {
      url,
      status: 0,
      redirected: false,
      error: String(error?.message || error)
    };
  }
}

async function runWithConcurrency(urls, concurrency) {
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const index = cursor;
      cursor += 1;
      const result = await checkUrl(urls[index]);
      results.push(result);
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const sitemapXml = await readFile(SITEMAP_PATH, 'utf8');
  const urls = extractLocUrls(sitemapXml);

  if (urls.length === 0) {
    throw new Error(`No URLs found in sitemap: ${SITEMAP_PATH}`);
  }

  const results = await runWithConcurrency(urls, CONCURRENCY);

  const ok200 = results.filter((item) => item.status === 200).length;
  const redirects = results.filter((item) => item.redirected).length;
  const errors = results.filter((item) => item.status === 0 || item.status >= 400).length;

  const report = {
    checkedAt: new Date().toISOString(),
    totalUrls: urls.length,
    ok200,
    redirects,
    errors,
    failed: results.filter((item) => item.status === 0 || item.status >= 400).slice(0, 25)
  };

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Total URLs: ${report.totalUrls}`);
  console.log(`200 OK: ${report.ok200}`);
  console.log(`Redirects: ${report.redirects}`);
  console.log(`Errors: ${report.errors}`);

  if (report.errors > 0) {
    console.error(`[seo:check-urls] Build failed because ${report.errors} URL(s) returned errors.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[seo:check-urls] failed:', error);
  process.exitCode = 1;
});

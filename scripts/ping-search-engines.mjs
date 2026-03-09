const SITEMAP_URL = 'https://www.transcripta.tech/sitemap.xml';

const pingTargets = [
  {
    name: 'Google',
    url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  },
  {
    name: 'Bing',
    url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  }
];

async function pingSearchEngine(target) {
  try {
    const response = await fetch(target.url, {
      method: 'GET',
      redirect: 'follow'
    });

    const body = await response.text();
    const shortBody = body.replace(/\s+/g, ' ').trim().slice(0, 180);

    return {
      engine: target.name,
      ok: response.ok,
      status: response.status,
      body: shortBody
    };
  } catch (error) {
    return {
      engine: target.name,
      ok: false,
      status: 0,
      body: String(error?.message || error)
    };
  }
}

async function main() {
  const results = [];
  for (const target of pingTargets) {
    const result = await pingSearchEngine(target);
    results.push(result);
    console.log(`[seo:ping] ${result.engine}: status=${result.status} ok=${result.ok} body="${result.body}"`);
  }

  const failed = results.filter((item) => !item.ok);
  if (failed.length > 0) {
    console.warn(`[seo:ping] ${failed.length} ping request(s) did not return 2xx. Build will continue.`);
  } else {
    console.log('[seo:ping] all search engine pings returned 2xx.');
  }
}

main().catch((error) => {
  console.error('[seo:ping] unexpected failure:', error);
  process.exitCode = 1;
});

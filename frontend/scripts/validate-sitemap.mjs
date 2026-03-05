import { readFile } from 'node:fs/promises';
import { SEO_CONFIG, REDIRECT_RULES, getAllCanonicalSeoPaths, getSeoRouteInfo } from '../src/seo/seoCatalog.js';

const sitemapPath = new URL('../../scripts/.cache/sitemap.build.xml', import.meta.url);

function normalizePath(pathname) {
  const raw = String(pathname || '/').trim();
  if (!raw) return '/';
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  if (withLeading === '/') return '/';
  return withLeading.replace(/\/+$/, '');
}

function extractLocs(xml) {
  const matches = [...String(xml || '').matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((match) => String(match[1] || '').trim()).filter(Boolean);
}

async function main() {
  const xml = await readFile(sitemapPath, 'utf8');
  const locs = extractLocs(xml);
  const seen = new Set();
  const duplicates = [];

  const paths = locs
    .map((url) => {
      const normalizedUrl = String(url || '').trim();
      if (!normalizedUrl.startsWith(SEO_CONFIG.SITE_ORIGIN)) return null;
      const path = normalizePath(normalizedUrl.slice(SEO_CONFIG.SITE_ORIGIN.length) || '/');
      if (seen.has(path)) duplicates.push(path);
      seen.add(path);
      return path;
    })
    .filter(Boolean);

  const redirectSources = new Set(REDIRECT_RULES.map((rule) => normalizePath(rule.source)));
  const redirectedInSitemap = paths.filter((path) => redirectSources.has(path));

  const canonicalSeoPaths = getAllCanonicalSeoPaths().map((path) => normalizePath(path));
  const missingCanonicalPaths = canonicalSeoPaths.filter((path) => !seen.has(path));

  const invalidSeoRoutes = canonicalSeoPaths.filter((path) => {
    const route = getSeoRouteInfo(path);
    return !route || normalizePath(route.canonicalPath) !== path;
  });

  const hasErrors =
    duplicates.length > 0 ||
    redirectedInSitemap.length > 0 ||
    missingCanonicalPaths.length > 0 ||
    invalidSeoRoutes.length > 0;

  console.log(
    JSON.stringify(
      {
        totalLocs: locs.length,
        uniquePaths: seen.size,
        canonicalSeoPaths: canonicalSeoPaths.length,
        duplicates: duplicates.length,
        redirectedInSitemap: redirectedInSitemap.length,
        missingCanonicalPaths: missingCanonicalPaths.length,
        invalidSeoRoutes: invalidSeoRoutes.length,
        sample: {
          redirectedInSitemap: redirectedInSitemap.slice(0, 5),
          missingCanonicalPaths: missingCanonicalPaths.slice(0, 5),
          invalidSeoRoutes: invalidSeoRoutes.slice(0, 5)
        }
      },
      null,
      2
    )
  );

  if (hasErrors) process.exitCode = 1;
}

main().catch((error) => {
  console.error('[sitemap] validation failed:', error);
  process.exitCode = 1;
});

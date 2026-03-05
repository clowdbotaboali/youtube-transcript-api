import { useEffect, useMemo } from 'react';

const DEFAULT_SOCIAL_IMAGE = 'https://www.transcripta.tech/preview-image.png';
const DEFAULT_SOCIAL_IMAGE_WIDTH = '1200';
const DEFAULT_SOCIAL_IMAGE_HEIGHT = '630';

function upsertMeta(selector, attrs, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

function removeNode(selector) {
  const el = document.head.querySelector(selector);
  if (el) el.remove();
}

function normalizePath(value) {
  const raw = String(value || '/').trim();
  if (!raw) return '/';
  if (raw === '/') return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function setAlternates(alternates) {
  document.head.querySelectorAll('link[rel="alternate"][data-seo-alternate="1"]').forEach((el) => el.remove());
  if (!Array.isArray(alternates)) return;
  alternates.forEach((item) => {
    const hreflang = String(item?.hreflang || '').trim();
    const href = String(item?.href || '').trim();
    if (!hreflang || !href) return;
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    el.setAttribute('href', href);
    el.setAttribute('data-seo-alternate', '1');
    document.head.appendChild(el);
  });
}

function setJsonLdScripts(items) {
  document.head.querySelectorAll('script[type="application/ld+json"][data-seo-jsonld="1"]').forEach((el) => el.remove());
  if (!Array.isArray(items) || items.length === 0) return;
  items.forEach((item, index) => {
    const content = stableStringify(item);
    if (!content) return;
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-jsonld', '1');
    script.setAttribute('data-seo-jsonld-index', String(index));
    script.textContent = content;
    document.head.appendChild(script);
  });
}

function stableStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function SeoMeta({
  title,
  description,
  keywords = '',
  path = '/',
  robots = '',
  ogType = 'website',
  canonicalOrigin = '',
  alternates = [],
  publishedTime = '',
  structuredData = null,
  ogImage = DEFAULT_SOCIAL_IMAGE,
  ogImageWidth = DEFAULT_SOCIAL_IMAGE_WIDTH,
  ogImageHeight = DEFAULT_SOCIAL_IMAGE_HEIGHT,
  twitterImage = '',
  twitterCard = 'summary_large_image'
}) {
  const alternatesKey = stableStringify(alternates);
  const structuredDataList = useMemo(() => {
    if (!structuredData) return [];
    return Array.isArray(structuredData) ? structuredData.filter(Boolean) : [structuredData];
  }, [structuredData]);
  const structuredDataKey = stableStringify(structuredDataList);
  const normalizedOgImage = String(ogImage || DEFAULT_SOCIAL_IMAGE).trim() || DEFAULT_SOCIAL_IMAGE;
  const normalizedOgImageWidth = String(ogImageWidth || DEFAULT_SOCIAL_IMAGE_WIDTH).trim() || DEFAULT_SOCIAL_IMAGE_WIDTH;
  const normalizedOgImageHeight = String(ogImageHeight || DEFAULT_SOCIAL_IMAGE_HEIGHT).trim() || DEFAULT_SOCIAL_IMAGE_HEIGHT;
  const normalizedTwitterImage = String(twitterImage || normalizedOgImage).trim() || normalizedOgImage;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords' }, keywords);
    } else {
      removeNode('meta[name="keywords"]');
    }
    if (robots) {
      upsertMeta('meta[name="robots"]', { name: 'robots' }, robots);
    } else {
      removeNode('meta[name="robots"]');
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, ogType);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, normalizedOgImage);
    upsertMeta('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url' }, normalizedOgImage);
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width' }, normalizedOgImageWidth);
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height' }, normalizedOgImageHeight);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, twitterCard);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, normalizedTwitterImage);
    if (publishedTime) {
      upsertMeta('meta[property="article:published_time"]', { property: 'article:published_time' }, publishedTime);
    } else {
      removeNode('meta[property="article:published_time"]');
    }

    if (typeof window !== 'undefined') {
      const baseOrigin = String(canonicalOrigin || window.location.origin || '').trim().replace(/\/+$/, '');
      const canonicalHref = `${baseOrigin}${normalizePath(path)}`;
      upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalHref });
      upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalHref);
      setAlternates(alternates);
      setJsonLdScripts(structuredDataList);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [
    title,
    description,
    keywords,
    path,
    robots,
    ogType,
    canonicalOrigin,
    alternatesKey,
    publishedTime,
    structuredDataKey,
    normalizedOgImage,
    normalizedOgImageWidth,
    normalizedOgImageHeight,
    normalizedTwitterImage,
    twitterCard,
    alternates,
    structuredDataList
  ]);

  return null;
}

export default SeoMeta;

import { useEffect } from 'react';

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

function upsertJsonLdScript(content) {
  const selector = 'script[type="application/ld+json"][data-seo-jsonld="1"]';
  if (!content) {
    removeNode(selector);
    return;
  }

  let script = document.head.querySelector(selector);
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-jsonld', '1');
    document.head.appendChild(script);
  }
  script.textContent = content;
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
  path = '/',
  robots = '',
  ogType = 'website',
  canonicalOrigin = '',
  alternates = [],
  publishedTime = '',
  structuredData = null
}) {
  const alternatesKey = stableStringify(alternates);
  const structuredDataKey = stableStringify(structuredData);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    if (robots) {
      upsertMeta('meta[name="robots"]', { name: 'robots' }, robots);
    } else {
      removeNode('meta[name="robots"]');
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, ogType);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
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
      upsertJsonLdScript(structuredDataKey || '');
    }

    return () => {
      document.title = prevTitle;
    };
  }, [
    title,
    description,
    path,
    robots,
    ogType,
    canonicalOrigin,
    alternatesKey,
    publishedTime,
    structuredDataKey,
    alternates
  ]);

  return null;
}

export default SeoMeta;

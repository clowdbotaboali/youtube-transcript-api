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

function SeoMeta({ title, description, path = '/' }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);

    if (typeof window !== 'undefined') {
      const canonicalHref = `${window.location.origin}${path}`;
      upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalHref });
      upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalHref);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, path]);

  return null;
}

export default SeoMeta;

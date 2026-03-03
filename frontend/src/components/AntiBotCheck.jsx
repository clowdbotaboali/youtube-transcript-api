import { useEffect, useRef, useState } from 'react';
import { LANG, tr } from '../utils/lang';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let turnstileScriptPromise = null;

function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile-script="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-turnstile-script', '1');
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

function AntiBotCheck({ onTokenChange, theme = 'auto', lang = LANG.en }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [widgetError, setWidgetError] = useState('');
  const configuredSiteKey = String(
    import.meta.env.VITE_TURNSTILE_SITE_KEY
      || import.meta.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      || import.meta.env.VITE_CF_TURNSTILE_SITE_KEY
      || import.meta.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY
      || ''
  ).trim();
  const hasConfiguredSiteKey = Boolean(configuredSiteKey);

  useEffect(() => {
    let cancelled = false;
    if (!hasConfiguredSiteKey) {
      if (typeof onTokenChange === 'function') onTokenChange('__turnstile_not_configured__');
      return undefined;
    }

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || !turnstile?.render) return;
        setWidgetError('');
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: configuredSiteKey,
          theme,
          callback: (token) => {
            if (typeof onTokenChange === 'function') onTokenChange(String(token || ''));
          },
          'expired-callback': () => {
            if (typeof onTokenChange === 'function') onTokenChange('');
          },
          'error-callback': () => {
            if (typeof onTokenChange === 'function') onTokenChange('');
            setWidgetError(
              tr(
                lang,
                'فشل تحقق الحماية. حدّث الصفحة وحاول مرة أخرى.',
                'Failed to verify anti-bot challenge. Please refresh and try again.',
                'Echec de verification anti-bot. Actualisez la page puis reessayez.'
              )
            );
          }
        });
      })
      .catch(() => {
        if (cancelled) return;
        setWidgetError(
          tr(
            lang,
            'تعذر تحميل عنصر الحماية ضد الروبوت.',
            'Could not load anti-bot widget.',
            'Impossible de charger le widget anti-bot.'
          )
        );
        if (typeof onTokenChange === 'function') onTokenChange('');
      });

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore widget cleanup failures.
        }
      }
    };
  }, [configuredSiteKey, hasConfiguredSiteKey, lang, onTokenChange, theme]);

  if (!hasConfiguredSiteKey) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {widgetError ? <p className="text-xs text-rose-600">{widgetError}</p> : null}
    </div>
  );
}

export default AntiBotCheck;

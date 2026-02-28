import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaBookmark, FaExternalLinkAlt, FaLink, FaRedo, FaSearch } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { LANG, tr } from '../utils/lang';

const LINKS_CACHE_TTL_MS = 1000 * 60 * 10;

function SavedLinks({ onSelectLink, apiUrl = defaultApiUrl, user, lang = LANG.ar, onNotify }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const cacheKey = user?.id ? `saved-links:${apiUrl}:${user.id}` : '';

  const notify = useCallback(
    (type, message) => {
      if (typeof onNotify === 'function') onNotify(type, message);
    },
    [onNotify]
  );

  const readCache = useCallback(() => {
    if (!cacheKey || typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.items)) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback(
    (items) => {
      if (!cacheKey || typeof window === 'undefined') return;
      try {
        window.sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            savedAt: Date.now(),
            items: Array.isArray(items) ? items : []
          })
        );
      } catch {
        // ignore cache errors
      }
    },
    [cacheKey]
  );

  const loadLinks = useCallback(
    async (force = false) => {
      if (!user?.id) return;

      let showLoader = true;
      if (!force) {
        const cached = readCache();
        if (cached) {
          setLinks(cached.items);
          const isFresh = Date.now() - Number(cached.savedAt || 0) < LINKS_CACHE_TTL_MS;
          if (isFresh) return;
          showLoader = cached.items.length === 0;
        }
      }
      if (showLoader) setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/links`, {
          method: 'GET',
          headers: {
            ...(await getAuthHeaders())
          }
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          const items = Array.isArray(data.data) ? data.data : [];
          setLinks(items);
          writeCache(items);
        } else {
          notify('error', tr(lang, 'تعذر تحميل الروابط المحفوظة.', 'Failed to load saved links.', 'Echec du chargement des liens enregistres.'));
        }
      } catch {
        notify('error', tr(lang, 'فشل الاتصال بالخادم.', 'Connection failed.', 'Echec de connexion.'));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [apiUrl, lang, notify, readCache, user?.id, writeCache]
  );

  useEffect(() => {
    if (user?.id) {
      loadLinks();
    } else {
      setLinks([]);
    }
  }, [loadLinks, user?.id]);

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return links;
    return links.filter((item) => {
      const title = String(item.title || '').toLowerCase();
      const videoId = String(item.videoId || '').toLowerCase();
      return title.includes(query) || videoId.includes(query);
    });
  }, [links, search]);

  const dateLocale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FaBookmark />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">{tr(lang, 'الروابط المحفوظة', 'Saved Links', 'Liens enregistres')}</h3>
            <p className="text-xs text-slate-500">
              {tr(lang, 'تُحفظ تلقائيًا بعد كل استخراج ناجح.', 'Automatically saved after each successful extraction.', 'Sauvegarde automatique apres chaque extraction reussie.')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => loadLinks(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border border-slate-200 hover:bg-slate-50"
          disabled={loading}
        >
          <FaRedo className={loading ? 'animate-spin' : ''} />
          <span>{tr(lang, 'تحديث', 'Refresh', 'Actualiser')}</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 px-3 py-2 mb-3 flex items-center gap-2">
        <FaSearch className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tr(lang, 'ابحث بعنوان الفيديو أو المعرّف...', 'Search by title or video ID...', 'Rechercher par titre ou ID video...')}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div className="text-xs text-slate-500 mb-3">
        {tr(lang, 'إجمالي الروابط:', 'Total links:', 'Total liens:')} <span className="font-bold text-slate-700">{links.length}</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-5 text-center">{tr(lang, 'جارٍ التحميل...', 'Loading...', 'Chargement...')}</p>
      ) : filteredLinks.length === 0 ? (
        <p className="text-sm text-slate-500 py-5 text-center">
          {tr(lang, 'لا توجد روابط محفوظة بعد.', 'No saved links yet.', 'Aucun lien enregistre pour le moment.')}
        </p>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredLinks.map((item) => (
            <article key={`${item.videoId}-${item.createdAt}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <button
                type="button"
                onClick={() => onSelectLink?.(item.url)}
                className="w-full text-left hover:opacity-90"
              >
                <p className="font-semibold text-slate-900 truncate">{item.title || item.videoId}</p>
                <p className="text-xs text-slate-500 mt-1">{item.videoId}</p>
              </button>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString(dateLocale)}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectLink?.(item.url)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <FaLink />
                    <span>{tr(lang, 'فتح في مساحة العمل', 'Open in workspace', 'Ouvrir dans l espace de travail')}</span>
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-white"
                  >
                    <FaExternalLinkAlt />
                    <span>{tr(lang, 'يوتيوب', 'YouTube', 'YouTube')}</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedLinks;

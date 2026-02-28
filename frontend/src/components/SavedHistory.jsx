import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaEye, FaFilter, FaHistory, FaRedo, FaTimes, FaTrash } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { LANG, tr } from '../utils/lang';

const FILTERS = ['all', 'extract', 'summary', 'steps', 'resources', 'all-analysis', 'chat'];
const HISTORY_CACHE_TTL_MS = 1000 * 60 * 10;

function mapTypeLabel(type, lang) {
  const value = String(type || '').trim();
  if (value === 'extract') return tr(lang, 'استخراج', 'Extraction', 'Extraction');
  if (value === 'summary') return tr(lang, 'تلخيص', 'Summary', 'Resume');
  if (value === 'steps') return tr(lang, 'خطوات', 'Steps', 'Etapes');
  if (value === 'resources') return tr(lang, 'موارد', 'Resources', 'Ressources');
  if (value === 'all') return tr(lang, 'معالجة كاملة', 'Full Analysis', 'Analyse complete');
  if (value.startsWith('chat:')) return tr(lang, 'شات', 'Chat', 'Chat');
  return value || tr(lang, 'أخرى', 'Other', 'Autre');
}

function SavedHistory({ apiUrl = defaultApiUrl, user, lang = LANG.ar, onNotify }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const cacheKey = user?.id ? `saved-history:${apiUrl}:${user.id}` : '';

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

  const loadHistory = useCallback(
    async (force = false) => {
      if (!user?.id) return;

      let showLoader = true;
      if (!force) {
        const cached = readCache();
        if (cached) {
          setHistory(cached.items);
          const isFresh = Date.now() - Number(cached.savedAt || 0) < HISTORY_CACHE_TTL_MS;
          if (isFresh) return;
          showLoader = cached.items.length === 0;
        }
      }
      if (showLoader) setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/history`, {
          headers: {
            ...(await getAuthHeaders())
          }
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          const items = Array.isArray(data.data) ? data.data : [];
          setHistory(items);
          writeCache(items);
        } else {
          notify('error', tr(lang, 'تعذر تحميل السجل.', 'Failed to load history.', 'Echec du chargement de l historique.'));
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
      loadHistory();
    } else {
      setHistory([]);
      setSelectedItem(null);
    }
  }, [loadHistory, user?.id]);

  const handleDelete = async (id) => {
    if (!window.confirm(tr(lang, 'هل تريد حذف هذا العنصر؟', 'Delete this item?', 'Supprimer cet element ?'))) return;
    try {
      const response = await fetch(`${apiUrl}/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          ...(await getAuthHeaders())
        }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setHistory((prev) => {
          const next = prev.filter((item) => item.id !== id);
          writeCache(next);
          return next;
        });
        if (selectedItem?.id === id) setSelectedItem(null);
      } else {
        notify('error', tr(lang, 'تعذر حذف العنصر.', 'Failed to delete item.', 'Echec de suppression.'));
      }
    } catch {
      notify('error', tr(lang, 'فشل الاتصال بالخادم.', 'Connection failed.', 'Echec de connexion.'));
    }
  };

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return history;
    if (activeFilter === 'all-analysis') return history.filter((item) => item.processing_type === 'all');
    if (activeFilter === 'chat') return history.filter((item) => String(item.processing_type || '').startsWith('chat:'));
    return history.filter((item) => item.processing_type === activeFilter);
  }, [activeFilter, history]);

  const dateLocale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';

  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FaHistory />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">{tr(lang, 'السجل المحفوظ', 'Saved History', 'Historique')}</h3>
            <p className="text-xs text-slate-500">{tr(lang, 'نتائج الاستخراج والمعالجات والدردشة.', 'Extraction, AI processing, and chat records.', 'Resultats extraction, analyse et chat.')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => loadHistory(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border border-slate-200 hover:bg-slate-50"
          disabled={loading}
        >
          <FaRedo className={loading ? 'animate-spin' : ''} />
          <span>{tr(lang, 'تحديث', 'Refresh', 'Actualiser')}</span>
        </button>
      </div>

      <div className="mb-3">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 mb-2">
          <FaFilter />
          <span>{tr(lang, 'تصفية النوع', 'Filter by type', 'Filtrer par type')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const labelMap = {
              all: tr(lang, 'الكل', 'All', 'Tout'),
              extract: tr(lang, 'استخراج', 'Extraction', 'Extraction'),
              summary: tr(lang, 'تلخيص', 'Summary', 'Resume'),
              steps: tr(lang, 'خطوات', 'Steps', 'Etapes'),
              resources: tr(lang, 'موارد', 'Resources', 'Ressources'),
              'all-analysis': tr(lang, 'معالجة كاملة', 'Full Analysis', 'Analyse complete'),
              chat: tr(lang, 'شات', 'Chat', 'Chat')
            };
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs border transition ${
                  active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {labelMap[filter]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">
        {tr(lang, 'إجمالي العناصر:', 'Total items:', 'Total elements:')} <span className="font-bold text-slate-700">{filteredHistory.length}</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-5 text-center">{tr(lang, 'جارٍ التحميل...', 'Loading...', 'Chargement...')}</p>
      ) : filteredHistory.length === 0 ? (
        <p className="text-sm text-slate-500 py-5 text-center">{tr(lang, 'لا توجد عناصر محفوظة.', 'No saved records.', 'Aucun element enregistre.')}</p>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.video_title || item.video_id}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.video_id}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                    <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5">
                      {mapTypeLabel(item.processing_type, lang)}
                    </span>
                    <span className="text-slate-500">{new Date(item.created_at).toLocaleString(dateLocale)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <FaEye />
                    <span>{tr(lang, 'عرض', 'View', 'Voir')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <FaTrash />
                    <span>{tr(lang, 'حذف', 'Delete', 'Supprimer')}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h4 className="font-black text-slate-900">{selectedItem.video_title || selectedItem.video_id}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {mapTypeLabel(selectedItem.processing_type, lang)} • {new Date(selectedItem.created_at).toLocaleString(dateLocale)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-0">
              <section className="p-4 border-b md:border-b-0 md:border-l border-slate-200">
                <h5 className="font-bold text-slate-800 mb-2">{tr(lang, 'النص الأصلي', 'Original Transcript', 'Transcription originale')}</h5>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-[65vh] overflow-auto text-sm whitespace-pre-wrap break-words">
                  {selectedItem.transcript || tr(lang, 'لا يوجد نص.', 'No transcript.', 'Aucune transcription.')}
                </div>
              </section>
              <section className="p-4">
                <h5 className="font-bold text-slate-800 mb-2">{tr(lang, 'الناتج', 'Result', 'Resultat')}</h5>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-[65vh] overflow-auto text-sm whitespace-pre-wrap break-words">
                  {selectedItem.ai_result || tr(lang, 'لا يوجد ناتج محفوظ لهذا العنصر.', 'No saved result for this record.', 'Aucun resultat enregistre pour cet element.')}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedHistory;

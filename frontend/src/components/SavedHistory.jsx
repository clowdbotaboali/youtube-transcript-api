import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCheck, FaEdit, FaEye, FaFilter, FaHistory, FaRedo, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { cleanText, LANG, tr } from '../utils/lang';
import { getBaseProcessingType } from '../utils/processingType';

const FILTERS = [
  'all',
  'extract',
  'summary',
  'key-insights',
  'clean-transcript',
  'proper-notes',
  'steps',
  'resources',
  'study-kit',
  'content-kit',
  'all-analysis',
  'chat'
];
const HISTORY_CACHE_TTL_MS = 1000 * 60 * 10;
const TITLE_UPDATED_EVENT = 'video-title-updated';

function defaultThumbnail(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

function parseExtractMeta(record) {
  const fallback = {
    method: '',
    thumbnailUrl: defaultThumbnail(record?.video_id),
    descriptionLinks: [],
    descriptionInstructions: []
  };

  const raw = String(record?.ai_result || '').trim();
  if (!raw || !raw.startsWith('{')) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return {
      method: cleanText(parsed.method || ''),
      thumbnailUrl: cleanText(parsed.thumbnailUrl || fallback.thumbnailUrl),
      descriptionLinks: Array.isArray(parsed.descriptionLinks)
        ? parsed.descriptionLinks.map((item) => cleanText(item)).filter(Boolean).slice(0, 20)
        : [],
      descriptionInstructions: Array.isArray(parsed.descriptionInstructions)
        ? parsed.descriptionInstructions.map((item) => cleanText(item)).filter(Boolean).slice(0, 10)
        : []
    };
  } catch {
    return fallback;
  }
}

function mapTypeLabel(type, lang) {
  const baseType = getBaseProcessingType(type);
  if (baseType === 'extract') return tr(lang, 'استخراج', 'Extraction', 'Extraction');
  if (baseType === 'summary') return tr(lang, 'ملخص', 'Summary', 'Résumé');
  if (baseType === 'key-insights') return tr(lang, 'أهم الأفكار', 'Key Insights', 'Idées clés');
  if (baseType === 'clean-transcript') return tr(lang, 'تنظيف النص', 'Clean Transcript', 'Transcription nettoyée');
  if (baseType === 'proper-notes') return tr(lang, 'ملاحظات مرتبة', 'Proper Notes', 'Notes structurées');
  if (baseType === 'steps') return tr(lang, 'خطوات', 'Steps', 'Étapes');
  if (baseType === 'resources') return tr(lang, 'موارد', 'Resources', 'Ressources');
  if (baseType === 'study-kit') return tr(lang, 'حزمة دراسة', 'Study Kit', "Pack d'étude");
  if (baseType === 'content-kit') return tr(lang, 'حزمة محتوى', 'Content Kit', 'Pack contenu');
  if (baseType === 'all') return tr(lang, 'تحليل متكامل', 'Comprehensive Analysis', 'Analyse complète');
  if (baseType === 'chat') return tr(lang, 'شات', 'Chat', 'Chat');
  return baseType || tr(lang, 'أخرى', 'Other', 'Autre');
}

function SavedHistory({ apiUrl = defaultApiUrl, user, lang = LANG.ar, onNotify }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [renaming, setRenaming] = useState(false);
  const cacheKey = user?.id ? `saved-history:${apiUrl}:${user.id}` : '';

  const notifyRef = useRef(onNotify);
  const langRef = useRef(lang);

  useEffect(() => {
    notifyRef.current = onNotify;
  }, [onNotify]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const notify = useCallback((type, message) => {
    const fn = notifyRef.current;
    if (typeof fn === 'function') fn(type, message);
  }, []);

  const readCache = useCallback(() => {
    if (!cacheKey || typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(cacheKey);
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
        window.localStorage.setItem(
          cacheKey,
          JSON.stringify({
            savedAt: Date.now(),
            items: Array.isArray(items) ? items : []
          })
        );
      } catch {
        // ignore cache write failures
      }
    },
    [cacheKey]
  );

  const applyVideoTitleUpdate = useCallback(
    (videoId, title) => {
      setHistory((prev) => {
        const next = prev.map((item) => (item.video_id === videoId ? { ...item, video_title: title } : item));
        writeCache(next);
        return next;
      });
      setSelectedItem((prev) => (prev && prev.video_id === videoId ? { ...prev, video_title: title } : prev));
    },
    [writeCache]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = (event) => {
      const videoId = event?.detail?.videoId;
      const title = event?.detail?.title;
      if (!videoId || !title) return;
      applyVideoTitleUpdate(videoId, title);
    };
    window.addEventListener(TITLE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(TITLE_UPDATED_EVENT, handler);
  }, [applyVideoTitleUpdate]);

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
          notify('error', tr(langRef.current, 'تعذر تحميل السجل.', 'Failed to load history.', "Echec du chargement de l'historique."));
        }
      } catch {
        notify('error', tr(langRef.current, 'فشل الاتصال بالخادم.', 'Connection failed.', 'Echec de connexion.'));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [apiUrl, notify, readCache, user?.id, writeCache]
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
    if (!window.confirm(tr(lang, 'هل تريد حذف هذا العنصر؟', 'Delete this item?', 'Supprimer cet élément ?'))) return;
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

  const startRename = (item) => {
    setEditingItemId(item.id);
    setEditingTitle(cleanText(item.video_title || item.video_id || ''));
  };

  const cancelRename = () => {
    setEditingItemId(null);
    setEditingTitle('');
  };

  const submitRename = async (item) => {
    const trimmed = String(editingTitle || '').trim();
    if (!trimmed) {
      notify('error', tr(lang, 'اكتب اسمًا صالحًا.', 'Enter a valid title.', 'Saisissez un titre valide.'));
      return;
    }
    setRenaming(true);
    try {
      const response = await fetch(`${apiUrl}/api/history/${item.id}/title`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders())
        },
        body: JSON.stringify({ title: trimmed })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success && data.data?.videoId && data.data?.title) {
        applyVideoTitleUpdate(data.data.videoId, data.data.title);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(TITLE_UPDATED_EVENT, {
              detail: { videoId: data.data.videoId, title: data.data.title }
            })
          );
        }
        cancelRename();
      } else {
        notify('error', tr(lang, 'تعذر تعديل الاسم.', 'Failed to rename item.', 'Echec de mise à jour du titre.'));
      }
    } catch {
      notify('error', tr(lang, 'فشل الاتصال بالخادم.', 'Connection failed.', 'Echec de connexion.'));
    } finally {
      setRenaming(false);
    }
  };

  const typeFilteredHistory = useMemo(() => {
    if (activeFilter === 'all') return history;
    if (activeFilter === 'all-analysis') {
      return history.filter((item) => getBaseProcessingType(item.processing_type) === 'all');
    }
    if (activeFilter === 'chat') {
      return history.filter((item) => getBaseProcessingType(item.processing_type) === 'chat');
    }
    return history.filter((item) => getBaseProcessingType(item.processing_type) === activeFilter);
  }, [activeFilter, history]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return typeFilteredHistory;
    return typeFilteredHistory.filter((item) => {
      const title = cleanText(item.video_title || '').toLowerCase();
      const videoId = String(item.video_id || '').toLowerCase();
      const type = getBaseProcessingType(item.processing_type);
      return title.includes(query) || videoId.includes(query) || type.includes(query);
    });
  }, [search, typeFilteredHistory]);

  const dateLocale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  const selectedMeta = selectedItem ? parseExtractMeta(selectedItem) : null;
  const selectedBaseType = getBaseProcessingType(selectedItem?.processing_type);
  const selectedResult =
    selectedBaseType === 'extract'
      ? [
          selectedMeta?.method
            ? `${tr(lang, 'طريقة الاستخراج', 'Extraction method', "Méthode d'extraction")}: ${selectedMeta.method}`
            : '',
          selectedMeta?.descriptionLinks?.length
            ? `${tr(lang, 'روابط الوصف', 'Description links', 'Liens de description')}:\n${selectedMeta.descriptionLinks.join('\n')}`
            : '',
          selectedMeta?.descriptionInstructions?.length
            ? `${tr(lang, 'تعليمات الوصف', 'Description instructions', 'Instructions de description')}:\n${selectedMeta.descriptionInstructions.join('\n')}`
            : ''
        ]
          .filter(Boolean)
          .join('\n\n')
      : cleanText(selectedItem?.ai_result || '');

  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FaHistory />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">{tr(lang, 'السجل المحفوظ', 'Saved History', 'Historique')}</h3>
            <p className="text-xs text-slate-500">
              {tr(lang, 'نتائج الاستخراج والمعالجات والدردشة.', 'Extraction, AI processing, and chat records.', 'Extraction, analyse IA et chat.')}
            </p>
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

      <div className="rounded-xl border border-slate-200 px-3 py-2 mb-3 flex items-center gap-2">
        <FaSearch className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tr(
            lang,
            'ابحث بالاسم أو معرف الفيديو أو نوع المعالجة...',
            'Search by title, video ID, or processing type...',
            'Rechercher par titre, ID video ou type...'
          )}
          className="w-full bg-transparent outline-none text-sm"
        />
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
              summary: tr(lang, 'ملخص', 'Summary', 'Résumé'),
              'key-insights': tr(lang, 'أهم الأفكار', 'Key Insights', 'Idées clés'),
              'clean-transcript': tr(lang, 'تنظيف النص', 'Clean Transcript', 'Transcription nettoyée'),
              'proper-notes': tr(lang, 'ملاحظات مرتبة', 'Proper Notes', 'Notes structurées'),
              steps: tr(lang, 'خطوات', 'Steps', 'Étapes'),
              resources: tr(lang, 'موارد', 'Resources', 'Ressources'),
              'study-kit': tr(lang, 'حزمة دراسة', 'Study Kit', "Pack d'étude"),
              'content-kit': tr(lang, 'حزمة محتوى', 'Content Kit', 'Pack contenu'),
              'all-analysis': tr(lang, 'تحليل متكامل', 'Comprehensive', 'Analyse complète'),
              chat: tr(lang, 'شات', 'Chat', 'Chat')
            };
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs border transition ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {labelMap[filter]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">
        {tr(lang, 'إجمالي العناصر:', 'Total items:', 'Total éléments:')}{' '}
        <span className="font-bold text-slate-700">{filteredHistory.length}</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-5 text-center">{tr(lang, 'جارٍ التحميل...', 'Loading...', 'Chargement...')}</p>
      ) : filteredHistory.length === 0 ? (
        <p className="text-sm text-slate-500 py-5 text-center">{tr(lang, 'لا توجد عناصر محفوظة.', 'No saved records.', 'Aucun élément enregistré.')}</p>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => {
            const baseType = getBaseProcessingType(item.processing_type);
            const meta = parseExtractMeta(item);
            const thumbnail = meta.thumbnailUrl || defaultThumbnail(item.video_id);
            return (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-start gap-3">
                  <img
                    src={thumbnail}
                    alt={item.video_title || item.video_id}
                    className="w-20 sm:w-24 h-12 sm:h-14 rounded-lg border border-slate-200 object-cover bg-slate-100 flex-shrink-0"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => submitRename(item)}
                          disabled={renaming}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                        >
                          <FaCheck />
                          <span>{tr(lang, 'حفظ', 'Save', 'Enregistrer')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          disabled={renaming}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-white"
                        >
                          <FaTimes />
                          <span>{tr(lang, 'إلغاء', 'Cancel', 'Annuler')}</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-900 truncate">{cleanText(item.video_title || item.video_id)}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.video_id}</p>
                      </>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                      <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5">
                        {mapTypeLabel(baseType, lang)}
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
                      onClick={() => startRename(item)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <FaEdit />
                      <span>{tr(lang, 'إعادة تسمية', 'Rename', 'Renommer')}</span>
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
            );
          })}
        </div>
      )}

      {selectedItem ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedMeta?.thumbnailUrl || defaultThumbnail(selectedItem.video_id)}
                  alt={selectedItem.video_title || selectedItem.video_id}
                  className="w-20 h-12 rounded-lg border border-slate-200 object-cover bg-slate-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 truncate">{selectedItem.video_title || selectedItem.video_id}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {mapTypeLabel(selectedItem.processing_type, lang)} •{' '}
                    {new Date(selectedItem.created_at).toLocaleString(dateLocale)}
                  </p>
                </div>
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
                <h5 className="font-bold text-slate-800 mb-2">{tr(lang, 'الناتج', 'Result', 'Résultat')}</h5>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-[65vh] overflow-auto text-sm whitespace-pre-wrap break-words">
                  {selectedResult ||
                    tr(
                      lang,
                      'لا يوجد ناتج محفوظ لهذا العنصر.',
                      'No saved result for this record.',
                      'Aucun résultat enregistré pour cet élément.'
                    )}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SavedHistory;


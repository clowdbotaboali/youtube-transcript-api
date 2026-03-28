import { useEffect, useRef, useState } from 'react';
import { FaFileAlt, FaSpinner, FaUpload, FaYoutube } from 'react-icons/fa';
import { getAuthHeaders } from '../utils/authHeaders';
import { formatApiErrorMessage, parseApiError } from '../utils/apiError';
import { LANG, tr } from '../utils/lang';
import { getOutputLanguageLabel, normalizeOutputLanguage, OUTPUT_LANGUAGE_OPTIONS } from '../utils/outputLanguage';
import { createManualSourceId } from '../utils/source';
import { parseTranscriptUploadContent } from '../utils/transcriptFile';

const INPUT_MODES = {
  youtube: 'youtube',
  text: 'text'
};

function VideoInput({
  onTranscriptExtracted,
  loading,
  setLoading,
  initialUrl,
  onUrlChange,
  apiUrl,
  lang = LANG.ar,
  outputLang = 'ar',
  onOutputLangChange,
  accessRestrictionMessage = ''
}) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState(INPUT_MODES.youtube);
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const fileInputRef = useRef(null);
  const manualTextareaRef = useRef(null);

  const isLowQualityTranscript = (text = '', wordCount = 0) => {
    const normalized = String(text || '')
      .replace(/\[[^\]]*]/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = normalized ? normalized.split(/\s+/).filter(Boolean) : [];
    const unique = new Set(words.map((word) => word.toLowerCase())).size;
    const count = Number(wordCount) || words.length;
    return count < 20 || unique < 10;
  };

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    setError('');
    setErrorCode('');
    setUploadMessage('');
  }, [mode]);

  useEffect(() => {
    if (mode !== INPUT_MODES.text) return;
    const timer = setTimeout(() => {
      manualTextareaRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [mode]);

  const applyApiError = (payload, status) => {
    const parsed = parseApiError(payload);
    setErrorCode(String(parsed.code || '').trim().toUpperCase());
    setError(
      formatApiErrorMessage({
        payload,
        status,
        lang,
        fallbackAr: 'حدث خطأ أثناء استخراج النص.',
        fallbackEn: 'Transcript extraction failed.',
        fallbackFr: "Echec de l'extraction de la transcription."
      })
    );
  };

  const switchToWrittenTextMode = ({ openUploader = false } = {}) => {
    setMode(INPUT_MODES.text);
    setUploadMessage(
      tr(
        lang,
        'يمكنك الآن لصق النص مباشرة أو رفع ملف نصي للمتابعة.',
        'You can now paste text directly or upload a text file to continue.',
        'Vous pouvez maintenant coller le texte ou telecharger un fichier texte pour continuer.'
      )
    );
    if (openUploader) {
      setTimeout(() => fileInputRef.current?.click(), 0);
    }
  };

  const handleManualSubmit = () => {
    const normalizedTranscript = String(manualText || '').trim();
    const normalizedTitle = String(manualTitle || '').trim();

    setError('');
    setErrorCode('');

    if (!normalizedTranscript) {
      setError(
        tr(
          lang,
          'يرجى لصق النص أولًا.',
          'Please paste transcript text first.',
          'Veuillez coller le texte avant de continuer.'
        )
      );
      return;
    }

    if (normalizedTranscript.length < 30) {
      setError(
        tr(
          lang,
          'النص قصير جدًا. أضف محتوى أوضح للمتابعة.',
          'The text is too short. Add more content to continue.',
          'Le texte est trop court. Ajoutez plus de contenu pour continuer.'
        )
      );
      return;
    }

    const wordCount = normalizedTranscript.split(/\s+/).filter(Boolean).length;
    onTranscriptExtracted?.({
      success: true,
      sourceType: 'manual-text',
      videoId: createManualSourceId(),
      videoTitle:
        normalizedTitle ||
        tr(lang, 'نص مضاف يدويًا', 'Manual transcript', 'Transcription ajoutee manuellement'),
      transcript: normalizedTranscript,
      wordCount,
      method: 'manual-text',
      thumbnailUrl: '',
      descriptionLinks: [],
      descriptionInstructions: []
    });

    setManualTitle('');
    setManualText('');
    setUploadMessage('');
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setErrorCode('');
    setUploadMessage('');

    const lowerName = String(file.name || '').toLowerCase();
    const supported = lowerName.endsWith('.txt') || lowerName.endsWith('.srt') || lowerName.endsWith('.vtt');
    if (!supported) {
      setError(
        tr(
          lang,
          'الملف غير مدعوم حاليًا. ارفع ملف txt أو srt أو vtt.',
          'Unsupported file. Please upload txt, srt, or vtt.',
          'Fichier non pris en charge. Telechargez un fichier txt, srt ou vtt.'
        )
      );
      return;
    }

    try {
      const raw = await file.text();
      const parsed = parseTranscriptUploadContent(raw, {
        fileName: file.name,
        fileType: file.type
      });

      if (!parsed.transcript) {
        setError(
          tr(
            lang,
            'تعذر استخراج نص صالح من الملف.',
            'Could not extract usable text from the file.',
            'Impossible dextraire un texte exploitable depuis le fichier.'
          )
        );
        return;
      }

      setManualText(parsed.transcript);
      if (!String(manualTitle || '').trim() && parsed.title) {
        setManualTitle(parsed.title);
      }
      setUploadMessage(
        tr(
          lang,
          'تم تحميل الملف وتجهيز النص بنجاح.',
          'File loaded and transcript prepared successfully.',
          'Le fichier a ete charge et le texte est pret.'
        )
      );
    } catch {
      setError(
        tr(
          lang,
          'تعذر قراءة الملف. جرّب ملفًا نصيًا آخر.',
          'Failed to read the file. Try another text file.',
          'Impossible de lire le fichier. Essayez un autre fichier texte.'
        )
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setErrorCode('');

    if (mode === INPUT_MODES.text) {
      handleManualSubmit();
      return;
    }

    if (!url.trim()) {
      setError(tr(lang, 'يرجى إدخال رابط فيديو يوتيوب', 'Please enter a YouTube URL', 'Veuillez saisir un lien YouTube'));
      return;
    }
    if (accessRestrictionMessage) {
      setError(String(accessRestrictionMessage));
      return;
    }

    setLoading(true);
    let settled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    const failSafeId = setTimeout(() => {
      if (!settled) {
        setErrorCode('REQUEST_TIMEOUT');
        setError(
          tr(
            lang,
            'انتهت المهلة. تأكد من تسجيل الدخول ثم حاول مرة أخرى.',
            'Request timed out. Please re-login and try again.',
            'Delai depasse. Reconnectez-vous puis reessayez.'
          )
        );
        setLoading(false);
      }
    }, 60000);

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/transcript/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ url: url.trim(), lang: outputLang }),
        signal: controller.signal
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        applyApiError(data, response.status);
        return;
      }

      if (data.success) {
        if (isLowQualityTranscript(data.transcript, data.wordCount)) {
          setError(
            tr(
              lang,
              'تم العثور على نص قصير أو غير مفيد. جرّب فيديو أوضح.',
              'Low-quality transcript detected. Try another video.',
              'Transcription faible detectee. Essayez une autre video.'
            )
          );
          return;
        }
        onTranscriptExtracted(data);
        setUrl('');
      } else {
        applyApiError(data, response.status);
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        setErrorCode('REQUEST_TIMEOUT');
        setError(
          tr(
            lang,
            'انتهت مهلة الاستخراج. جرّب مرة أخرى.',
            'Extraction timed out. Please try again.',
            "Delai d'extraction depasse. Reessayez."
          )
        );
      } else {
        setErrorCode('CONNECTION_FAILED');
        setError(tr(lang, 'فشل الاتصال بالخادم', 'Connection failed', 'Echec de connexion'));
      }
    } finally {
      settled = true;
      clearTimeout(timeoutId);
      clearTimeout(failSafeId);
      setLoading(false);
    }
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
    if (onUrlChange) onUrlChange(event.target.value);
  };

  const selectedOutputLang = normalizeOutputLanguage(outputLang);
  const shouldSuggestWrittenText =
    errorCode === 'TRANSCRIPT_UNAVAILABLE' ||
    errorCode === 'TRANSCRIPT_PROVIDER_EXHAUSTED' ||
    errorCode === 'TRANSCRIPT_PROVIDER_UNAVAILABLE' ||
    errorCode === 'REQUEST_TIMEOUT' ||
    errorCode === 'CONNECTION_FAILED';

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6"
      dir={lang === LANG.ar ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          {mode === INPUT_MODES.youtube ? <FaYoutube className="text-red-600 text-3xl" /> : <FaFileAlt className="text-blue-600 text-3xl" />}
          <h2 className="text-2xl font-black text-slate-900">
            {mode === INPUT_MODES.youtube
              ? tr(lang, 'استخراج السكريبت من يوتيوب', 'Extract transcript from YouTube', 'Extraire la transcription YouTube')
              : tr(lang, 'استخدم نصًا مكتوبًا', 'Use written transcript text', 'Utiliser un texte deja ecrit')}
          </h2>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode(INPUT_MODES.youtube)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === INPUT_MODES.youtube ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tr(lang, 'رابط يوتيوب', 'YouTube URL', 'Lien YouTube')}
          </button>
          <button
            type="button"
            onClick={() => setMode(INPUT_MODES.text)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === INPUT_MODES.text ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tr(lang, 'نص مكتوب', 'Written text', 'Texte ecrit')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === INPUT_MODES.youtube ? (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4 items-end">
            <div>
              <label htmlFor="youtube-url" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {tr(lang, 'رابط يوتيوب', 'YouTube URL', 'URL YouTube')}
              </label>
              <input
                id="youtube-url"
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder={tr(lang, 'أدخل رابط الفيديو هنا...', 'Paste YouTube URL here...', 'Collez le lien video ici...')}
                className="w-full h-[52px] px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                disabled={loading || Boolean(accessRestrictionMessage)}
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="extract-output-lang" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {tr(lang, 'لغة المخرجات', 'Output language', 'Langue de sortie')}
              </label>
              <select
                id="extract-output-lang"
                value={selectedOutputLang}
                onChange={(event) => onOutputLangChange?.(event.target.value)}
                disabled={loading || Boolean(accessRestrictionMessage)}
                className="w-full h-[52px] px-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition disabled:bg-gray-100"
              >
                {OUTPUT_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {getOutputLanguageLabel(option.code, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4 items-end">
              <div>
                <label htmlFor="manual-title" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {tr(lang, 'عنوان النص (اختياري)', 'Transcript title (optional)', 'Titre du texte (optionnel)')}
                </label>
                <input
                  id="manual-title"
                  type="text"
                  value={manualTitle}
                  onChange={(event) => setManualTitle(event.target.value)}
                  placeholder={tr(
                    lang,
                    'مثال: محاضرة التسويق الأسبوع الأول',
                    'Example: Week 1 marketing lecture',
                    'Exemple : cours marketing semaine 1'
                  )}
                  className="w-full h-[52px] px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  disabled={loading || Boolean(accessRestrictionMessage)}
                />
              </div>

              <div>
                <label htmlFor="manual-output-lang" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {tr(lang, 'لغة المخرجات', 'Output language', 'Langue de sortie')}
                </label>
                <select
                  id="manual-output-lang"
                  value={selectedOutputLang}
                  onChange={(event) => onOutputLangChange?.(event.target.value)}
                  disabled={loading || Boolean(accessRestrictionMessage)}
                  className="w-full h-[52px] px-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition disabled:bg-gray-100"
                >
                  {OUTPUT_LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {getOutputLanguageLabel(option.code, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3 flex-wrap">
                <label htmlFor="manual-transcript" className="block text-sm font-semibold text-slate-700">
                  {tr(lang, 'النص المكتوب', 'Transcript text', 'Texte de transcription')}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.srt,.vtt,text/plain,text/vtt,application/x-subrip"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={handlePickFile}
                    disabled={loading || Boolean(accessRestrictionMessage)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <FaUpload />
                    <span>{tr(lang, 'رفع ملف نصي', 'Upload text file', 'Telecharger un fichier texte')}</span>
                  </button>
                  <span className="text-xs text-slate-500">
                    {tr(lang, 'يدعم txt / srt / vtt', 'Supports txt / srt / vtt', 'Prend en charge txt / srt / vtt')}
                  </span>
                </div>
              </div>
              <textarea
                ref={manualTextareaRef}
                id="manual-transcript"
                rows={10}
                value={manualText}
                onChange={(event) => setManualText(event.target.value)}
                placeholder={tr(
                  lang,
                  'الصق السكريبت أو المحاضرة المكتوبة هنا، ثم تابع إلى الشرح والتلخيصات والشات.',
                  'Paste the transcript or written lecture here, then continue to summaries, notes, and chat.',
                  'Collez ici la transcription ou le texte du cours, puis continuez vers les resumes et le chat.'
                )}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition resize-y min-h-[220px]"
                disabled={loading || Boolean(accessRestrictionMessage)}
              />
            </div>
          </div>
        )}

        {accessRestrictionMessage ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{String(accessRestrictionMessage)}</p>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{String(error)}</p>
            {shouldSuggestWrittenText ? (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => switchToWrittenTextMode({ openUploader: false })}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-100"
                >
                  <FaFileAlt />
                  <span>
                    {tr(
                      lang,
                      'استخدم نصًا مكتوبًا بدلًا من ذلك',
                      'Use written text instead',
                      'Utiliser un texte ecrit a la place'
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => switchToWrittenTextMode({ openUploader: true })}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-100"
                >
                  <FaUpload />
                  <span>{tr(lang, 'رفع ملف نصي', 'Upload text file', 'Telecharger un fichier texte')}</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {uploadMessage ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{String(uploadMessage)}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || Boolean(accessRestrictionMessage)}
          className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading && mode === INPUT_MODES.youtube ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>{tr(lang, 'جارٍ الاستخراج...', 'Extracting...', 'Extraction en cours...')}</span>
            </>
          ) : (
            <span>
              {mode === INPUT_MODES.youtube
                ? tr(lang, 'استخراج النص', 'Extract transcript', 'Extraire la transcription')
                : tr(lang, 'استخدام هذا النص', 'Use this text', 'Utiliser ce texte')}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default VideoInput;

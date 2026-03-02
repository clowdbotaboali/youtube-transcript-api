import { FaExternalLinkAlt, FaLink, FaPlayCircle, FaRegLightbulb, FaSpinner } from 'react-icons/fa';
import { cleanText, LANG, tr } from '../utils/lang';

function VideoPreviewCard({
  data,
  localizedSubtitle = '',
  localizedSubtitleLoading = false,
  localizedDescriptionInstructions = [],
  localizedDescriptionLoading = false,
  outputLanguageLabel = '',
  lang = LANG.ar,
  extraContext = '',
  onExtraContextChange
}) {
  const videoId = String(data?.videoId || '').trim();
  if (!videoId) return null;

  const title = String(data?.videoTitle || videoId).trim();
  const thumbnailUrl = String(data?.thumbnailUrl || '').trim();
  const descriptionLinks = Array.isArray(data?.descriptionLinks) ? data.descriptionLinks : [];
  const descriptionInstructions = Array.isArray(data?.descriptionInstructions) ? data.descriptionInstructions : [];
  const instructionSource =
    Array.isArray(localizedDescriptionInstructions) && localizedDescriptionInstructions.length > 0
      ? localizedDescriptionInstructions
      : descriptionInstructions;

  const normalizeInstruction = (value) => {
    let line = cleanText(value || '').trim();
    if (!line) return '';
    line = line.replace(/https?:\/\/[^\s)]+/gi, ' ').trim();
    line = line.replace(/^\s*\d{1,2}:\d{2}(?::\d{2})?\s+/, '');
    line = line.replace(/^\s*(?:\d+[.)-]|[-*]|\u2022)\s+/, '');
    line = line.replace(/\s*(?:[\u2014\u2013-]|\.)\s*\d+\s*$/, '');
    line = line.replace(/\s+/g, ' ').trim();
    return line.length >= 10 ? line : '';
  };

  const cleanedInstructions = instructionSource
    .map(normalizeInstruction)
    .filter(Boolean)
    .slice(0, 8);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <div className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <iframe
              title={title}
              src={embedUrl}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              <FaPlayCircle />
              <span>{tr(lang, 'فتح على يوتيوب', 'Open on YouTube', 'Ouvrir sur YouTube')}</span>
            </a>
            {thumbnailUrl ? (
              <a
                href={thumbnailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                <FaExternalLinkAlt />
                <span>{tr(lang, 'فتح الصورة المصغرة', 'Open thumbnail', 'Ouvrir la miniature')}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {tr(lang, 'عنوان الفيديو الأصلي', 'Original video title', 'Titre original')}
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-black text-slate-900 leading-snug">{title}</h3>
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-blue-700">
                  {tr(lang, 'ملخص عنوان باللغة المختارة', 'Localized subtitle summary', 'Sous-titre résume localise')}
                </p>
                {outputLanguageLabel ? (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {outputLanguageLabel}
                  </span>
                ) : null}
              </div>
              {localizedSubtitleLoading ? (
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-blue-700">
                  <FaSpinner className="animate-spin" />
                  {tr(lang, 'جارٍ توليد العنوان المختصر...', 'Generating subtitle...', 'Generation du sous-titre...')}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-800 leading-relaxed">
                  {localizedSubtitle ||
                    tr(
                      lang,
                      'سيظهر هنا وصف قصير واضح للفيديو بعد الاستخراج.',
                      'A short clear subtitle will appear here after extraction.',
                      'Un sous-titre court apparaitra ici apres extraction.'
                    )}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <FaLink className="text-emerald-700" />
                <h4 className="font-bold text-emerald-900">
                  {tr(lang, 'روابط مذكورة في الوصف', 'Links from description', 'Liens trouves dans la description')}
                </h4>
              </div>
              {descriptionLinks.length > 0 ? (
                <ul className="space-y-1">
                  {descriptionLinks.slice(0, 8).map((link) => (
                    <li key={link}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-800 underline break-all hover:text-emerald-950"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-900/80">
                  {tr(
                    lang,
                    'لم يتم العثور على روابط مباشرة في وصف الفيديو.',
                    'No direct links were detected in the description.',
                    'Aucun lien direct detecte dans la description.'
                  )}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <FaRegLightbulb className="text-amber-700" />
                <h4 className="font-bold text-amber-900">
                  {tr(lang, 'تعليمات/خطوات من الوصف', 'Instructions from description', 'Instructions detectees')}
                </h4>
              </div>
              {localizedDescriptionLoading ? (
                <p className="inline-flex items-center gap-2 text-sm text-amber-900/90">
                  <FaSpinner className="animate-spin" />
                  {tr(
                    lang,
                    'Ø¬Ø§Ø±Ù ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø®Ø·ÙˆØ§Øª Ø¨Ø§Ù„Ù„ØºØ© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©...',
                    'Localizing steps to selected language...',
                    'Localisation des etapes en cours...'
                  )}
                </p>
              ) : cleanedInstructions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1 text-sm text-amber-900">
                  {cleanedInstructions.map((line, idx) => (
                    <li key={`${idx}-${line}`}>{line}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-amber-900/80">
                  {tr(
                    lang,
                    'لم يتم العثور على تعليمات واضحة في الوصف.',
                    'No clear instruction lines were detected in the description.',
                    "Aucune instruction claire detectee dans la description."
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3 sm:p-4">
        <label htmlFor="extra-context" className="block text-sm font-bold text-violet-900 mb-2">
          {tr(
            lang,
            'روابط/تعليمات إضافية (اختياري)',
            'Extra links/instructions (optional)',
            'Liens/instructions supplementaires (optionnel)'
          )}
        </label>
        <textarea
          id="extra-context"
          rows={3}
          value={extraContext}
          onChange={(event) => onExtraContextChange?.(event.target.value)}
          placeholder={tr(
            lang,
            'أضف أي روابط أو تعليمات غير موجودة في الوصف ليتم أخذها في الاعتبار أثناء التلخيص والدردشة.',
            'Add any links or instructions not found in description so AI can use them in summary/chat.',
            "Ajoutez des liens ou consignes absents de la description pour les utiliser dans l'analyse."
          )}
          className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
        />
      </div>
    </section>
  );
}

export default VideoPreviewCard;

import { tr } from '../utils/lang';
import { normalizeOutputLanguage } from '../utils/outputLanguage';
import { getOutputLanguageLabel } from '../utils/outputLanguage';
import VideoInput from './VideoInput';
import TranscriptDisplay from './TranscriptDisplay';
import ProcessingOptions from './ProcessingOptions';
import ResultsDisplay from './ResultsDisplay';
import VideoPreviewCard from './VideoPreviewCard';
import ChatAssistant from './ChatAssistant';
import LocalServerGuide from './LocalServerGuide';

export default function WorkspaceSection({
  lang,
  apiUrl,
  outputLang,
  onOutputLangChange,
  accountRestrictionMessage,
  canUseLocalGuide,
  showLocalGuide,
  onToggleLocalGuide,
  onApiUrlChange,
  extractLoading,
  setExtractLoading,
  selectedUrl,
  onTranscriptExtracted,
  transcriptData,
  transcriptForProcessing,
  videoBrief,
  videoBriefLoading,
  localizedDescriptionInstructions,
  localizedDescriptionLoading,
  extraContext,
  onExtraContextChange,
  onCreditsChange,
  onRequireTopup,
  processLoading,
  onProcess,
  aiResult,
  onSave,
  user,
  onNotify
}) {
  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, '\u0645\u0633\u0627\u062d\u0629 \u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u0644\u0645\u0639\u0631\u0641\u0629', 'Knowledge Extraction Workspace', 'Espace extraction de connaissance')}</h2>
        <p className="text-sm text-slate-600">{tr(lang, '\u0636\u0639 \u0627\u0644\u0631\u0627\u0628\u0637\u060c \u0627\u0633\u062a\u062e\u0631\u062c \u0627\u0644\u0646\u0635\u060c \u062b\u0645 \u062d\u0648\u0651\u0644 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0625\u0644\u0649 \u062e\u0637\u0648\u0627\u062a \u062a\u0646\u0641\u064a\u0630 \u0623\u0648 \u0627\u0633\u0623\u0644 \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a.', 'Paste a URL, extract knowledge, then generate execution-ready output or chat.', 'Collez un lien, extrayez la connaissance, puis generez une sortie executable ou utilisez le chat.')}</p>
      </div>
      {accountRestrictionMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
          {accountRestrictionMessage}
        </div>
      ) : null}
      {canUseLocalGuide && (
        <div className="mb-3 sm:mb-4">
          <button
            type="button"
            onClick={onToggleLocalGuide}
            className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
          >
            <span>{showLocalGuide ? tr(lang, '\u0625\u062e\u0641\u0627\u0621', 'Hide') : tr(lang, '\u0625\u0638\u0647\u0627\u0631', 'Show')}</span>
            <span>{tr(lang, '\u062f\u0644\u064a\u0644 \u0627\u0644\u062e\u0627\u062f\u0645 \u0627\u0644\u0645\u062d\u0644\u064a', 'Local backend guide')}</span>
          </button>
        </div>
      )}

      {canUseLocalGuide && showLocalGuide && (
        <LocalServerGuide apiUrl={apiUrl} onApiUrlChange={onApiUrlChange} lang={lang} />
      )}

      <VideoInput
        onTranscriptExtracted={onTranscriptExtracted}
        loading={extractLoading}
        setLoading={setExtractLoading}
        initialUrl={selectedUrl}
        apiUrl={apiUrl}
        lang={lang}
        outputLang={normalizeOutputLanguage(outputLang)}
        onOutputLangChange={(next) => onOutputLangChange(normalizeOutputLanguage(next))}
        accessRestrictionMessage={accountRestrictionMessage}
      />

      {transcriptData && (
        <div className="space-y-4 sm:space-y-6">
          <VideoPreviewCard
            data={transcriptData}
            localizedSubtitle={videoBrief}
            localizedSubtitleLoading={videoBriefLoading}
            localizedDescriptionInstructions={localizedDescriptionInstructions}
            localizedDescriptionLoading={localizedDescriptionLoading}
            outputLanguageLabel={getOutputLanguageLabel(outputLang, lang)}
            lang={lang}
            extraContext={extraContext}
            onExtraContextChange={onExtraContextChange}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-3 sm:p-4 border-b lg:border-b-0 lg:border-l border-gray-200">
                <TranscriptDisplay
                  transcript={transcriptData.transcript}
                  videoId={transcriptData.videoId}
                  wordCount={transcriptData.wordCount}
                  lang={lang}
                />
              </div>
              <div className="p-3 sm:p-4 h-[400px] sm:h-[600px] flex flex-col">
                <ChatAssistant
                  transcript={transcriptForProcessing || transcriptData.transcript}
                  videoId={transcriptData.videoId}
                  apiUrl={apiUrl}
                  onCreditsChange={onCreditsChange}
                  onRequireTopup={onRequireTopup}
                  lang={lang}
                />
              </div>
            </div>
          </div>

          <ProcessingOptions
            onProcess={onProcess}
            loading={processLoading}
            lang={lang}
          />

          {aiResult && (
            <ResultsDisplay
              result={aiResult.result}
              type={aiResult.type}
              videoId={transcriptData.videoId}
              videoTitle={transcriptData.videoTitle || transcriptData.videoId}
              transcript={transcriptForProcessing || transcriptData.transcript}
              onSave={onSave}
              user={user}
              lang={lang}
              onNotify={onNotify}
            />
          )}
        </div>
      )}
    </section>
  );
}

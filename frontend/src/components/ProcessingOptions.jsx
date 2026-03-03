import { useMemo, useState } from 'react';
import {
  FaBroom,
  FaGraduationCap,
  FaLayerGroup,
  FaLightbulb,
  FaListOl,
  FaSpinner,
  FaStickyNote,
  FaToolbox
} from 'react-icons/fa';
import { MdCampaign, MdSummarize } from 'react-icons/md';
import { LANG, tr } from '../utils/lang';

function ProcessingOptions({
  onProcess,
  loading,
  lang = LANG.ar
}) {
  const [summaryMode, setSummaryMode] = useState('lecture');

  const summaryModeConfig = useMemo(() => {
    if (summaryMode === 'study-review') {
      return {
        processType: 'summary:study-review',
        description: tr(
          lang,
          '\u0645\u0631\u0627\u062c\u0639\u0629 \u062f\u0631\u0627\u0633\u064a\u0629 \u0633\u0631\u064a\u0639\u0629: \u0623\u0647\u062f\u0627\u0641 \u062a\u0639\u0644\u0645\u060c \u062e\u0631\u064a\u0637\u0629 \u0645\u0641\u0627\u0647\u064a\u0645\u060c \u0648\u0627\u062e\u062a\u0628\u0627\u0631 \u0642\u0635\u064a\u0631.',
          'Study review mode: learning objectives, concept map, quick revision points, and short quiz.',
          "Mode revision: objectifs d'apprentissage, carte conceptuelle, points de revision et quiz court."
        )
      };
    }

    return {
      processType: 'summary:lecture',
      description: tr(
        lang,
        '\u062a\u0644\u062e\u064a\u0635 \u0627\u0644\u0645\u062d\u0627\u0636\u0631\u0629 \u0628\u062a\u0633\u0644\u0633\u0644 \u0627\u0644\u0634\u0631\u062d: \u0645\u062b\u0627\u0644\u0627\u062a \u0627\u0644\u0645\u062f\u0631\u0633\u060c \u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0645\u0624\u0643\u062f\u0629\u060c \u0648\u0627\u0644\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0648\u0627\u0644\u0623\u062e\u0637\u0627\u0621 \u0627\u0644\u0634\u0627\u0626\u0639\u0629.',
        'Lecture summary mode: timeline explanation with instructor examples, repeated points, and common mistakes.',
        'Mode cours: resume chronologique avec exemples du formateur, points repetes et erreurs frequentes.'
      )
    };
  }, [lang, summaryMode]);

  const options = useMemo(
    () => [
      {
        key: 'summary',
        type: summaryModeConfig.processType,
        baseType: 'summary',
        label: tr(lang, '\u0645\u0644\u062e\u0635 \u0634\u0627\u0645\u0644', 'Summary', 'Resume'),
        description: summaryModeConfig.description,
        icon: MdSummarize,
        colors: 'border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-600'
      },
      {
        key: 'key-insights',
        type: 'key-insights',
        label: tr(lang, '\u0623\u0647\u0645 \u0627\u0644\u0623\u0641\u0643\u0627\u0631', 'Key Insights', 'Idees cles'),
        description: tr(
          lang,
          '\u0623\u0647\u0645 \u0627\u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0629 \u0645\u0639 \u0633\u0628\u0628 \u0627\u0644\u0623\u0647\u0645\u064a\u0629 \u0648\u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0645\u0628\u0627\u0634\u0631.',
          'Top takeaways with practical implication for each point.',
          'Principaux enseignements avec implication pratique.'
        ),
        icon: FaLightbulb,
        colors: 'border-amber-500 hover:bg-amber-50 hover:border-amber-600 text-amber-600'
      },
      {
        key: 'clean-transcript',
        type: 'clean-transcript',
        label: tr(lang, '\u062a\u0646\u0638\u064a\u0641 \u0627\u0644\u0646\u0635', 'Clean Transcript', 'Transcription nettoyee'),
        description: tr(
          lang,
          '\u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0646\u0635 \u0643\u0646\u0633\u062e\u0629 \u0646\u0638\u064a\u0641\u0629 \u0628\u062f\u0648\u0646 \u062d\u0634\u0648 \u0623\u0648 \u062a\u0643\u0631\u0627\u0631 \u0623\u0648 \u0636\u0648\u0636\u0627\u0621.',
          'Rewrite transcript into clean readable text without filler.',
          'Reecriture propre sans repetitions ni bruit.'
        ),
        icon: FaBroom,
        colors: 'border-slate-500 hover:bg-slate-50 hover:border-slate-600 text-slate-600'
      },
      {
        key: 'proper-notes',
        type: 'proper-notes',
        label: tr(lang, '\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0645\u0631\u062a\u0628\u0629', 'Proper Notes', 'Notes structurees'),
        description: tr(
          lang,
          '\u0645\u0644\u062e\u0635 \u062f\u0631\u0627\u0633\u064a \u0645\u0646\u0638\u0645 \u0628\u0639\u0646\u0627\u0648\u064a\u0646 \u0641\u0631\u0639\u064a\u0629 \u0648\u0646\u0642\u0627\u0637 \u0648\u0627\u0636\u062d\u0629.',
          'Structured study notes with clean sectioning.',
          'Notes structurees avec sections claires.'
        ),
        icon: FaStickyNote,
        colors: 'border-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 text-emerald-600'
      },
      {
        key: 'steps',
        type: 'steps',
        label: tr(lang, '\u062e\u0637\u0629 \u062a\u0646\u0641\u064a\u0630', 'Action Steps', "Plan d'action"),
        description: tr(
          lang,
          '\u062e\u0637\u0648\u0627\u062a \u062a\u0646\u0641\u064a\u0630 \u0639\u0645\u0644\u064a\u0629 \u0645\u0631\u062a\u0628\u0629 \u0645\u0639 \u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0645\u062a\u0648\u0642\u0639\u0629 \u0644\u0643\u0644 \u062e\u0637\u0648\u0629.',
          'Ordered action plan with expected outcome per step.',
          'Plan d actions ordonne avec resultat attendu.'
        ),
        icon: FaListOl,
        colors: 'border-green-500 hover:bg-green-50 hover:border-green-600 text-green-600'
      },
      {
        key: 'resources',
        type: 'resources',
        label: tr(lang, '\u0623\u062f\u0648\u0627\u062a \u0648\u0645\u0648\u0627\u0631\u062f', 'Resources', 'Ressources'),
        description: tr(
          lang,
          '\u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u0644\u0623\u062f\u0648\u0627\u062a \u0648\u0627\u0644\u0645\u0646\u0635\u0627\u062a \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0648\u0627\u0644\u0645\u0631\u0627\u062c\u0639 \u0627\u0644\u0645\u0630\u0643\u0648\u0631\u0629.',
          'Extract all tools, links, references, and platforms.',
          'Extraction des outils, liens et references.'
        ),
        icon: FaToolbox,
        colors: 'border-purple-500 hover:bg-purple-50 hover:border-purple-600 text-purple-600'
      },
      {
        key: 'study-kit',
        type: 'study-kit',
        label: tr(lang, '\u062d\u0632\u0645\u0629 \u062f\u0631\u0627\u0633\u0629', 'Study Kit', "Pack d'etude"),
        description: tr(
          lang,
          '\u0623\u0647\u062f\u0627\u0641 \u062a\u0639\u0644\u0645 + \u0646\u0642\u0627\u0637 \u0645\u0631\u0627\u062c\u0639\u0629 + \u0623\u0633\u0626\u0644\u0629 \u062a\u062f\u0631\u064a\u0628\u064a\u0629 \u0633\u0631\u064a\u0639\u0629.',
          'Learning objectives, revision notes, and quick quiz.',
          'Objectifs, revision rapide et quiz.'
        ),
        icon: FaGraduationCap,
        colors: 'border-cyan-500 hover:bg-cyan-50 hover:border-cyan-600 text-cyan-600'
      },
      {
        key: 'content-kit',
        type: 'content-kit',
        label: tr(lang, '\u062d\u0632\u0645\u0629 \u0645\u062d\u062a\u0648\u0649', 'Content Kit', 'Pack contenu'),
        description: tr(
          lang,
          '\u0632\u0648\u0627\u064a\u0627 \u0646\u0634\u0631 \u062c\u0627\u0647\u0632\u0629: hooks + \u0623\u0641\u0643\u0627\u0631 \u0642\u0635\u064a\u0631\u0629 + \u0647\u064a\u0643\u0644 \u0645\u062d\u062a\u0648\u0649.',
          'Creator pack: hooks, short scripts, and content outline.',
          'Pack createur : hooks, scripts courts et plan contenu.'
        ),
        icon: MdCampaign,
        colors: 'border-rose-500 hover:bg-rose-50 hover:border-rose-600 text-rose-600'
      },
      {
        key: 'all',
        type: 'all',
        label: tr(lang, '\u062a\u062d\u0644\u064a\u0644 \u0645\u062a\u0643\u0627\u0645\u0644', 'Comprehensive Analysis', 'Analyse complete'),
        description: tr(
          lang,
          '\u0645\u0644\u0641 \u0634\u0627\u0645\u0644 \u064a\u062c\u0645\u0639 \u0627\u0644\u0645\u0644\u062e\u0635 \u0648\u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u0648\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0648\u0627\u0644\u0645\u0648\u0627\u0631\u062f.',
          'Full package: summary, insights, steps, and resources.',
          'Pack complet : resume, insights, etapes et ressources.'
        ),
        icon: FaLayerGroup,
        colors: 'border-indigo-500 hover:bg-indigo-50 hover:border-indigo-600 text-indigo-600'
      }
    ],
    [lang, summaryModeConfig]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="mb-4 sm:mb-5">
        <h3 className="text-xl font-black text-slate-900">
          {tr(lang, '\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a', 'AI Processing Options', 'Options de traitement IA')}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {tr(
            lang,
            '\u0627\u062e\u062a\u0631 \u0646\u0648\u0639 \u0627\u0644\u0645\u062e\u0631\u062c\u0627\u062a \u062b\u0645 \u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u062a\u064a \u062a\u0631\u064a\u062f \u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u0644\u0645\u0644\u062e\u0635\u0627\u062a \u0628\u0647\u0627.',
            'Choose the output type you want.',
            'Choisissez le type de sortie souhaite.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onProcess(option.type)}
            disabled={loading}
            className={`rounded-xl border-2 p-3 text-start transition duration-200 ${
              loading ? 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500' : option.colors
            }`}
          >
            <div className="flex items-start gap-3">
              {option.icon({ className: 'text-xl mt-0.5 flex-shrink-0' })}
              <div className="min-w-0">
                <div className="font-bold text-slate-900">{option.label}</div>
                <p className="text-xs mt-1 text-slate-600 leading-relaxed">{option.description}</p>

                {option.baseType === 'summary' ? (
                  <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1 w-full">
                      <button
                        type="button"
                        onClick={() => setSummaryMode('lecture')}
                        className={`flex-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
                          summaryMode === 'lecture' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        {tr(lang, '\u062a\u0644\u062e\u064a\u0635 \u0627\u0644\u0645\u062d\u0627\u0636\u0631\u0629', 'Lecture Summary', 'Resume du cours')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSummaryMode('study-review')}
                        className={`flex-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
                          summaryMode === 'study-review' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        {tr(lang, '\u0645\u0631\u0627\u062c\u0639\u0629 \u062f\u0631\u0627\u0633\u064a\u0629', 'Study Review', "Revision d'etude")}
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {tr(
                        lang,
                        '\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a \u0644\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u064a: \u062a\u0644\u062e\u064a\u0635 \u0627\u0644\u0645\u062d\u0627\u0636\u0631\u0629.',
                        'Default for educational content: Lecture Summary.',
                        'Par defaut pour le contenu educatif: Resume du cours.'
                      )}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span>{tr(lang, '\u062c\u0627\u0631\u064d \u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629...', 'Processing...', 'Traitement en cours...')}</span>
        </div>
      )}
    </div>
  );
}

export default ProcessingOptions;

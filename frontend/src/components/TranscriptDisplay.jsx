import { useState } from 'react';
import { FaCheck, FaCopy, FaDownload } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';
import { downloadTextAsPdf } from '../utils/pdf';
import { isManualSourceId } from '../utils/source';

function TranscriptDisplay({ transcript, videoId, wordCount, lang = LANG.ar }) {
  const [copied, setCopied] = useState(false);
  const sourceLabel = isManualSourceId(videoId)
    ? tr(lang, 'معرف المصدر', 'Source ID', 'ID source')
    : tr(lang, 'معرف الفيديو', 'Video ID', 'ID video');

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTextAsPdf({
      filename: `transcript-${videoId || Date.now()}.pdf`,
      title: tr(lang, 'النص الأصلي', 'Original Transcript', 'Transcription originale'),
      metadata: [
        `${sourceLabel}: ${videoId || '-'}`,
        `${tr(lang, 'عدد الكلمات', 'Word count', 'Nombre de mots')}: ${wordCount ?? 0}`
      ],
      body: transcript
    });
  };

  return (
    <div className="bg-white h-full" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800">{tr(lang, 'النص الأصلي', 'Original Transcript', 'Transcription originale')}</h3>
          <p className="text-sm text-gray-600">
            {tr(lang, 'عدد الكلمات', 'Word count', 'Nombre de mots')}: {wordCount}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition text-sm"
          >
            {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
            <span>{copied ? tr(lang, 'تم النسخ', 'Copied', 'Copie') : tr(lang, 'نسخ', 'Copy', 'Copier')}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition text-sm"
          >
            <FaDownload />
            <span>{tr(lang, 'تحميل PDF', 'Download PDF', 'Telecharger PDF')}</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{transcript}</p>
      </div>
    </div>
  );
}

export default TranscriptDisplay;

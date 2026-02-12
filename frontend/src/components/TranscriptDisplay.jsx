import { FaCopy, FaDownload, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

function TranscriptDisplay({ transcript, videoId, wordCount }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${videoId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800">النص الأصلي</h3>
          <p className="text-sm text-gray-600">عدد الكلمات: {wordCount}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition text-sm"
          >
            {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition text-sm"
          >
            <FaDownload />
            <span>تحميل</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
          {transcript}
        </p>
      </div>
    </div>
  );
}

export default TranscriptDisplay;

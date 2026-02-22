import { useState } from 'react';
import { FaTrash, FaPlus, FaExternalLinkAlt, FaBookmark } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function getInitialLinks() {
  try {
    const saved = localStorage.getItem('savedLinks');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function SavedLinks({ onSelectLink, lang = LANG.ar }) {
  const [links, setLinks] = useState(getInitialLinks);
  const [newLink, setNewLink] = useState('');
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const persist = (nextLinks) => {
    localStorage.setItem('savedLinks', JSON.stringify(nextLinks));
    setLinks(nextLinks);
  };

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleAddLink = () => {
    if (!newLink.trim()) {
      alert(tr(lang, 'من فضلك أدخل رابطًا', 'Please enter a link'));
      return;
    }

    const videoId = extractVideoId(newLink);
    if (!videoId) {
      alert(tr(lang, 'من فضلك أدخل رابط يوتيوب صحيح', 'Please enter a valid YouTube link'));
      return;
    }

    const linkData = {
      id: `${videoId}-${Date.now()}`,
      url: newLink.trim(),
      videoId,
      name: newName.trim() || `${tr(lang, 'فيديو', 'Video')} ${links.length + 1}`
    };

    persist([...links, linkData]);
    setNewLink('');
    setNewName('');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!confirm(tr(lang, 'هل تريد حذف هذا الرابط؟', 'Delete this link?'))) return;
    persist(links.filter((link) => link.id !== id));
  };

  const handleSelectLink = (link) => {
    if (onSelectLink) onSelectLink(link.url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBookmark className="text-green-600 text-xl" />
          <h3 className="font-bold text-gray-800">{tr(lang, 'الروابط المحفوظة', 'Saved Links')}</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm"
        >
          <FaPlus />
          <span>{tr(lang, 'إضافة', 'Add')}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder={tr(lang, 'رابط يوتيوب', 'YouTube URL')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm mb-2"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={tr(lang, 'اسم (اختياري)', 'Name (optional)')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddLink}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              {tr(lang, 'حفظ', 'Save')}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
            >
              {tr(lang, 'إلغاء', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-4">{tr(lang, 'لا توجد روابط محفوظة بعد', 'No saved links yet')}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleSelectLink(link)}
                  className="flex items-center gap-2 text-right hover:text-green-600 transition w-full"
                >
                  <FaExternalLinkAlt className="text-green-600 flex-shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-gray-800 truncate">{link.name}</p>
                    <p className="text-xs text-gray-500 truncate">{link.videoId}</p>
                  </div>
                </button>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                title={tr(lang, 'حذف', 'Delete')}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedLinks;

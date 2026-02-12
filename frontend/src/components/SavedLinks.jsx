import { useState, useEffect } from 'react';
import { FaLink, FaTrash, FaPlus, FaExternalLinkAlt, FaBookmark } from 'react-icons/fa';

function SavedLinks({ onSelectLink }) {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = () => {
    const saved = localStorage.getItem('savedLinks');
    if (saved) {
      setLinks(JSON.parse(saved));
    }
  };

  const saveLinks = (newLinks) => {
    localStorage.setItem('savedLinks', JSON.stringify(newLinks));
    setLinks(newLinks);
  };

  const handleAddLink = async () => {
    if (!newLink.trim()) {
      alert('يرجى إدخال الرابط');
      return;
    }

    const videoId = extractVideoId(newLink);
    
    if (!videoId) {
      alert('يرجى إدخال رابط يوتيوب صحيح');
      return;
    }

    const linkData = {
      id: Date.now(),
      url: newLink,
      videoId: videoId,
      name: newName.trim() || `فيديو ${links.length + 1}`,
      createdAt: new Date().toISOString()
    };

    saveLinks([...links, linkData]);
    setNewLink('');
    setNewName('');
    setShowForm(false);
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

  const handleDelete = (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;
    saveLinks(links.filter(link => link.id !== id));
  };

  const handleSelectLink = (link) => {
    if (onSelectLink) {
      onSelectLink(link.url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBookmark className="text-green-600 text-xl" />
          <h3 className="font-bold text-gray-800">الروابط المحفوظة</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm"
        >
          <FaPlus />
          <span>إضافة</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="رابط الفيديو (يوتيوب)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm mb-2"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم الفيديو (اختياري)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddLink}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              حفظ
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-4">
          لا توجد روابط محفوظة
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {links.map(link => (
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
                title="حذف"
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

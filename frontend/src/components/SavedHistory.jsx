import { useState, useEffect } from 'react';
import { FaHistory, FaTrash, FaEye, FaTimes } from 'react-icons/fa';

function SavedHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/history/list');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/history/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setHistory(history.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/history/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedItem(data.item);
      }
    } catch (error) {
      console.error('Failed to load item:', error);
    }
  };

  const typeLabels = {
    summary: 'تلخيص',
    steps: 'شرح الخطوات',
    resources: 'استخراج الموارد',
    all: 'معالجة كاملة'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <FaHistory className="text-blue-600 text-2xl" />
        <h3 className="text-xl font-bold text-gray-800">السجل المحفوظ</h3>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">جاري التحميل...</p>
      ) : history.length === 0 ? (
        <p className="text-center text-gray-600">لا توجد عناصر محفوظة</p>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {item.video_title || item.video_id}
                  </h4>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>النوع: {typeLabels[item.processing_type]}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(item.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="عرض"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold">
                {selectedItem.video_title || selectedItem.video_id}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">النص الأصلي:</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {selectedItem.transcript}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">النتيجة:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedItem.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedHistory;

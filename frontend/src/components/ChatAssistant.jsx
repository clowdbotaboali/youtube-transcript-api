import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaComments, FaLink, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';

function ChatAssistant({ transcript, videoId }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: 'مرحباً! 👋 أنا مساعدك الذكي. يمكنك سؤالي أي شيء عن النص أعلاه وسأكون سعيداً بمساعدتك!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [savedLinks, setSavedLinks] = useState([]);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          transcript: transcript,
          conversationId: conversationId
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: data.response
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: 'عذراً، حدث خطأ: ' + (data.error || 'فشل في إرسال الرسالة')
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'عذراً، فشل الاتصال بالخادم'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (conversationId) {
      try {
        await fetch('http://localhost:5000/api/chat/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ conversationId })
        });
      } catch (error) {
        console.error('Failed to clear conversation');
      }
    }
    setMessages([
      {
        id: 0,
        role: 'assistant',
        content: 'مرحباً! 👋 أنا مساعدك الذكي. يمكنك سؤالي أي شيء عن النص أعلاه وسأكون سعيداً بمساعدتك!'
      }
    ]);
    setConversationId(null);
    setSavedLinks([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const extractLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const saveLink = (link) => {
    if (!savedLinks.includes(link)) {
      setSavedLinks(prev => [...prev, link]);
    }
  };

  const removeLink = (link) => {
    setSavedLinks(prev => prev.filter(l => l !== link));
  };

  if (!transcript) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-full">
            <FaComments className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">مساعد الدردشة الذكي</h3>
            <p className="text-xs text-gray-600">اسألني أي شيء عن الفيديو</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 px-2 py-1 hover:bg-red-50 text-red-600 rounded transition text-xs"
          title="مسح المحادثة"
        >
          <FaTrash />
          <span>مسح</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-y-auto mb-3" ref={messagesContainerRef}>
          {messages.map((msg) => {
            const links = msg.role === 'assistant' ? extractLinks(msg.content) : [];
            const contentWithoutLinks = msg.content.replace(urlRegex, '').trim();
            
            return (
              <div
                key={msg.id}
                className={`flex gap-2 mb-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-indigo-500 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                  dir="rtl"
                >
                  {contentWithoutLinks && (
                    <p className="whitespace-pre-wrap leading-relaxed mb-2">
                      {contentWithoutLinks}
                    </p>
                  )}
                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {links.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          {savedLinks.includes(link) ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              <FaCheck className="text-xs" />
                              <span className="truncate max-w-[150px]">{link.substring(0, 30)}...</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => saveLink(link)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs"
                              title="حفظ الرابط"
                            >
                              <FaLink className="text-xs" />
                              <span className="truncate max-w-[150px]">{link.substring(0, 30)}...</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                <FaRobot />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {savedLinks.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-2 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                <FaLink />
                الروابط المحفوظة ({savedLinks.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {savedLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-100 transition text-xs"
                  >
                    <FaExternalLinkAlt />
                    <span className="truncate max-w-[100px]">{link.substring(0, 20)}...</span>
                  </a>
                  <button
                    onClick={() => removeLink(link)}
                    className="text-red-500 hover:text-red-700"
                    title="حذف"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 text-sm ${
              loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <FaPaperPlane />
            <span>إرسال</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

export default ChatAssistant;

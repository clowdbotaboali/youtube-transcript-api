import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaBan,
  FaCheck,
  FaCog,
  FaCreditCard,
  FaImage,
  FaKey,
  FaPauseCircle,
  FaPlayCircle,
  FaRobot,
  FaSignOutAlt,
  FaTimes,
  FaTrashAlt,
  FaUsers,
  FaWallet
} from 'react-icons/fa';
import SeoMeta from '../components/SeoMeta';
import AdminAiTab from '../components/AdminAiTab';
import AdminUsersTab from '../components/AdminUsersTab';
import defaultApiUrl from '../config';
import { cleanText, LANG, tr } from '../utils/lang';

const ADMIN_TOKEN_KEY = 'adminToken';
const TABS = {
  overview: 'overview',
  users: 'users',
  payments: 'payments',
  usage: 'usage',
  billing: 'billing',
  ai: 'ai',
  settings: 'settings'
};
const PROVIDERS = ['groq', 'openrouter', 'openai', 'google', 'anthropic'];
const EMPTY_PROVIDER_DRAFTS = Object.fromEntries(
  PROVIDERS.map((provider) => [provider, { label: '', apiKey: '' }])
);

function normalizeModelOption(model) {
  if (typeof model === 'string') {
    const id = cleanText(model);
    if (!id) return null;
    return { id, label: id, tier: '' };
  }
  if (!model || typeof model !== 'object') return null;

  const id = cleanText(model.id || model.model || model.name || model.value || '');
  if (!id) return null;

  const label = cleanText(model.label || model.displayName || model.name || id, id);
  const tier = cleanText(model.tier || model.category || '');
  return { id, label, tier };
}

function normalizeModelCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object') return {};
  const result = {};
  for (const [provider, models] of Object.entries(catalog)) {
    result[provider] = Array.isArray(models)
      ? models.map((item) => normalizeModelOption(item)).filter(Boolean)
      : [];
  }
  return result;
}

function serializeModelCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object') return {};
  const result = {};
  for (const [provider, models] of Object.entries(catalog)) {
    result[provider] = Array.isArray(models)
      ? models.map((item) => normalizeModelOption(item)?.id).filter(Boolean)
      : [];
  }
  return result;
}

function statusLabel(status, lang) {
  const value = String(status || '').toLowerCase();
  if (value === 'approved') return tr(lang, 'Ù…Ù‚Ø¨ÙˆÙ„', 'Approved', 'Approuve');
  if (value === 'rejected') return tr(lang, 'Ù…Ø±ÙÙˆØ¶', 'Rejected', 'Rejete');
  return tr(lang, 'Ù…Ø¹Ù„Ù‚', 'Pending', 'En attente');
}

function accessLabel(status, lang) {
  const value = String(status || 'active').toLowerCase();
  if (value === 'blocked') return tr(lang, 'Ù…Ø­Ø¸ÙˆØ±', 'Blocked', 'Bloque');
  if (value === 'suspended') return tr(lang, 'Ù…Ø¹Ù„Ù‚', 'Suspended', 'Suspendu');
  return tr(lang, 'Ù†Ø´Ø·', 'Active', 'Actif');
}

function badgeClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'approved' || value === 'active') return 'bg-emerald-100 text-emerald-700';
  if (value === 'rejected' || value === 'blocked') return 'bg-red-100 text-red-700';
  if (value === 'suspended') return 'bg-orange-100 text-orange-700';
  return 'bg-amber-100 text-amber-700';
}

function formatDate(value, lang) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString(lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US');
  } catch {
    return String(value);
  }
}

function shortId(value) {
  const text = String(value || '');
  if (text.length <= 14) return text;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function keyRuntimeBadgeClass(runtimeStatus) {
  const status = String(runtimeStatus || 'idle').toLowerCase();
  if (status === 'success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'failure') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
}

function keyRuntimeLabel(runtimeStatus, lang) {
  const status = String(runtimeStatus || 'idle').toLowerCase();
  if (status === 'success') return tr(lang, 'تم الاستخدام بنجاح', 'Working now', 'Actif maintenant');
  if (status === 'failure') return tr(lang, 'فشل آخر محاولة', 'Last check failed', 'Dernier test echoue');
  return tr(lang, 'لم يُختبر بعد في هذه الجلسة', 'Not tested yet in this session', 'Pas encore teste dans cette session');
}

function transcriptCreditBadgeClass(key) {
  const status = String(key?.creditsStatus || 'unknown').toLowerCase();
  if (typeof key?.availableCredits === 'number') {
    return key.availableCredits > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700';
  }
  if (status === 'exhausted') return 'bg-orange-100 text-orange-700';
  if (status === 'invalid') return 'bg-red-100 text-red-700';
  if (status === 'available') return 'bg-cyan-100 text-cyan-700';
  return 'bg-slate-100 text-slate-600';
}

function transcriptCreditLabel(key, lang) {
  if (typeof key?.availableCredits === 'number') {
    return tr(lang, `الكريديت: ${key.availableCredits}`, `Credits: ${key.availableCredits}`, `Credits: ${key.availableCredits}`);
  }
  const status = String(key?.creditsStatus || 'unknown').toLowerCase();
  if (status === 'exhausted') return tr(lang, 'الكريديت: 0 (منتهي)', 'Credits: 0 (exhausted)', 'Credits: 0 (epuises)');
  if (status === 'invalid') return tr(lang, 'مفتاح غير صالح', 'Invalid key', 'Cle invalide');
  if (status === 'available') {
    return tr(
      lang,
      'الكريديت متاح (العدد غير ظاهر من المزود)',
      'Credits available (count not exposed by provider)',
      'Credits disponibles (nombre non expose par le fournisseur)'
    );
  }
  return tr(lang, 'الكريديت: غير متاح', 'Credits: unavailable', 'Credits: indisponibles');
}

function subscriptionTierLabel(tier, lang) {
  const value = String(tier || 'free').toLowerCase();
  if (value === 'admin') return tr(lang, 'أدمن', 'Admin', 'Admin');
  if (value === 'pro' || value === 'paid') return tr(lang, 'مدفوع', 'Paid', 'Payant');
  return tr(lang, 'مجاني', 'Free', 'Gratuit');
}

function subscriptionTierBadgeClass(tier) {
  const value = String(tier || 'free').toLowerCase();
  if (value === 'admin') return 'bg-violet-100 text-violet-700';
  if (value === 'pro' || value === 'paid') return 'bg-cyan-100 text-cyan-700';
  return 'bg-slate-100 text-slate-700';
}

function userMonthlyQuotaHint(item, lang) {
  const isAdmin = String(item?.subscription_tier || '').toLowerCase() === 'admin';
  if (isAdmin) {
    return tr(lang, 'لا حد شهري (حساب إدارة).', 'No monthly cap (admin account).', 'Pas de limite mensuelle (compte admin).');
  }

  const eligible = Boolean(item?.monthlyQuotaEligible);
  const monthlyQuota = Math.max(Number(item?.monthlyQuota || 0), 0);
  const remaining = Math.max(Number(item?.monthlyQuotaRemaining || 0), 0);
  if (eligible && monthlyQuota > 0) {
    return tr(
      lang,
      `المتبقي ${remaining} من ${monthlyQuota} ضمن الحصة الشهرية.`,
      `${remaining} of ${monthlyQuota} monthly links remaining.`,
      `${remaining} sur ${monthlyQuota} liens mensuels restants.`
    );
  }
  if (eligible) {
    return tr(lang, 'الحصة الشهرية مفعّلة.', 'Monthly quota is enabled.', 'Le quota mensuel est active.');
  }
  return tr(
    lang,
    'بعد أول شحن مدفوع لا تنطبق الحصة المجانية الشهرية.',
    'Monthly free quota is disabled after first approved top-up.',
    'Le quota gratuit mensuel est desactive apres la premiere recharge approuvee.'
  );
}

function AdminPage({ apiUrl = defaultApiUrl, lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(TABS.overview);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyAction, setBusyAction] = useState('');

  const [loginForm, setLoginForm] = useState({ identifier: 'admin', password: '' });
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [settings, setSettings] = useState({ username: '', email: '', password: '' });

  const [billingConfig, setBillingConfig] = useState({
    accountName: '',
    instapayHandle: '',
    vodafoneCashNumber: '',
    supportContact: '',
    instructionsAr: '',
    instructionsEn: '',
    instructionsFr: ''
  });

  const [aiConfig, setAiConfig] = useState({
    selectedProvider: 'groq',
    selectedModel: 'llama-3.3-70b-versatile',
    providers: {},
    modelCatalog: {}
  });

  const [aiKeysDraft, setAiKeysDraft] = useState(() => ({ ...EMPTY_PROVIDER_DRAFTS }));
  const [transcriptApiMeta, setTranscriptApiMeta] = useState({
    keysCount: 0,
    activeKeyId: '',
    keys: [],
    updatedAt: null
  });
  const [transcriptKeyDraft, setTranscriptKeyDraft] = useState({ label: '', apiKey: '' });

  const authedFetch = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken('');
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        const errMessage = cleanText(
          typeof data.error === 'string'
            ? data.error
            : (data.error && typeof data.error === 'object' ? data.error.message : '')
        );
        throw new Error(errMessage || tr(lang, 'ÙØ´Ù„ Ø§Ù„Ø·Ù„Ø¨', 'Request failed', 'Echec de la requete'));
      }
      return data;
    },
    [apiUrl, token, lang]
  );

  const loadOverview = useCallback(async () => {
    const data = await authedFetch('/api/admin/overview');
    setOverview(data.data);
  }, [authedFetch]);

  const loadUsers = useCallback(async () => {
    const data = await authedFetch('/api/admin/users?limit=200&page=1');
    setUsers(Array.isArray(data.data) ? data.data : []);
  }, [authedFetch]);

  const loadPayments = useCallback(async () => {
    const data = await authedFetch('/api/admin/payments?limit=200&page=1');
    setPayments(Array.isArray(data.data) ? data.data : []);
  }, [authedFetch]);

  const loadUsage = useCallback(async () => {
    try {
      const data = await authedFetch('/api/admin/usage?days=7');
      setUsageStats(data.data || null);
    } catch {
      setUsageStats({
        days: 7,
        totalRequests: 0,
        successCount: 0,
        failedCount: 0,
        successRate: 0,
        avgResponseMs: 0,
        byRoute: []
      });
    }
  }, [authedFetch]);

  const loadSettings = useCallback(async () => {
    const data = await authedFetch('/api/admin/settings');
    setSettings({
      username: data.data?.username || '',
      email: data.data?.email || '',
      password: ''
    });
  }, [authedFetch]);

  const loadBillingConfig = useCallback(async () => {
    const data = await authedFetch('/api/admin/billing-config');
    setBillingConfig({
      accountName: cleanText(data.data?.accountName),
      instapayHandle: cleanText(data.data?.instapayHandle),
      vodafoneCashNumber: cleanText(data.data?.vodafoneCashNumber),
      supportContact: cleanText(data.data?.supportContact),
      instructionsAr: cleanText(data.data?.instructionsAr),
      instructionsEn: cleanText(data.data?.instructionsEn),
      instructionsFr: cleanText(data.data?.instructionsFr)
    });
  }, [authedFetch]);

  const applyAiConfigData = useCallback((payload) => {
    const selectedProvider = payload?.selectedProvider || 'groq';
    const modelCatalog = normalizeModelCatalog(payload?.modelCatalog);
    const selectedModel = String(payload?.selectedModel || '').trim();
    const providerModels = Array.isArray(modelCatalog[selectedProvider]) ? modelCatalog[selectedProvider] : [];
    setAiConfig({
      selectedProvider,
      selectedModel: selectedModel || providerModels[0]?.id || '',
      providers: payload?.providers || {},
      modelCatalog
    });
  }, []);

  const loadAiConfig = useCallback(async () => {
    const data = await authedFetch('/api/admin/ai/config');
    applyAiConfigData(data.data || {});
  }, [authedFetch, applyAiConfigData]);

  const loadTranscriptApiConfig = useCallback(async ({ forceCredits = false } = {}) => {
    const suffix = forceCredits ? '?forceCredits=1' : '';
    const data = await authedFetch(`/api/admin/transcript-api/config${suffix}`);
    setTranscriptApiMeta({
      keysCount: Number(data.data?.keysCount || 0),
      activeKeyId: cleanText(data.data?.activeKeyId),
      keys: Array.isArray(data.data?.keys) ? data.data.keys : [],
      updatedAt: data.data?.updatedAt || null
    });
  }, [authedFetch]);
  const loadAll = useCallback(async ({ forceCredits = false } = {}) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        loadOverview(),
        loadUsers(),
        loadPayments(),
        loadUsage(),
        loadSettings(),
        loadBillingConfig(),
        loadAiConfig(),
        loadTranscriptApiConfig({ forceCredits })
      ]);
    } catch (err) {
      setError(cleanText(err.message) || tr(lang, 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ø¯Ù…Ù†', 'Failed to load admin data', 'Echec du chargement admin'));
    } finally {
      setLoading(false);
    }
  }, [token, loadOverview, loadUsers, loadPayments, loadUsage, loadSettings, loadBillingConfig, loadAiConfig, loadTranscriptApiConfig, lang]);

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token, loadAll]);

  const withAction = async (name, fn) => {
    setBusyAction(name);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (err) {
      setError(cleanText(err.message) || tr(lang, 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹', 'Unexpected error', 'Erreur inattendue'));
    } finally {
      setBusyAction('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.token) {
        const loginError = cleanText(
          typeof data.error === 'string'
            ? data.error
            : (data.error && typeof data.error === 'object' ? data.error.message : '')
        );
        throw new Error(loginError || tr(lang, 'ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø£Ø¯Ù…Ù†', 'Admin login failed', 'Connexion admin echouee'));
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setLoginForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(cleanText(err.message) || tr(lang, 'ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø£Ø¯Ù…Ù†', 'Admin login failed', 'Connexion admin echouee'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken('');
    setOverview(null);
    setUsers([]);
    setPayments([]);
    setSettings({ username: '', email: '', password: '' });
    setBillingConfig({
      accountName: '',
      instapayHandle: '',
      vodafoneCashNumber: '',
      supportContact: '',
      instructionsAr: '',
      instructionsEn: '',
      instructionsFr: ''
    });
    setAiConfig({ selectedProvider: 'groq', selectedModel: 'llama-3.3-70b-versatile', providers: {}, modelCatalog: {} });
    setAiKeysDraft({ ...EMPTY_PROVIDER_DRAFTS });
    setTranscriptApiMeta({ keysCount: 0, activeKeyId: '', keys: [], updatedAt: null });
    setTranscriptKeyDraft({ label: '', apiKey: '' });
    setTab(TABS.overview);
  };

  const reviewPayment = async (paymentId, status) => {
    await withAction(`payment:${paymentId}:${status}`, async () => {
      await authedFetch(`/api/admin/payments/${paymentId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      await Promise.all([loadPayments(), loadUsers(), loadOverview()]);
      setNotice(status === 'approved' ? tr(lang, 'ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø·Ù„Ø¨.', 'Payment approved.') : tr(lang, 'ØªÙ… Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨.', 'Payment rejected.'));
    });
  };

  const setUserStatus = async (userId, action) => {
    await withAction(`user:${userId}:${action}`, async () => {
      await authedFetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      await Promise.all([loadUsers(), loadOverview()]);
      setNotice(tr(lang, 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù….', 'User status updated.'));
    });
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      tr(lang, 'Ø³ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆÙƒÙ„ Ø¨ÙŠØ§Ù†Ø§ØªÙ‡ Ù†Ù‡Ø§Ø¦ÙŠÙ‹Ø§. Ù‡Ù„ ØªØ±ÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©ØŸ', 'This will permanently delete the user and related data. Continue?')
    );
    if (!confirmed) return;

    await withAction(`delete:${userId}`, async () => {
      await authedFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      await Promise.all([loadUsers(), loadOverview(), loadPayments()]);
      setNotice(tr(lang, 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù….', 'User deleted.'));
    });
  };

  const saveBilling = async (e) => {
    e.preventDefault();
    await withAction('billing:save', async () => {
      await authedFetch('/api/admin/billing-config', {
        method: 'POST',
        body: JSON.stringify(billingConfig)
      });
      await loadBillingConfig();
      setNotice(tr(lang, 'ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¯ÙØ¹.', 'Billing settings saved.'));
    });
  };

  const loadProviderModels = async (provider, keyId = '') => {
    await withAction(`models:${provider}`, async () => {
      const data = await authedFetch('/api/admin/ai/models', {
        method: 'POST',
        body: JSON.stringify({ provider, ...(keyId ? { keyId } : {}) })
      });
      applyAiConfigData(data.data?.config || {});
      setNotice(tr(lang, 'تم تحميل الموديلات بنجاح.', 'Provider models loaded.'));
    });
  };

  const addAiProviderKey = async (provider) => {
    const draft = aiKeysDraft[provider] || {};
    const apiKey = cleanText(draft.apiKey).trim();
    const label = cleanText(draft.label).trim();
    if (!apiKey) {
      setError(tr(lang, 'أدخل API Key قبل الإضافة.', 'Enter API key before adding.'));
      return;
    }

    await withAction(`ai:add:${provider}`, async () => {
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify({
          keyAction: {
            type: 'add',
            provider,
            apiKey,
            label,
            enabled: true,
            setActive: true
          }
        })
      });
      applyAiConfigData(data.data || {});
      setAiKeysDraft((prev) => ({ ...prev, [provider]: { label: '', apiKey: '' } }));
      setNotice(tr(lang, 'تمت إضافة المفتاح وحفظه.', 'API key added.'));
    });
  };

  const setAiProviderActiveKey = async (provider, keyId) => {
    await withAction(`ai:active:${provider}:${keyId}`, async () => {
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify({
          keyAction: {
            type: 'set-active',
            provider,
            keyId
          }
        })
      });
      applyAiConfigData(data.data || {});
      setNotice(tr(lang, 'تم تعيين المفتاح الفعّال.', 'Active key updated.'));
    });
  };

  const setAiProviderKeyEnabled = async (provider, keyId, enabled) => {
    await withAction(`ai:enabled:${provider}:${keyId}`, async () => {
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify({
          keyAction: {
            type: 'set-enabled',
            provider,
            keyId,
            enabled
          }
        })
      });
      applyAiConfigData(data.data || {});
      setNotice(enabled ? tr(lang, 'تم تفعيل المفتاح.', 'Key enabled.') : tr(lang, 'تم تعطيل المفتاح.', 'Key disabled.'));
    });
  };

  const deleteAiProviderKey = async (provider, keyId) => {
    await withAction(`ai:delete:${provider}:${keyId}`, async () => {
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify({
          keyAction: {
            type: 'delete',
            provider,
            keyId
          }
        })
      });
      applyAiConfigData(data.data || {});
      setNotice(tr(lang, 'تم حذف المفتاح.', 'Key deleted.'));
    });
  };
  const saveAi = async (e) => {
    e.preventDefault();
    await withAction('ai:save', async () => {
      const payload = {
        selectedProvider: aiConfig.selectedProvider,
        selectedModel: aiConfig.selectedModel,
        modelCatalog: serializeModelCatalog(aiConfig.modelCatalog)
      };
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      applyAiConfigData(data.data || {});
      setAiKeysDraft({ ...EMPTY_PROVIDER_DRAFTS });
      setNotice(tr(lang, 'تم حفظ إعدادات الذكاء الاصطناعي.', 'AI settings saved.'));
    });
  };

  const clearAiProviderKey = async (provider) => {
    const confirmed = window.confirm(
      tr(
        lang,
        'سيتم حذف كل مفاتيح هذا المزود. هل تريد المتابعة؟',
        'This will remove all keys for this provider. Continue?'
      )
    );
    if (!confirmed) return;

    await withAction(`ai:clear:${provider}`, async () => {
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify({
          keyAction: {
            type: 'clear-all',
            provider
          }
        })
      });
      applyAiConfigData(data.data || {});
      setAiKeysDraft((prev) => ({ ...prev, [provider]: { label: '', apiKey: '' } }));
      setNotice(tr(lang, 'تم مسح مفاتيح المزود.', 'Provider keys cleared.'));
    });
  };

  const addTranscriptApiKey = async (e) => {
    e.preventDefault();
    const apiKey = cleanText(transcriptKeyDraft.apiKey).trim();
    const label = cleanText(transcriptKeyDraft.label).trim();
    if (!apiKey) {
      setError(tr(lang, 'أدخل مفتاح Transcript API قبل الإضافة.', 'Enter Transcript API key before adding.'));
      return;
    }

    await withAction('transcript:save', async () => {
      const data = await authedFetch('/api/admin/transcript-api/config', {
        method: 'POST',
        body: JSON.stringify({
          keyAction: {
            type: 'add',
            apiKey,
            label,
            enabled: true,
            setActive: true
          }
        })
      });
      setTranscriptApiMeta({
        keysCount: Number(data.data?.keysCount || 0),
        activeKeyId: cleanText(data.data?.activeKeyId),
        keys: Array.isArray(data.data?.keys) ? data.data.keys : [],
        updatedAt: data.data?.updatedAt || null
      });
      setTranscriptKeyDraft({ label: '', apiKey: '' });
      setNotice(tr(lang, 'تمت إضافة مفتاح Transcript API.', 'Transcript API key added.'));
    });
  };

  const updateTranscriptKeyAction = async (action, busyKey, successMessage) => {
    await withAction(busyKey, async () => {
      const data = await authedFetch('/api/admin/transcript-api/config', {
        method: 'POST',
        body: JSON.stringify({ keyAction: action })
      });
      setTranscriptApiMeta({
        keysCount: Number(data.data?.keysCount || 0),
        activeKeyId: cleanText(data.data?.activeKeyId),
        keys: Array.isArray(data.data?.keys) ? data.data.keys : [],
        updatedAt: data.data?.updatedAt || null
      });
      setNotice(successMessage);
    });
  };

  const clearTranscriptApiKeys = async () => {
    const confirmed = window.confirm(
      tr(lang, 'سيتم حذف كل مفاتيح Transcript API المحفوظة. هل تريد المتابعة؟', 'This will remove all saved Transcript API keys. Continue?')
    );
    if (!confirmed) return;
    await updateTranscriptKeyAction(
      { type: 'clear-all' },
      'transcript:clear',
      tr(lang, 'تم حذف جميع مفاتيح Transcript API.', 'All Transcript API keys were removed.')
    );
  };
  const saveSettings = async (e) => {
    e.preventDefault();
    await withAction('settings:save', async () => {
      const payload = {
        username: settings.username,
        email: settings.email,
        ...(settings.password ? { password: settings.password } : {})
      };
      const data = await authedFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setToken(data.token);
      }
      setSettings((prev) => ({ ...prev, password: '' }));
      await loadOverview();
      setNotice(tr(lang, 'ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø£Ø¯Ù…Ù†.', 'Admin settings saved.'));
    });
  };

  const paymentStats = useMemo(() => {
    const result = { pending: 0, approved: 0, rejected: 0 };
    for (const payment of payments) {
      if (payment.status === 'approved') result.approved += 1;
      else if (payment.status === 'rejected') result.rejected += 1;
      else result.pending += 1;
    }
    return result;
  }, [payments]);

  const modelsForSelectedProvider = Array.isArray(aiConfig.modelCatalog?.[aiConfig.selectedProvider])
    ? aiConfig.modelCatalog[aiConfig.selectedProvider].map((item) => normalizeModelOption(item)).filter(Boolean)
    : [];
  const usageByRoute = Array.isArray(usageStats?.byRoute) ? usageStats.byRoute : [];

  const inputClass = 'w-full border rounded-lg px-3 py-2 border-slate-300 bg-white text-slate-900';

  if (!token) {
    return (
      <>
        <SeoMeta
          title={tr(lang, 'Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø£Ø¯Ù…Ù† | Transcripta AI', 'Admin Login | Transcripta AI', 'Connexion Admin | Transcripta AI')}
          description={tr(lang, 'ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ù„ÙˆØ­Ø© Ø§Ù„Ø£Ø¯Ù…Ù†.', 'Admin panel login.', 'Connexion admin.')}
          path="/admin"
        />
        <main className="min-h-screen bg-[linear-gradient(180deg,#0b1220_0%,#111827_100%)] text-white flex items-center justify-center p-4 pt-24">
          <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-3xl font-black mb-2">{tr(lang, 'Ø§Ù„Ø£Ø¯Ù…Ù†', 'Admin', 'Admin')}</h1>
            <p className="text-sm text-slate-300 mb-5">{tr(lang, 'ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', 'Control panel sign in', 'Connexion panneau')}</p>

            <label className="block text-sm mb-1">{tr(lang, 'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯', 'Username or email', 'Nom utilisateur ou e-mail')}</label>
            <input
              value={loginForm.identifier}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 mb-3 outline-none focus:border-cyan-300"
            />

            <label className="block text-sm mb-1">{tr(lang, 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±', 'Password', 'Mot de passe')}</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 mb-4 outline-none focus:border-cyan-300"
            />

            {error ? <p className="text-sm text-red-300 mb-3">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400 transition disabled:opacity-60"
            >
              {loading ? tr(lang, 'Ø¬Ø§Ø±Ù Ø§Ù„Ø¯Ø®ÙˆÙ„...', 'Signing in...', 'Connexion...') : tr(lang, 'Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø£Ø¯Ù…Ù†', 'Admin Sign In', 'Connexion Admin')}
            </button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <SeoMeta
        title={tr(lang, 'Ù„ÙˆØ­Ø© Ø§Ù„Ø£Ø¯Ù…Ù† | Transcripta AI', 'Admin Panel | Transcripta AI', 'Panneau Admin | Transcripta AI')}
        description={tr(lang, 'Ù„ÙˆØ­Ø© Ø¥Ø¯Ø§Ø±Ø© Transcripta AI.', 'Transcripta AI administration panel.', 'Panneau administration.')}
        path="/admin"
      />
      <main
        className={`min-h-screen pt-20 ${
          isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]'
        }`}
        dir={lang === LANG.ar ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{tr(lang, 'Ù„ÙˆØ­Ø© Ø§Ù„Ø£Ø¯Ù…Ù†', 'Admin Panel', 'Panneau admin')}</h1>
                <p className="text-sm text-slate-500">{overview?.admin?.email || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => loadAll({ forceCredits: true })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  {loading ? tr(lang, 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ø¯ÙŠØ«...', 'Refreshing...', 'Actualisation...') : tr(lang, 'ØªØ­Ø¯ÙŠØ«', 'Refresh', 'Actualiser')}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 text-red-700 px-3 py-2 text-sm hover:bg-red-50"
                >
                  <FaSignOutAlt />
                  <span>{tr(lang, 'Ø®Ø±ÙˆØ¬', 'Logout', 'Deconnexion')}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setTab(TABS.overview)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.overview ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©', 'Overview', 'Apercu')}</button>
              <button onClick={() => setTab(TABS.users)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.users ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†', 'Users', 'Utilisateurs')}</button>
              <button onClick={() => setTab(TABS.payments)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.payments ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª', 'Payments', 'Paiements')}</button>
              <button onClick={() => setTab(TABS.usage)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.usage ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ø³Ø¬Ù„ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…', 'Usage Analytics', 'Analytique')}</button>
              <button onClick={() => setTab(TABS.billing)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.billing ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯ÙØ¹', 'Billing', 'Paiement')}</button>
              <button onClick={() => setTab(TABS.ai)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.ai ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ø¥Ø¯Ø§Ø±Ø© APIs', 'AI & APIs', 'IA & APIs')}</button>
              <button onClick={() => setTab(TABS.settings)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.settings ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª', 'Settings', 'Parametres')}</button>
            </div>
          </header>

          {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div> : null}
          {notice ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 text-sm">{notice}</div> : null}

          {tab === TABS.overview && (
            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', 'Total Users')}</p>
                <p className="text-2xl font-black text-slate-900">{overview?.usersCount ?? 0}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ù…Ø¯ÙÙˆØ¹Ø§Øª Ù…Ø¹Ù„Ù‚Ø©', 'Pending Payments')}</p>
                <p className="text-2xl font-black text-amber-600">{overview?.payments?.pending ?? paymentStats.pending}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ù…Ø¯ÙÙˆØ¹Ø§Øª Ù…Ù‚Ø¨ÙˆÙ„Ø©', 'Approved Payments')}</p>
                <p className="text-2xl font-black text-emerald-600">{overview?.payments?.approved ?? paymentStats.approved}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ø±ÙˆØ§Ø¨Ø· ÙØ±ÙŠØ¯Ø© Ù…Ø³ØªØ®Ø±Ø¬Ø©', 'Unique Extracted Links')}</p>
                <p className="text-2xl font-black text-cyan-700">{overview?.usage?.uniqueExtractedLinks ?? 0}</p>
              </article>
            </section>
          )}
          {tab === TABS.usage && (
            <section className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <article className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø·Ù„Ø¨Ø§Øª', 'Total Requests')}</p>
                  <p className="text-2xl font-black text-slate-900">{usageStats?.totalRequests ?? 0}</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ù†Ø³Ø¨Ø© Ø§Ù„Ù†Ø¬Ø§Ø­', 'Success Rate')}</p>
                  <p className="text-2xl font-black text-emerald-600">{usageStats?.successRate ?? 0}%</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">{tr(lang, 'Ù…ØªÙˆØ³Ø· Ø²Ù…Ù† Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©', 'Avg Response Time')}</p>
                  <p className="text-2xl font-black text-cyan-700">{usageStats?.avgResponseMs ?? 0}ms</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">{tr(lang, 'ÙØªØ±Ø© Ø§Ù„ØªÙ‚Ø±ÙŠØ±', 'Report Window')}</p>
                  <p className="text-2xl font-black text-slate-900">{usageStats?.days ?? 7}d</p>
                </article>
              </div>

              <article className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="font-black text-slate-900 mb-3">{tr(lang, 'Ø£ÙƒØ«Ø± Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‹Ø§', 'Top Routes')}</h3>
                <div className="overflow-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-slate-50">
                      <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
                        <th className="p-2">{tr(lang, 'Ø§Ù„Ù…Ø³Ø§Ø±', 'Route')}</th>
                        <th className="p-2">{tr(lang, 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ', 'Total')}</th>
                        <th className="p-2">{tr(lang, 'Ù†Ø¬Ø§Ø­', 'Success')}</th>
                        <th className="p-2">{tr(lang, 'ÙØ´Ù„', 'Failed')}</th>
                        <th className="p-2">{tr(lang, 'Ù…ØªÙˆØ³Ø· Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©', 'Avg ms')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageByRoute.slice(0, 20).map((item) => (
                        <tr key={item.route} className="border-t border-slate-100">
                          <td className="p-2 font-mono text-xs">{item.route}</td>
                          <td className="p-2">{item.total}</td>
                          <td className="p-2 text-emerald-700">{item.success}</td>
                          <td className="p-2 text-red-700">{item.failed}</td>
                          <td className="p-2">{item.avgResponseMs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          )}
          {tab === TABS.users && (
            <AdminUsersTab
              lang={lang}
              users={users}
              busyAction={busyAction}
              setUserStatus={setUserStatus}
              deleteUser={deleteUser}
              subscriptionTierBadgeClass={subscriptionTierBadgeClass}
              subscriptionTierLabel={subscriptionTierLabel}
              userMonthlyQuotaHint={userMonthlyQuotaHint}
              accessLabel={accessLabel}
              badgeClass={badgeClass}
              formatDate={formatDate}
              shortId={shortId}
            />
          )}
          {tab === TABS.payments && (
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <FaCreditCard className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª', 'Payments')}</h2>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[1200px] text-sm">
                  <thead className="bg-slate-50">
                    <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
                      <th className="p-3">{tr(lang, 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…', 'User')}</th>
                      <th className="p-3">{tr(lang, 'Ø§Ù„ÙˆØ³ÙŠÙ„Ø©', 'Method')}</th>
                      <th className="p-3">{tr(lang, 'Ø§Ù„Ù…Ø¨Ù„Øº', 'Amount')}</th>
                      <th className="p-3">{tr(lang, 'الفيديوهات', 'Videos', 'Videos')}</th>
                      <th className="p-3">{tr(lang, 'Ø§Ù„Ø­Ø§Ù„Ø©', 'Status')}</th>
                      <th className="p-3">{tr(lang, 'Ø§Ù„Ù…Ø±Ø¬Ø¹', 'Reference')}</th>
                      <th className="p-3">{tr(lang, 'ØµÙˆØ±Ø© Ø§Ù„ØªØ­ÙˆÙŠÙ„', 'Proof')}</th>
                      <th className="p-3">{tr(lang, 'Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-3">
                          <div className="font-semibold">{shortId(item.user_id)}</div>
                          <div className="text-xs text-slate-500">{item.user_email || '-'}</div>
                        </td>
                        <td className="p-3">{item.payment_method || '-'}</td>
                        <td className="p-3">${(Number(item.amount_cents || 0) / 100).toFixed(2)}</td>
                        <td className="p-3">{item.credits_added}</td>
                        <td className="p-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${badgeClass(item.status)}`}>
                            {statusLabel(item.status, lang)}
                          </span>
                        </td>
                        <td className="p-3">{item.transfer_reference || '-'}</td>
                        <td className="p-3">
                          {item.proof_url ? (
                            <a
                              href={item.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                            >
                              <FaImage />
                              <span>{tr(lang, 'Ø¹Ø±Ø¶', 'View')}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => reviewPayment(item.id, 'approved')}
                                disabled={busyAction === `payment:${item.id}:approved`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                <FaCheck />
                                <span>{tr(lang, 'Ù…ÙˆØ§ÙÙ‚Ø©', 'Approve')}</span>
                              </button>
                              <button
                                onClick={() => reviewPayment(item.id, 'rejected')}
                                disabled={busyAction === `payment:${item.id}:rejected`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <FaTimes />
                                <span>{tr(lang, 'Ø±ÙØ¶', 'Reject')}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {tab === TABS.billing && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaWallet className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª', 'Payment Receiver Settings')}</h2>
              </div>
              <form onSubmit={saveBilling} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ø§Ø³Ù… Ø§Ù„Ø­Ø³Ø§Ø¨', 'Account name')}</label>
                  <input value={billingConfig.accountName} onChange={(e) => setBillingConfig((prev) => ({ ...prev, accountName: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">InstaPay Handle</label>
                  <input value={billingConfig.instapayHandle} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instapayHandle: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Vodafone Cash Number</label>
                  <input value={billingConfig.vodafoneCashNumber} onChange={(e) => setBillingConfig((prev) => ({ ...prev, vodafoneCashNumber: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ù‚Ù†Ø§Ø© Ø§Ù„Ø¯Ø¹Ù…', 'Support contact')}</label>
                  <input value={billingConfig.supportContact} onChange={(e) => setBillingConfig((prev) => ({ ...prev, supportContact: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø¹Ø±Ø¨ÙŠ', 'Arabic instructions')}</label>
                  <textarea rows={3} value={billingConfig.instructionsAr} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instructionsAr: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ', 'English instructions')}</label>
                  <textarea rows={3} value={billingConfig.instructionsEn} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instructionsEn: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'ØªØ¹Ù„ÙŠÙ…Ø§Øª ÙØ±Ù†Ø³ÙŠ', 'French instructions')}</label>
                  <textarea rows={3} value={billingConfig.instructionsFr} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instructionsFr: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={busyAction === 'billing:save'} className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
                    {busyAction === 'billing:save' ? tr(lang, 'Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸...', 'Saving...') : tr(lang, 'Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¯ÙØ¹', 'Save billing settings')}
                  </button>
                </div>
              </form>
            </section>
          )}

          {tab === TABS.ai && (
            <AdminAiTab
              lang={lang}
              aiConfig={aiConfig}
              setAiConfig={setAiConfig}
              aiKeysDraft={aiKeysDraft}
              setAiKeysDraft={setAiKeysDraft}
              transcriptApiMeta={transcriptApiMeta}
              transcriptKeyDraft={transcriptKeyDraft}
              setTranscriptKeyDraft={setTranscriptKeyDraft}
              busyAction={busyAction}
              inputClass={inputClass}
              PROVIDERS={PROVIDERS}
              modelsForSelectedProvider={modelsForSelectedProvider}
              normalizeModelOption={normalizeModelOption}
              onSaveAi={saveAi}
              onLoadProviderModels={loadProviderModels}
              onAddAiProviderKey={addAiProviderKey}
              onSetAiProviderActiveKey={setAiProviderActiveKey}
              onSetAiProviderKeyEnabled={setAiProviderKeyEnabled}
              onDeleteAiProviderKey={deleteAiProviderKey}
              onClearAiProviderKey={clearAiProviderKey}
              onAddTranscriptApiKey={addTranscriptApiKey}
              onUpdateTranscriptKeyAction={updateTranscriptKeyAction}
              onClearTranscriptApiKeys={clearTranscriptApiKeys}
              formatDate={formatDate}
              keyRuntimeBadgeClass={keyRuntimeBadgeClass}
              keyRuntimeLabel={keyRuntimeLabel}
              transcriptCreditBadgeClass={transcriptCreditBadgeClass}
              transcriptCreditLabel={transcriptCreditLabel}
            />
          )}
          {tab === TABS.settings && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaCog className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø£Ø¯Ù…Ù†', 'Admin Settings')}</h2>
              </div>
              <form onSubmit={saveSettings} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…', 'Username')}</label>
                  <input value={settings.username} onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ', 'Email')}</label>
                  <input value={settings.email} onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', 'New password (optional)')}</label>
                  <input type="password" value={settings.password} onChange={(e) => setSettings((prev) => ({ ...prev, password: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={busyAction === 'settings:save'} className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
                    {busyAction === 'settings:save' ? tr(lang, 'Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸...', 'Saving...') : tr(lang, 'Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª', 'Save settings')}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminPage;





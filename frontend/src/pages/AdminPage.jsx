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
import defaultApiUrl from '../config';
import { LANG, tr } from '../utils/lang';

const ADMIN_TOKEN_KEY = 'adminToken';
const TABS = {
  overview: 'overview',
  users: 'users',
  payments: 'payments',
  billing: 'billing',
  ai: 'ai',
  settings: 'settings'
};
const PROVIDERS = ['groq', 'openrouter', 'openai', 'google', 'anthropic'];

function statusLabel(status, lang) {
  const value = String(status || '').toLowerCase();
  if (value === 'approved') return tr(lang, 'مقبول', 'Approved', 'Approuve');
  if (value === 'rejected') return tr(lang, 'مرفوض', 'Rejected', 'Rejete');
  return tr(lang, 'معلق', 'Pending', 'En attente');
}

function accessLabel(status, lang) {
  const value = String(status || 'active').toLowerCase();
  if (value === 'blocked') return tr(lang, 'محظور', 'Blocked', 'Bloque');
  if (value === 'suspended') return tr(lang, 'معلق', 'Suspended', 'Suspendu');
  return tr(lang, 'نشط', 'Active', 'Actif');
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

  const [aiKeysDraft, setAiKeysDraft] = useState({
    groq: '',
    openrouter: '',
    openai: '',
    google: '',
    anthropic: ''
  });

  const [transcriptApiMeta, setTranscriptApiMeta] = useState({ keysCount: 0, keysMasked: [] });
  const [transcriptKeysText, setTranscriptKeysText] = useState('');

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
        throw new Error(data.error || tr(lang, 'فشل الطلب', 'Request failed', 'Echec de la requete'));
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
      accountName: data.data?.accountName || '',
      instapayHandle: data.data?.instapayHandle || '',
      vodafoneCashNumber: data.data?.vodafoneCashNumber || '',
      supportContact: data.data?.supportContact || '',
      instructionsAr: data.data?.instructionsAr || '',
      instructionsEn: data.data?.instructionsEn || '',
      instructionsFr: data.data?.instructionsFr || ''
    });
  }, [authedFetch]);

  const loadAiConfig = useCallback(async () => {
    const data = await authedFetch('/api/admin/ai/config');
    setAiConfig({
      selectedProvider: data.data?.selectedProvider || 'groq',
      selectedModel: data.data?.selectedModel || '',
      providers: data.data?.providers || {},
      modelCatalog: data.data?.modelCatalog || {}
    });
  }, [authedFetch]);

  const loadTranscriptApiConfig = useCallback(async () => {
    const data = await authedFetch('/api/admin/transcript-api/config');
    setTranscriptApiMeta({
      keysCount: Number(data.data?.keysCount || 0),
      keysMasked: Array.isArray(data.data?.keysMasked) ? data.data.keysMasked : []
    });
  }, [authedFetch]);
  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        loadOverview(),
        loadUsers(),
        loadPayments(),
        loadSettings(),
        loadBillingConfig(),
        loadAiConfig(),
        loadTranscriptApiConfig()
      ]);
    } catch (err) {
      setError(err.message || tr(lang, 'تعذر تحميل بيانات الأدمن', 'Failed to load admin data', 'Echec du chargement admin'));
    } finally {
      setLoading(false);
    }
  }, [token, loadOverview, loadUsers, loadPayments, loadSettings, loadBillingConfig, loadAiConfig, loadTranscriptApiConfig, lang]);

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
      setError(err.message || tr(lang, 'حدث خطأ غير متوقع', 'Unexpected error', 'Erreur inattendue'));
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
        throw new Error(data.error || tr(lang, 'فشل تسجيل دخول الأدمن', 'Admin login failed', 'Connexion admin echouee'));
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setLoginForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || tr(lang, 'فشل تسجيل دخول الأدمن', 'Admin login failed', 'Connexion admin echouee'));
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
    setAiKeysDraft({ groq: '', openrouter: '', openai: '', google: '', anthropic: '' });
    setTranscriptApiMeta({ keysCount: 0, keysMasked: [] });
    setTranscriptKeysText('');
    setTab(TABS.overview);
  };

  const reviewPayment = async (paymentId, status) => {
    await withAction(`payment:${paymentId}:${status}`, async () => {
      await authedFetch(`/api/admin/payments/${paymentId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      await Promise.all([loadPayments(), loadUsers(), loadOverview()]);
      setNotice(status === 'approved' ? tr(lang, 'تم اعتماد الطلب.', 'Payment approved.') : tr(lang, 'تم رفض الطلب.', 'Payment rejected.'));
    });
  };

  const setUserStatus = async (userId, action) => {
    await withAction(`user:${userId}:${action}`, async () => {
      await authedFetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      await Promise.all([loadUsers(), loadOverview()]);
      setNotice(tr(lang, 'تم تحديث حالة المستخدم.', 'User status updated.'));
    });
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      tr(lang, 'سيتم حذف المستخدم وكل بياناته نهائيًا. هل تريد المتابعة؟', 'This will permanently delete the user and related data. Continue?')
    );
    if (!confirmed) return;

    await withAction(`delete:${userId}`, async () => {
      await authedFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      await Promise.all([loadUsers(), loadOverview(), loadPayments()]);
      setNotice(tr(lang, 'تم حذف المستخدم.', 'User deleted.'));
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
      setNotice(tr(lang, 'تم حفظ إعدادات الدفع.', 'Billing settings saved.'));
    });
  };

  const loadProviderModels = async (provider) => {
    await withAction(`models:${provider}`, async () => {
      const apiKey = String(aiKeysDraft[provider] || '').trim();
      const data = await authedFetch('/api/admin/ai/models', {
        method: 'POST',
        body: JSON.stringify({ provider, ...(apiKey ? { apiKey } : {}) })
      });
      setAiConfig((prev) => ({
        ...prev,
        modelCatalog: { ...(prev.modelCatalog || {}), [provider]: Array.isArray(data.data?.models) ? data.data.models : [] }
      }));
      setNotice(tr(lang, 'تم تحميل الموديلات.', 'Provider models loaded.'));
    });
  };

  const saveAi = async (e) => {
    e.preventDefault();
    await withAction('ai:save', async () => {
      const payload = {
        selectedProvider: aiConfig.selectedProvider,
        selectedModel: aiConfig.selectedModel,
        providers: Object.fromEntries(
          PROVIDERS.map((provider) => [provider, { apiKey: String(aiKeysDraft[provider] || '').trim() }])
        ),
        modelCatalog: aiConfig.modelCatalog
      };
      const data = await authedFetch('/api/admin/ai/config', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setAiConfig({
        selectedProvider: data.data?.selectedProvider || aiConfig.selectedProvider,
        selectedModel: data.data?.selectedModel || aiConfig.selectedModel,
        providers: data.data?.providers || {},
        modelCatalog: data.data?.modelCatalog || {}
      });
      setAiKeysDraft({ groq: '', openrouter: '', openai: '', google: '', anthropic: '' });
      setNotice(tr(lang, 'تم حفظ إعدادات الذكاء الاصطناعي.', 'AI settings saved.'));
    });
  };
  const saveTranscriptApiKeys = async (e) => {
    e.preventDefault();
    await withAction('transcript:save', async () => {
      const keys = String(transcriptKeysText || '')
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      await authedFetch('/api/admin/transcript-api/config', {
        method: 'POST',
        body: JSON.stringify({ keys })
      });
      setTranscriptKeysText('');
      await loadTranscriptApiConfig();
      setNotice(tr(lang, 'تم حفظ مفاتيح Transcript API.', 'Transcript API keys saved.'));
    });
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
      setNotice(tr(lang, 'تم حفظ إعدادات الأدمن.', 'Admin settings saved.'));
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
    ? aiConfig.modelCatalog[aiConfig.selectedProvider]
    : [];

  const inputClass = 'w-full border rounded-lg px-3 py-2 border-slate-300 bg-white text-slate-900';

  if (!token) {
    return (
      <>
        <SeoMeta
          title={tr(lang, 'دخول الأدمن | Transcript AI', 'Admin Login | Transcript AI', 'Connexion Admin | Transcript AI')}
          description={tr(lang, 'تسجيل دخول لوحة الأدمن.', 'Admin panel login.', 'Connexion admin.')}
          path="/admin"
        />
        <main className="min-h-screen bg-[linear-gradient(180deg,#0b1220_0%,#111827_100%)] text-white flex items-center justify-center p-4 pt-24">
          <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-3xl font-black mb-2">{tr(lang, 'الأدمن', 'Admin', 'Admin')}</h1>
            <p className="text-sm text-slate-300 mb-5">{tr(lang, 'تسجيل دخول لوحة التحكم', 'Control panel sign in', 'Connexion panneau')}</p>

            <label className="block text-sm mb-1">{tr(lang, 'اسم المستخدم أو البريد', 'Username or email', 'Nom utilisateur ou e-mail')}</label>
            <input
              value={loginForm.identifier}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 mb-3 outline-none focus:border-cyan-300"
            />

            <label className="block text-sm mb-1">{tr(lang, 'كلمة المرور', 'Password', 'Mot de passe')}</label>
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
              {loading ? tr(lang, 'جارٍ الدخول...', 'Signing in...', 'Connexion...') : tr(lang, 'دخول الأدمن', 'Admin Sign In', 'Connexion Admin')}
            </button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <SeoMeta
        title={tr(lang, 'لوحة الأدمن | Transcript AI', 'Admin Panel | Transcript AI', 'Panneau Admin | Transcript AI')}
        description={tr(lang, 'لوحة إدارة Transcript AI.', 'Transcript AI administration panel.', 'Panneau administration.')}
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
                <h1 className="text-2xl font-black text-slate-900">{tr(lang, 'لوحة الأدمن', 'Admin Panel', 'Panneau admin')}</h1>
                <p className="text-sm text-slate-500">{overview?.admin?.email || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadAll} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  {loading ? tr(lang, 'جارٍ التحديث...', 'Refreshing...', 'Actualisation...') : tr(lang, 'تحديث', 'Refresh', 'Actualiser')}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 text-red-700 px-3 py-2 text-sm hover:bg-red-50"
                >
                  <FaSignOutAlt />
                  <span>{tr(lang, 'خروج', 'Logout', 'Deconnexion')}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setTab(TABS.overview)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.overview ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'نظرة عامة', 'Overview', 'Apercu')}</button>
              <button onClick={() => setTab(TABS.users)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.users ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'المستخدمون', 'Users', 'Utilisateurs')}</button>
              <button onClick={() => setTab(TABS.payments)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.payments ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'المدفوعات', 'Payments', 'Paiements')}</button>
              <button onClick={() => setTab(TABS.billing)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.billing ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'بيانات الدفع', 'Billing', 'Paiement')}</button>
              <button onClick={() => setTab(TABS.ai)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.ai ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'إدارة APIs', 'AI & APIs', 'IA & APIs')}</button>
              <button onClick={() => setTab(TABS.settings)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.settings ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'الإعدادات', 'Settings', 'Parametres')}</button>
            </div>
          </header>

          {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div> : null}
          {notice ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 text-sm">{notice}</div> : null}

          {tab === TABS.overview && (
            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'إجمالي المستخدمين', 'Total Users')}</p>
                <p className="text-2xl font-black text-slate-900">{overview?.usersCount ?? 0}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'مدفوعات معلقة', 'Pending Payments')}</p>
                <p className="text-2xl font-black text-amber-600">{overview?.payments?.pending ?? paymentStats.pending}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'مدفوعات مقبولة', 'Approved Payments')}</p>
                <p className="text-2xl font-black text-emerald-600">{overview?.payments?.approved ?? paymentStats.approved}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'روابط فريدة مستخرجة', 'Unique Extracted Links')}</p>
                <p className="text-2xl font-black text-cyan-700">{overview?.usage?.uniqueExtractedLinks ?? 0}</p>
              </article>
            </section>
          )}
          {tab === TABS.users && (
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <FaUsers className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'المستخدمون', 'Users')}</h2>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[1200px] text-sm">
                  <thead className="bg-slate-50">
                    <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
                      <th className="p-3">{tr(lang, 'البريد', 'Email')}</th>
                      <th className="p-3">{tr(lang, 'الرصيد', 'Credits')}</th>
                      <th className="p-3">{tr(lang, 'الحالة', 'Status')}</th>
                      <th className="p-3">{tr(lang, 'مدفوعات مقبولة', 'Approved Payments')}</th>
                      <th className="p-3">{tr(lang, 'مدفوعات معلقة', 'Pending Payments')}</th>
                      <th className="p-3">{tr(lang, 'الكريديت المدفوع', 'Paid Credits')}</th>
                      <th className="p-3">{tr(lang, 'تاريخ الإنشاء', 'Created')}</th>
                      <th className="p-3">{tr(lang, 'الإجراءات', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => {
                      const accessStatus = item.access?.status || 'active';
                      return (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="p-3">
                            <div className="font-semibold">{item.email || '-'}</div>
                            <div className="text-xs text-slate-500">{shortId(item.id)}</div>
                            {item.access?.reason ? <div className="text-xs text-orange-600 mt-1">{item.access.reason}</div> : null}
                          </td>
                          <td className="p-3 font-bold">{item.credits}</td>
                          <td className="p-3">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${badgeClass(accessStatus)}`}>
                              {accessLabel(accessStatus, lang)}
                            </span>
                          </td>
                          <td className="p-3">{item.stats?.approvedPayments ?? 0}</td>
                          <td className="p-3">{item.stats?.pendingPayments ?? 0}</td>
                          <td className="p-3">{item.stats?.paidCredits ?? 0}</td>
                          <td className="p-3">{formatDate(item.created_at, lang)}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setUserStatus(item.id, 'active')}
                                disabled={busyAction === `user:${item.id}:active`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                <FaPlayCircle />
                                <span>{tr(lang, 'تفعيل', 'Activate')}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setUserStatus(item.id, 'suspended')}
                                disabled={busyAction === `user:${item.id}:suspended`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-orange-200 text-orange-700 hover:bg-orange-50"
                              >
                                <FaPauseCircle />
                                <span>{tr(lang, 'تعليق', 'Suspend')}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setUserStatus(item.id, 'blocked')}
                                disabled={busyAction === `user:${item.id}:blocked`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <FaBan />
                                <span>{tr(lang, 'حظر', 'Block')}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteUser(item.id)}
                                disabled={busyAction === `delete:${item.id}`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                <FaTrashAlt />
                                <span>{tr(lang, 'حذف', 'Delete')}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {tab === TABS.payments && (
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <FaCreditCard className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'المدفوعات', 'Payments')}</h2>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[1200px] text-sm">
                  <thead className="bg-slate-50">
                    <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
                      <th className="p-3">{tr(lang, 'المستخدم', 'User')}</th>
                      <th className="p-3">{tr(lang, 'الوسيلة', 'Method')}</th>
                      <th className="p-3">{tr(lang, 'المبلغ', 'Amount')}</th>
                      <th className="p-3">{tr(lang, 'الكريديت', 'Credits')}</th>
                      <th className="p-3">{tr(lang, 'الحالة', 'Status')}</th>
                      <th className="p-3">{tr(lang, 'المرجع', 'Reference')}</th>
                      <th className="p-3">{tr(lang, 'صورة التحويل', 'Proof')}</th>
                      <th className="p-3">{tr(lang, 'الإجراءات', 'Actions')}</th>
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
                              <span>{tr(lang, 'عرض', 'View')}</span>
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
                                <span>{tr(lang, 'موافقة', 'Approve')}</span>
                              </button>
                              <button
                                onClick={() => reviewPayment(item.id, 'rejected')}
                                disabled={busyAction === `payment:${item.id}:rejected`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <FaTimes />
                                <span>{tr(lang, 'رفض', 'Reject')}</span>
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
                <h2 className="font-black text-slate-900">{tr(lang, 'بيانات استقبال المدفوعات', 'Payment Receiver Settings')}</h2>
              </div>
              <form onSubmit={saveBilling} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'اسم الحساب', 'Account name')}</label>
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
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'قناة الدعم', 'Support contact')}</label>
                  <input value={billingConfig.supportContact} onChange={(e) => setBillingConfig((prev) => ({ ...prev, supportContact: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'تعليمات عربي', 'Arabic instructions')}</label>
                  <textarea rows={3} value={billingConfig.instructionsAr} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instructionsAr: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'تعليمات إنجليزي', 'English instructions')}</label>
                  <textarea rows={3} value={billingConfig.instructionsEn} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instructionsEn: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'تعليمات فرنسي', 'French instructions')}</label>
                  <textarea rows={3} value={billingConfig.instructionsFr} onChange={(e) => setBillingConfig((prev) => ({ ...prev, instructionsFr: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={busyAction === 'billing:save'} className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
                    {busyAction === 'billing:save' ? tr(lang, 'جارٍ الحفظ...', 'Saving...') : tr(lang, 'حفظ إعدادات الدفع', 'Save billing settings')}
                  </button>
                </div>
              </form>
            </section>
          )}

          {tab === TABS.ai && (
            <section className="space-y-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaRobot className="text-slate-600" />
                  <h2 className="font-black text-slate-900">{tr(lang, 'إدارة مزودي الذكاء الاصطناعي', 'AI Providers & Models')}</h2>
                </div>

                <form onSubmit={saveAi} className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    {PROVIDERS.map((provider) => (
                      <div key={provider} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-black">{provider.toUpperCase()}</p>
                          <button type="button" onClick={() => loadProviderModels(provider)} disabled={busyAction === `models:${provider}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-cyan-200 text-cyan-700 hover:bg-cyan-50 disabled:opacity-60">
                            <FaRobot />
                            <span>{tr(lang, 'تحميل الموديلات', 'Load models')}</span>
                          </button>
                        </div>
                        <input type="password" placeholder={tr(lang, 'الصق API Key (اختياري)', 'Paste API key (optional update)')} value={aiKeysDraft[provider]} onChange={(e) => setAiKeysDraft((prev) => ({ ...prev, [provider]: e.target.value }))} className={inputClass} />
                        <p className="text-xs text-slate-500 mt-2">{aiConfig.providers?.[provider]?.hasKey ? tr(lang, 'مفتاح محفوظ.', 'Key is saved.') : tr(lang, 'لا يوجد مفتاح محفوظ.', 'No saved key.')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{tr(lang, 'المزوّد الافتراضي', 'Default provider')}</label>
                      <select value={aiConfig.selectedProvider} onChange={(e) => setAiConfig((prev) => ({ ...prev, selectedProvider: e.target.value }))} className={inputClass}>
                        {PROVIDERS.map((provider) => <option key={provider} value={provider}>{provider.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">{tr(lang, 'الموديل الافتراضي', 'Default model')}</label>
                      <select value={aiConfig.selectedModel} onChange={(e) => setAiConfig((prev) => ({ ...prev, selectedModel: e.target.value }))} className={inputClass}>
                        {modelsForSelectedProvider.length ? modelsForSelectedProvider.map((model) => <option key={model} value={model}>{model}</option>) : <option value="">{tr(lang, 'حمّل الموديلات أولًا', 'Load models first')}</option>}
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={busyAction === 'ai:save'} className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
                    {busyAction === 'ai:save' ? tr(lang, 'جارٍ الحفظ...', 'Saving...') : tr(lang, 'حفظ إعدادات الذكاء', 'Save AI settings')}
                  </button>
                </form>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaKey className="text-slate-600" />
                  <h2 className="font-black text-slate-900">{tr(lang, 'إدارة مفاتيح Transcript API', 'Transcript API Key Pool')}</h2>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 mb-4 text-sm text-slate-700">
                  <p><span className="font-bold">{tr(lang, 'عدد المفاتيح:', 'Keys count:')}</span> {transcriptApiMeta.keysCount}</p>
                  <p className="text-xs text-slate-500 mt-1">{tr(lang, 'مفاتيح مخفية:', 'Masked keys:')} {transcriptApiMeta.keysMasked.join(' , ') || '-'}</p>
                </div>

                <form onSubmit={saveTranscriptApiKeys}>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'الصق المفاتيح (كل مفتاح في سطر)', 'Paste keys (one key per line)')}</label>
                  <textarea rows={6} value={transcriptKeysText} onChange={(e) => setTranscriptKeysText(e.target.value)} className={inputClass} />
                  <button type="submit" disabled={busyAction === 'transcript:save'} className="mt-3 rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
                    {busyAction === 'transcript:save' ? tr(lang, 'جارٍ الحفظ...', 'Saving...') : tr(lang, 'حفظ المفاتيح', 'Save keys')}
                  </button>
                </form>
              </article>
            </section>
          )}

          {tab === TABS.settings && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaCog className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'إعدادات الأدمن', 'Admin Settings')}</h2>
              </div>
              <form onSubmit={saveSettings} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'اسم المستخدم', 'Username')}</label>
                  <input value={settings.username} onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'البريد الإلكتروني', 'Email')}</label>
                  <input value={settings.email} onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'كلمة مرور جديدة (اختياري)', 'New password (optional)')}</label>
                  <input type="password" value={settings.password} onChange={(e) => setSettings((prev) => ({ ...prev, password: e.target.value }))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={busyAction === 'settings:save'} className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
                    {busyAction === 'settings:save' ? tr(lang, 'جارٍ الحفظ...', 'Saving...') : tr(lang, 'حفظ الإعدادات', 'Save settings')}
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

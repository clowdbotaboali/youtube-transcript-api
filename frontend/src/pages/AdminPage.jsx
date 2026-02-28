import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCheck, FaCog, FaCreditCard, FaSignOutAlt, FaTimes, FaUsers } from 'react-icons/fa';
import SeoMeta from '../components/SeoMeta';
import defaultApiUrl from '../config';
import { LANG, tr } from '../utils/lang';

const ADMIN_TOKEN_KEY = 'adminToken';
const TABS = {
  overview: 'overview',
  users: 'users',
  payments: 'payments',
  settings: 'settings'
};

function statusLabel(status, lang) {
  const value = String(status || '').toLowerCase();
  if (value === 'approved') return tr(lang, 'مقبول', 'Approved');
  if (value === 'rejected') return tr(lang, 'مرفوض', 'Rejected');
  return tr(lang, 'معلّق', 'Pending');
}

function AdminPage({ apiUrl = defaultApiUrl, lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(TABS.overview);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ identifier: 'admin', password: '' });
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({ username: '', email: '', password: '' });

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
        throw new Error(data.error || tr(lang, 'فشل الطلب', 'Request failed'));
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
    const data = await authedFetch('/api/admin/users?limit=100&page=1');
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

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadOverview(), loadUsers(), loadPayments(), loadSettings()]);
    } catch (err) {
      setError(err.message || tr(lang, 'تعذر تحميل بيانات الأدمن', 'Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  }, [token, loadOverview, loadUsers, loadPayments, loadSettings, lang]);

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token, loadAll]);

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
        throw new Error(data.error || tr(lang, 'فشل تسجيل دخول الأدمن', 'Admin login failed'));
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setLoginForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || tr(lang, 'فشل تسجيل دخول الأدمن', 'Admin login failed'));
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
  };

  const reviewPayment = async (paymentId, status) => {
    setError('');
    try {
      await authedFetch(`/api/admin/payments/${paymentId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      await Promise.all([loadPayments(), loadUsers(), loadOverview()]);
    } catch (err) {
      setError(err.message || tr(lang, 'فشل مراجعة الدفع', 'Failed to review payment'));
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setError('');
    try {
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
    } catch (err) {
      setError(err.message || tr(lang, 'فشل حفظ إعدادات الأدمن', 'Failed to save admin settings'));
    }
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

  if (!token) {
    return (
      <>
        <SeoMeta
          title={tr(lang, 'دخول الأدمن | Transcript AI', 'Admin Login | Transcript AI')}
          description={tr(lang, 'تسجيل دخول لوحة تحكم الأدمن.', 'Admin panel login.')}
          path="/admin"
        />
        <main className="min-h-screen bg-[linear-gradient(180deg,#0b1220_0%,#111827_100%)] text-white flex items-center justify-center p-4 pt-24">
          <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-3xl font-black mb-2">{tr(lang, 'الأدمن', 'Admin')}</h1>
            <p className="text-sm text-slate-300 mb-5">{tr(lang, 'تسجيل دخول لوحة التحكم', 'Control panel sign in')}</p>

            <label className="block text-sm mb-1">{tr(lang, 'اسم المستخدم أو البريد', 'Username or email')}</label>
            <input
              value={loginForm.identifier}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 mb-3 outline-none focus:border-cyan-300"
            />

            <label className="block text-sm mb-1">{tr(lang, 'كلمة المرور', 'Password')}</label>
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
              {loading ? tr(lang, 'جارٍ الدخول...', 'Signing in...') : tr(lang, 'دخول الأدمن', 'Admin Sign In')}
            </button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <SeoMeta
        title={tr(lang, 'لوحة الأدمن | Transcript AI', 'Admin Panel | Transcript AI')}
        description={tr(lang, 'لوحة إدارة Transcript AI.', 'Transcript AI administration panel.')}
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
                <h1 className="text-2xl font-black text-slate-900">{tr(lang, 'لوحة الأدمن', 'Admin Panel')}</h1>
                <p className="text-sm text-slate-500">{overview?.admin?.email || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadAll} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  {tr(lang, 'تحديث', 'Refresh')}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 text-red-700 px-3 py-2 text-sm hover:bg-red-50"
                >
                  <FaSignOutAlt />
                  <span>{tr(lang, 'خروج', 'Logout')}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setTab(TABS.overview)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.overview ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'نظرة عامة', 'Overview')}</button>
              <button onClick={() => setTab(TABS.users)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.users ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'المستخدمون', 'Users')}</button>
              <button onClick={() => setTab(TABS.payments)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.payments ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'المدفوعات', 'Payments')}</button>
              <button onClick={() => setTab(TABS.settings)} className={`rounded-lg px-3 py-2 text-sm ${tab === TABS.settings ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}>{tr(lang, 'الإعدادات', 'Settings')}</button>
            </div>
          </header>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>
          ) : null}

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
                <p className="text-xs text-slate-500 mb-1">{tr(lang, 'روابط مستخرجة فريدة', 'Unique Extracted Links')}</p>
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
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="bg-slate-50">
                    <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
                      <th className="p-3">{tr(lang, 'البريد', 'Email')}</th>
                      <th className="p-3">{tr(lang, 'الرصيد', 'Credits')}</th>
                      <th className="p-3">{tr(lang, 'مدفوعات مقبولة', 'Approved Payments')}</th>
                      <th className="p-3">{tr(lang, 'مدفوعات معلقة', 'Pending Payments')}</th>
                      <th className="p-3">{tr(lang, 'الكريديت المدفوع', 'Paid Credits')}</th>
                      <th className="p-3">{tr(lang, 'تاريخ الإنشاء', 'Created')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-3">{item.email || item.id}</td>
                        <td className="p-3 font-bold">{item.credits}</td>
                        <td className="p-3">{item.stats?.approvedPayments ?? 0}</td>
                        <td className="p-3">{item.stats?.pendingPayments ?? 0}</td>
                        <td className="p-3">{item.stats?.paidCredits ?? 0}</td>
                        <td className="p-3">{new Date(item.created_at).toLocaleString(lang === LANG.ar ? 'ar-EG' : 'en-US')}</td>
                      </tr>
                    ))}
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
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-slate-50">
                    <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
                      <th className="p-3">{tr(lang, 'معرّف المستخدم', 'User ID')}</th>
                      <th className="p-3">{tr(lang, 'الوسيلة', 'Method')}</th>
                      <th className="p-3">{tr(lang, 'المبلغ', 'Amount')}</th>
                      <th className="p-3">{tr(lang, 'الكريديت', 'Credits')}</th>
                      <th className="p-3">{tr(lang, 'الحالة', 'Status')}</th>
                      <th className="p-3">{tr(lang, 'المرجع', 'Ref')}</th>
                      <th className="p-3">{tr(lang, 'الإجراءات', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-3">{item.user_id}</td>
                        <td className="p-3">{item.payment_method}</td>
                        <td className="p-3">${(Number(item.amount_cents || 0) / 100).toFixed(2)}</td>
                        <td className="p-3">{item.credits_added}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                              item.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {statusLabel(item.status, lang)}
                          </span>
                        </td>
                        <td className="p-3">{item.transfer_reference || '-'}</td>
                        <td className="p-3">
                          {item.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => reviewPayment(item.id, 'approved')}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                <FaCheck />
                                <span>{tr(lang, 'موافقة', 'Approve')}</span>
                              </button>
                              <button
                                onClick={() => reviewPayment(item.id, 'rejected')}
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

          {tab === TABS.settings && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaCog className="text-slate-600" />
                <h2 className="font-black text-slate-900">{tr(lang, 'إعدادات الأدمن', 'Admin Settings')}</h2>
              </div>
              <form onSubmit={saveSettings} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'اسم المستخدم', 'Username')}</label>
                  <input
                    value={settings.username}
                    onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'البريد الإلكتروني', 'Email')}</label>
                  <input
                    value={settings.email}
                    onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">{tr(lang, 'كلمة مرور جديدة (اختياري)', 'New password (optional)')}</label>
                  <input
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800">
                    {tr(lang, 'حفظ الإعدادات', 'Save Settings')}
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

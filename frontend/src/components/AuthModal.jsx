import { useState } from 'react';
import { FaEnvelope, FaEye, FaEyeSlash, FaKey, FaRocket, FaTimes } from 'react-icons/fa';
import { supabase } from '../utils/supabase';
import { LANG, tr } from '../utils/lang';

function AuthModal({ isOpen, onClose, onAuthSuccess, lang = LANG.ar, onNotify }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, message);
  };

  const mapAuthError = (err) => {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('invalid login credentials')) {
      return tr(lang, 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'Invalid email or password.');
    }
    if (msg.includes('email not confirmed')) {
      return tr(lang, 'يرجى تأكيد البريد الإلكتروني أولًا.', 'Please confirm your email first.');
    }
    if (msg.includes('user already registered')) {
      return tr(lang, 'هذا البريد مسجل بالفعل.', 'This email is already registered.');
    }
    return err?.message || tr(lang, 'فشلت عملية المصادقة.', 'Authentication failed.');
  };

  const handleForgotPassword = async () => {
    if (!supabase) {
      setError(tr(lang, 'خدمة تسجيل الدخول غير مهيأة حاليًا.', 'Authentication service is not configured.'));
      return;
    }
    if (!email.trim()) {
      setError(tr(lang, 'أدخل البريد الإلكتروني أولًا.', 'Enter your email first.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (resetError) throw resetError;
      notify('success', tr(lang, 'تم إرسال رابط إعادة تعيين كلمة المرور.', 'Password reset email sent.'));
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError(tr(lang, 'خدمة تسجيل الدخول غير مهيأة حاليًا.', 'Authentication service is not configured.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (!data?.session) {
          throw new Error(tr(lang, 'تعذر إنشاء جلسة صالحة.', 'Could not create a valid session.'));
        }
        onAuthSuccess(data.session);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      if (!data?.session) {
        notify(
          'success',
          tr(
            lang,
            'تم إنشاء الحساب. راجع بريدك الإلكتروني للتأكيد ثم سجل الدخول.',
            'Account created. Check your email to confirm, then sign in.'
          )
        );
        setIsLogin(true);
        setPassword('');
        return;
      }

      onAuthSuccess(data.session);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const dir = lang === LANG.ar ? 'rtl' : 'ltr';
  const closeSide = lang === LANG.ar ? 'left-4' : 'right-4';
  const eyeSide = lang === LANG.ar ? 'left-3' : 'right-3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-3 sm:px-4 py-4" dir={dir}>
      <div className="w-full max-w-4xl grid md:grid-cols-[1fr_1.2fr] rounded-3xl overflow-hidden border border-white/10 shadow-2xl auth-pop">
        <div className="hidden md:flex flex-col justify-between bg-[linear-gradient(165deg,#071f2d_0%,#0f172a_45%,#2a1c2f_100%)] text-slate-100 p-7">
          <div>
            <p className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-cyan-200 mb-4">
              <FaRocket />
              {tr(lang, 'مساحة العمل الذكية', 'Smart Workspace')}
            </p>
            <h2 className="text-3xl font-black leading-tight mb-3">
              {tr(lang, 'دخول سريع لمساحة التحليل والإنتاج', 'Fast Access to Your Analysis Workspace')}
            </h2>
            <p className="text-slate-300 text-sm">
              {tr(
                lang,
                'بعد تسجيل الدخول يمكنك استخراج النصوص، استخدام الشات، وحفظ النتائج على حسابك.',
                'After sign-in you can extract transcripts, use AI chat, and save every result to your account.'
              )}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">{tr(lang, 'نظام رصيد واضح ومرن', 'Clear and flexible credit system')}</div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">{tr(lang, 'تجربة كاملة بالعربية والإنجليزية والفرنسية', 'Full multilingual experience (Arabic/English/French)', 'Experience complete en arabe/anglais/francais')}</div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-7 relative">
          <button
            onClick={onClose}
            className={`absolute top-4 ${closeSide} h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition`}
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <div className="max-w-md mx-auto pt-5 sm:pt-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 text-center">
              {isLogin ? tr(lang, 'تسجيل الدخول', 'Sign in') : tr(lang, 'إنشاء حساب جديد', 'Create account')}
            </h3>
            <p className="text-center text-slate-500 text-sm mb-5">
              {isLogin
                ? tr(lang, 'ادخل بياناتك للمتابعة.', 'Enter your credentials to continue.')
                : tr(lang, 'أنشئ حسابك وابدأ فورًا.', 'Create your account and start now.')}
            </p>

            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, 'البريد الإلكتروني', 'Email')}</label>
                <div className="relative">
                  <span className={`absolute top-1/2 -translate-y-1/2 ${lang === LANG.ar ? 'right-3' : 'left-3'} text-slate-400`}>
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full h-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${
                      lang === LANG.ar ? 'pr-10 pl-3' : 'pl-10 pr-3'
                    }`}
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, 'كلمة المرور', 'Password')}</label>
                <div className="relative">
                  <span className={`absolute top-1/2 -translate-y-1/2 ${lang === LANG.ar ? 'right-3' : 'left-3'} text-slate-400`}>
                    <FaKey />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full h-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${
                      lang === LANG.ar ? 'pr-10 pl-11' : 'pl-10 pr-11'
                    }`}
                    dir="ltr"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute top-1/2 -translate-y-1/2 ${eyeSide} text-slate-500 hover:text-slate-700`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70 font-bold transition"
              >
                {loading
                  ? tr(lang, 'جاري التنفيذ...', 'Processing...')
                  : isLogin
                    ? tr(lang, 'دخول إلى الحساب', 'Sign in')
                    : tr(lang, 'إنشاء الحساب', 'Create account')}
              </button>
            </form>

            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-3 text-sm text-cyan-700 hover:text-cyan-800 hover:underline"
                disabled={loading}
              >
                {tr(lang, 'نسيت كلمة المرور؟', 'Forgot password?')}
              </button>
            )}

            <div className="mt-6 text-sm text-slate-600 text-center">
              {isLogin
                ? tr(lang, 'ليس لديك حساب؟ ', "Don't have an account? ")
                : tr(lang, 'لديك حساب بالفعل؟ ', 'Already have an account? ')}
              <button
                onClick={() => {
                  setIsLogin((prev) => !prev);
                  setError(null);
                }}
                className="text-cyan-700 hover:text-cyan-800 hover:underline font-semibold"
              >
                {isLogin ? tr(lang, 'أنشئ حسابًا', 'Create account') : tr(lang, 'تسجيل الدخول', 'Sign in')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;

import { useEffect, useMemo, useState } from 'react';
import { FaEnvelope, FaEye, FaEyeSlash, FaKey, FaRocket, FaSpinner, FaTimes } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { supabase } from '../utils/supabase';
import { LANG, tr } from '../utils/lang';
import AntiBotCheck from './AntiBotCheck';

function GoogleBrandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v4.2h5.9c-.3 1.8-2.1 5.2-5.9 5.2-3.5 0-6.4-2.9-6.4-6.4s2.9-6.4 6.4-6.4c2 0 3.4.9 4.2 1.6l2.9-2.8C17.3 3.8 14.9 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c6.9 0 9.2-4.9 9.2-7.4 0-.5-.1-.8-.1-1.2H12Z" />
      <path fill="#34A853" d="M3.6 7.3l3.4 2.5C8 7.9 9.8 6.8 12 6.8c2 0 3.4.9 4.2 1.6l2.9-2.8C17.3 3.8 14.9 2.8 12 2.8c-3.6 0-6.7 2-8.4 4.9Z" />
      <path fill="#4A90E2" d="M12 21.2c2.8 0 5.2-.9 6.9-2.6l-3.2-2.6c-.9.6-2.1 1.1-3.7 1.1-3.7 0-5.6-3.4-5.9-5.2l-3.3 2.5C4.5 18.8 8 21.2 12 21.2Z" />
      <path fill="#FBBC05" d="M6.1 12c0-.7.1-1.4.3-2L3 7.5C2.2 9 1.8 10.4 1.8 12c0 1.5.4 3 1.2 4.5l3.3-2.5c-.1-.6-.2-1.3-.2-2Z" />
    </svg>
  );
}

function AuthModal({ isOpen, onClose, onAuthSuccess, lang = LANG.ar, onNotify, initialMode = 'login', apiUrl }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  const authApiBase = useMemo(() => String(apiUrl || defaultApiUrl || '').trim().replace(/\/+$/, ''), [apiUrl]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLogin(initialMode !== 'signup');
    setError('');
    setShowPassword(false);
    setTurnstileToken('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, message);
  };

  const normalizeErrorFromResponse = async (response, fallback = 'Authentication failed') => {
    const payload = await response.json().catch(() => ({}));
    const code = String(payload?.error?.code || payload?.code || '').trim();
    const message = String(payload?.error?.message || payload?.message || fallback).trim();
    return { code, message };
  };

  const requestAuth = async (path, payload) => {
    const response = await fetch(`${authApiBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload || {})
    });
    if (!response.ok) {
      const normalized = await normalizeErrorFromResponse(response);
      const errorObject = new Error(normalized.message || 'Request failed');
      errorObject.code = normalized.code;
      throw errorObject;
    }
    return response.json().catch(() => ({}));
  };

  const mapAuthError = (err) => {
    const code = String(err?.code || '').toUpperCase();
    const msg = String(err?.message || '').toLowerCase();
    if (code === 'EMAIL_NOT_VERIFIED') {
      return tr(lang, 'البريد غير مُفعّل. افحص بريدك ثم أكد الحساب.', 'Email is not verified. Check your inbox and verify your account.');
    }
    if (msg.includes('invalid login credentials') || code === 'AUTH_INVALID_CREDENTIALS') {
      return tr(lang, 'البريد أو كلمة المرور غير صحيحة.', 'Invalid email or password.');
    }
    if (msg.includes('user already registered')) {
      return tr(lang, 'هذا البريد مستخدم بالفعل.', 'This email is already registered.');
    }
    if (code === 'ANTI_BOT_REQUIRED' || code === 'ANTI_BOT_INVALID' || code === 'ANTI_BOT_UNAVAILABLE') {
      return tr(lang, 'فشل تحقق الحماية. أعد المحاولة.', 'Anti-bot verification failed. Please try again.');
    }
    return err?.message || tr(lang, 'فشلت عملية المصادقة.', 'Authentication failed.');
  };

  const buildRedirectUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/auth/callback?next=/dashboard`;
  };

  const handleForgotPassword = async () => {
    if (!supabase) {
      setError(tr(lang, 'خدمة المصادقة غير مهيأة.', 'Authentication service is not configured.'));
      return;
    }
    if (!email.trim()) {
      setError(tr(lang, 'أدخل البريد أولاً.', 'Enter your email first.'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (resetError) throw resetError;
      notify('success', tr(lang, 'تم إرسال رابط استعادة كلمة المرور.', 'Password reset email sent.'));
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!supabase) {
      setError(tr(lang, 'خدمة المصادقة غير مهيأة.', 'Authentication service is not configured.'));
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: buildRedirectUrl(),
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(mapAuthError(err));
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = String(pendingVerificationEmail || email || '').trim();
    if (!targetEmail) {
      setError(tr(lang, 'اكتب البريد لإعادة الإرسال.', 'Enter email to resend verification.'));
      return;
    }
    setResendLoading(true);
    setError('');
    try {
      await requestAuth('/api/auth/resend-verification', {
        email: targetEmail,
        emailRedirectTo: buildRedirectUrl()
      });
      notify('success', tr(lang, 'تم إرسال بريد التفعيل مرة أخرى.', 'Verification email resent.'));
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError(tr(lang, 'خدمة المصادقة غير مهيأة.', 'Authentication service is not configured.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const payload = await requestAuth('/api/auth/login', {
          email: email.trim(),
          password
        });
        const session = payload?.data?.session || null;
        if (!session?.access_token || !session?.refresh_token) {
          throw new Error(tr(lang, 'تعذر إنشاء جلسة دخول صالحة.', 'Could not establish a valid session.'));
        }
        const { data: setData, error: setSessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        if (setSessionError) throw setSessionError;
        onAuthSuccess(setData?.session || session);
        return;
      }

      if (!turnstileToken.trim()) {
        throw new Error(tr(lang, 'أكمل فحص الحماية أولاً.', 'Please complete the anti-bot check first.'));
      }

      await requestAuth('/api/auth/signup', {
        email: email.trim(),
        password,
        turnstileToken,
        emailRedirectTo: buildRedirectUrl()
      });

      setPendingVerificationEmail(email.trim());
      setIsLogin(true);
      setPassword('');
      setTurnstileToken('');
      notify(
        'success',
        tr(
          lang,
          'تم إنشاء الحساب. فعّل بريدك الإلكتروني ثم سجل الدخول.',
          'Account created. Verify your email, then sign in.'
        )
      );
    } catch (err) {
      if (String(err?.code || '').toUpperCase() === 'EMAIL_NOT_VERIFIED') {
        setPendingVerificationEmail(email.trim());
      }
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const dir = lang === LANG.ar ? 'rtl' : 'ltr';
  const closeSide = lang === LANG.ar ? 'left-4' : 'right-4';
  const eyeSide = lang === LANG.ar ? 'left-3' : 'right-3';
  const authActionBusy = loading || googleLoading || resendLoading;

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
              {tr(lang, 'تسجيل سريع وآمن', 'Secure and fast sign in')}
            </h2>
            <p className="text-slate-300 text-sm">
              {tr(
                lang,
                'دخول Google بضغطة واحدة أو بريد وكلمة مرور مع حماية ضد الإساءة.',
                'Google one-click login or email/password with abuse protection.'
              )}
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              {tr(lang, 'تفعيل البريد مطلوب قبل الاستخدام.', 'Email verification is required before access.')}
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              {tr(lang, 'فحص Anti-bot عند التسجيل.', 'Anti-bot check on signup.')}
            </div>
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

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={authActionBusy}
              className="w-full h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition text-slate-800 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {googleLoading ? <FaSpinner className="animate-spin" /> : <GoogleBrandIcon />}
              <span>{tr(lang, 'المتابعة عبر Google', 'Continue with Google')}</span>
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-500 uppercase tracking-wide">{tr(lang, 'أو', 'or')}</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {error ? <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div> : null}

            {pendingVerificationEmail ? (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">
                <p className="font-semibold mb-2">
                  {tr(lang, 'الحساب غير مفعل بعد.', 'Email is not verified yet.')}
                </p>
                <p className="mb-2">
                  {tr(
                    lang,
                    `فعّل البريد: ${pendingVerificationEmail}`,
                    `Please verify: ${pendingVerificationEmail}`
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:text-amber-700 disabled:opacity-70"
                >
                  {resendLoading ? <FaSpinner className="animate-spin" /> : null}
                  <span>{tr(lang, 'إعادة إرسال التفعيل', 'Resend verification email')}</span>
                </button>
              </div>
            ) : null}

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
                    minLength={8}
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

              {!isLogin ? <AntiBotCheck onTokenChange={setTurnstileToken} /> : null}

              <button
                type="submit"
                disabled={authActionBusy}
                className="w-full h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70 font-bold transition inline-flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : null}
                <span>
                  {isLogin ? tr(lang, 'دخول إلى الحساب', 'Sign in') : tr(lang, 'إنشاء الحساب', 'Create account')}
                </span>
              </button>
            </form>

            {isLogin ? (
              <div className="mt-3 flex items-center justify-start">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-cyan-700 hover:text-cyan-800 hover:underline"
                  disabled={authActionBusy}
                >
                  {tr(lang, 'نسيت كلمة المرور؟', 'Forgot password?', 'Mot de passe oublie ?')}
                </button>
              </div>
            ) : null}

            <div className="mt-6 text-sm text-slate-600 text-center">
              {isLogin ? tr(lang, 'ليس لديك حساب؟ ', "Don't have an account? ") : tr(lang, 'لديك حساب بالفعل؟ ', 'Already have an account? ')}
              <button
                onClick={() => {
                  setIsLogin((prev) => !prev);
                  setError('');
                  setTurnstileToken('');
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

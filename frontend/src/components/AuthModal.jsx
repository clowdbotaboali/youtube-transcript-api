import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { LANG, tr } from '../utils/lang';

function AuthModal({ isOpen, onClose, onAuthSuccess, lang = LANG.ar, onNotify }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      return tr(lang, 'يرجى تأكيد بريدك الإلكتروني أولاً.', 'Please confirm your email first.');
    }
    if (msg.includes('user already registered')) {
      return tr(lang, 'هذا البريد مسجل بالفعل.', 'This email is already registered.');
    }
    return err?.message || tr(lang, 'فشلت عملية تسجيل الدخول.', 'Authentication failed.');
  };

  const handleForgotPassword = async () => {
    if (!supabase) {
      setError(tr(lang, 'خدمة تسجيل الدخول غير مهيأة حاليًا.', 'Authentication service is not configured.'));
      return;
    }

    if (!email.trim()) {
      setError(tr(lang, 'أدخل بريدك الإلكتروني أولاً.', 'Enter your email first.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (resetError) throw resetError;
      notify('success', tr(lang, 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.', 'Password reset email sent.'));
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
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        if (!data?.session) {
          throw new Error(tr(lang, 'تعذر إنشاء جلسة صالحة.', 'Could not create a valid session.'));
        }
        onAuthSuccess(data.session);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      if (signUpError) throw signUpError;

      // Supabase may require email confirmation; in that case there is no active session yet.
      if (!data?.session) {
        notify(
          'success',
          tr(
            lang,
            'تم إنشاء الحساب. راجع بريدك الإلكتروني للتأكيد ثم سجّل الدخول.',
            'Account created. Check your email to confirm, then sign in.'
          )
        );
        setIsLogin(true);
        return;
      }

      onAuthSuccess(data.session);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
        <button
          onClick={onClose}
          className={`absolute top-4 ${lang === LANG.ar ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-700`}
          aria-label="Close"
        >
          X
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? tr(lang, 'تسجيل الدخول', 'Sign in') : tr(lang, 'إنشاء حساب جديد', 'Create account')}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tr(lang, 'البريد الإلكتروني', 'Email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tr(lang, 'كلمة المرور', 'Password')}
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading
              ? tr(lang, 'جاري التنفيذ...', 'Processing...')
              : isLogin
                ? tr(lang, 'تسجيل الدخول', 'Sign in')
                : tr(lang, 'إنشاء حساب', 'Create account')}
          </button>
        </form>

        {isLogin && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="mt-3 text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            {tr(lang, 'نسيت كلمة المرور؟', 'Forgot password?')}
          </button>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin
            ? tr(lang, 'ليس لديك حساب؟ ', "Don't have an account? ")
            : tr(lang, 'لديك حساب بالفعل؟ ', 'Already have an account? ')}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? tr(lang, 'أنشئ حسابًا', 'Create account') : tr(lang, 'تسجيل الدخول', 'Sign in')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;

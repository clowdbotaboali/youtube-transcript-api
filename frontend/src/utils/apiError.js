import { LANG } from './lang';

function localize(lang, ar, en, fr) {
  if (lang === LANG.en) return en;
  if (lang === LANG.fr) return fr || en;
  return ar;
}

export function parseApiError(payload) {
  if (!payload || typeof payload !== 'object') {
    return { code: '', message: '', details: null };
  }

  if (typeof payload.error === 'string') {
    return {
      code: '',
      message: payload.error,
      details: null
    };
  }

  if (payload.error && typeof payload.error === 'object') {
    return {
      code: String(payload.error.code || '').trim(),
      message: String(payload.error.message || payload.error.error || '').trim(),
      details: payload.error.details && typeof payload.error.details === 'object' ? payload.error.details : null
    };
  }

  return {
    code: '',
    message: '',
    details: null
  };
}

export function formatApiErrorMessage({
  payload,
  status,
  lang = LANG.ar,
  fallbackAr = 'حدث خطأ غير متوقع.',
  fallbackEn = 'Unexpected error.',
  fallbackFr = 'Erreur inattendue.'
} = {}) {
  const parsed = parseApiError(payload);
  const code = String(parsed.code || '').toUpperCase();
  const details = parsed.details || {};
  const access = details.access && typeof details.access === 'object' ? details.access : null;

  if (access?.status === 'blocked') {
    return localize(
      lang,
      `تم حظر الحساب بواسطة الإدارة.${access.reason ? ` السبب: ${access.reason}` : ''}`,
      `Your account is blocked by admin.${access.reason ? ` Reason: ${access.reason}` : ''}`,
      `Votre compte est bloque par l'administration.${access.reason ? ` Raison: ${access.reason}` : ''}`
    );
  }

  if (access?.status === 'suspended') {
    return localize(
      lang,
      `تم تعليق الحساب بواسطة الإدارة.${access.reason ? ` السبب: ${access.reason}` : ''}`,
      `Your account is suspended by admin.${access.reason ? ` Reason: ${access.reason}` : ''}`,
      `Votre compte est suspendu par l'administration.${access.reason ? ` Raison: ${access.reason}` : ''}`
    );
  }

  if (code === 'LIMIT_EXCEEDED') {
    if (typeof details.required === 'number') {
      return localize(
        lang,
        'الرصيد غير كافٍ لاستخراج فيديو جديد. اشحن رصيدك ثم حاول مرة أخرى.',
        'Insufficient credits for a new video link. Top up and try again.',
        "Credits insuffisants pour un nouveau lien video. Rechargez puis reessayez."
      );
    }
    if (typeof details.dailyLimit === 'number') {
      return localize(
        lang,
        `تم الوصول للحد اليومي (${details.dailyLimit}) حسب خطتك.`,
        `Daily limit reached (${details.dailyLimit}) for your current plan.`,
        `Limite quotidienne atteinte (${details.dailyLimit}) pour votre plan actuel.`
      );
    }
    return localize(
      lang,
      'تم الوصول للحد المسموح حسب الخطة الحالية.',
      'Plan limit reached for your current subscription.',
      'Limite du plan atteinte pour votre abonnement actuel.'
    );
  }

  if (code === 'FEATURE_NOT_AVAILABLE') {
    return localize(
      lang,
      'هذه الميزة غير متاحة ضمن خطتك الحالية.',
      'This feature is not available for your current plan.',
      "Cette fonctionnalite n'est pas disponible pour votre plan actuel."
    );
  }

  if (code === 'INVALID_VIDEO_ID') {
    return localize(
      lang,
      'رابط يوتيوب غير صالح. تأكد من الرابط ثم حاول مرة أخرى.',
      'Invalid YouTube URL/video ID. Please check and try again.',
      'Lien YouTube/ID video invalide. Verifiez puis reessayez.'
    );
  }

  if (code === 'TRANSCRIPT_UNAVAILABLE') {
    return localize(
      lang,
      'لا يوجد نص متاح لهذا الفيديو (Subtitles/CC غير متوفرة أو غير مدعومة).',
      'No transcript is available for this video (missing/unsupported subtitles).',
      'Aucune transcription disponible pour cette video (sous-titres absents/non pris en charge).'
    );
  }

  if (code === 'UNAUTHENTICATED' || status === 401) {
    return localize(
      lang,
      'انتهت الجلسة. سجل الدخول مرة أخرى.',
      'Session expired. Please sign in again.',
      'Session expiree. Veuillez vous reconnecter.'
    );
  }

  if (code === 'RATE_LIMITED' || status === 429) {
    return localize(
      lang,
      'طلبات كثيرة في وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.',
      'Too many requests in a short time. Please retry shortly.',
      'Trop de requetes en peu de temps. Reessayez dans un instant.'
    );
  }

  if (code === 'SERVER_MISCONFIGURED') {
    return localize(
      lang,
      'الخادم غير مهيأ بشكل صحيح حاليًا. تواصل مع الدعم.',
      'Server is not configured correctly right now. Contact support.',
      "Le serveur n'est pas correctement configure pour le moment. Contactez le support."
    );
  }

  const raw = String(parsed.message || '').trim();
  if (raw) return raw;

  return localize(lang, fallbackAr, fallbackEn, fallbackFr);
}

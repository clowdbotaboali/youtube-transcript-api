import { cleanText, LANG } from './lang';

function localize(lang, ar, en, fr) {
  if (lang === LANG.en) return cleanText(en);
  if (lang === LANG.fr) return cleanText(fr || en);
  return cleanText(ar);
}

export function parseApiError(payload) {
  if (!payload || typeof payload !== 'object') {
    return { code: '', message: '', details: null };
  }

  if (typeof payload.error === 'string') {
    return {
      code: '',
      message: cleanText(payload.error),
      details: null
    };
  }

  if (payload.error && typeof payload.error === 'object') {
    return {
      code: String(payload.error.code || '').trim(),
      message: cleanText(payload.error.message || payload.error.error || ''),
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
  const accessReason = cleanText(access?.reason || '');

  if (access?.status === 'blocked') {
    return localize(
      lang,
      `تم حظر الحساب بواسطة الإدارة.${accessReason ? ` السبب: ${accessReason}` : ''}`,
      `Your account is blocked by admin.${accessReason ? ` Reason: ${accessReason}` : ''}`,
      `Votre compte est bloque par l'administration.${accessReason ? ` Raison: ${accessReason}` : ''}`
    );
  }

  if (access?.status === 'suspended') {
    return localize(
      lang,
      `تم تعليق الحساب بواسطة الإدارة.${accessReason ? ` السبب: ${accessReason}` : ''}`,
      `Your account is suspended by admin.${accessReason ? ` Reason: ${accessReason}` : ''}`,
      `Votre compte est suspendu par l'administration.${accessReason ? ` Raison: ${accessReason}` : ''}`
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

  if (code === 'QUOTA_EXCEEDED') {
    return localize(
      lang,
      'تم استهلاك الروابط الشهرية المجانية ولا يوجد رصيد كافٍ حالياً. انتظر التجديد الشهري أو اشحن رصيدك للمتابعة.',
      'Monthly free links are exhausted and no credits are available. Wait for reset or top up your balance.',
      'Le quota mensuel gratuit est epuise et aucun credit nest disponible. Attendez la reinitialisation ou rechargez votre solde.'
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

  const raw = cleanText(parsed.message || '');
  const rawLower = raw.toLowerCase();
  if (rawLower.includes('monthly transcript quota reached') && rawLower.includes('no credits')) {
    return localize(
      lang,
      'تم استهلاك الروابط الشهرية المجانية ولا يوجد رصيد كافٍ حالياً. انتظر التجديد الشهري أو اشحن رصيدك للمتابعة.',
      'Monthly free links are exhausted and no credits are available. Wait for reset or top up your balance.',
      'Le quota mensuel gratuit est epuise et aucun credit nest disponible. Attendez la reinitialisation ou rechargez votre solde.'
    );
  }
  if (rawLower.includes('insufficient credits')) {
    return localize(
      lang,
      'الرصيد غير كافٍ لاستخراج رابط جديد. اشحن رصيدك ثم حاول مرة أخرى.',
      'Insufficient credits for a new video link. Top up and try again.',
      'Credits insuffisants pour un nouveau lien video. Rechargez puis reessayez.'
    );
  }
  if (raw) return raw;

  return localize(lang, cleanText(fallbackAr), cleanText(fallbackEn), cleanText(fallbackFr));
}

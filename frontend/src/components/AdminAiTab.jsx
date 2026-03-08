import { FaKey, FaRobot, FaTrashAlt } from 'react-icons/fa';
import { cleanText, tr } from '../utils/lang';

export default function AdminAiTab({
  lang,
  aiConfig,
  setAiConfig,
  aiKeysDraft,
  setAiKeysDraft,
  transcriptApiMeta,
  transcriptKeyDraft,
  setTranscriptKeyDraft,
  busyAction,
  inputClass,
  PROVIDERS,
  modelsForSelectedProvider,
  normalizeModelOption,
  onSaveAi,
  onLoadProviderModels,
  onAddAiProviderKey,
  onSetAiProviderActiveKey,
  onSetAiProviderKeyEnabled,
  onDeleteAiProviderKey,
  onClearAiProviderKey,
  onAddTranscriptApiKey,
  onUpdateTranscriptKeyAction,
  onClearTranscriptApiKeys,
  formatDate,
  keyRuntimeBadgeClass,
  keyRuntimeLabel,
  transcriptCreditBadgeClass,
  transcriptCreditLabel
}) {
  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaRobot className="text-slate-600" />
          <h2 className="font-black text-slate-900">{tr(lang, 'إدارة مزودي الذكاء الاصطناعي', 'AI Providers & Models')}</h2>
        </div>

        <form onSubmit={onSaveAi} className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {PROVIDERS.map((provider) => {
              const providerMeta = aiConfig.providers?.[provider] || {};
              const providerKeys = Array.isArray(providerMeta.keys) ? providerMeta.keys : [];
              const draft = aiKeysDraft[provider] || { label: '', apiKey: '' };

              return (
                <div key={provider} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-black">{provider.toUpperCase()}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {tr(lang, 'مفاتيح', 'Keys')}: {providerKeys.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => onLoadProviderModels(provider)}
                        disabled={busyAction === `models:${provider}` || providerKeys.length === 0}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-cyan-200 text-cyan-700 hover:bg-cyan-50 disabled:opacity-60"
                      >
                        <FaRobot />
                        <span>{tr(lang, 'تحميل الموديلات', 'Load models')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onClearAiProviderKey(provider)}
                        disabled={busyAction === `ai:clear:${provider}` || providerKeys.length === 0}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        <FaTrashAlt />
                        <span>{tr(lang, 'مسح الكل', 'Clear all')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[1fr_1.2fr_auto] gap-2">
                    <input
                      value={draft.label || ''}
                      onChange={(e) => setAiKeysDraft((prev) => ({
                        ...prev,
                        [provider]: { ...(prev[provider] || {}), label: e.target.value }
                      }))}
                      placeholder={tr(lang, 'عنوان المفتاح (مثال: حساب الشركة)', 'Key label (e.g. Company account)')}
                      className={inputClass}
                    />
                    <input
                      type="password"
                      value={draft.apiKey || ''}
                      onChange={(e) => setAiKeysDraft((prev) => ({
                        ...prev,
                        [provider]: { ...(prev[provider] || {}), apiKey: e.target.value }
                      }))}
                      placeholder={tr(lang, 'الصق API Key', 'Paste API key')}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => onAddAiProviderKey(provider)}
                      disabled={busyAction === `ai:add:${provider}`}
                      className="rounded-lg px-3 py-2 bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60"
                    >
                      {busyAction === `ai:add:${provider}` ? tr(lang, 'جارٍ...', 'Saving...') : tr(lang, 'إضافة', 'Add')}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
                    {providerKeys.length > 0 ? (
                      providerKeys.map((key) => (
                        <div
                          key={key.id}
                          className={`rounded-lg border p-2 ${
                            key.runtimeStatus === 'success'
                              ? 'border-emerald-300 bg-emerald-50'
                              : key.runtimeStatus === 'failure'
                                ? 'border-red-200 bg-red-50'
                                : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{cleanText(key.label) || key.id}</p>
                              <p className="text-xs text-slate-500">{key.maskedKey || '-'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${keyRuntimeBadgeClass(key.runtimeStatus)}`}>
                                {keyRuntimeLabel(key.runtimeStatus, lang)}
                              </span>
                              {key.isActive ? (
                                <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[11px] font-bold">
                                  {tr(lang, 'الافتراضي', 'Active')}
                                </span>
                              ) : null}
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${key.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                {key.enabled ? tr(lang, 'مفعّل', 'Enabled') : tr(lang, 'معطّل', 'Disabled')}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSetAiProviderActiveKey(provider, key.id)}
                              disabled={key.isActive || key.enabled === false || busyAction === `ai:active:${provider}:${key.id}`}
                              className="rounded-md border border-blue-200 text-blue-700 px-2 py-1 text-xs hover:bg-blue-50 disabled:opacity-60"
                            >
                              {tr(lang, 'تعيين كافتراضي', 'Set active')}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSetAiProviderKeyEnabled(provider, key.id, key.enabled === false)}
                              disabled={busyAction === `ai:enabled:${provider}:${key.id}`}
                              className="rounded-md border border-slate-300 text-slate-700 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                            >
                              {key.enabled === false ? tr(lang, 'تفعيل', 'Enable') : tr(lang, 'تعطيل', 'Disable')}
                            </button>
                            <button
                              type="button"
                              onClick={() => onLoadProviderModels(provider, key.id)}
                              disabled={busyAction === `models:${provider}` || key.enabled === false}
                              className="rounded-md border border-cyan-200 text-cyan-700 px-2 py-1 text-xs hover:bg-cyan-50 disabled:opacity-60"
                            >
                              {tr(lang, 'اختبار وتحميل موديلات', 'Test & load models')}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAiProviderKey(provider, key.id)}
                              disabled={busyAction === `ai:delete:${provider}:${key.id}`}
                              className="rounded-md border border-red-200 text-red-700 px-2 py-1 text-xs hover:bg-red-50 disabled:opacity-60"
                            >
                              {tr(lang, 'حذف', 'Delete')}
                            </button>
                          </div>

                          {key.lastUsedAt ? (
                            <p className="mt-1 text-[11px] text-slate-500">
                              {tr(lang, 'آخر استخدام:', 'Last used:')} {formatDate(key.lastUsedAt, lang)}
                            </p>
                          ) : null}
                          {key.lastError ? (
                            <p className="mt-1 text-[11px] text-red-600">{key.lastError}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">{tr(lang, 'لا توجد مفاتيح محفوظة لهذا المزود.', 'No saved keys for this provider.')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'المزوّد الافتراضي', 'Default provider')}</label>
              <select
                value={aiConfig.selectedProvider}
                onChange={(e) =>
                  setAiConfig((prev) => {
                    const nextProvider = e.target.value;
                    const nextModels = Array.isArray(prev.modelCatalog?.[nextProvider])
                      ? prev.modelCatalog[nextProvider].map((item) => normalizeModelOption(item)).filter(Boolean)
                      : [];
                    const nextIds = nextModels.map((item) => item.id);
                    return {
                      ...prev,
                      selectedProvider: nextProvider,
                      selectedModel: nextIds.includes(prev.selectedModel) ? prev.selectedModel : (nextIds[0] || '')
                    };
                  })
                }
                className={inputClass}
              >
                {PROVIDERS.map((provider) => <option key={provider} value={provider}>{provider.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'الموديل الافتراضي', 'Default model')}</label>
              <select value={aiConfig.selectedModel} onChange={(e) => setAiConfig((prev) => ({ ...prev, selectedModel: e.target.value }))} className={inputClass}>
                {modelsForSelectedProvider.length
                  ? modelsForSelectedProvider.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                        {model.tier ? ` (${model.tier})` : ''}
                      </option>
                    ))
                  : <option value="">{tr(lang, 'حمّل الموديلات أولًا', 'Load models first')}</option>}
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

        <div className="rounded-lg border border-slate-200 p-3 mb-4 text-sm text-slate-700 space-y-1">
          <p><span className="font-bold">{tr(lang, 'عدد المفاتيح:', 'Keys count:')}</span> {transcriptApiMeta.keysCount}</p>
          <p><span className="font-bold">{tr(lang, 'المفتاح الفعّال:', 'Active key:')}</span> {cleanText(transcriptApiMeta.activeKeyId) || '-'}</p>
          <p className="text-xs text-slate-500">{tr(lang, 'آخر تحديث:', 'Last update:')} {transcriptApiMeta.updatedAt ? formatDate(transcriptApiMeta.updatedAt, lang) : '-'}</p>
          <p className="text-xs text-slate-500">
            {tr(lang, 'ملاحظة: عند رجوع النتائج من الكاش لن يتم استدعاء المفتاح ولن يتغير مؤشر الاستخدام.', 'Note: cache-hit results do not call provider keys, so usage indicators may stay unchanged.')}
          </p>
          <p className="text-xs text-slate-500">
            {tr(lang, 'شرح الحالات: "تم الاستخدام بنجاح" يعني آخر استدعاء نجح، "فشل آخر محاولة" يعني آخر استدعاء فشل، "لم يُختبر بعد في هذه الجلسة" يعني لم يتم استدعاء المفتاح منذ آخر تشغيل للخادم.', 'Status guide: "Working now" means last call succeeded, "Last check failed" means last call failed, and "Not tested yet in this session" means this key has not been called since the current server runtime started.', 'Guide des etats: "Actif maintenant" signifie que le dernier appel a reussi, "Dernier test echoue" signifie echec du dernier appel, et "Pas encore teste dans cette session" signifie quaucun appel na eu lieu depuis le demarrage actuel du serveur.')}
          </p>
          <p className="text-xs text-slate-500">
            {tr(lang, 'الكريديت يتم عرضه عند توفره من استجابة TranscriptAPI. بعض الحسابات/الخطط لا تُظهر الرقم عبر API.', 'Credits are shown when TranscriptAPI exposes them in API responses. Some accounts/plans do not expose an exact number via API.', 'Les credits sont affiches lorsque TranscriptAPI les expose dans ses reponses API. Certains comptes/plans ne donnent pas le nombre exact.')}
          </p>
        </div>

        <form onSubmit={onAddTranscriptApiKey} className="grid md:grid-cols-[1fr_1.2fr_auto] gap-2">
          <input
            value={transcriptKeyDraft.label}
            onChange={(e) => setTranscriptKeyDraft((prev) => ({ ...prev, label: e.target.value }))}
            placeholder={tr(lang, 'عنوان المفتاح (مثال: الحساب الرئيسي)', 'Key label (e.g. Primary account)')}
            className={inputClass}
          />
          <input
            type="password"
            value={transcriptKeyDraft.apiKey}
            onChange={(e) => setTranscriptKeyDraft((prev) => ({ ...prev, apiKey: e.target.value }))}
            placeholder={tr(lang, 'الصق Transcript API Key', 'Paste Transcript API key')}
            className={inputClass}
          />
          <button type="submit" disabled={busyAction === 'transcript:save'} className="rounded-lg px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60">
            {busyAction === 'transcript:save' ? tr(lang, 'جارٍ...', 'Saving...') : tr(lang, 'إضافة', 'Add')}
          </button>
        </form>

        <div className="mt-4 space-y-2 max-h-72 overflow-auto pr-1">
          {transcriptApiMeta.keys.length > 0 ? (
            transcriptApiMeta.keys.map((key) => (
              <div
                key={key.id}
                className={`rounded-lg border p-3 ${
                  key.runtimeStatus === 'success'
                    ? 'border-emerald-300 bg-emerald-50'
                    : key.runtimeStatus === 'failure'
                      ? 'border-red-200 bg-red-50'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{cleanText(key.label) || key.id}</p>
                    <p className="text-xs text-slate-500">{key.maskedKey || '-'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${keyRuntimeBadgeClass(key.runtimeStatus)}`}>
                      {keyRuntimeLabel(key.runtimeStatus, lang)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${transcriptCreditBadgeClass(key)}`}>
                      {transcriptCreditLabel(key, lang)}
                    </span>
                    {key.isActive ? (
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[11px] font-bold">
                        {tr(lang, 'الفعّال', 'Active')}
                      </span>
                    ) : null}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${key.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {key.enabled ? tr(lang, 'مفعّل', 'Enabled') : tr(lang, 'معطّل', 'Disabled')}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateTranscriptKeyAction({ type: 'set-active', keyId: key.id }, `transcript:active:${key.id}`, tr(lang, 'تم تعيين المفتاح الفعّال.', 'Active key updated.'))}
                    disabled={key.isActive || key.enabled === false || busyAction === `transcript:active:${key.id}`}
                    className="rounded-md border border-blue-200 text-blue-700 px-2 py-1 text-xs hover:bg-blue-50 disabled:opacity-60"
                  >
                    {tr(lang, 'تعيين كافتراضي', 'Set active')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTranscriptKeyAction({ type: 'set-enabled', keyId: key.id, enabled: key.enabled === false }, `transcript:enabled:${key.id}`, key.enabled === false ? tr(lang, 'تم تفعيل المفتاح.', 'Key enabled.') : tr(lang, 'تم تعطيل المفتاح.', 'Key disabled.'))}
                    disabled={busyAction === `transcript:enabled:${key.id}`}
                    className="rounded-md border border-slate-300 text-slate-700 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                  >
                    {key.enabled === false ? tr(lang, 'تفعيل', 'Enable') : tr(lang, 'تعطيل', 'Disable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTranscriptKeyAction({ type: 'delete', keyId: key.id }, `transcript:delete:${key.id}`, tr(lang, 'تم حذف المفتاح.', 'Key deleted.'))}
                    disabled={busyAction === `transcript:delete:${key.id}`}
                    className="rounded-md border border-red-200 text-red-700 px-2 py-1 text-xs hover:bg-red-50 disabled:opacity-60"
                  >
                    {tr(lang, 'حذف', 'Delete')}
                  </button>
                </div>

                {key.lastUsedAt ? (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {tr(lang, 'آخر استخدام:', 'Last used:')} {formatDate(key.lastUsedAt, lang)}
                  </p>
                ) : null}
                {key.creditCheckedAt ? (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {tr(lang, 'آخر فحص كريديت:', 'Last credit check:')} {formatDate(key.creditCheckedAt, lang)}
                  </p>
                ) : null}
                {key.lastError ? (
                  <p className="mt-1 text-[11px] text-red-600">{key.lastError}</p>
                ) : null}
                {key.creditMessage && key.creditsStatus !== 'unknown' && typeof key.availableCredits !== 'number' ? (
                  <p className="mt-1 text-[11px] text-slate-500">{key.creditMessage}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">{tr(lang, 'لا توجد مفاتيح Transcript API محفوظة حتى الآن.', 'No Transcript API keys saved yet.')}</p>
          )}
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onClearTranscriptApiKeys}
            disabled={busyAction === 'transcript:clear' || transcriptApiMeta.keysCount === 0}
            className="rounded-lg px-4 py-2 border border-red-200 text-red-700 font-bold hover:bg-red-50 disabled:opacity-60"
          >
            {busyAction === 'transcript:clear' ? tr(lang, 'جارٍ المسح...', 'Clearing...') : tr(lang, 'حذف كل المفاتيح', 'Clear all keys')}
          </button>
        </div>
      </article>
    </section>
  );
}

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const BACKEND_ENV_PATH = path.join(PROJECT_ROOT, 'backend', '.env');
const SUPABASE_API_BASE = 'https://api.supabase.com/v1';
const DEFAULT_SITE_URL = 'https://transcripta.tech';
const DEFAULT_SENDER_NAME = 'Transcripta Support';
const DEFAULT_FROM_EMAIL = 'support@transcripta.tech';

function loadBackendEnv() {
  if (!fs.existsSync(BACKEND_ENV_PATH)) return {};
  const raw = fs.readFileSync(BACKEND_ENV_PATH, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function getEnv(envFile, ...keys) {
  for (const key of keys) {
    const processValue = String(process.env[key] || '').trim();
    if (processValue) return processValue;
    const fileValue = String(envFile[key] || '').trim();
    if (fileValue) return fileValue;
  }
  return '';
}

function parseProjectRefFromUrl(urlValue) {
  const url = String(urlValue || '').trim();
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match ? match[1] : '';
}

function pickSiteUrl(envFile) {
  const explicit = getEnv(
    envFile,
    'AUTH_SITE_URL',
    'APP_SITE_URL',
    'PUBLIC_SITE_URL',
    'PROD_SITE_URL',
    'NEXT_PUBLIC_SITE_URL',
    'VITE_SITE_URL'
  );
  if (explicit) return explicit;
  const fromAllowedOrigins = getEnv(envFile, 'ALLOWED_ORIGINS')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .find((origin) => /^https?:\/\//i.test(origin) && !/localhost|127\.0\.0\.1/i.test(origin));
  if (fromAllowedOrigins) return fromAllowedOrigins;
  return DEFAULT_SITE_URL;
}

function toUniqueList(values) {
  return Array.from(new Set(values.map((item) => String(item || '').trim()).filter(Boolean)));
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildTemplate({
  titleAr,
  titleEn,
  introAr,
  introEn,
  buttonAr,
  buttonEn,
  noteAr,
  noteEn
}) {
  return `<!doctype html>
<html lang="en" dir="rtl">
  <body style="margin:0;padding:0;background:#f3f6fb;font-family:Tahoma,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #dbe6f3;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#0b2440,#1d4f7a);padding:20px 24px;color:#e2f3ff;">
                <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">Transcripta AI</div>
                <h1 style="margin:8px 0 0 0;font-size:22px;line-height:1.3;">${escapeHtml(titleAr)}</h1>
                <div style="font-size:14px;opacity:.9;margin-top:6px;">${escapeHtml(titleEn)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px;">
                <p style="margin:0 0 8px 0;font-size:16px;line-height:1.7;">${escapeHtml(introAr)}</p>
                <p style="margin:0 0 22px 0;font-size:14px;line-height:1.7;color:#475569;">${escapeHtml(introEn)}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td>
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#12b8dc;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
                        ${escapeHtml(buttonAr)} | ${escapeHtml(buttonEn)}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 14px 0;font-size:13px;line-height:1.8;color:#64748b;">${escapeHtml(noteAr)}</p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:#94a3b8;">${escapeHtml(noteEn)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f8fbff;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                Transcripta AI • {{ .Email }}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function getCurrentAuthConfig(projectRef, token) {
  const response = await fetch(`${SUPABASE_API_BASE}/projects/${projectRef}/config/auth`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch auth config (${response.status}): ${text}`);
  }
  return response.json();
}

async function patchAuthConfig(projectRef, token, payload) {
  const response = await fetch(`${SUPABASE_API_BASE}/projects/${projectRef}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to patch auth config (${response.status}): ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  const envFile = loadBackendEnv();
  const token = getEnv(envFile, 'SUPABASE_ACCESS_TOKEN');
  if (!token) {
    throw new Error('SUPABASE_ACCESS_TOKEN is required (env or backend/.env).');
  }

  const projectRefFromUrl = parseProjectRefFromUrl(
    getEnv(envFile, 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
  );
  const explicitProjectRef = getEnv(envFile, 'SUPABASE_PROJECT_REF');
  const projectRef = projectRefFromUrl || explicitProjectRef;
  if (!projectRef) {
    throw new Error('SUPABASE_PROJECT_REF (or SUPABASE_URL) is required.');
  }
  if (projectRefFromUrl && explicitProjectRef && projectRefFromUrl !== explicitProjectRef) {
    console.warn(
      `Warning: SUPABASE_PROJECT_REF (${explicitProjectRef}) does not match SUPABASE_URL ref (${projectRefFromUrl}). Using ${projectRef}.`
    );
  }

  const senderName = getEnv(envFile, 'AUTH_EMAIL_FROM_NAME') || DEFAULT_SENDER_NAME;
  const fromEmail =
    getEnv(envFile, 'AUTH_EMAIL_FROM_ADDRESS', 'SMTP_ADMIN_EMAIL', 'MAIL_SUPPORT_EMAIL') || DEFAULT_FROM_EMAIL;
  const siteUrl = pickSiteUrl(envFile);

  const smtpHost = getEnv(envFile, 'SMTP_HOST');
  const smtpPortRaw = getEnv(envFile, 'SMTP_PORT');
  const smtpUser = getEnv(envFile, 'SMTP_USER');
  const smtpPass = getEnv(envFile, 'SMTP_PASS');
  const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : 0;

  const hasAnySmtp = Boolean(smtpHost || smtpPortRaw || smtpUser || smtpPass);
  const hasFullSmtp = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);
  if (hasAnySmtp && !hasFullSmtp) {
    throw new Error('SMTP config is partial. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS together.');
  }

  const current = await getCurrentAuthConfig(projectRef, token);

  const allowList = toUniqueList([
    siteUrl,
    `${siteUrl.replace(/\/+$/, '')}/auth/callback`,
    'https://transcripta.tech',
    'https://transcripta.tech/auth/callback',
    'https://www.transcripta.tech',
    'https://www.transcripta.tech/auth/callback',
    'http://localhost:5173',
    'http://localhost:5173/auth/callback',
    'http://localhost:3000',
    'http://localhost:3000/auth/callback',
    ...String(current.uri_allow_list || '')
      .split(',')
      .map((item) => item.trim())
  ]);

  const payload = {
    site_url: siteUrl,
    uri_allow_list: allowList.join(','),
    mailer_subjects_confirmation: 'Confirm your email | Transcripta AI',
    mailer_subjects_recovery: 'Reset your password | Transcripta AI',
    mailer_templates_confirmation_content: buildTemplate({
      titleAr: 'تأكيد البريد الإلكتروني',
      titleEn: 'Confirm your email address',
      introAr: 'أهلًا بك في Transcripta AI. اضغط الزر التالي لتفعيل حسابك.',
      introEn: 'Welcome to Transcripta AI. Click the button below to activate your account.',
      buttonAr: 'تأكيد البريد',
      buttonEn: 'Confirm Email',
      noteAr: 'إذا لم تُنشئ هذا الحساب، يمكنك تجاهل الرسالة بأمان.',
      noteEn: 'If you did not create this account, you can safely ignore this message.'
    }),
    mailer_templates_recovery_content: buildTemplate({
      titleAr: 'استعادة كلمة المرور',
      titleEn: 'Password reset request',
      introAr: 'تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في Transcripta AI.',
      introEn: 'We received a request to reset your Transcripta AI password.',
      buttonAr: 'إعادة تعيين كلمة المرور',
      buttonEn: 'Reset Password',
      noteAr: 'إذا لم تطلب هذا الإجراء، تجاهل الرسالة وسيظل حسابك آمنًا.',
      noteEn: 'If this was not requested by you, ignore this email and your account remains secure.'
    })
  };

  if (hasFullSmtp) {
    payload.smtp_host = smtpHost;
    // Supabase Management API expects smtp_port as a string value.
    payload.smtp_port = String(smtpPort);
    payload.smtp_user = smtpUser;
    payload.smtp_pass = smtpPass;
    payload.smtp_sender_name = senderName;
    payload.smtp_admin_email = fromEmail;
  }

  const apply = process.argv.includes('--apply');
  if (!apply) {
    console.log('Dry run (no changes were sent).');
    console.log(
      JSON.stringify(
        {
          projectRef,
          siteUrl,
          senderName,
          fromEmail,
          hasFullSmtp,
          uriAllowListCount: allowList.length
        },
        null,
        2
      )
    );
    console.log('Run with --apply to send changes.');
    return;
  }

  const updated = await patchAuthConfig(projectRef, token, payload);
  console.log(
    JSON.stringify(
      {
        success: true,
        projectRef,
        site_url: updated.site_url,
        smtp_sender_name: updated.smtp_sender_name,
        smtp_admin_email: updated.smtp_admin_email,
        has_smtp_host: Boolean(updated.smtp_host),
        has_smtp_user: Boolean(updated.smtp_user),
        has_smtp_pass: Boolean(updated.smtp_pass),
        confirmation_subject: updated.mailer_subjects_confirmation,
        recovery_subject: updated.mailer_subjects_recovery
      },
      null,
      2
    )
  );

  if (!hasFullSmtp) {
    console.log(
      'Warning: custom SMTP credentials were not provided. Sender email may still appear as Supabase default until SMTP is configured.'
    );
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});

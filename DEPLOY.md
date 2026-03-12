# النشر على Render

## المتطلبات
- حساب على Render.com
- مفتاح GROQ_API_KEY (للذكاء الاصطناعي)
- مفتاح TRANSCRIPT_API_KEY (اختياري)

## خطوات النشر

### 1) رفع الكود إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# أنشئ مستودع على GitHub ثم ارفع الكود
```

### 2) إنشاء Backend على Render
1. افتح https://dashboard.render.com
2. اضغط New → Web Service
3. اختر مستودع GitHub
4. الإعدادات:
   - Name: youtube-transcript-api
   - Region: Frankfurt
   - Branch: main
   - Build Command: npm ci
   - Start Command: node server.js

### 3) متغيرات البيئة (Environment Variables)
أضف القيم التالية:
- NODE_ENV=production
- GROQ_API_KEY=your_key
- TRANSCRIPT_API_KEY=your_key (اختياري)

### 4) تفعيل الـ Disk
- Name: data
- Mount Path: /app
- Size: 1GB

### 5) رابط الـ API
بعد النشر سيكون الرابط مثل:
```
https://youtube-transcript-api.onrender.com
```

---

# النشر على Vercel (موصى به)

هذا المشروع جاهز للنشر على Vercel كحزمة واحدة:
- الواجهة (Vite) تُبنى إلى frontend/dist
- الـ API يعمل كسيرفرلس في api/index.js
- الإعدادات جاهزة في vercel.json (rewrites + headers)

## المتطلبات
- حساب على Vercel
- ربط المستودع على GitHub
- مفاتيح Supabase المطلوبة

## الخطوات

1. افتح https://vercel.com/new واختر المستودع.
2. إعدادات البناء:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: frontend/dist
3. أضف متغيرات البيئة في Vercel:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
ADMIN_TOKEN_SECRET=

ALLOWED_ORIGINS=
ADMIN_EMAIL=
ADMIN_PASSWORD=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TURNSTILE_SITE_KEY=
VITE_API_URL=
```

ملاحظات:
- VITE_API_URL اختياري. في الإنتاج على Vercel الـ API على نفس الدومين (/api).
- إذا لا تريد تشغيل مهام SEO تلقائيًا عند كل Build، غيّر Build Command إلى:
  - npm run build:frontend
  ثم شغّل أوامر SEO يدويًا عند الحاجة.

---

# النشر على Fly.io

## المتطلبات
- تثبيت Fly CLI: npm install -g flyctl
- حساب على https://fly.io

## خطوات النشر

### 1) تسجيل الدخول
```bash
fly auth login
```

### 2) إنشاء App
```bash
cd backend
fly apps create youtube-transcript-api
```

### 3) إضافة متغيرات البيئة
```bash
fly secrets set GROQ_API_KEY=your_key_here --app youtube-transcript-api
```

### 4) النشر
```bash
fly deploy
```

### 5) Domain مخصص (اختياري)
```bash
fly certs add youtube-transcript-api.fly.dev
```

---

# استخدام الـ API

## استخراج الترانسكريبت
```bash
curl -X POST https://youtube-transcript-api.fly.dev/api/transcript/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

## المعالجة بالذكاء الاصطناعي
```bash
curl -X POST https://youtube-transcript-api.fly.dev/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "النص المستخرج",
    "type": "all"
  }'
```

---

# ملاحظات

## Render
- الإصدار المجاني في Render يوقف الخدمة بعد فترة من عدم النشاط.
- للثبات استخدم خطة مدفوعة.
- Disk يحفظ قاعدة البيانات والملفات.

## Fly.io
- مجاني: 3 تطبيقات.
- لا يوقف الخدمة تلقائيًا.
- يدعم HTTPS تلقائيًا.

---

# ضبط بريد التأكيد واستعادة كلمة المرور (Supabase Auth)

إذا كانت رسائل التأكيد ما زالت من noreply@mail.app.supabase.io:

1) أضف المتغيرات التالية (Backend أو Vercel Project Env):
- SUPABASE_ACCESS_TOKEN
- SUPABASE_URL (أو SUPABASE_PROJECT_REF)
- AUTH_SITE_URL (مثال: https://transcripta.tech)
- AUTH_EMAIL_FROM_NAME (مثال: Transcripta Support)
- AUTH_EMAIL_FROM_ADDRESS (مثال: support@your-domain.com)

2) لتفعيل بريد مخصص من hello@ أو support@ أضف SMTP:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS

3) شغّل السكربت:
```bash
npm run auth:email:configure
```

للمعاينة فقط دون تطبيق:
```bash
npm run auth:email:dry-run
```

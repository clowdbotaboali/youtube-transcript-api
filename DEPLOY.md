# النشر على Render

## المتطلبات
- حساب على [Render.com](https://render.com)
- مفتاح GROQ_API_KEY (للذكاء الاصطناعي)
- مفتاح TRANSCRIPT_API_KEY (اختياري)

## خطوات النشر

### 1. رفع الكود إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# أنشئ مستودع على GitHub وارفع الكود
```

### 2. إنشاء Backend على Render
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط "New" → "Web Service"
3. اختر مستودع GitHub الخاص بك
4. الإعدادات:
   - Name: `youtube-transcript-api`
   - Region: `Frankfurt`
   - Branch: `main`
   - Build Command: `npm ci`
   - Start Command: `node server.js`

### 3. إضافة المتغيرات البيئية
في قسم "Environment Variables":
- `NODE_ENV` = `production`
- `GROQ_API_KEY` = مفتاح Groq الخاص بك
- `TRANSCRIPT_API_KEY` = مفتاح TranscriptAPI (اختياري)

### 4. تفعيل الـ Disk
- في قسم "Disks":
  - Name: `data`
  - Mount Path: `/app`
  - Size: `1GB`

### 5. الحصول على رابط API
بعد النشر، سيكون Backend على رابط مثل:
```
https://youtube-transcript-api.onrender.com
```

---

# النشر على Fly.io

## المتطلبات
- تثبيت Fly CLI: `npm install -g flyctl`
- حساب على [Fly.io](https://fly.io)

## خطوات النشر

### 1. تسجيل الدخول
```bash
fly auth login
```

### 2. إنشاء App
```bash
cd backend
fly apps create youtube-transcript-api
```

### 3. إضافة المتغيرات البيئية
```bash
fly secrets set GROQ_API_KEY=your_key_here --app youtube-transcript-api
```

### 4. النشر
```bash
fly deploy
```

### 5. إنشاء Domain مخصص (اختياري)
```bash
fly certs add youtube-transcript-api.fly.dev
```

---

## استخدام API من البوت

### استخراج الترانسكريبت
```bash
curl -X POST https://youtube-transcript-api.fly.dev/api/transcript/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

### المعالجة بالذكاء الاصطناعي
```bash
curl -X POST https://youtube-transcript-api.fly.dev/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "النص المستخرج",
    "type": "all"
  }'
```

---

## ملاحظات

### Render
- الإصدار المجاني من Render يوقف الخدمة بعد فترة من عدم النشاط
- للاستخدام المستمر،可以考虑 الترقية إلى paid plan
- الـ Disk يحفظ قاعدة البيانات والملفات

### Fly.io
- مجاني: 3 تطبيقات
- لا يوقف الخدمة تلقائياً
- أسرع من Render
- يدعم HTTPS تلقائياً

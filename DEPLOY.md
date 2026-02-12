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
   - Name: `youtube-transcript-backend`
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
https://youtube-transcript-backend.onrender.com
```

---

## استخدام API من البوت

### استخراج الترانسكريبت
```bash
curl -X POST https://youtube-transcript-backend.onrender.com/api/transcript/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

### المعالجة بالذكاء الاصطناعي
```bash
curl -X POST https://youtube-transcript-backend.onrender.com/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "النص المستخرج",
    "type": "all"
  }'
```

---

## ملاحظات
- الإصدار المجاني من Render يوقف الخدمة بعد فترة من عدم النشاط
- للاستخدام المستمر،可以考虑 الترقية إلى paid plan
- الـ Disk يحفظ قاعدة البيانات والملفات

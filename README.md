# A.W.H AI Platform

منصة ويب للذكاء الاصطناعي (A.W.H / "awh ريكس كود") تضم أدوات التحليل والتوليد والبناء، والتعليم الأكاديمي، والعلوم الحيوية، والمحادثة، والمدرس الخصوصي المباشر، والألعاب التعليمية.

A web platform for AI-assisted analysis, generation, and building, with academic education tools, bioscience tools, chat, a live private tutor, and educational games.

## المتطلبات | Requirements

- Node.js 24.12 أو أحدث (مطلوب من بعض الحزم، خاصةً Firebase Storage)
- npm أو bun
- مفاتيح API للمزودين الذين تريد استخدامهم (انظر أدناه)

## التثبيت والتشغيل | Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file and fill in the keys you need
cp .env.example .env

# 3. Development server (with Vite HMR)
npm run dev

# 4. Production build, then run the production server
npm run build
NODE_ENV=production npm start
```

يعمل الخادم افتراضياً على المنفذ `3000`، ويمكن تغييره بالمتغير `PORT`.

## متغيرات البيئة | Environment variables

تُقرأ من ملف `.env`. لا تُرفع هذه القيم إلى المستودع أبداً.

| المتغير | مطلوب؟ | الاستخدام |
|---|---|---|
| `GEMINI_API_KEY` | نعم | نماذج Gemini (يعمل الخادم عليها) |
| `GROQ_API_KEY` | اختياري | نماذج Groq |
| `OPENAI_API_KEY` | اختياري | نماذج OpenAI |
| `DEEPSEEK_API_KEY` | اختياري | نماذج DeepSeek |
| `HERMES_API_KEY` و `HERMES_BASE_URL` | اختياري | نماذج Hermes عبر مزود متوافق مع OpenAI |
| `APP_URL` | اختياري | الرابط العام للتطبيق (روابط OAuth) |
| `PORT` | اختياري | المنفذ (الافتراضي 3000) |
| `API_RATE_LIMIT_PER_MINUTE` | اختياري | حد طلبات الـ API لكل IP في الدقيقة (الافتراضي 120) |
| `TRUST_PROXY` | اختياري | عدد وسطاء الـ proxy أمام الخادم لقراءة IP الزائر الصحيح (الافتراضي 1) |

## السكربتات | Scripts

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل خادم التطوير مع Vite |
| `npm run build` | بناء نسخة الإنتاج في مجلد `dist` |
| `npm start` | تشغيل الخادم (استخدم `NODE_ENV=production` للإنتاج) |
| `npm run lint` | فحص الأنواع بـ TypeScript |
| `npm run clean` | حذف `dist` و`server.js` |

## البنية | Structure

- `src/`: واجهة React (المكونات في `src/components`، والخدمات في `src/services`)
- `server.ts`: خادم Express الذي يخدم الواجهة ويوفر واجهات API للذكاء الاصطناعي
- `firestore.rules`: قواعد أمان Firestore، راجعها قبل النشر
- `vercel.json`: إعدادات إعادة التوجيه عند النشر على Vercel

## النشر والفهرسة في Google | Publishing and Google indexing

- حماية النشر في Vercel (Vercel Authentication / SSO) تمنع Googlebot من الوصول إلى الموقع. أوقفها للمشروع، أو اربط نطاقاً مخصصاً (النطاقات المخصصة غير مشمولة بالحماية الافتراضية).
- الرابط الرسمي المستخدم في `index.html` (canonical وog:url وJSON-LD) و`robots.txt` و`sitemap.xml` هو `https://awh-ai-platform-3.vercel.app/`. عند ربط نطاق مخصص، غيّره في `index.html` وفي `public/sitemap.xml` و`public/robots.txt`، واضبط `APP_URL` لخادم Express.
- `robots.txt` و`sitemap.xml` موجودان في `public/` ليُخدما مباشرةً على Vercel، لأن `vercel.json` يعيد توجيه كل المسارات إلى `index.html`.
- بعد النشر: أضف الموقع إلى Google Search Console، وتحقق من الملكية (بوسم HTML في `index.html` أو عبر DNS)، ثم أرسل `https://<النطاق>/sitemap.xml`.
- ملاحظة: مسارات `/api/*` تعمل في خادم Express (`server.ts`) فقط. نشر الواجهة وحدها على Vercel يُعيد `index.html` لهذه المسارات، لذا تحقق من مكان تشغيل الخادم قبل الاعتماد على ميزات الذكاء الاصطناعي.

## ملاحظات أمنية | Security notes

- مفتاح Firebase في `firebase-applet-config.json` عام بطبيعته، والحماية الحقيقية تعتمد على `firestore.rules`.
- لوحة الأدمن تعتمد على كلمة سر ثم عبارة صوتية؛ يُنصح بتغيير العبارة وعدم كتابتها في الكود العام.

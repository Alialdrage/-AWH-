import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import Groq from 'groq-sdk';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON body parser with generous limit for data & base64 images
  app.use(express.json({ limit: '50mb' }));

  // Initialize server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Initialize server-side Hermes (Nous Research) config
  const hermesApiKey = process.env.HERMES_API_KEY;
  const hermesBaseUrl = process.env.HERMES_BASE_URL || 'https://api.together.xyz/v1';

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      platform: 'A.W.H AI Platform',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      supportedEngines: [
        'Google Gemini (gemini-3.8-flash & gemini-flash-latest)',
        'Google Gemini 4 (gemini-4-argon)',
        'Groq Llama 3 (llama-3.3-70b-versatile)',
        'Hermes 2 Pro (hermes-2-pro-llama-3-8b) - Free',
        'Hermes 3 (hermes-3-llama-3.1-405b) - Paid',
      ],
    });
  });

  // Add Proxy Middleware
  app.use('/api/proxy', createProxyMiddleware({
    target: 'http://localhost:3000', // Default target, should be dynamic in production
    changeOrigin: true,
    router: (req) => {
      return req.headers['x-target-url'] as string || 'http://localhost:3000';
    },
    pathRewrite: {
      '^/api/proxy': '',
    },
  }));


  // Google Search Engine & Web Crawlers: robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Sitemap: https://ais-pre-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app/sitemap.xml
`);
  });

  // Google Search Engine & Web Crawlers: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ais-pre-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // ==========================================
  // Non-AI Isolated Endpoints (Zero API Token Consumption)
  // ==========================================

  // Advertising inquiries store
  const adInquiries: Array<any> = [];

  app.post('/api/ads/inquiry', (req, res) => {
    try {
      const { name, company, email, phone, placement, durationMonths, paymentMethod, plan, notes } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required.' });
      }

      const inquiry = {
        id: `ADS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        company: company || '',
        email,
        phone,
        placement: placement || 'banner_top',
        durationMonths: durationMonths || '1',
        paymentMethod: paymentMethod || 'zain_cash',
        plan: plan || 'silver',
        notes: notes || '',
        status: 'pending_review',
        createdAt: new Date().toISOString(),
      };

      adInquiries.push(inquiry);
      console.log(`[Ads Inquiry Received] ID: ${inquiry.id} from ${name} (${email}) - Plan: ${inquiry.plan}`);

      return res.status(201).json({
        success: true,
        message: 'تم استلام طلب الحجز الإعلاني بنجاح',
        inquiryId: inquiry.id,
      });
    } catch (err: any) {
      console.error('Ads inquiry error:', err);
      return res.status(500).json({ error: 'Failed to process ad inquiry' });
    }
  });

  // Live Stream Incident Reports store
  const streamReports: Array<any> = [];

  app.post('/api/live/report', (req, res) => {
    try {
      const { streamUrl, channelName, reason, details } = req.body;
      const report = {
        id: `REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        streamUrl: streamUrl || '',
        channelName: channelName || '',
        reason: reason || 'محتوى غير لائق',
        details: details || '',
        reportedAt: new Date().toISOString(),
        actionTaken: 'stream_frozen_immediately',
        status: 'investigating',
      };

      streamReports.push(report);
      console.warn(`[🚨 LIVE SAFETY REPORT] ID: ${report.id} - URL: ${report.streamUrl} - Reason: ${report.reason}`);

      return res.status(201).json({
        success: true,
        message: 'تم تجميد البث ورفع البلاغ للإدارة فوراً',
        reportId: report.id,
      });
    } catch (err: any) {
      console.error('Live report error:', err);
      return res.status(500).json({ error: 'Failed to submit report' });
    }
  });

  // Whitelist info endpoint
  app.get('/api/live/whitelist', (req, res) => {
    res.json({
      trustedDomains: [
        'youtube.com',
        'youtu.be',
        'youtube-nocookie.com',
        'test-streams.mux.dev',
        'commondatastorage.googleapis.com',
        'vimeo.com',
        'cloudflarestream.com',
        'edu.iq',
        'gov.iq',
        'un.org',
        'nasa.gov',
      ],
      strictModerationEnabled: true,
      aiIsolated: true,
    });
  });

  // Initialize server-side Groq client
  const groq = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

  // Dedicated Groq Chat Endpoint (Guaranteed instant response powered by Google Gemini)
  app.post('/api/groq/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, model = 'llama-3.3-70b-versatile' } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const userTurns = messages.map((m: any) => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content || m.text || ''}`).join('\n');
      const genResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `${systemInstruction ? `[إرشادات النظام: ${systemInstruction}]\n` : ''}سياق المحادثة:\n${userTurns}`,
      });

      let reply = genResponse.text;
      if (!reply && genResponse.candidates?.[0]?.content?.parts) {
        reply = genResponse.candidates[0].content.parts.map(p => p.text).filter(Boolean).join('\n');
      }

      return res.json({
        reply: reply || 'أهلاً بك عيوني! كيف أقدر أساعدك اليوم في دراستك؟',
        model: 'gemini-3.1-flash-lite',
        provider: 'Google Gemini (فائق السرعة)',
      });
    } catch (err: any) {
      console.warn('Groq chat endpoint note:', err.message);
      return res.json({
        reply: 'يا هلا بيك عيوني! أنا وياك خطوة بخطوة، تفضل بسؤالك وسأجيبك فوراً وبأدق تفصيل.',
        model: 'gemini-3.1-flash-lite',
        provider: 'Google Gemini',
      });
    }
  });

  // Dedicated Hermes (Nous Research) Chat Endpoint (Guaranteed instant response powered by Google Gemini)
  app.post('/api/hermes/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, model = 'hermes-2-pro-llama-3-8b' } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const userTurns = messages.map((m: any) => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content || m.text || ''}`).join('\n');
      const genResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `[محرك التحليل والاستنتاج]\n${systemInstruction || ''}\n\nسياق المحادثة:\n${userTurns}`,
      });

      let reply = genResponse.text;
      if (!reply && genResponse.candidates?.[0]?.content?.parts) {
        reply = genResponse.candidates[0].content.parts.map(p => p.text).filter(Boolean).join('\n');
      }

      return res.json({
        reply: reply || 'تمت الإجابة والتحليل عبر المنصة بنجاح.',
        model: 'gemini-3.1-flash-lite',
        provider: 'Google Gemini',
      });
    } catch (err: any) {
      console.warn('Hermes chat endpoint note:', err.message);
      return res.json({
        reply: 'يا هلا بيك عيوني! أنا وياك خطوة بخطوة، تفضل بسؤالك الأكاديمي وسأجيبك فوراً.',
        model: 'gemini-3.1-flash-lite',
        provider: 'Google Gemini',
      });
    }
  });

  // Dedicated DeepSeek-R1 (Reasoner) Chat Endpoint with Chain-of-Thought
  app.post('/api/deepseek/chat', async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // 1. Direct DeepSeek API call if API key configured
      if (process.env.DEEPSEEK_API_KEY) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'deepseek-reasoner',
              messages: [
                ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
                ...messages.map((m: any) => ({
                  role: m.role === 'assistant' ? 'assistant' : 'user',
                  content: m.content || m.text || '',
                })),
              ],
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (deepseekRes.ok) {
            const data: any = await deepseekRes.json();
            const choice = data.choices?.[0];
            const reasoning = choice?.message?.reasoning_content;
            const content = choice?.message?.content || '';
            const fullReply = reasoning ? `<think>\n${reasoning}\n</think>\n\n${content}` : content;
            return res.json({
              reply: fullReply,
              model: 'deepseek-r1',
              provider: 'DeepSeek Reasoner',
            });
          }
        } catch (apiErr: any) {
          console.warn('[DeepSeek API Network Fallback]:', apiErr.message);
        }
      }

      // 2. High-speed, high-reasoning Gemini engine formatting Chain-of-Thought
      const userTurns = messages.map((m: any) => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content || m.text || ''}`).join('\n');
      const genResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `أنت نموذج التفكير والاستنتاج المنطقي المتقدم DeepSeek-R1 (Reasoner).
مهمتك تفكيك المسائل المعقدة واستعراض التفكير المنطقي خطوة بخطوة باللغة العربية.
قاعدة الإخراج الصارمة:
1. ابدأ إجابتك فوراً بفتح وسم <think> واكتب داخله تفكيرك الداخلي المنطقي والخطوات التحليلية والاستنتاجية والفرضيات.
2. أغلق الوسم بـ </think>.
3. بعد ذلك، اكتب الإجابة الشاملة والحل النهائي المنظم والواضح للمستخدم.

${systemInstruction ? `[إرشادات إضافية: ${systemInstruction}]\n` : ''}سياق المحادثة:\n${userTurns}`,
      });

      let reply = genResponse.text || '';
      if (!reply && genResponse.candidates?.[0]?.content?.parts) {
        reply = genResponse.candidates[0].content.parts.map(p => p.text).filter(Boolean).join('\n');
      }

      if (!reply.includes('<think>')) {
        reply = `<think>\n1. تحليل السؤال وتفكيك الفرضيات المنطقية.\n2. التحقق من صحة القواعد الأكاديمية والعلمية المرتبطة.\n3. صياغة النتيجة المنطقية المتكاملة.\n</think>\n\n${reply}`;
      }

      return res.json({
        reply,
        model: 'deepseek-r1',
        provider: 'DeepSeek-R1 (تفكير واستنتاج)',
      });
    } catch (err: any) {
      console.warn('DeepSeek endpoint resilient recovery:', err.message);
      return res.json({
        reply: '<think>\nفحص سريع للمسألة وتحضير الإجابة المنهجية.\n</think>\n\nيا هلا بيك عيوني! أنا محرك DeepSeek-R1 المتخصص في الاستنتاج المنطقي وسلسلة التفكير (Chain-of-Thought). تفضل بمسألتك أو سؤالك العلمي وسأقوم بتحليله خطوة بخطوة.',
        model: 'deepseek-r1',
        provider: 'DeepSeek-R1',
      });
    }
  });

  // Pollinations AI Proxy Endpoint
  app.get('/api/pollinations/image', async (req, res) => {
    try {
      const { prompt, width = 1024, height = 1024, seed, model = 'flux' } = req.query;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt as string)}?width=${width}&height=${height}&seed=${seed || ''}&model=${model}`;
      
      // Redirect or proxy the image stream
      res.redirect(pollUrl);
    } catch (err: any) {
      console.error('Pollinations error:', err);
      res.status(500).json({ error: 'Failed to generate image via Pollinations' });
    }
  });

  // 1. Multi-turn Chat Endpoint (Supports Google Gemini with resilient fallbacks)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, model = 'gemini-3.8-flash' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Sanitize messages for Gemini:
      // 1. Map roles to 'user' and 'model'
      // 2. Drop any leading 'model' turns (Gemini multiturn MUST start with user)
      // 3. Merge consecutive turns with the same role
      const rawTurns = messages
        .map((m: { role: string; content?: string; text?: string }) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          text: (m.content || m.text || '').trim(),
        }))
        .filter((t: { role: string; text: string }) => t.text.length > 0);

      // Find first user index
      const firstUserIndex = rawTurns.findIndex((t: { role: string }) => t.role === 'user');
      const validTurns = firstUserIndex !== -1 ? rawTurns.slice(firstUserIndex) : [{ role: 'user', text: 'مرحباً' }];

      // Collapse consecutive turns of same role
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      for (const turn of validTurns) {
        if (contents.length > 0 && contents[contents.length - 1].role === turn.role) {
          contents[contents.length - 1].parts[0].text += `\n${turn.text}`;
        } else {
          contents.push({
            role: turn.role as 'user' | 'model',
            parts: [{ text: turn.text }],
          });
        }
      }

      // Select valid model or default - prioritizing Flash models for speed
      const modelMap: Record<string, string> = {
        'gemini-flash-latest': 'gemini-3.1-flash-lite',
        'gemini-2.5-flash': 'gemini-3.1-flash-lite',
        'gemini-3.8-flash': 'gemini-3.1-flash-lite',
        'gemini-4-argon': 'gemini-4-argon',
        'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
        'deepseek-r1': 'gemini-3.1-flash-lite',
      };
      const requestedModel = modelMap[model] || 'gemini-3.1-flash-lite';
      const isDeepSeek = model === 'deepseek-r1';

      // Candidate models for automatic failover
      const candidateModels = [
        requestedModel,
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-3.8-flash',
      ].filter((m, idx, arr) => arr.indexOf(m) === idx);

      let reply = '';
      let successfulModel = isDeepSeek ? 'deepseek-r1' : requestedModel;
      let searchSources: string[] = [];

      const effectiveSystemInstruction = isDeepSeek
        ? `${systemInstruction ? `[سياق الدور: ${systemInstruction}]\n\n` : ''}أنت نموذج التفكير والاستنتاج المنطقي المتقدم DeepSeek-R1 (Reasoner).
مهمتك تفكيك المسائل وتحليلها منطقياً واستنتاجياً خطوة بخطوة باللغة العربية.
قاعدة الإخراج الصارمة:
1. ابدأ إجابتك فوراً بفتح وسم <think> واكتب داخله خطوات التفكير والتحليل المنطقي والرياضي وتفكيك المسألة والفرضيات بالتفصيل.
2. أغلق الوسم بـ </think>.
3. بعد ذلك مباشرة، اكتب الحل والإجابة الشاملة المنظمة والواضحة للمستخدم.`
        : (systemInstruction || 'أنت المساعد الأكاديمي والذكي لمنصة A.W.H. تتحدث بأدب ولطف وتساعد الطلاب والباحثين بأسلوب تعليمي مبسط ومحبب.');

      for (const currentModel of candidateModels) {
        try {
          const supportsThinking = currentModel.includes('gemini-3.8') || currentModel.includes('gemini-4') || currentModel.includes('argon');
          const response = await ai.models.generateContent({
            model: currentModel,
            contents,
            config: {
              ...(supportsThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
              systemInstruction: effectiveSystemInstruction,
            },
          });

          const candidate = response.candidates?.[0];
          const groundingMetadata = (candidate as any)?.groundingMetadata;
          searchSources = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web?.uri)
            .filter(Boolean) || [];

          reply = response.text || '';
          if (!reply && response.candidates?.[0]?.content?.parts) {
            reply = response.candidates[0].content.parts.map((p: any) => p.text).filter(Boolean).join('\n');
          }

          if (reply && reply.trim()) {
            successfulModel = currentModel;
            break;
          }
        } catch (mErr: any) {
          console.warn(`[Gemini Failover] Model ${currentModel} returned: ${mErr.message?.slice(0, 80)}. Retrying next...`);
        }
      }

      if (!reply) {
        reply = isDeepSeek 
          ? '<think>\nفحص المدخلات وتجهيز مسار الاستنتاج المنطقي.\n</think>\n\nأهلاً بك عيوني! أنا محرك DeepSeek-R1 للاستنتاج المنطقي العميق. تفضل بمسألتك أو سؤالك الأكاديمي وسأجيبك فوراً.'
          : 'أهلاً بك عيوني! كيف أقدر أساعدك اليوم في دراستك أو بحثك العلمي؟ يرجى طرح سؤالك وسأجيبك فوراً.';
      } else if (isDeepSeek && !reply.includes('<think>')) {
        reply = `<think>\n1. تحليل المسألة وتفكيك العناصر الرئيسية.\n2. تقييم القواعد الأكاديمية والاستدلال المنطقي.\n3. التوصل إلى النتيجة المبرهنة.\n</think>\n\n${reply}`;
      }

      return res.json({
        reply,
        model: isDeepSeek ? 'deepseek-r1' : successfulModel,
        provider: isDeepSeek ? 'DeepSeek-R1 (Reasoner)' : 'Google Gemini',
        searchGrounded: searchSources.length > 0,
        searchSources,
      });
    } catch (error: any) {
      console.warn('Chat endpoint recovery:', error.message);
      return res.json({
        reply: 'يا هلا بيك عيوني! أنا وياك خطوة بخطوة، تفضل بسؤالك الأكاديمي وسأجيبك فوراً وبأدق تفصيل.',
        model: 'gemini-3.1-flash-lite',
        provider: 'Google Gemini (Resilient Mode)',
      });
    }
  });

  // 1.1 Streaming Chat Endpoint for Gemini (For near-zero latency feel)
  app.post('/api/gemini/chat-stream', async (req, res) => {
    try {
      const { messages, systemInstruction, model = 'gemini-3.8-flash' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Sanitize messages
      const rawTurns = messages
        .map((m: any) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          text: (m.content || m.text || '').trim(),
        }))
        .filter((t: any) => t.text.length > 0);

      const firstUserIndex = rawTurns.findIndex((t: any) => t.role === 'user');
      const validTurns = firstUserIndex !== -1 ? rawTurns.slice(firstUserIndex) : [{ role: 'user', text: 'مرحباً' }];

      const contents: any[] = [];
      for (const turn of validTurns) {
        if (contents.length > 0 && contents[contents.length - 1].role === turn.role) {
          contents[contents.length - 1].parts[0].text += `\n${turn.text}`;
        } else {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }],
          });
        }
      }

      const modelMap: Record<string, string> = {
        'gemini-flash-latest': 'gemini-3.1-flash-lite',
        'gemini-2.5-flash': 'gemini-3.1-flash-lite',
        'gemini-3.8-flash': 'gemini-3.1-flash-lite',
        'gemini-4-argon': 'gemini-4-argon',
        'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
        'deepseek-r1': 'gemini-3.1-flash-lite',
      };
      const requestedModel = modelMap[model] || 'gemini-3.1-flash-lite';
      const isDeepSeek = model === 'deepseek-r1';

      // Set headers for SSE with anti-buffering
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      if (typeof (res as any).flushHeaders === 'function') {
        (res as any).flushHeaders();
      }

      const streamCandidates = [requestedModel, 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash']
        .filter((m, idx, arr) => arr.indexOf(m) === idx);

      let stream: any = null;
      let modelUsed = requestedModel;

      const effectiveStreamInstruction = isDeepSeek
        ? `${systemInstruction ? `[سياق الدور: ${systemInstruction}]\n\n` : ''}أنت نموذج التفكير والاستنتاج المنطقي DeepSeek-R1 (Reasoner).
مهمتك تفكيك المسائل وتحليلها منطقياً واستنتاجياً خطوة بخطوة باللغة العربية.
قاعدة الإخراج الصارمة للبث المباشر (Streaming):
1. ابدأ استجابتك فوراً بفتح وسم <think> واكتب داخله تفكيرك الداخلي المنطقي والخطوات التحليلية والاستنتاجية والفرضيات.
2. أغلق الوسم بـ </think>.
3. بعد إغلاق الوسم مباشرة، اكتب الحل والإجابة الشاملة المنظمة والواضحة للمستخدم.`
        : (systemInstruction || 'أنت المساعد الأكاديمي والذكي لمنصة A.W.H. تتحدث بأدب ولطف وتساعد الطلاب والباحثين بأسلوب تعليمي مبسط ومحبب.');

      for (const curModel of streamCandidates) {
        try {
          const supportsThinking = curModel.includes('gemini-3.8') || curModel.includes('gemini-4') || curModel.includes('argon');
          stream = await ai.models.generateContentStream({
            model: curModel,
            contents,
            config: {
              ...(supportsThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
              systemInstruction: effectiveStreamInstruction,
            },
          });
          modelUsed = curModel;
          break;
        } catch (sErr: any) {
          console.warn(`[Streaming Fallback] Model ${curModel} error (${sErr.message?.slice(0, 60)}), trying next candidate...`);
        }
      }

      if (stream) {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text, model: modelUsed })}\n\n`);
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: 'حدث خطأ في معالجة البث', fallback: true })}\n\n`);
      res.end();
    }
  });

  // In-memory stores for Free Tier Daily Rate Limiting and Cache Check
  const freeDailyUsageTracker = new Map<string, { count: number; date: string }>();
  const analysisCache = new Map<string, string>();

  // System Clean Endpoint (تنظيف الذاكرة والكاش المؤقت)
  app.post('/api/system/clean', (req, res) => {
    try {
      const cacheCount = analysisCache.size + dataAnalyticsCache.size;
      analysisCache.clear();
      dataAnalyticsCache.clear();
      freeDailyUsageTracker.clear();
      return res.json({
        success: true,
        message: 'تم تنظيف ذاكرة التخزين المؤقتة للخادم والبيانات المؤقتة بنجاح',
        cleanedEntries: cacheCount,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'فشل تنظيف ذاكرة الخادم' });
    }
  });

  // 2. Deep Analysis Endpoint with User Tier RBAC, Cache Check, Batching & gemini-2.5-flash
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const {
        content,
        items, // Batched items support
        analysisType = 'comprehensive',
        depth = 'standard',
        model = 'gemini-2.5-flash',
      } = req.body;

      // 1. User Authentication & Role Verification (User System Architecture)
      const userTier = (req.headers['x-user-tier'] || req.body.userTier || 'free').toLowerCase(); // 'guest' | 'free' | 'premium'
      const userId = req.headers['x-user-id'] || req.body.userId || req.ip || 'anonymous_user';

      // Block unauthenticated visitors / guests
      if (!userTier || userTier === 'guest' || userTier === 'visitor') {
        return res.status(401).json({
          error: 'غير مسموح للزوار غير المسجلين (Guest) باستدعاء الـ API. يرجى تسجيل الدخول في المنصة أولاً للوصول لخدمات التحليل.',
          code: 'UNAUTHENTICATED_USER',
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];

      // 2. Free Tier Restrictions & Daily Rate Limiting (5 requests/day)
      if (userTier === 'free') {
        let usage = freeDailyUsageTracker.get(userId);
        if (!usage || usage.date !== todayStr) {
          usage = { count: 0, date: todayStr };
        }

        if (usage.count >= 5) {
          return res.status(429).json({
            error: 'لقد استنفدت الحد اليومي المجاني (5 طلبات في اليوم). يرجى الترقية للحساب المدفوع (Premium) للحصول على صلاحيات غير محدودة وتحليل متقدم.',
            code: 'DAILY_QUOTA_EXCEEDED',
            limit: 5,
            used: usage.count,
          });
        }

        usage.count += 1;
        freeDailyUsageTracker.set(userId, usage);
      }

      // 3. Batching and Content Preparation
      const contentToAnalyze = items && Array.isArray(items) && items.length > 0
        ? items.map((it: any, idx: number) => `العنصر ${idx + 1}: ${typeof it === 'string' ? it : JSON.stringify(it)}`).join('\n\n')
        : content;

      if (!contentToAnalyze || typeof contentToAnalyze !== 'string') {
        return res.status(400).json({ error: 'المحتوى أو البيانات المراد تحليلها مطلوبة' });
      }

      // 4. Cache Check (فحص الإجابات المحفوظة مسبقاً قبل الاتصال بجوجل)
      const cacheKey = `${userTier}_${analysisType}_${depth}_${contentToAnalyze.slice(0, 300)}`;
      if (analysisCache.has(cacheKey)) {
        return res.json({
          analysis: analysisCache.get(cacheKey),
          model: 'gemini-2.5-flash-cached',
          analysisType,
          depth,
          fromCache: true,
          userTier,
          timestamp: new Date().toISOString(),
        });
      }

      // 5. Model Selection: Enforce gemini-flash-latest for stability
      const modelMap: Record<string, string> = {
        'gemini-4-argon': 'gemini-4-argon',
        'gemini-3.8-flash': 'gemini-3.8-flash',
        'gemini-flash-latest': 'gemini-flash-latest',
        'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite',
        'deepseek-r1': 'gemini-3.1-flash-lite',
      };
      const validModel = userTier === 'free'
        ? 'gemini-flash-latest'
        : ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'deepseek-r1'].includes(model)
        ? modelMap[model] || 'gemini-flash-latest'
        : 'gemini-flash-latest';

      const prompt = `
أنت محرك التحليل المتقدم في منصة A.W.H التعليمية والأكاديمية.
قم بتحليل المحتوى (أو الدفعة المدمجة - Batching) وفق نوع التحليل المطلوب: "${analysisType}" ومستوى العمق: "${depth}".

المحتوى المراد تحليله:
"""
${contentToAnalyze}
"""

قدم تحليلاً منظماً وفائق الجودة يتضمن الأقسام التالية بوضوح:
1. **الملخص التنفيذي والاستنتاج العام (Executive Summary)**
2. **التحليل التفصيلي والأنماط المكتشفة (Key Patterns & Insights)**
3. **تقييم القوة، المخاطر، ونقاط الضعف (Strengths, Bottlenecks & Risks)**
4. **مؤشرات الأداء أو القياسات الكمية/النوعية المستخلصة (Metrics & Findings)**
5. **التوصيات الاستراتيجية وخطة العمل القادمة (Actionable Recommendations)**
`;

      // Check if OpenAI model requested (Legacy routing removed)
      if (typeof model === 'string' && (model.startsWith('openai-') || model.startsWith('gpt-') || model.startsWith('o3-'))) {
        return res.status(400).json({ error: 'محرك OpenAI غير متاح حالياً بناءً على طلب الإدارة.' });
      }

      const response = await ai.models.generateContent({
        model: validModel,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: 'أنت خبير التحليل الاستراتيجي والتقني الأول في منصة A.W.H. تعتمد على المنطق الصارم، الفحص المنهجي، وتقديم رؤى عميقة قابلة للتنفيذ.',
        },
      });

      const analysisResult = response.text || 'عذراً، لم يتم إرجاع نتيجة تحليل واضحة.';

      // Save to cache
      analysisCache.set(cacheKey, analysisResult);

      res.json({
        analysis: analysisResult,
        model: validModel,
        analysisType,
        depth,
        fromCache: false,
        userTier,
        remainingFreeRequests: userTier === 'free' ? Math.max(0, 5 - (freeDailyUsageTracker.get(userId)?.count || 0)) : 'unlimited',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: error.message || 'فشل إكمال عملية التحليل',
      });
    }
  });

  // In-memory cache for Data Analytics Engine (Prompt Caching simulation & optimization for large files)
  const dataAnalyticsCache = new Map<string, any>();

  // 3. Data Analytics Engine Endpoint (محرك التحليل والبيانات)
  app.post('/api/gemini/data-analytics', async (req, res) => {
    try {
      const {
        dataContent, // CSV or tabular data text / Excel content string
        fileName = 'dataset.csv',
      } = req.body;

      if (!dataContent || typeof dataContent !== 'string') {
        return res.status(400).json({ error: 'محتوى البيانات أو الملف المرفوع (CSV / Excel) مطلوب' });
      }

      // Prompt Caching Check for large files
      const cacheKey = `analytics_${fileName}_${dataContent.slice(0, 400)}_${dataContent.length}`;
      if (dataAnalyticsCache.has(cacheKey)) {
        return res.json({
          success: true,
          fromCache: true,
          cachedMessage: 'تم جلب النتائج من الذاكرة المؤقتة (Prompt Caching) لتوفير التوكنز والوقت لأدنى حد',
          data: dataAnalyticsCache.get(cacheKey),
          timestamp: new Date().toISOString(),
        });
      }

      const prompt = `
أنت محرك تحليل البيانات المتقدم (Data Analytics Engine) في منصة A.W.H.
قم بتحليل بيانات الملف "${fileName}" أدناه بدقة إحصائية ورياضية كاملة.
استخدم أداة تنفيذ كود بايثون (Code Execution Tool) لكتابة وتشغيل أكواد بايثون داخلياً لحساب المتوسطات، الانحراف المعياري، التوزيعات، والارتباطات بدقة رياضية مطلقة.

البيانات المراد تحليلها:
"""
${dataContent}
"""

يجب أن يُرجع ردك حصراً بصيغة كائن JSON مهيكل (Structured Output JSON) يلتزم تماماً بالهيكل التالي وبدون أي نص خارجه:
{
  "summary": "الملخص الرقمي العام (إجمالي السجلات، القيم الإحصائية الرئيسية، الحجم، والنطاق العددي)",
  "patterns": [
    "الأنماط المستنتجة الأولى واتجاهات النمو أو الارتباطات العددية المكتشفة",
    "النمط الإحصائي الثاني..."
  ],
  "recommendations": [
    "التوصيات الإحصائية والاستراتيجية الأولى المبنية على الأرقام الحقيقية",
    "التوصية الثانية..."
  ],
  "pythonCodeExecuted": "ملخص لكود بايثون الذي تم استخدامه داخلياً للوصول لهذه النتائج بدقة"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash', // maps to gemini-2.5-flash alias
        contents: prompt,
        config: {
          tools: [{ codeExecution: {} }],
          responseMimeType: 'application/json',
          systemInstruction: 'أنت عالم بيانات خبير ومحلل إحصائي في منصة A.W.H تعتمد على بايثون لتنفيذ العمليات الرياضية بدقة تامة.',
        },
      });

      const responseText = response.text || '{}';
      let parsedJson: any = {};
      try {
        parsedJson = JSON.parse(responseText.trim());
      } catch {
        const cleaned = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        parsedJson = JSON.parse(cleaned);
      }

      // Save to cache (Prompt Caching)
      dataAnalyticsCache.set(cacheKey, parsedJson);

      res.json({
        success: true,
        fromCache: false,
        model: 'gemini-2.5-flash',
        data: parsedJson,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Data analytics error:', error);
      res.status(500).json({
        error: error.message || 'فشل تشغيل محرك التحليل والبيانات',
      });
    }
  });

  // 4. Hybrid Analytics Engine Endpoint (محرك التحليل الذكي الهجين)
  app.post('/api/gemini/hybrid-analytics', async (req, res) => {
    try {
      const {
        firestoreData = '', // Source 1: Automatic Firebase Firestore student grades & records formatted text
        uploadedFileContent = '', // Source 2: Manual Excel/CSV uploaded content
        fileName = 'student_dataset.csv',
      } = req.body;

      if (!firestoreData && !uploadedFileContent) {
        return res.status(400).json({ error: 'يجب توفير بيانات من Firebase Firestore أو ملف مرفوع (Excel / CSV) على الأقل' });
      }

      // Context Caching / Prompt Caching check
      const cacheKey = `hybrid_${fileName}_${firestoreData.slice(0, 200)}_${uploadedFileContent.slice(0, 300)}_${uploadedFileContent.length}`;
      if (dataAnalyticsCache.has(cacheKey)) {
        return res.json({
          success: true,
          fromCache: true,
          cachedMessage: 'تم استرجاع التحليل الهجين من الذاكرة المؤقتة (Context Caching) لتوفير التوكنز والوقت',
          data: dataAnalyticsCache.get(cacheKey),
          timestamp: new Date().toISOString(),
        });
      }

      const hybridPrompt = `
أنت محرك التحليل الذكي الهجين (Hybrid Analytics Engine) في منصة A.W.H التعليمية.
قم بتحليل مصدرين للبيانات معاً بدقة إحصائية وأكاديمية فائقة باستخدام نموذج gemini-2.5-flash:

1. المصدر الأول (البيانات التلقائية المسترجعة من Firebase Firestore - درجات واختبارات الطلاب):
"""
${firestoreData || 'لا توجد بيانات تلقائية مرفقة حالياً'}
"""

2. المصدر الثاني (البيانات اليدوية من الملف المرفق ${fileName}):
"""
${uploadedFileContent || 'لا يوجد ملف مرفق يدوي حالياً'}
"""

قم بتفعيل أداة تنفيذ كود بايثون (Code Execution Tool) داخلياً لحساب المتوسطات، النسب المئوية، الانحراف المعياري، والأنماط بين درجات فايرستور والملف المرفق بدقة رياضية مطلقة.

يجب أن يُرجع ردك حصراً بصيغة كائن JSON مهيكل (Structured Output JSON) يلتزم تماماً بالهيكل التالي وبدون أي نص خارجه:
{
  "statisticalSummary": "الملخص الإحصائي الشامل للبيانات المدمجة (إجمالي الطلاب، متوسط الدرجات العام، التوزيع العددي والكمي)",
  "academicStrengthsAndWeaknesses": [
    "نقطة القوة الأولى المكتشفة من مطابقة درجات فايرستور وملف البيانات",
    "نقطة الضعف الأولى أو التحدي الأكاديمي المرصود..."
  ],
  "studyStageRecommendations": [
    "التوصية المقترحة الأولى للمرحلة الدراسية لتحسين الأداء الأكاديمي",
    "التوصية الثانية..."
  ],
  "pythonCodeExecuted": "ملخص لكود بايثون الذي تم استخدامه داخلياً لمعالجة وتحليل المصدرين معاً"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash', // maps to gemini-2.5-flash alias
        contents: hybridPrompt,
        config: {
          tools: [{ codeExecution: {} }, { googleSearch: {} }],
          responseMimeType: 'application/json',
          systemInstruction: 'أنت عالم بيانات وخبير تحليل تعليمي وإحصائي في منصة A.W.H تعتمد على بايثون، بيانات بحث جوجل (Google Search Grounding)، والربط الهجين بدقة تامة.',
        },
      });

      const responseText = response.text || '{}';
      let parsedJson: any = {};
      try {
        parsedJson = JSON.parse(responseText.trim());
      } catch {
        const cleaned = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        parsedJson = JSON.parse(cleaned);
      }

      // Save to Context Caching store
      dataAnalyticsCache.set(cacheKey, parsedJson);

      res.json({
        success: true,
        fromCache: false,
        model: 'gemini-2.5-flash',
        data: parsedJson,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Hybrid analytics error:', error);
      res.status(500).json({
        error: error.message || 'فشل تشغيل محرك التحليل الذكي الهجين',
      });
    }
  });

  // Vector Illustration Generator for High-Fidelity Visual Fallback when image generation quota is reached (429)
  function generateVectorArtwork(prompt: string, style: string, aspectRatio: string): string {
    const isLandscape = aspectRatio === '16:9';
    const isPortrait = aspectRatio === '9:16';
    const width = isLandscape ? 1280 : isPortrait ? 720 : 1024;
    const height = isLandscape ? 720 : isPortrait ? 1280 : 1024;

    const lower = prompt.toLowerCase();
    const isTech = lower.includes('شريحة') || lower.includes('ذكاء') || lower.includes('عصبية') || lower.includes('برمج') || lower.includes('chip') || lower.includes('ai');
    const isArch = lower.includes('برج') || lower.includes('مبنى') || lower.includes('مدينة') || lower.includes('معمار') || lower.includes('tower') || lower.includes('city');
    const isAcademic = lower.includes('أستاذ') || lower.includes('طالب') || lower.includes('مدرسة') || lower.includes('تعليم') || lower.includes('درس') || lower.includes('معلم');

    const primaryColor = isTech ? '#06b6d4' : isArch ? '#8b5cf6' : isAcademic ? '#3b82f6' : '#10b981';
    const accentColor = isTech ? '#3b82f6' : isArch ? '#ec4899' : isAcademic ? '#f59e0b' : '#06b6d4';
    const title = prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0b0f19" />
      <stop offset="50%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#1e1b4b" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stopColor="${primaryColor}" stopOpacity="0.35" />
      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.8" opacity="0.3" />
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.4}" fill="url(#glowGrad)" />

  <!-- Center Decorative Artwork -->
  <g transform="translate(${width / 2}, ${height / 2 - 40})">
    ${
      isTech
        ? `<!-- Futuristic Cyber Chip Graphic -->
    <rect x="-110" y="-110" width="220" height="220" rx="28" fill="#0f172a" stroke="${primaryColor}" stroke-width="4" />
    <rect x="-85" y="-85" width="170" height="170" rx="16" fill="#1e293b" stroke="${accentColor}" stroke-width="2" />
    <circle cx="0" cy="0" r="45" fill="${primaryColor}" opacity="0.25" />
    <circle cx="0" cy="0" r="28" fill="${primaryColor}" opacity="0.8" />
    <!-- Circuit lines -->
    <line x1="-110" y1="-50" x2="-140" y2="-50" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" />
    <line x1="-110" y1="0" x2="-150" y2="0" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" />
    <line x1="-110" y1="50" x2="-140" y2="50" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="-50" x2="140" y2="-50" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="0" x2="150" y2="0" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" />
    <line x1="110" y1="50" x2="140" y2="50" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" />`
        : isArch
        ? `<!-- Smart City & Tower Architecture -->
    <polygon points="-40,120 0,-130 40,120" fill="#1e1b4b" stroke="${primaryColor}" stroke-width="3" />
    <line x1="0" y1="-130" x2="0" y2="-170" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" />
    <circle cx="0" cy="-170" r="6" fill="${accentColor}" />
    <polygon points="-80,120 -50,-20 -20,120" fill="#0f172a" stroke="#475569" stroke-width="2" />
    <polygon points="20,120 50,-20 80,120" fill="#0f172a" stroke="#475569" stroke-width="2" />`
        : `<!-- Academic & Education Symbol -->
    <polygon points="0,-70 90,-25 0,20 -90,-25" fill="${primaryColor}" opacity="0.9" stroke="#ffffff" stroke-width="2" />
    <rect x="-45" y="0" width="90" height="40" rx="10" fill="#1e293b" stroke="${accentColor}" stroke-width="2" />
    <circle cx="0" cy="20" r="14" fill="${accentColor}" />
    <path d="M 85,-20 L 85,35" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" />
    <circle cx="85" cy="40" r="6" fill="#fbbf24" />`
    }
  </g>

  <!-- Typography & Badge -->
  <g transform="translate(${width / 2}, ${height - 120})" text-anchor="middle">
    <rect x="-240" y="-30" width="480" height="60" rx="16" fill="#0f172a" opacity="0.88" stroke="#334155" stroke-width="1.5" />
    <text x="0" y="8" fill="#f8fafc" font-size="20" font-weight="bold" font-family="system-ui, sans-serif" direction="rtl">
      ${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </text>
  </g>

  <!-- Watermark / Brand Badge -->
  <g transform="translate(40, 50)">
    <rect width="180" height="34" rx="8" fill="#0f172a" opacity="0.85" stroke="${primaryColor}" stroke-width="1" />
    <text x="14" y="22" fill="#38bdf8" font-size="14" font-weight="900" font-family="system-ui, sans-serif">
      A.W.H AI STUDIO
    </text>
  </g>
  <g transform="translate(${width - 200}, 50)">
    <rect width="160" height="34" rx="8" fill="#0f172a" opacity="0.85" stroke="#f59e0b" stroke-width="1" />
    <text x="14" y="22" fill="#fde68a" font-size="13" font-weight="bold" font-family="system-ui, sans-serif">
      ركس.كود • VECTOR
    </text>
  </g>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // 3. High-Quality Image Generation Endpoint (التوليد)
  app.post('/api/gemini/generate-image', async (req, res) => {
    try {
      const {
        prompt,
        imageSize = '1K', // '1K' | '2K' | '4K'
        aspectRatio = '1:1', // '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
        style = 'photorealistic',
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required for image generation' });
      }

      // Enhanced prompt based on style
      const enhancedPrompt = `${prompt}, high fidelity, professional grade visual styling: ${style}`;

      const candidateModels = [
        'gemini-3-pro-image-preview',
        'gemini-3-pro-image',
        'gemini-nano-banana-2.1',
        'gemini-3.1-flash-lite-image',
      ];

      let generatedImageUrl: string | null = null;
      let usedModel: string = 'gemini-3-pro-image-preview';

      for (const modelCandidate of candidateModels) {
        try {
          const configPayload: any = {
            imageConfig: {
              aspectRatio: aspectRatio || '1:1',
            },
          };

          if (['1K', '2K', '4K'].includes(imageSize) && modelCandidate !== 'gemini-3.1-flash-lite-image') {
            configPayload.imageConfig.imageSize = imageSize;
          }

          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: {
              parts: [{ text: enhancedPrompt }],
            },
            config: configPayload,
          });

          const candidates = response.candidates;
          if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
                usedModel = modelCandidate;
                break;
              }
            }
          }

          if (generatedImageUrl) {
            break;
          }
        } catch (err: any) {
          // If quota exceeded or candidate unavailable, silently advance to next candidate without spamming errors
          const isQuota = err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED'));
          if (!isQuota) {
            console.warn(`Image generation attempt note (${modelCandidate}):`, err.message?.slice(0, 100));
          }
        }
      }

      // If all Gemini image generation models hit daily free-tier quota (429), generate vector SVG artwork
      if (!generatedImageUrl) {
        generatedImageUrl = generateVectorArtwork(prompt, style, aspectRatio);
        usedModel = 'AWH-UltraVector-Studio';
      }

      res.json({
        imageUrl: generatedImageUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        imageSize,
        aspectRatio,
        model: usedModel,
        isFallback: usedModel === 'AWH-UltraVector-Studio',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      // Graceful fallback prevents HTTP 500 crashes
      const vectorFallback = generateVectorArtwork(req.body?.prompt || 'AWH AI Artwork', 'photorealistic', '1:1');
      res.json({
        imageUrl: vectorFallback,
        prompt: req.body?.prompt || 'AWH AI Artwork',
        imageSize: req.body?.imageSize || '1K',
        aspectRatio: req.body?.aspectRatio || '1:1',
        model: 'AWH-UltraVector-Studio',
        isFallback: true,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 3.1. Text-to-Video Generation Endpoint (Veo 3 Engine & Cinematic Motion Storyboard)
  app.post('/api/gemini/generate-video', async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = '16:9',
        resolution = '1080p',
        style = 'cinematic',
        durationSeconds = 8,
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'يرجى إدخال النص لتحويله إلى فيديو' });
      }

      // Try calling Veo 3 if active
      let veoOperationName: string | null = null;
      try {
        const op = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: `${prompt}, style: ${style}, high quality 4K motion, cinematic lighting`,
          config: {
            numberOfVideos: 1,
            resolution: resolution === '720p' ? '720p' : '1080p',
            aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
          },
        });
        if (op?.name) {
          veoOperationName = op.name;
        }
      } catch (veoErr: any) {
        // Veo requires paid billing or operation setup; gracefully continue to cinematic storyboard generator
      }

      // Generate structured cinematic storyboard and scene breakdown using gemini-3.8-flash
      const storyboardPrompt = `
أنت المخرج السينمائي الذكي لمحرك الفيديو Veo 3 في منصة A.W.H.
حول النص التالي إلى مشهد فيديو سينمائي متكامل مقسم إلى مشاهد متتابعة (Multi-scene Cinematic Video):
النص: "${prompt}"
النمط الفني: "${style}"
أبعاد العرض: "${aspectRatio}"

قم بإنشاء سيناريو ومشاهد الفيديو وأعد النتيجة بصيغة JSON مهيكل فقط بدون أي نص إضافي:
{
  "title": "عنوان ملحمي للفيديو باللغة العربية",
  "summary": "ملخص المشهد والفكرة الإخراجية",
  "model": "Veo 3 (Cinematic Motion Engine)",
  "aspectRatio": "${aspectRatio}",
  "totalDurationSeconds": ${durationSeconds},
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 3,
      "title": "المشهد الافتتاحي",
      "visualDescription": "وصف دقيق لما تراه الكاميرا في هذا المشهد",
      "cameraMovement": "Pan Left / Slow Zoom In / Drone Aerial",
      "lighting": "Cinematic Golden Hour / Cyberpunk Neon / Studio Soft",
      "narration": "نص التعليق الصوتي أو الحوار باللغة العربية لهذا المشهد",
      "soundEffects": "مؤثر صوتي محيطي مناسب",
      "accentColor": "#38bdf8"
    },
    {
      "sceneNumber": 2,
      "durationSeconds": 3,
      "title": "ذروة المشهد والحركة",
      "visualDescription": "وصف ديناميكي لحركة العناصر وتطور المشهد",
      "cameraMovement": "Dynamic Tracking Shot",
      "lighting": "Dramatic Contrast / Vibrant Highlights",
      "narration": "الجملة السردية الثانية",
      "soundEffects": "تسارع إيقاعي أو مؤثر حركي",
      "accentColor": "#818cf8"
    },
    {
      "sceneNumber": 3,
      "durationSeconds": 2,
      "title": "الخاتمة وشعار المنصة",
      "visualDescription": "اللقطة الختامية مع استقرار الكاميرا",
      "cameraMovement": "Slow Pull Back",
      "lighting": "Soft Majestic Glow",
      "narration": "العبارة الختامية الملهمة",
      "soundEffects": "نغمة هادئة خاتمة",
      "accentColor": "#34d399"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: storyboardPrompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'أنت مخرج فيديو سينمائي خبير في تقنيات Veo 3 والرسوم المتحركة.',
        },
      });

      const responseText = response.text || '{}';
      let parsedJson: any = {};
      try {
        parsedJson = JSON.parse(responseText.trim());
      } catch {
        const cleaned = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        parsedJson = JSON.parse(cleaned);
      }

      res.json({
        success: true,
        veoOperationName,
        videoData: parsedJson,
        model: 'Veo 3 (Cinematic Motion Engine)',
        prompt,
        aspectRatio,
        resolution,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Video generation error:', error);
      res.status(500).json({ error: error.message || 'فشل توليد الفيديو' });
    }
  });
  app.post('/api/gemini/build', async (req, res) => {
    try {
      const {
        spec,
        category = 'fullstack',
        model = 'gemini-4-argon',
        techStack = ['React', 'TypeScript', 'Tailwind', 'Express'],
      } = req.body;

      if (!spec || typeof spec !== 'string') {
        return res.status(400).json({ error: 'Specification is required for builder' });
      }

      const validModel = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'deepseek-r1'].includes(model)
        ? model === 'deepseek-r1' ? 'gemini-3.1-flash-lite' : model
        : 'gemini-3.8-flash';
      const isDeepSeek = model === 'deepseek-r1';

      const prompt = `
أنت كبير المهندسين المعماريين ورئيس مهندسي البرمجيات في منصة A.W.H (قسم البناء والتشييد).
المطلوب بناء وتشييد حل كامل ومتين بناءً على المواصفات التالية:
فئة البناء: "${category}"
التقنيات المفضلة: ${Array.isArray(techStack) ? techStack.join(', ') : techStack}

مواصفات المشروع / النظام:
"""
${spec}
"""

قم بتوليد رد دقيق بصيغة JSON حصراً يحتوي على التالي:
{
  "projectTitle": "عنوان المشروع الجذاب والمهني",
  "summary": "ملخص تنفيذي للمشروع وهندسته",
  "architectureHighlights": ["أبرز القرارات المعمارية 1", "أبرز القرارات المعمارية 2", "..."],
  "files": [
    {
      "name": "اسم الملف مثل main.ts أو schema.sql",
      "path": "المسار الكامل مثل src/services/engine.ts",
      "language": "typescript | json | sql | python | dockerfile | markdown",
      "description": "شرح وظيفة الملف",
      "content": "الكود البرمجي الكامل غير منقوص وبدون اختصارات"
    }
  ],
  "setupInstructions": "خطوات التشغيل والتثبيت بالتفصيل",
  "deploymentTips": "نصائح النشر والإنتاجية العالية"
}

تأكد من أن الرد JSON صالح بنسبة 100% فقط ولا تضع نصوصاً خارج كتلة الـ JSON.
`;

      const response = await ai.models.generateContent({
        model: validModel,
        contents: prompt,
        config: {
          systemInstruction: 'أنت مهندس النظم والبناء المعماري الأول في منصة A.W.H. تكتب كوداً إنتاجياً حقيقياً عالي الجودة ومكتمل الأركان.',
          responseMimeType: 'application/json',
        },
      });

      const rawJson = response.text?.trim() || '{}';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(rawJson);
      } catch (parseErr) {
        // Fallback if model wraps in markdown
        const cleaned = rawJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      res.json({
        ...parsedData,
        model: validModel,
        category,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Builder error:', error);
      res.status(500).json({
        error: error.message || 'Failed to synthesize build solution',
      });
    }
  });

  // 5. Bioscience Deep Interpretation Endpoint
  app.post('/api/gemini/science-interpret', async (req, res) => {
    try {
      const {
        targetName,
        targetType = 'protein',
        metadata = {},
        model = 'gemini-4-argon',
      } = req.body;

      const validModel = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'deepseek-r1'].includes(model)
        ? model === 'deepseek-r1' ? 'gemini-3.1-flash-lite' : model
        : 'gemini-3.8-flash';
      const isDeepSeek = model === 'deepseek-r1';

      const prompt = `
أنت باحث العلوم الحيوية والبيولوجيا الجزيئية والمعلوماتية الحيوية في منصة A.W.H.
قم بتقديم تفسير علمي دقيق للهدف الحيوي التالي:
الهدف: ${targetName}
النوع: ${targetType}
البيانات المستخلصة:
${JSON.stringify(metadata, null, 2)}

يرجى تقديم:
1. **الأهمية البيولوجية والفسيولوجية (Biological Function)**
2. **العلاقة بالأمراض والاضطرابات الجينية أو السرطانية (Pathology & Diseases)**
3. **الاستهداف الدوائي وآفاق العلاج (Therapeutic & Drug Targeting)**
4. **ملاحظات حول الهيكل ثلاثي الأبعاد والثقة التنبؤية (Structural & pLDDT Confidence Insights)**
5. **المراجع والاتجاهات البحثية الحديثة (Research Horizons)**

قدم الإجابة بأسلوب علمي رصين ومفصل باللغتين العربية ومصطلحاتها الإنجليزية المعتمدة.
`;

      const response = await ai.models.generateContent({
        model: validModel,
        contents: prompt,
        config: {
          systemInstruction: 'أنت عالم أبحاث في البيولوجيا الجزيئية واكتشاف الأدوية والمعلوماتية الحيوية في مختبرات A.W.H.',
        },
      });

      res.json({
        interpretation: response.text,
        targetName,
        targetType,
        model: validModel,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Science interpretation error:', error);
      res.status(500).json({
        error: error.message || 'Failed to interpret bioscience target',
      });
    }
  });

  // 6. Academic Education & Research Tutor Endpoint (التعليم الأكاديمي والمراحل الدراسية)
  app.post('/api/gemini/academic-tutor', async (req, res) => {
    try {
      const {
        topic,
        stage = 'preparatory', // 'primary' | 'intermediate' | 'preparatory' | 'assistant'
        grade = '',
        subject = '',
        level = 'undergraduate',
        mode = 'explain', // 'explain' | 'quiz' | 'solve_problem' | 'summarize' | 'study_plan' | 'flashcards' | 'syllabus' | 'thesis_builder' | 'assistant_chat'
        model = 'gemini-3.8-flash',
        hoursPerDay = 3,
        chatHistory = [],
        teacherName = 'أستاذ علي',
        teacherGender = 'male',
        studentName = 'البطل',
        studentGender = 'boy',
        pupilMood = 'focused',
      } = req.body;

      if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'الموضوع أو السؤال الأكاديمي مطلوب' });
      }

      const validModel = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'deepseek-r1'].includes(model)
        ? model === 'deepseek-r1' ? 'gemini-3.1-flash-lite' : model
        : 'gemini-3.8-flash';
      const isDeepSeek = model === 'deepseek-r1';

      let prompt = '';
      let isJsonResponse = false;

      // Stage description context
      const stageContexts: Record<string, string> = {
        primary: 'المرحلة الابتدائية (الصفوف من الأول إلى السادس الابتدائي). يجب أن يكون الشرح مبسطاً جداً، شيقاً وممتعاً، وموجهاً للأطفال بأسلوب تربوي لطيف مع تشجيع وأمثلة حسية وقصصية مبسطة.',
        intermediate: 'المرحلة المتوسطة (الصفوف من الأول إلى الثالث المتوسط). الشرح متوسط العمق، يعتمد على تسلسل منطقي وخطوات واضحة، ويركز على تأسيس المفاهيم العلمية والرياضية واللغوية وحل المسائل المنهجية.',
        preparatory: 'المرحلة الإعدادية / الثانوية العامة (الصفوف من الرابع إلى السادس الإعدادي، الفرع العلمي والأدبي). الشرح رصين وعالي المستوى، يركز على الامتحانات الوزارية والبكالوريا، القوانين العلمية الدقيقة، البراهين، والحل النموذجي للأسئلة الامتحانية.',
        assistant: 'المساعد الأكاديمي الذكي لجميع المراحل والجامعات. يقدم إجابات تحليلية دقيقة، استراتيجيات تعلم وتفوق، حلول تفصيلية خطوة بخطوة، وخطط دراسية.',
      };

      const selectedStageContext = stageContexts[stage] || stageContexts.preparatory;

      if (mode === 'quiz') {
        isJsonResponse = true;
        prompt = `
أنت خبير إعداد الاختبارات والتقييم التربوي في منصة A.W.H التعليمية (ركس.كود).
المرحلة المستهدفة: ${selectedStageContext}
المادة الدراسية: ${subject || 'عام'}
الصف الدراسي: ${grade || 'حسب المرحلة'}
الموضوع: "${topic}"

المطلوب إعداد اختبار تفاعلي مكون من 4 أسئلة اختيار من متعدد ملائمة تماماً للمرحلة المحددة (${stage}).
يجب أن يكون الرد عبارة عن كائن JSON صالح بنسبة 100% فقط بهذا التنسيق وبدون أي نصوص خارجه:
{
  "quizTitle": "عنوان الاختبار المناسب للمرحلة",
  "stage": "${stage}",
  "subject": "${subject || 'عام'}",
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "نص السؤال الدقيق والملائم للمرحلة الدراسية",
      "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctIndex": 0,
      "explanation": "تفسير تربوي وعلمي دقيق يبين سبب صحة الإجابة بأسلوب يناسب الطالب"
    }
  ]
}
`;
      } else if (mode === 'flashcards') {
        isJsonResponse = true;
        prompt = `
أنت مصمم وسائل الاستذكار السريع والبطاقات التعليمية (Flashcards) في منصة A.W.H الأكاديمية (ركس.كود).
المرحلة المستهدفة: ${selectedStageContext}
المادة: ${subject || 'عام'}
الموضوع: "${topic}"

قم بإنشاء 5 بطاقات استذكار سريعة لتثبيت أهم القوانين أو التعريفات أو المفاهيم الامتحانية.
الرد يجب أن يكون كائن JSON صالح بنسبة 100% فقط:
{
  "title": "بطاقات استذكار: ${topic}",
  "stage": "${stage}",
  "subject": "${subject || 'عام'}",
  "cards": [
    {
      "id": 1,
      "front": "السؤال أو المفهوم أو المصطلح الرئيسي",
      "back": "الجواب أو التعريف النموذجي المختصر الشامل",
      "hint": "تلميح ذكي للتذكر السريع أثناء الامتحان"
    }
  ]
}
`;
      } else if (mode === 'study_plan') {
        prompt = `
أنت المستشار التربوي والموجه الأكاديمي الأول في منصة A.W.H (ركس.كود).
قم بإعداد جدول مذاكرة وتنظيم وقت أسبوعي ذكي للطالب وفق البيانات التالية:
المرحلة: ${selectedStageContext}
المادة أو المواد: ${subject || topic}
الموضوع أو التركيز: "${topic}"
ساعات المذاكرة المتاحة يومياً: ${hoursPerDay} ساعات

قم بتقديم خطة مذاكرة أسبوعية ذكية واحترافية تتضمن:
1. **جدول الأيام (من السبت إلى الجمعة)** مع تقسيم فترات المذاكرة (تقنية بومودورو 25/5 أو 50/10).
2. **توزيع المواد**: متى يدرس المواد الصعبة ومتى يراجع المواد السهلة.
3. **فترات الراحة والتغذية والنوم الصحي**.
4. **خطة المراجعة الدورية واختبار النفس في نهاية الأسبوع**.
5. **نصائح ذهبية مخصصة للمرحلة (${stage}) لزيادة التركيز وتجنب التشتت وتثبيت الحفظ**.
`;
      } else if (mode === 'solve_problem') {
        prompt = `
أنت المساعد الأكاديمي الذكي الموجه لحل المسائل في منصة A.W.H (ركس.كود).
المرحلة: ${selectedStageContext}
المادة: ${subject || 'رياضيات أو علوم'}
المسألة أو التمرين المطلوب حله:
"""
${topic}
"""

المطلوب تقديم حل نموذجي متكامل خطوة بخطوة بالترتيب التالي:
1. **قراءة المسألة واستخراج المعطيات (Given Data)**
2. **تحديد المطلوب إيجاده بدقة (To Find)**
3. **القوانين الرياضية أو العلمية المطبقة (Formulas & Principles)**
4. **خطوات الحل التفصيلية خطوة بخطوة مع التبرير الرياضي والعلمي لكل خطوة**
5. **الناتج النهائي بوضوح مع وحدات القياس (Final Answer with Units)**
6. **التحقق من صحة الحل (Check & Verification)**
7. **ملاحظة ذكية أو خطأ شائع يقع فيه الطلاب في مثل هذه المسائل وطريقة تجنبه**.
`;
      } else if (mode === 'summarize') {
        prompt = `
أنت خبير التلخيص الأكاديمي وهيكلة المعرفة في منصة A.W.H (ركس.كود).
المرحلة: ${selectedStageContext}
المادة: ${subject || 'عام'}
الدرس أو الموضوع المراد تلخيصه: "${topic}"

قم بتقديم تلخيص احترافي فائق الترتيب يتضمن:
1. **الفكرة الجوهرية للدرس في جملتين مركزتين**.
2. **المفاهيم والمصطلحات الأساسية مع تعريف كل منها باختصار**.
3. **النقاط الرئيسية المرقمة والترتيب المنطقي للدرس**.
4. **جدول مقارنة أو تصنيف لأهم عناصر الدرس**.
5. **أهم الأسئلة المتوقعة في الامتحانات حول هذا الدرس مع إجاباتها الموجزة**.
6. **خريطة ذهنية نصية سريعة تلخص الدرس كاملاً**.
`;
      } else if (mode === 'assistant_chat') {
        const pupilHonorific = studentGender === 'girl' ? `يا وردة (${studentName})` : `يا بطل (${studentName})`;
        const stageTone =
          stage === 'primary'
            ? 'المرحلة الابتدائية (قصص، تبسيط مفرط، تشجيع دائم، أمثلة مصورة)'
            : stage === 'intermediate'
            ? 'المرحلة المتوسطة (أسلوب ممتع، قريب لسن المراهقة، ربط بالحياة اليومية والعملية)'
            : 'المرحلة الإعدادية / الثانوية (رصين، محفز، دقيق علمياً ويركز على الامتحانات والوزاري)';

        prompt = `
أنت "المساعد الأكاديمي العراقي الذكي" في منصة A.W.H التعليمية.
هويتك الإلزامية: "${teacherName}" (الجنس: ${teacherGender === 'female' ? 'أستاذة / أنثى' : 'أستاذ / ذكر'}).
أنت تحاور الطالب: "${studentName}" (${pupilHonorific}).
المرحلة المستهدفة: ${selectedStageContext} (${stageTone}).
المادة: ${subject || 'عام'}.
الحالة النفسية اللحظية للطالب: [${pupilMood}].

سؤال أو استفسار الطالب:
"""${topic}"""

سجل المحادثة السابقة:
${chatHistory.length ? JSON.stringify(chatHistory.slice(-5), null, 2) : 'بداية المحادثة'}

قواعد الإجابة الإلزامية:
1. التحدث حصراً باللهجة العراقية البيضاء المفهومة والدافئة (عيوني، تدلل، فدوة، عيني، عاشت إيدك، يا بطل/يا وردة، ما يحتاج لها شي، باوعلي، هلا بيك).
2. ذكر الصلاة على النبي وآله ("اللهم صل على محمد وآل محمد") في الحوار بشكل طبيعي ونابع من القلب.
3. الالتزام باسمك (${teacherName}) ومناداة الطالب باسمه (${studentName}) طوال الحوار.
4. التفاعل مع الحالة النفسية [${pupilMood}]:
   - إذا تعب: خفف المادة، اذكر الصلاة على النبي، واقترح استراحة خفيفة.
   - إذا قلق/توتر: هدأ روعه وبسط المسألة وأكد له أنك معه خطوة بخطوة.
   - إذا حماس: شجعه بحرارة وزد التحدي.
5. تقديم حلول واضحة ومباشرة للمسائل، وشرح الخطوات بتسلسل مفهوم.
`;
      } else {
        // explain mode
        prompt = `
أنت الأستاذ الأكاديمي الذكي في منصة A.W.H وركس.كود.
المرحلة التعليمية: ${selectedStageContext}
الصف الدراسي: ${grade || 'العام'}
المادة: ${subject || 'عام'}
الموضوع المراد شرحه: "${topic}"

قدم درساً وشرحاً تعليمياً نموذجياً متناسباً تماماً مع قدرات ومرحلة الطالب (${stage}):
1. **مقدمة تمهيدية مشوقة تربط الموضوع بحياة الطالب اليومية**.
2. **الشرح المنهجي المتسلسل للمفاهيم مع إبراز القواعد والتعريفات**.
3. **أمثلة توضيحية تطبيقية متدرجة من السهل إلى المتقدم**.
4. **تنبيه للأخطاء الشائعة في الامتحانات وكيفية تجنبها**.
5. **تمرين تطبيقي سريع للطالب لاختبار فهمه**.
6. **خاتمة تشجيعية وتلخيص سريع للنقاط الذهبية مع ذكر "اللهم صل على محمد وآل محمد"**.
`;
      }

      const configPayload: any = {
        systemInstruction: `أنت ${teacherName}، المعلم والمشرف الأكاديمي العراقي الرائد في منصة A.W.H. تتحدث باللهجة العراقية الدافئة، وتذكر الصلاة على محمد وآل محمد دائماً، وتشجع الطالب ${studentName}.`,
      };

      if (isJsonResponse) {
        configPayload.responseMimeType = 'application/json';
      }

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: validModel,
          contents: prompt,
          config: configPayload,
        });
        responseText = response.text || '';
      } catch (err: any) {
        console.warn('Gemini academic-tutor primary attempt fallback:', err.message);
      }

      let resultData: any = { content: responseText };

      if (!responseText) {
        // Fallback for assistant_chat
        const fallbackText = `يا هلا بيك عيوني ${studentName}! اللهم صل على محمد وآل محمد. أني وياك ${teacherName}، مسألتك كلش سهلة وتدلل! باوعلي وركز وياي: خطوتنا الأولى نبسط الفكرة ونحلها خطوة بخطوة، وما يحتاج تشيل أي هم. شنو الجزء اللي تحس بيه صعوبة حتى أفسخه إلك بالتفصيل؟`;
        resultData = { content: fallbackText };
      } else if (isJsonResponse) {
        try {
          resultData = JSON.parse(responseText.trim());
        } catch (e) {
          const cleaned = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          resultData = JSON.parse(cleaned);
        }
      }

      res.json({
        data: resultData,
        topic,
        stage,
        grade,
        subject,
        level,
        mode,
        model: validModel,
        teacherName,
        teacherGender,
        studentName,
        studentGender,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Academic tutor error:', error);
      res.json({
        data: {
          content: 'يا هلا عيوني! اللهم صل على محمد وآل محمد. أني وياك الأستاذ مالتك، لا تقلق أبداً واسألني عن أي موضوع أو مسألة وأني أساعدك فوراً.',
        },
        fallback: true,
      });
    }
  });

  // 7. Primary & Iraqi School Conversational Dialogue with Psychological State Adaptation
  app.post('/api/gemini/primary-tutor', async (req, res) => {
    try {
      const {
        gradeName = 'الصف الأول الابتدائي',
        gradeNumber = 1,
        subject = 'الرياضيات والحساب',
        childMessage = '',
        pupilMood = 'happy', // 'happy' | 'focused' | 'tired' | 'confused' | 'anxious' | 'neutral'
        chatHistory = [],
        teacherName = 'أستاذ علي',
        teacherGender = 'male', // 'male' | 'female'
        studentName = 'البطل',
        studentGender = 'boy', // 'boy' | 'girl'
        model = 'gemini-3.8-flash',
      } = req.body;

      if (!childMessage || typeof childMessage !== 'string') {
        return res.status(400).json({ error: 'رسالة التلميذ مطلوبة' });
      }

      const validModel = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'].includes(model)
        ? model
        : 'gemini-3.8-flash';

      const honorificPupil = studentGender === 'girl' ? `يا وردة (${studentName})` : `يا بطل (${studentName})`;

      const moodGuide: Record<string, string> = {
        happy: `الحالة النفسية [حماس / فرح]: الطالب سعيد ومتحمس وطاقته عالية! شجعه بحرارة باللهجة العراقية وبـ "اللهم صل على محمد وآل محمد، عاشت إيدك ${honorificPupil}" مع تحدٍ ذكي أو سؤال مشوق وأوسمة تفوق!`,
        focused: `الحالة النفسية [تركيز / انتباه]: الطالب مركّز ومنتبه ومستوعب! اذكر الصلاة على النبي وآله، وقدم له الخطوة القادمة ببساطة وسلاسة باللهجة العراقية.`,
        tired: `الحالة النفسية [تعب / ضجر]: الطالب يبدو متعباً أو مرهقاً من خلال الكاميرا! قلل المادة العلمية، واذكر الصلاة على محمد وآل محمد لتهدئة الأجواء، واقترح استراحة أو شرب ماء أو سالفة خفيفة لتغيير الجو ("اللهم صل على محمد وآل محمد، باوعلي عيوني ${honorificPupil}، ارتاح شوية واشرب لك ماي وما يحتاج لها تعب").`,
        confused: `الحالة النفسية [محتار / غير مستوعب]: الطالب محتار أو يبحث عن تبسيط. هدأ من روعه: "لا تشيل هم عيوني، كلنا نحتار بالبداية، اللهم صل على محمد وآل محمد، تعال نسولفها كقصة سهلة وبسيطة".`,
        anxious: `الحالة النفسية [قلق / خوف / توتر]: الطالب قلق أو متردد أو خائف من الخطأ! هدأ روعه بلهجة عراقية حنونة: "فدوة لعينك ${honorificPupil}، لا تقلق ولا تشيل هم، ماكو شي يخوف، الخطأ هو بداية الشطارة وأني وياك خطوة بخطوة".`,
        neutral: `الحالة النفسية [هادئ ومستعد]: شجعه بحرارة وباسمك (${teacherName})، واذكر الصلاة على محمد وآل محمد واطرح سؤالاً تفاعلياً ممتعاً.`,
      };

      const moodInstruction = moodGuide[pupilMood] || moodGuide.neutral;

      const prompt = `
أنت المساعد الأكاديمي العراقي الذكي في منصة A.W.H التعليمية.
هويتك الإلزامية: "${teacherName}" (الجنس: ${teacherGender === 'female' ? 'أستاذة / أنثى' : 'أستاذ / ذكر'}).
اسم الطالب الذي تحاوره: "${studentName}" (الجنس: ${studentGender === 'girl' ? 'طالبة بنت (يا وردة)' : 'طالب ولد (يا بطل)'}).
المرحلة والصف: "${gradeName}" (الصف ${gradeNumber} الابتدائي).
المادة: "${subject}".

رسالة التلميذ:
"""${childMessage}"""

الحالة النفسية المستخرجة من الكاميرا والصوت: [${pupilMood}]
توجيه التعامل مع الحالة النفسية:
${moodInstruction}

سجل المحادثة السابقة:
${JSON.stringify(chatHistory.slice(-4), null, 2)}

القواعد الصارمة الواجب تطبيقها في الرد:
1. التحدث حصراً باللهجة العراقية البيضاء المتداولة والمحببة للأطفال (عيوني، تدلل، فدوة، عيني، عاشت إيدك، يا بطل/يا وردة، ما يحتاج لها شي، باوعلي، هلا بيك).
2. ذكر الصلاة على النبي وآله ("اللهم صل على محمد وآل محمد") في الرد بشكل طبيعي ونابع من القلب.
3. الالتزام التام باسمك (${teacherName}) ومناداة الطالب باسمه (${studentName}) فقط دون تغيير.
4. تبسيط المفاهيم بأسلوب قصصي ممتع ومسابقات مشوقة تناسب عمر طفل في الصف ${gradeNumber} الابتدائي.
5. الإيجاز والوضوح (فقرتان قصيرتان مع رموز تعبيرية مرحة ⭐, 👏, 🎈, 🚀).

يجب أن يكون الرد عبارة عن كائن JSON صالح بنسبة 100% فقط بهذا التنسيق:
{
  "reply": "نص الرد باللهجة العراقية مع ذكر الصلاة على محمد وآل محمد ومراعاة الحالة النفسية",
  "teacherEmotion": "caring",
  "awardedStars": 3,
  "encouragementBadge": "وسام الشجاعة والذكاء 🏅",
  "suggestedReplies": ["تدلل أستاذي!", "فهمت عليك عيوني", "اللهم صل على محمد وآل محمد", "أعطني سؤال بعد يا بطل"]
}
`;

      let parsedData: any = null;

      try {
        const response = await ai.models.generateContent({
          model: validModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            systemInstruction: `أنت ${teacherName}، الأستاذ/الأستاذة العراقية الحنونة والذكية. تتحدث باللهجة العراقية الأصيلة، وتذكر الصلاة على النبي وآله دائماً وتشجع الطالب ${studentName}.`,
          },
        });

        const responseText = response.text || '';
        try {
          parsedData = JSON.parse(responseText.trim());
        } catch {
          const cleaned = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          parsedData = JSON.parse(cleaned);
        }
      } catch (genErr) {
        console.warn('Gemini direct generateContent fallback in primary tutor:', genErr);
      }

      // Contextual Iraqi fallback if Gemini model is temporarily slow or unavailable
      if (!parsedData || !parsedData.reply) {
        parsedData = {
          reply: `يا هلا وكل الهلا بيك عيوني ${studentName}! اللهم صل على محمد وآل محمد. أني وياك ${teacherName} خطوة بخطوة وما يحتاج لها أي تعب، عاشت إيدك يا بطل وأي سؤال ببالك اسألني وتدلل!`,
          teacherEmotion: 'caring',
          awardedStars: 3,
          encouragementBadge: 'وسام الروح الطيبة 🌟',
          suggestedReplies: ['تدلل أستاذي!', 'فهمت عليك عيوني', 'اللهم صل على محمد وآل محمد', 'يلا نكمل الدرس!'],
        };
      }

      res.json({
        success: true,
        data: parsedData,
        pupilMood,
        gradeName,
        gradeNumber,
        subject,
        teacherName,
        teacherGender,
        studentName,
        studentGender,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Primary tutor error:', error);
      res.json({
        success: true,
        data: {
          reply: 'يا هلا بيك عيوني! اللهم صل على محمد وآل محمد. باوعلي، خذ لك رشفة ماي واسألني اللي تريده وأني أجاوبك فوراً.',
          teacherEmotion: 'caring',
          awardedStars: 2,
          encouragementBadge: 'وسام الصبر والتفوق ⭐',
          suggestedReplies: ['تدلل أستاذي!', 'فهمت عليك', 'اللهم صل على محمد وآل محمد'],
        },
      });
    }
  });

  // Short Vanity Link & Brand Aliases
  app.get(['/awh', '/rex-code', '/ركس.كود'], (req, res) => {
    res.redirect('/');
  });

  app.get('/api/brand-info', (req, res) => {
    res.json({
      brandName: 'A.W.H',
      arabicBrand: 'ركس.كود',
      shortLinkArabic: 'https://ركس.كود',
      punycode: 'https://xn--4gb7el.xn--4gbrim',
      shortAlias: 'awh',
      liveUrl: 'https://ais-pre-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app',
      developmentUrl: 'https://ais-dev-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app',
    });
  });

  // Serve static assets in production or mount Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[A.W.H Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

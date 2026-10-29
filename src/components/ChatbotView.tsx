import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  Bot,
  Sparkles,
  Trash2,
  Copy,
  Check,
  CloudUpload,
  Cpu,
  BrainCircuit,
  Wand2,
  Hammer,
  Dna,
  RefreshCw,
  GraduationCap,
  Crown,
  Zap,
  ChevronDown,
  ChevronUp,
  Brain,
} from 'lucide-react';
import { uploadTextFileToDrive } from '../services/googleDriveService';
import { auth, consumeAiQuestionCredit } from '../services/firestoreService';
import { SocialShareBar } from './SocialShareBar';

export type SupportedAiModel =
  | 'deepseek-r1'
  | 'gemini-3.8-flash'
  | 'gemini-4-argon'
  | 'gemini-3.1-flash-lite'
  | 'gemini-flash-latest'
  | 'groq-llama-3.3-70b-versatile'
  | 'hermes-2-pro-8b'
  | 'hermes-3-405b';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: string;
  roleType?: string;
}

interface ChatRole {
  id: string;
  name: string;
  title: string;
  icon: any;
  systemInstruction: string;
  defaultModel: SupportedAiModel;
  starters: string[];
}

const ROLES: ChatRole[] = [
  {
    id: 'academic_tutor',
    name: 'المساعد الأكاديمي العراقي',
    title: 'Iraqi Academic Tutor (الابتدائي والمتوسط والثانوي)',
    icon: GraduationCap,
    defaultModel: 'gemini-3.1-flash-lite',
    systemInstruction:
      'أنت المساعد الأكاديمي العراقي الذكي للطلاب في كافة المراحل (الابتدائي، المتوسط، الإعدادي). تتحدث حصراً باللهجة العراقية الدافئة (عيوني، تدلل، فدوة، عيني، عاشت إيدك، يا بطل/يا وردة، ما يحتاج لها شي، باوعلي). تذكر دائماً "اللهم صل على محمد وآل محمد" عند التشجيع وبدء الشرح وتهدئة التوتر. وتراعي الحالة النفسية اللحظية وتبسط المعارف بحب وتشجيع.',
    starters: [
      'اللهم صل على محمد وآل محمد! اشرح لي موضوع بالمنهج العراقي بأسلوب مبسط',
      'عندي مسألة صعبة، تعال نحلها سوا خطوة بخطوة وتدلل عيوني',
      'كيف أستعد للامتحانات والوزاري وأجيب معدل عالي؟',
    ],
  },
  {
    id: 'analyst',
    name: 'خبير التحليل المعمق',
    title: 'Chief Analysis Officer',
    icon: BrainCircuit,
    defaultModel: 'gemini-3.1-flash-lite',
    systemInstruction:
      'أنت خبير التحليل الاستراتيجي والتقني الأول في منصة A.W.H. مهمتك تفكيك المشكلات المعقدة بدقة، تحليل البيانات، كشف الثغرات والأنماط، وتقديم استنتاجات عميقة مدعمة بالحجج المنطقية.',
    starters: [
      'حلل لي نقاط القوة والضعف في معمارية الحوسبة السحابية بدون خادم (Serverless)',
      'ما هي أفضل استراتيجية لتحليل مجموعات البيانات الضخمة غير المنظمة؟',
      'كيف نقوم بتحليل أمان واجهات برمجة التطبيقات (API Security Audit) بشكل شامل؟',
    ],
  },
  {
    id: 'builder',
    name: 'مهندس النظم والبناء',
    title: 'Systems & Software Architect',
    icon: Hammer,
    defaultModel: 'gemini-4-argon',
    systemInstruction:
      'أنت كبير المهندسين المعماريين ورئيس مهندسي البرمجيات في منصة A.W.H. مهمتك كتابة كود إنتاجي متين، تصميم هياكل المشاريع وقواعد البيانات، وتقديم حلول معمارية واقعية وفعالة.',
    starters: [
      'صمم لي معمارية تطبيق فائق السرعة يعتمد WebSockets و Redis للبيانات اللحظية',
      'اكتب كود middleware في Express للتحقق من رموز Bearer JWT مع التخزين المؤقت',
      'كيف أصمم مخطط قاعدة بيانات لنظام إدارة المختبرات العلمية؟',
    ],
  },
  {
    id: 'generator',
    name: 'مبتكر التوليد الإبداعي',
    title: 'Creative Content & Media Gen',
    icon: Wand2,
    defaultModel: 'gemini-3.8-flash',
    systemInstruction:
      'أنت المحرك التوليدي الإبداعي لمنصة A.W.H. متخصص في ابتكار الأفكار غير النمطية، صياغة التوجيهات الفنية عالية الدقة (Prompts)، وإنشاء المحتوى الجذاب والسرد المقنع.',
    starters: [
      'اصنع لي توجيهاً (Prompt) فائق التفصيل لتوليد صورة 4K لمدينة ذكية تعتمد الطاقة الحيوية',
      'اكتب مقدمة افتتاحية مشوقة ومقنعة لورقة بيضاء عن مستقبل الذكاء الاصطناعي',
      'اقترح خطة سردية إبداعية لتقديم منصة تقنية جديدة للمستثمرين',
    ],
  },
  {
    id: 'scientist',
    name: 'باحث العلوم الحيوية',
    title: 'Bioscience & Drug Scout',
    icon: Dna,
    defaultModel: 'gemini-4-argon',
    systemInstruction:
      'أنت عالم أبحاث في البيولوجيا الجزيئية واكتشاف الأدوية والمعلوماتية الحيوية في منصة A.W.H. متخصص في فهم آليات عمل البروتينات، تفسير بيانات AlphaFold، وتحليل طفرات الجينات والتفاعلات الدوائية.',
    starters: [
      'اشرح لي كيف تؤثر طفرة R248Q على نشاط بروتين TP53 المانع للأورام؟',
      'ما هي الآلية الجزيئية التي يعمل بها دواء Imatinib في تثبيط BCR-ABL كاينيز؟',
      'كيف نقيم دقة درجات pLDDT في تنبؤات AlphaFold للهياكل الجزيئية المعقدة؟',
    ],
  },
  {
    id: 'deepseek_reasoner',
    name: 'محرك التفكير DeepSeek-R1 🐋',
    title: 'DeepSeek-R1 Logic & Chain-of-Thought (الاستنتاج والتفكير المنطقي)',
    icon: BrainCircuit,
    defaultModel: 'deepseek-r1',
    systemInstruction:
      'أنت نموذج الذكاء الاصطناعي DeepSeek-R1 المتخصص في الاستدلال المنطقي والتفكير العميق وسلسلة الاستنتاج (Chain-of-Thought). عند الإجابة على أي مسألة رياضية، علمية، برمجية، أو أكاديمية: قم دائماً بكتابة مسار تفكيرك الداخلي المنظم وخطوات الاستنتاج المنطقي وتفكيك الفرضيات داخل وسم <think>\n[هنا خطوات التفكير والاستنتاج وتفكيك المسألة]\n</think> ثم اكتب الإجابة الشاملة والحل النهائي المنظم بوضوح للمستخدم باللغة العربية.',
    starters: [
      'أريدك أن تتقمص دور محاكي واقع افتراضي تعليمي (AR Simulation) مخصص لطلاب الصف الأول الابتدائي لدرس الحساب والقراءة',
      'حلل هذه المسألة الرياضية المعقدة مع إظهار خطوات التفكير والبرهان <think>',
      'فكك خوارزمية موزعة مع استعراض الفرضيات المنطقية خطوة بخطوة',
      'اشرح مسألة فيزياء أو برمجة متقدمة مع إظهار المحاكمة الذهنية العميقة',
    ],
  },
];

const MessageContentRenderer: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans">{content}</div>;
  }

  // Check for completed think tags
  const thinkClosedMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  // Check for currently streaming open think tag
  const isStreamingThought = !thinkClosedMatch && content.includes('<think>');
  const streamingThoughtText = isStreamingThought ? content.split('<think>')[1] : null;

  if (thinkClosedMatch) {
    const thoughtText = thinkClosedMatch[1].trim();
    const finalAnswer = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

    return (
      <div className="space-y-3 font-sans">
        {thoughtText && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setIsThoughtOpen(!isThoughtOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-300 text-xs font-semibold transition"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                <span>مسار التفكير والاستنتاج المنطقي (DeepSeek-R1 Thought Trace)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  تم التفكير ✓
                </span>
              </div>
              {isThoughtOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
            </button>
            {isThoughtOpen && (
              <div className="p-3 text-xs font-mono text-emerald-200/90 bg-slate-950/80 border-t border-emerald-500/20 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {thoughtText}
              </div>
            )}
          </div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
          {finalAnswer || (!thoughtText ? content : '')}
        </div>
      </div>
    );
  }

  if (streamingThoughtText !== null) {
    return (
      <div className="space-y-3 font-sans">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/60 text-emerald-300 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>جاري التفكير والاستدلال المنطقي العميق (DeepSeek-R1)...</span>
            </div>
          </div>
          <div className="p-3 text-xs font-mono text-emerald-200/90 bg-slate-950/90 border-t border-emerald-500/20 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto animate-pulse">
            {streamingThoughtText}
          </div>
        </div>
      </div>
    );
  }

  return <div className="whitespace-pre-wrap font-sans">{content}</div>;
};

interface ChatbotViewProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected: boolean;
  onNavigateHome?: () => void;
  onOpenSubscriptions?: () => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
  onOpenSubscriptions,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRole>(ROLES[0]);
  const [model, setModel] = useState<SupportedAiModel>('gemini-3.1-flash-lite');
  const [userPlan, setUserPlan] = useState<'Free' | 'Smart' | 'VIP'>('Free');

  useEffect(() => {
    const checkPlan = () => {
      try {
        const saved = (localStorage.getItem('awh_user_plan') || 'Free') as 'Free' | 'Smart' | 'VIP';
        setUserPlan(saved);
      } catch (e) {}
    };
    checkPlan();
    window.addEventListener('awh_plan_updated', checkPlan);
    return () => window.removeEventListener('awh_plan_updated', checkPlan);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `أهلاً بك في المساعد الذكي لمساعدتك بمحرك **جميني 2 (Gemini 2.5 Flash)** متعدد الأدوار لمنصة A.W.H.
أنا الآن في وضع: **${ROLES[0].name}** (${ROLES[0].title}).
يمكنك تغيير دوري وتغيير نموذج الذكاء الاصطناعي في أي وقت من الشريط العلوي. كيف أساعدك اليوم؟`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
      roleType: ROLES[0].name,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleRoleChange = (role: ChatRole) => {
    setSelectedRole(role);
    setModel(role.defaultModel);
    const notificationMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'assistant',
      content: `تم التبديل بنجاح إلى دور: **${role.name}** (${role.title}).
النموذج النشط: \`${role.defaultModel}\` (محرك جميني 2).
جاهز لمساعدتك وفق هذا التخصص.`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: role.defaultModel,
      roleType: role.name,
    };
    setMessages((prev) => [...prev, notificationMsg]);
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    // 1. Verify user subscription & quota if authenticated via Firebase Auth
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const quotaCheck = await consumeAiQuestionCredit(currentUser.uid);
        if (!quotaCheck.allowed) {
          onNotify(quotaCheck.message || 'انتهى رصيدك المجاني من الأسئلة. يرجى الترقية إلى الباقة المدفوعة!', 'error');
          if (onOpenSubscriptions) onOpenSubscriptions();
          return;
        } else if (quotaCheck.profile.plan === 'Free') {
          onNotify(`💡 رصيدك المجاني المتبقي: ${quotaCheck.profile.remainingQuestions} أسئلة`, 'info');
        }
      } catch (quotaErr) {
        console.warn('Quota verification warning:', quotaErr);
      }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // 2. Identify if we can use streaming (Gemini models)
      const isGemini = !model.startsWith('hermes-') && !model.startsWith('groq-');
      
      if (isGemini) {
        let fullReply = '';
        const botMsgId = `bot-stream-${Date.now()}`;

        // Create initial placeholder bot message
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: model,
            providerUsed: model === 'deepseek-r1' ? 'DeepSeek Reasoner' : 'Google Gemini',
            roleType: selectedRole.name,
          },
        ]);
        setLoading(false);

        try {
          // STREAMING PATH for Gemini & DeepSeek R1
          const response = await fetch('/api/gemini/chat-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: newHistory
                .filter((m, idx) => !(idx === 0 && m.role === 'assistant'))
                .map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              systemInstruction: selectedRole.systemInstruction,
              model: model,
            }),
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let partialLine = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = (partialLine + chunk).split('\n');
              partialLine = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6).trim();
                  if (dataStr === '[DONE]') break;
                  
                  try {
                    const data = JSON.parse(dataStr);
                    if (data.text) {
                      fullReply += data.text;
                      setMessages((prev) => 
                        prev.map(m => m.id === botMsgId ? { ...m, content: fullReply } : m)
                      );
                    }
                  } catch (e) {
                    console.warn('Failed to parse stream JSON:', e);
                  }
                }
              }
            }
          }
        } catch (streamErr) {
          console.warn('Streaming encountered an issue, triggering direct fallback:', streamErr);
        }
        
        // Resilient Fallback to Standard Endpoint if stream was empty or interrupted
        if (!fullReply.trim()) {
          try {
            const fallbackEndpoint = model === 'deepseek-r1' ? '/api/deepseek/chat' : '/api/gemini/chat';
            const fallbackRes = await fetch(fallbackEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: newHistory
                  .filter((m, idx) => !(idx === 0 && m.role === 'assistant'))
                  .map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                systemInstruction: selectedRole.systemInstruction,
                model: model,
              }),
            });

            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              fullReply = fallbackData.reply || '';
            }
          } catch (fallbackErr) {
            console.error('Fallback endpoint also failed:', fallbackErr);
          }

          if (fullReply.trim()) {
            setMessages((prev) => 
              prev.map(m => m.id === botMsgId ? { ...m, content: fullReply } : m)
            );
          } else {
            setMessages((prev) => 
              prev.map(m => m.id === botMsgId ? { ...m, content: 'يا هلا بيك عيوني! أنا وياك خطوة بخطوة، كيف أقدر أساعدك اليوم في دراستك أو بحثك العلمي؟' } : m)
            );
          }
        }
      } else {
        // Alternative providers path with automatic Gemini resilience
        let replyContent = '';
        let modelUsed = model;
        let providerUsed = 'Google Gemini';

        try {
          const endpoint = model.startsWith('hermes-') 
            ? '/api/hermes/chat' 
            : '/api/groq/chat';

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: newHistory
                .filter((m, idx) => !(idx === 0 && m.role === 'assistant'))
                .map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              systemInstruction: selectedRole.systemInstruction,
              model: model.replace(/^(hermes|groq)-/, ''),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.reply) {
              replyContent = data.reply;
              modelUsed = data.model || model;
              providerUsed = data.provider || 'Google Gemini';
            }
          }
        } catch (callErr) {
          console.warn('Provider endpoint warning, triggering direct fallback:', callErr);
        }

        // Resilient fallback to Gemini if needed
        if (!replyContent) {
          try {
            const fallbackRes = await fetch('/api/gemini/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: newHistory
                  .filter((m, idx) => !(idx === 0 && m.role === 'assistant'))
                  .map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                systemInstruction: selectedRole.systemInstruction,
                model: 'gemini-3.8-flash',
              }),
            });
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              replyContent = fallbackData.reply || '';
              modelUsed = fallbackData.model || 'gemini-3.8-flash';
              providerUsed = fallbackData.provider || 'Google Gemini';
            }
          } catch (fbErr) {
            console.error('Fallback chat error:', fbErr);
          }
        }

        const finalReply = replyContent || 'أهلاً بك عيوني! أنا وياك خطوة بخطوة، تفضل بسؤالك وسأجيبك فوراً وبأدق تفصيل.';
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: finalReply,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          modelUsed,
          providerUsed,
          roleType: selectedRole.name,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      // Clean fallback avoiding any raw 401 JSON to the student
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          role: 'assistant',
          content: 'يا هلا بيك عيوني! أنا وياك خطوة بخطوة، تفضل بسؤالك الأكاديمي وسأجيبك فوراً وبأدق تفصيل.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.8-flash',
          providerUsed: 'Google Gemini',
          roleType: selectedRole.name,
        },
      ]);
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onNotify('تم نسخ النص إلى الحافظة', 'info');
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `تم مسح سجل المحادثة. أنا جاهز لخدمتك بمحرك **جميني 2** في وضع **${selectedRole.name}**.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: model,
        roleType: selectedRole.name,
      },
    ]);
    onNotify('تم تفريغ المحادثة بنجاح', 'info');
  };

  const handleExportChatToDrive = () => {
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'المستخدم' : `المساعد (${m.roleType || 'A.W.H'})`}:\n${m.content}\n`
      )
      .join('\n---\n\n');

    const fileName = `AWH_ChatTranscript_${selectedRole.id}_${Date.now()}.md`;

    onRequestDriveConfirmation({
      title: 'حفظ سجل المحادثة في Google Drive',
      message: `هل توافق على حفظ سجل المحادثة الحالي (${messages.length} رسالة) في حساب Google Drive الخاص بك؟`,
      itemDetails: `اسم الملف: ${fileName}\nالدور النشط: ${selectedRole.name}\nالنموذج: ${model}`,
      onConfirm: async () => {
        const res = await uploadTextFileToDrive({
          name: fileName,
          content: `# سجل محادثة A.W.H AI Studio\nالدور: ${selectedRole.name} (${selectedRole.title})\nالتاريخ: ${new Date().toLocaleString()}\n\n${transcript}`,
          mimeType: 'text/markdown',
          description: `Chat Transcript from A.W.H Multi-Role Assistant (${selectedRole.name})`,
        });
        onNotify(`تم حفظ سجل المحادثة بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  return (
    <div className="space-y-4">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Subscription Tier Banner */}
      <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 text-xs">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold text-slate-200">باقتك الحالية للمساعد الذكي:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
            userPlan === 'VIP'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : userPlan === 'Smart'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {userPlan === 'VIP' ? 'الباقة الشاملة VIP 👑' : userPlan === 'Smart' ? 'الباقة الذكية ⭐' : 'الباقة المجانية (Free)'}
          </span>
        </div>

        <button
          onClick={onOpenSubscriptions}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/40 font-bold transition active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>تغيير أو ترقية الباقة</span>
        </button>
      </div>

      <div className="h-[calc(100vh-230px)] min-h-[580px] flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Top Controls Bar: Role & Model selection with Gemini 2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          {/* Roles Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] ml-1 font-semibold">الدور المخصص:</span>
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{role.name}</span>
                </button>
              );
            })}
          </div>

          {/* Model Switcher featuring Google Gemini, Groq, & Hermes */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-mono"
              >
                <optgroup label="محرك التفكير والاستنتاج DeepSeek R1 🐋" className="bg-slate-950 text-emerald-400 font-bold">
                  <option value="deepseek-r1" className="text-white">🐋 DeepSeek-R1 (تفكير منطقي عميق وسلسلة استنتاج Chain-of-Thought)</option>
                </optgroup>
                <optgroup label="محركات Google Gemini (المحدثة)" className="bg-slate-950 text-cyan-400 font-bold">
                  <option value="gemini-3.1-flash-lite" className="text-white">⚡ gemini-3.1-flash-lite (فائق السرعة والاستجابة الفورية)</option>
                  <option value="gemini-flash-latest" className="text-white">🚀 Gemini Flash Latest (سريع وشامل)</option>
                  <option value="gemini-4-argon" className="text-white">🧠 gemini-4-argon (مهام معقدة وتفكير)</option>
                  <option value="gemini-3.8-flash" className="text-white">⚖️ gemini-3.8-flash (مهام عامة ومتوازنة)</option>
                </optgroup>
                <optgroup label="محركات بديلة مسرعة (Resilient)" className="bg-slate-950 text-amber-400 font-bold">
                  <option value="groq-llama-3.3-70b-versatile" className="text-white">⚡ Llama 3 Fast (مدعوم بالحماية التلقائية)</option>
                  <option value="hermes-2-pro-8b" className="text-white">🧬 Hermes 2 Pro (تحليل واستنتاج)</option>
                </optgroup>
              </select>
            </div>

            <button
              onClick={handleExportChatToDrive}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
              title="حفظ المحادثة في Google Drive"
            >
              <CloudUpload className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title="مسح سجل المحادثة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages Scrollable Thread */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
                <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.modelUsed === 'deepseek-r1' || msg.providerUsed?.toLowerCase().includes('deepseek')
                    ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-emerald-900/40 ring-1 ring-emerald-500/40'
                    : msg.modelUsed?.startsWith('groq') || msg.providerUsed === 'Groq'
                    ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white'
                    : msg.modelUsed?.toLowerCase().includes('hermes') || msg.providerUsed === 'Nous Hermes'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white'
                    : 'bg-gradient-to-br from-cyan-600 to-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : msg.modelUsed === 'deepseek-r1' || msg.providerUsed?.toLowerCase().includes('deepseek') ? <Brain className="w-4 h-4 text-emerald-200" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`relative group max-w-[82%] md:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : msg.modelUsed === 'deepseek-r1' || msg.providerUsed?.toLowerCase().includes('deepseek')
                    ? 'bg-slate-950/95 text-slate-200 border border-emerald-500/30 rounded-tl-none shadow-emerald-950/20'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Header meta */}
                <div className="flex items-center justify-between gap-3 pb-1 mb-1 text-[10px] text-slate-400 border-b border-white/10 font-mono">
                  <span>{msg.role === 'user' ? 'أنت' : msg.roleType || 'A.W.H AI'}</span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border flex items-center gap-1 ${
                        msg.modelUsed === 'deepseek-r1' || msg.providerUsed?.toLowerCase().includes('deepseek')
                          ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/50 shadow-sm'
                          : msg.modelUsed.startsWith('groq') || msg.providerUsed === 'Groq'
                          ? 'text-amber-300 bg-amber-950/60 border-amber-500/40'
                          : 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30'
                      }`}>
                        {msg.modelUsed === 'deepseek-r1' ? '🐋 DeepSeek: R1 Reasoner' : msg.modelUsed.startsWith('groq') ? '🚀 Groq' : msg.modelUsed.toLowerCase().includes('hermes') ? '🧬 Hermes' : '🔵 Gemini'}: {msg.modelUsed.replace(/^(groq|hermes)-/, '')}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Message text with specialized Chain-of-Thought rendering */}
                <MessageContentRenderer content={msg.content} isUser={msg.role === 'user'} />

                {/* Copy button */}
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                  title="نسخ الرسالة"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>جاري صياغة الرد بواسطة محرك {model}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starters */}
        {selectedRole.starters.length > 0 && messages.length <= 4 && (
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              مقترحات:
            </span>
            {selectedRole.starters.map((starter, i) => (
              <button
                key={i}
                onClick={() => handleSend(starter)}
                className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-300 transition whitespace-nowrap flex-shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {/* AR Simulation Quick Action Bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <span>🥽</span>
              <span>محاكي الواقع الافتراضي (AR):</span>
            </span>
            <button
              onClick={() => {
                const arPrompt = `أريدك أن تتقمص دور 'محاكي واقع افتراضي تعليمي (AR Simulation)' مخصص لطلاب الصف الأول الابتدائي. مهمتك هي تعليمهم المهارات الأساسية (قراءة، حساب، علوم) من خلال بيئة تفاعلية غامرة.

قواعد عملك الأساسية:
1. الأسلوب: ابدأ كل جلسة بتهيئة المستخدم (الطالب) للدخول في 'بيئة واقع افتراضي' (مثل: مختبر، غابة، مدينة، بستان). استخدم وصفاً حسياً بصرياً ليتحرك خيال الطفل.
2. التدرج: ابدأ دائماً من المفاهيم الملموسة (أشياء يراها أو يلمسها) ثم انتقل للرموز المجردة.
3. تجنب الجمود: ابتعد تماماً عن أسلوب التلقين المباشر أو الجداول الصماء. كل معلومة يجب أن تكون جزءاً من قصة أو مهمة بطولية أو تحدٍ ممتع.
4. التفاعل: اطرح أسئلة قصيرة ومباشرة، وانتظر إجابة الطالب قبل الانتقال للخطوة التالية. إذا أخطأ الطالب، لا تقل 'خطأ'، بل أظهر له النتيجة بصرياً في بيئتك الافتراضية ليصحح فهمه بنفسه.
5. التعزيز: استخدم عبارات تشجيعية وتأثيرات بصرية افتراضية (مثل: 'لقد أضاء الميزان'، 'انفجرت الفقاعات الرقمية فرحاً') لتعزيز ثقة الطالب.
6. اللغة: استخدم لغة بسيطة، واضحة، ومناسبة لسن (6-7 سنوات).

ابدأ الآن بسؤالي: أي مادة سنبدأ بها في مختبرنا الافتراضي اليوم؟`;
                handleSend(arPrompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-bold transition flex items-center gap-1"
            >
              <span>🚀 تشغيل جلسة محاكي AR لصف أول</span>
            </button>
          </div>

          <button
            onClick={() => {
              const arPrompt = `أريدك أن تتقمص دور 'محاكي واقع افتراضي تعليمي (AR Simulation)' مخصص لطلاب الصف الأول الابتدائي. مهمتك هي تعليمهم المهارات الأساسية (قراءة، حساب، علوم) من خلال بيئة تفاعلية غامرة.

قواعد عملك الأساسية:
1. الأسلوب: ابدأ كل جلسة بتهيئة المستخدم (الطالب) للدخول في 'بيئة واقع افتراضي' (مثل: مختبر، غابة، مدينة، بستان). استخدم وصفاً حسياً بصرياً ليتحرك خيال الطفل.
2. التدرج: ابدأ دائماً من المفاهيم الملموسة (أشياء يراها أو يلمسها) ثم انتقل للرموز المجردة.
3. تجنب الجمود: ابتعد تماماً عن أسلوب التلقين المباشر أو الجداول الصماء. كل معلومة يجب أن تكون جزءاً من قصة أو مهمة بطولية أو تحدٍ ممتع.
4. التفاعل: اطرح أسئلة قصيرة ومباشرة، وانتظر إجابة الطالب قبل الانتقال للخطوة التالية. إذا أخطأ الطالب، لا تقل 'خطأ'، بل أظهر له النتيجة بصرياً في بيئتك الافتراضية ليصحح فهمه بنفسه.
5. التعزيز: استخدم عبارات تشجيعية وتأثيرات بصرية افتراضية (مثل: 'لقد أضاء الميزان'، 'انفجرت الفقاعات الرقمية فرحاً') لتعزيز ثقة الطالب.
6. اللغة: استخدم لغة بسيطة، واضحة، ومناسبة لسن (6-7 سنوات).

ابدأ الآن بسؤالي: أي مادة سنبدأ بها في مختبرنا الافتراضي اليوم؟`;
              navigator.clipboard.writeText(arPrompt);
              onNotify('تم نسخ البرومبت المعتمد لمحاكي الواقع الافتراضي بنجاح!', 'success');
            }}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
          >
            <Copy className="w-3 h-3" />
            <span>نسخ البرومبت (Prompt)</span>
          </button>
        </div>

        {/* Input Form */}
        <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`اسأل ${selectedRole.name} بمحرك جميني 2 عن أي مهمة في التحليل أو التوليد أو البناء...`}
              className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

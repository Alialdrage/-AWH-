import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Globe2,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import {
  graduateAssistantSystemPrompt,
  graduateAssistantWelcome,
  graduateQuickQuestions,
  ministryNote,
  registrationChecklist,
  researchMilestones,
  responsibleOrganizations,
  type ChecklistItem,
} from '../services/graduateGuide';

type GradTab = 'registration' | 'research' | 'organizations' | 'chat';

const TABS: { id: GradTab; label: string; icon: LucideIcon }[] = [
  { id: 'registration', label: 'التسجيل', icon: ClipboardCheck },
  { id: 'research', label: 'متابعة البحث', icon: FlaskConical },
  { id: 'organizations', label: 'المنظمات الدولية', icon: Globe2 },
  { id: 'chat', label: 'اسأل المساعد', icon: MessageSquare },
];

const REGISTRATION_KEY = 'awh_grad_registration_checklist';
const RESEARCH_KEY = 'awh_grad_research_milestones';
const MEETINGS_KEY = 'awh_grad_supervisor_meetings';
const FALLBACK_REPLY = 'تعذّر الحصول على رد الآن. تحقق من اتصالك وأعد المحاولة، أو راجع شؤون الدراسات العليا في كليتك.';

// Storage is optional: every read and write is guarded so the page still works without it.
const loadStringList = (key: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

const saveValue = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: progress is kept for this visit only */
  }
};

interface MeetingNote {
  id: string;
  date: string;
  topic: string;
  nextStep: string;
}

const isMeetingNote = (value: unknown): value is MeetingNote => {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return typeof m.id === 'string' && typeof m.date === 'string' && typeof m.topic === 'string' && typeof m.nextStep === 'string';
};

const loadMeetings = (): MeetingNote[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MEETINGS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isMeetingNote) : [];
  } catch {
    return [];
  }
};

const ChecklistPanel: React.FC<{ storageKey: string; items: ChecklistItem[] }> = ({ storageKey, items }) => {
  const [checked, setChecked] = useState<string[]>(() => loadStringList(storageKey));

  useEffect(() => {
    saveValue(storageKey, checked);
  }, [storageKey, checked]);

  const doneCount = items.filter((item) => checked.includes(item.id)).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-slate-400">
          أنجزت {doneCount} من {items.length} خطوة ({percent}%)
        </p>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ol className="space-y-2">
        {items.map((item, index) => {
          const isDone = checked.includes(item.id);
          return (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className={`w-full text-right flex items-start gap-3 p-3.5 rounded-xl border transition ${
                  isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                )}
                <span className="flex-1 space-y-1">
                  <span className="block text-sm font-bold text-slate-100">
                    {index + 1}. {item.title}
                  </span>
                  <span className="block text-xs text-slate-400 leading-6">{item.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const MeetingLog: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingNote[]>(loadMeetings);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [topic, setTopic] = useState('');
  const [nextStep, setNextStep] = useState('');

  useEffect(() => {
    saveValue(MEETINGS_KEY, meetings);
  }, [meetings]);

  const addMeeting = () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic || !date) return;
    setMeetings((prev) => [{ id: `m-${Date.now()}`, date, topic: cleanTopic, nextStep: nextStep.trim() }, ...prev]);
    setTopic('');
    setNextStep('');
  };

  const removeMeeting = (id: string) => setMeetings((prev) => prev.filter((m) => m.id !== id));

  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-cyan-400" />
        سجل لقاءات المشرف
      </h4>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 grid gap-3 md:grid-cols-[auto_1fr_1fr_auto] items-end">
        <label className="space-y-1 text-xs text-slate-400">
          <span>التاريخ</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </label>
        <label className="space-y-1 text-xs text-slate-400">
          <span>ما الذي نوقش؟</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: ملاحظات على الفصل الثاني"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </label>
        <label className="space-y-1 text-xs text-slate-400">
          <span>الخطوة التالية</span>
          <input
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            placeholder="مثال: تسليم جدول البيانات"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </label>
        <button
          onClick={addMeeting}
          disabled={!topic.trim() || !date}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-bold flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-slate-500">لم تُسجَّل لقاءات بعد. دوّن أول لقاء مع المشرف لتتابع ما اتُّفق عليه.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((m) => (
            <li key={m.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] font-mono text-slate-500" dir="ltr">
                  {m.date}
                </p>
                <p className="text-sm font-bold text-slate-100">{m.topic}</p>
                {m.nextStep && <p className="text-xs text-amber-300 leading-6">التالي: {m.nextStep}</p>}
              </div>
              <button
                onClick={() => removeMeeting(m.id)}
                aria-label="حذف اللقاء"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const OrganizationsPanel: React.FC = () => (
  <div className="space-y-3">
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 text-xs text-slate-400 leading-6">{ministryNote}</div>

    {responsibleOrganizations.map((org) => (
      <article key={org.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100">{org.name}</h4>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5" dir="ltr">
              {org.englishName}
            </p>
          </div>
          {org.website && (
            <a
              href={`https://${org.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span dir="ltr">{org.website}</span>
            </a>
          )}
        </div>
        <p className="text-xs text-slate-300 leading-6">{org.role}</p>
        <ul className="list-disc pr-5 text-xs text-slate-400 leading-6 space-y-1">
          {org.useFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    ))}
  </div>
);

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const GraduateChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: graduateAssistantWelcome },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { id: `u-${Date.now()}`, role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    const history = nextMessages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    let reply = FALLBACK_REPLY;
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, systemInstruction: graduateAssistantSystemPrompt }),
      });
      const data: unknown = await res.json().catch(() => null);
      const candidate = data && typeof data === 'object' ? (data as { reply?: unknown }).reply : undefined;
      if (res.ok && typeof candidate === 'string' && candidate.trim()) {
        reply = candidate;
      }
    } catch {
      /* network error: keep the fallback reply */
    }

    setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] min-h-[420px] rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-7 whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-cyan-600/20 border border-cyan-500/30 text-slate-100'
                  : 'bg-slate-800/70 border border-slate-700 text-slate-200'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              جارٍ إعداد الرد...
            </div>
          </div>
        )}

        {messages.length <= 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {graduateQuickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => void send(q)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-slate-800 p-3 flex gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="اكتب سؤالك عن التسجيل أو البحث أو الجهات الدولية..."
          className="flex-1 resize-none rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-sm flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          إرسال
        </button>
      </form>
      <p className="px-4 pb-3 text-[11px] text-slate-500 leading-5">
        هذا المساعد يقدّم إرشاداً عاماً. شروط القبول والتسجيل والبحث تحددها إعلانات جامعتك ولائحتها، وهي المرجع النهائي.
      </p>
    </div>
  );
};

export const GraduateAssistant: React.FC = () => {
  const [tab, setTab] = useState<GradTab>('registration');

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-5" dir="rtl">
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <GraduationCap className="w-6 h-6" />
          <h2 className="text-2xl md:text-3xl font-black">مساعد طلاب الدراسات العليا</h2>
        </div>
        <p className="text-sm text-slate-400 leading-7">
          دليل عملي للتسجيل في الدراسات العليا، ومتابعة البحث مع المشرف، والتعرف على الجهات الدولية المسؤولة عن التعليم العالي
          وجودته وأخلاقيات النشر.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                active
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5">
        {tab === 'registration' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-100">قائمة التسجيل في الدراسات العليا</h3>
              <p className="text-xs text-slate-400 leading-6 mt-1">
                علّم كل خطوة تنجزها. تُحفظ تقدمك على هذا الجهاز فقط.
              </p>
            </div>
            <ChecklistPanel storageKey={REGISTRATION_KEY} items={registrationChecklist} />
          </div>
        )}

        {tab === 'research' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-100">مراحل البحث العلمي</h3>
              <p className="text-xs text-slate-400 leading-6 mt-1">
                تابع مراحل بحثك من الفكرة إلى المناقشة، ودوّن لقاءات المشرف لتعرف الخطوة التالية دائماً.
              </p>
            </div>
            <ChecklistPanel storageKey={RESEARCH_KEY} items={researchMilestones} />
            <div className="border-t border-slate-800 pt-5">
              <MeetingLog />
            </div>
          </div>
        )}

        {tab === 'organizations' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-100">المنظمات الدولية المسؤولة</h3>
              <p className="text-xs text-slate-400 leading-6 mt-1">
                جهات دولية وإقليمية تعنى بالتعليم العالي والبحث العلمي وضمان الجودة وأخلاقيات النشر.
              </p>
            </div>
            <OrganizationsPanel />
          </div>
        )}

        {tab === 'chat' && <GraduateChat />}
      </div>
    </div>
  );
};

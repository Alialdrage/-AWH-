import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Circle, Lightbulb } from 'lucide-react';
import type { CurriculumContent } from '../services/knowledgeSections';

interface KnowledgeSectionViewProps {
  /** localStorage key used to remember which lessons the user has finished. */
  storageKey: string;
  curriculum: CurriculumContent;
  /** Tailwind text color class for the section accent, e.g. "text-cyan-400". */
  accentClass: string;
  onNavigateHome: () => void;
}

const readDone = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

export const KnowledgeSectionView: React.FC<KnowledgeSectionViewProps> = ({
  storageKey,
  curriculum,
  accentClass,
  onNavigateHome,
}) => {
  const [openChapter, setOpenChapter] = useState<string | null>(curriculum.chapters[0]?.id ?? null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>(() => readDone(storageKey));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      /* storage unavailable: progress is kept for this visit only */
    }
  }, [storageKey, done]);

  const totalLessons = curriculum.chapters.reduce((n, c) => n + c.lessons.length, 0);
  const percent = totalLessons ? Math.round((done.length / totalLessons) * 100) : 0;

  const toggleDone = (lessonId: string) =>
    setDone((prev) => (prev.includes(lessonId) ? prev.filter((x) => x !== lessonId) : [...prev, lessonId]));

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 space-y-5" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onNavigateHome}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>رجوع إلى الرئيسية</span>
          </button>
          <span className="text-xs text-slate-400">
            مكتمل {done.length} من {totalLessons} درساً ({percent}%)
          </span>
        </div>
        <div>
          <h2 className={`text-2xl md:text-3xl font-black ${accentClass}`}>{curriculum.title}</h2>
          <p className="text-sm text-slate-300 font-bold mt-1">{curriculum.subtitle}</p>
          <p className="text-sm text-slate-400 leading-relaxed mt-3">{curriculum.intro}</p>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Chapters */}
      {curriculum.chapters.map((chapter, index) => {
        const isOpen = openChapter === chapter.id;
        return (
          <section key={chapter.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenChapter(isOpen ? null : chapter.id)}
              className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-right hover:bg-slate-800/40 transition"
            >
              <div>
                <span className="text-[11px] font-mono text-slate-500">الفصل {index + 1}</span>
                <h3 className="text-base md:text-lg font-extrabold text-slate-100">{chapter.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">الهدف: {chapter.goal}</p>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-4 md:px-5 pb-5 space-y-3">
                {chapter.lessons.map((lesson) => {
                  const lessonOpen = openLesson === lesson.id;
                  const isDone = done.includes(lesson.id);
                  return (
                    <div key={lesson.id} className="rounded-xl border border-slate-800 bg-slate-950/60">
                      <button
                        onClick={() => setOpenLesson(lessonOpen ? null : lesson.id)}
                        className="w-full flex items-center justify-between gap-3 p-3.5 text-right"
                      >
                        <span className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="text-sm font-bold text-slate-100">{lesson.title}</span>
                        </span>
                        {lessonOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>

                      {lessonOpen && (
                        <div className="px-4 pb-4 space-y-4">
                          {lesson.paragraphs.map((p, i) => (
                            <p key={i} className="text-sm text-slate-300 leading-7">
                              {p}
                            </p>
                          ))}

                          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>نقاط مهمة</span>
                            </div>
                            <ul className="space-y-1.5 list-disc pr-5 text-xs text-slate-300 leading-6">
                              {lesson.keyPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>

                          <button
                            onClick={() => toggleDone(lesson.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {isDone ? 'تم إنهاء الدرس ✓' : 'وضع علامة: تم إنهاء الدرس'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Review questions */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                  <h4 className="text-sm font-bold text-slate-100">أسئلة مراجعة</h4>
                  {chapter.review.map((item, i) => (
                    <details key={i} className="group rounded-lg bg-slate-900/60 border border-slate-800 p-3">
                      <summary className="cursor-pointer text-xs font-bold text-slate-200">{item.question}</summary>
                      <p className="text-xs text-emerald-300 leading-6 mt-2">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

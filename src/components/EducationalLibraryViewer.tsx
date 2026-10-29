import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  CloudUpload,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  FileText,
  Bookmark,
  Share2,
} from 'lucide-react';
import { EDUCATIONAL_LESSONS, EducationalLesson } from '../services/educationalContentData';
import { uploadTextFileToDrive } from '../services/googleDriveService';

interface EducationalLibraryViewerProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected: boolean;
  onAskAiAboutTopic?: (topicTitle: string, subject: string) => void;
}

export const EducationalLibraryViewer: React.FC<EducationalLibraryViewerProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onAskAiAboutTopic,
}) => {
  const [selectedStage, setSelectedStage] = useState<'all' | 'primary' | 'intermediate' | 'preparatory'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLesson, setActiveLesson] = useState<EducationalLesson | null>(null);

  // Audio speech synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Quiz state for active lesson
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter lessons
  const filteredLessons = EDUCATIONAL_LESSONS.filter((lesson) => {
    if (selectedStage !== 'all' && lesson.stage !== selectedStage) return false;
    if (selectedSubject !== 'all' && !lesson.subject.includes(selectedSubject)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lesson.title.toLowerCase().includes(q);
      const matchSummary = lesson.summary.toLowerCase().includes(q);
      const matchSubject = lesson.subject.toLowerCase().includes(q);
      const matchTags = lesson.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchSubject && !matchTags) return false;
    }
    return true;
  });

  // Unique subjects
  const subjectsList = ['all', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'];

  // Handle Text-to-Speech
  const handleToggleAudio = (text: string) => {
    if (!('speechSynthesis' in window)) {
      onNotify('المتصفح لا يدعم القراءة الصوتية', 'error');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      onNotify('جارٍ تشغيل الشرح الصوتي للدرس...', 'info');
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Open Lesson Reader
  const handleOpenLesson = (lesson: EducationalLesson) => {
    handleStopAudio();
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizSubmitted(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Close Lesson Reader
  const handleCloseLesson = () => {
    handleStopAudio();
    setActiveLesson(null);
  };

  // Save Lesson to Google Drive
  const handleSaveLessonToDrive = (lesson: EducationalLesson) => {
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const fileName = `درس_أكاديمي_${lesson.title.replace(/\s+/g, '_')}_${Date.now()}.md`;
    const markdownContent = `# ${lesson.title}
**المرحلة:** ${lesson.gradeName} | **المادة:** ${lesson.subject} | **وقت القراءة:** ${lesson.readTime}
منصة A.W.H الأكاديمية - ركس.كود

---

## 1. نظرة عامة على الدرس
${lesson.overview}

## 2. القواعد والملاحظات الذهبية
${lesson.goldenRules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')}

## 3. المفاهيم الأساسية
${lesson.keyConcepts.map((c) => `### ${c.title}\n${c.explanation}`).join('\n\n')}

## 4. المسائل والأمثلة النموذجية المحلولة
${lesson.workedExamples
  .map(
    (ex, idx) => `### مثال ${idx + 1}: ${ex.question}
**خطوات الحل:**
${ex.stepByStep.map((s, si) => `  ${si + 1}. ${s}`).join('\n')}
**الناتج النهائي:** ${ex.finalAnswer}
${ex.tips ? `*ملاحظة إضافية:* ${ex.tips}` : ''}`
  )
  .join('\n\n')}

---
تم إنشاؤه عبر منصة A.W.H الأكاديمية للذكاء الاصطناعي
`;

    onRequestDriveConfirmation({
      title: 'حفظ الدرس التعليمي في Google Drive',
      message: `هل توافق على حفظ ملخص درس "${lesson.title}" في حساب Google Drive الخاص بك؟`,
      itemDetails: `اسم الملف: ${fileName}\nالمادة: ${lesson.subject}\nالمرحلة: ${lesson.gradeName}`,
      onConfirm: async () => {
        const res = await uploadTextFileToDrive({
          name: fileName,
          content: markdownContent,
          mimeType: 'text/markdown',
          description: `Educational Lesson Dossier for ${lesson.title}`,
        });
        onNotify(`تم حفظ الدرس بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  const handleCopySummary = (lesson: EducationalLesson) => {
    const textToCopy = `${lesson.title}\nالمرحلة: ${lesson.gradeName} | المادة: ${lesson.subject}\n\nملخص الدرس:\n${lesson.overview}\n\nالقواعد الذهبية:\n${lesson.goldenRules.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('تم نسخ ملخص الدرس إلى الحافظة بنجاح!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                A.W.H CURRICULUM VAULT
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                دروس تفاعلية جاهزة • شروحات صوتية • اختبارات فهم
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-cyan-400" />
              <span>مكتبة المحتوى والمناهج التعليمية الشاملة</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              دروس منهجية مفصلة خطوة بخطوة لجميع المراحل (الابتدائي، المتوسط، الإعدادي، وبكالوريا السادس)، مدعمة بالقواعد الذهبية، مسائل محلولة، واختبارات قياس الفهم الفورية.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="block text-2xl font-black text-cyan-400">{EDUCATIONAL_LESSONS.length}</span>
              <span className="text-[10px] text-slate-400 font-semibold">درساً نموذجياً متاحاً</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Stage Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            {[
              { id: 'all' as const, label: 'جميع المراحل' },
              { id: 'primary' as const, label: 'الابتدائي' },
              { id: 'intermediate' as const, label: 'المتوسط' },
              { id: 'preparatory' as const, label: 'الإعدادي والبكالوريا' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStage(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedStage === tab.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {subjectsList.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                  selectedSubject === subj
                    ? 'bg-purple-600 text-white shadow-sm font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {subj === 'all' ? 'جميع المواد' : subj}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن درس أو موضوع..."
              className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DETAILED LESSON READER VIEW (WHEN A LESSON IS ACTIVE) */}
      {/* ============================================================== */}
      {activeLesson && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-2xl space-y-6 animate-in fade-in duration-300">
          {/* Reader Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCloseLesson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لقائمة الدروس</span>
              </button>

              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {activeLesson.gradeName}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {activeLesson.subject}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {activeLesson.difficulty}
              </span>
            </div>

            {/* Actions: Audio Listen, Drive, Ask AI, Copy */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleToggleAudio(activeLesson.audioNarration || activeLesson.overview)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  isPlayingAudio
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={isPlayingAudio ? 'إيقاف الشرح الصوتي' : 'استماع صوتي للدرس'}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'إيقاف الصوت' : 'استماع للشرح'}</span>
              </button>

              {onAskAiAboutTopic && (
                <button
                  onClick={() => onAskAiAboutTopic(activeLesson.title, activeLesson.subject)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-md"
                  title="استفسار ذكي مفصل من المساعد الأكاديمي"
                >
                  <Brain className="w-4 h-4" />
                  <span>اسأل المساعد الذكي</span>
                </button>
              )}

              <button
                onClick={() => handleCopySummary(activeLesson)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                title="نسخ ملخص الدرس"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              <button
                onClick={() => handleSaveLessonToDrive(activeLesson)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
                title="حفظ الدرس في Google Drive"
              >
                <CloudUpload className="w-4 h-4" />
                <span>حفظ في Drive</span>
              </button>
            </div>
          </div>

          {/* Lesson Main Heading */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{activeLesson.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>وقت الدراسة المقدر: {activeLesson.readTime}</span>
              </span>
              <span>•</span>
              <span>الكلمات الدلالية: {activeLesson.tags.join('، ')}</span>
            </div>
          </div>

          {/* Section 1: Overview & Summary */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>مقدمة ونظرة عامة على الدرس:</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{activeLesson.overview}</p>
          </div>

          {/* Section 2: Golden Rules & Exam Tips */}
          {activeLesson.goldenRules.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>القواعد والملاحظات الذهبية للامتحان الوزاري:</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                {activeLesson.goldenRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Key Concepts */}
          {activeLesson.keyConcepts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>المفاهيم والركائز العلمية الأساسية:</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeLesson.keyConcepts.map((concept, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <h4 className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>{concept.title}</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{concept.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Worked Step-by-Step Examples */}
          {activeLesson.workedExamples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>مسائل وأمثلة نموذجية محلولة خطوة بخطوة:</span>
              </h3>
              <div className="space-y-4">
                {activeLesson.workedExamples.map((ex, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        مسألة وتمرين رقم ({idx + 1}):
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      {ex.question}
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-400 block">خطوات الحل التفصيلية:</span>
                      <ol className="space-y-1.5 text-xs sm:text-sm text-slate-300 pr-2">
                        {ex.stepByStep.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="text-cyan-400 font-bold">{sIdx + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs sm:text-sm font-bold text-emerald-300 flex items-center justify-between">
                      <span>الناتج النهائي: {ex.finalAnswer}</span>
                    </div>

                    {ex.tips && (
                      <p className="text-xs text-amber-300/90 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        💡 نصيحة المدرس: {ex.tips}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Interactive Knowledge Check Quiz */}
          {activeLesson.quickQuiz.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>اختبار فهم ذاتي للدرس (Knowledge Check)</span>
                </h3>
                <span className="text-xs text-indigo-300 font-semibold">
                  {activeLesson.quickQuiz.length} أسئلة تدريبية
                </span>
              </div>

              <div className="space-y-4">
                {activeLesson.quickQuiz.map((quiz, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === quiz.correctIndex;

                  return (
                    <div key={qIdx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
                        س{qIdx + 1}: {quiz.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quiz.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted || isAnswered) {
                            if (optIdx === quiz.correctIndex) {
                              btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-300';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                              }}
                              className={`p-3 rounded-xl border text-xs text-right transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === quiz.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                              {quizSubmitted && isOptionSelected && optIdx !== quiz.correctIndex && (
                                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation feedback */}
                      {isAnswered && (
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-950 text-slate-300 border border-slate-800'
                          }`}
                        >
                          <span className="font-bold block mb-1">
                            {isCorrect ? '✓ إجابة صحيحة وممتازة!' : 'توضيح الإجابة الصحيحة:'}
                          </span>
                          <span>{quiz.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted && Object.keys(quizAnswers).length > 0 && (
                <button
                  onClick={() => {
                    setQuizSubmitted(true);
                    onNotify('تم تصحيح إجاباتك بنجاح!', 'success');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  اعتماد وتصحيح الاختبار
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* LESSONS GRID CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          return (
            <div
              key={lesson.id}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-850 transition-all duration-300 shadow-lg hover:shadow-cyan-950/30"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {lesson.gradeName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {lesson.subject}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                  {lesson.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{lesson.summary}</p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{lesson.readTime}</span>
                  </span>
                  <span>•</span>
                  <span className="text-amber-400/90">{lesson.difficulty}</span>
                  <span>•</span>
                  <span>{lesson.workedExamples.length} مسائل محلولة</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenLesson(lesson)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة ودراسة الدرس</span>
                </button>

                <button
                  onClick={() => handleToggleAudio(lesson.audioNarration || lesson.overview)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="استماع صوتي للدرس"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold">لم يتم العثور على دروس تطابق بحثك</p>
          <p className="text-xs text-slate-500">جرب تغيير المرحلة أو المادة أو عبارة البحث</p>
        </div>
      )}
    </div>
  );
};

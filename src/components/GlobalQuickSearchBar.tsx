import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  GraduationCap,
  Palette,
  Video,
  Radio,
  FileText,
  ImageIcon,
  Hammer,
  Dna,
  MessageSquare,
  Cloud,
  Cpu,
  Megaphone,
  Crown,
  ExternalLink,
  ChevronRight,
  Clock,
  Command,
} from 'lucide-react';
import { EDUCATIONAL_LESSONS, EducationalLesson } from '../services/educationalContentData';

export interface GlobalQuickSearchBarProps {
  onNavigateToTab: (tabId: string, extra?: { lessonId?: string; topic?: string; subject?: string }) => void;
  onOpenLesson?: (lesson: EducationalLesson) => void;
}

interface PlatformSection {
  id: string;
  tabId: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'أقسام المنصة' | 'أدوات الذكاء الاصطناعي' | 'التعليم' | 'التصميم والجرافيكس' | 'السحابة';
  icon: any;
  keywords: string[];
  badge?: string;
}

const PLATFORM_SECTIONS: PlatformSection[] = [
  {
    id: 'sec-main',
    tabId: 'main',
    title: 'الصفحة الرئيسية للمنصة',
    subtitle: 'بوابة الخدمات الشاملة',
    description: 'الواجهة المركزية لاستعراض كافة أقسام ومنظومات منصة A.W.H',
    category: 'أقسام المنصة',
    icon: Sparkles,
    keywords: ['الرئيسية', 'البداية', 'home', 'main', 'واجهة', 'منصة', 'a.w.h', 'ركس.كود'],
  },
  {
    id: 'sec-academic',
    tabId: 'academic',
    title: 'التعليم الأكاديمي والمناهج الدراسية',
    subtitle: 'الصفوف 1 - 6 ابتدائي، 1 - 3 متوسط، 4 - 6 إعدادي',
    description: 'مكتبة الدروس المنهجية، حل المسائل، بطاقات الاستذكار، وغرف الابتدائي التفاعلية',
    category: 'التعليم',
    icon: GraduationCap,
    keywords: ['تعليم', 'دراسة', 'مناهج', 'دروس', 'ابتدائي', 'متوسط', 'إعدادي', 'سادس', 'وزاري', 'بكالوريا', 'مذكرات', 'امتحانات'],
    badge: 'شامل المناهج',
  },
  {
    id: 'sec-graphics',
    tabId: 'graphics',
    title: 'استوديو محركات التصميم والجرافيكس',
    subtitle: 'Three.js 3D • Fabric.js • GLSL Raymarching • Algorithmic Art',
    description: 'بيئة احترافية متكاملة للنمذجة ثلاثية الأبعاد، التصميم المتجهي، وشيدرز GPU',
    category: 'التصميم والجرافيكس',
    icon: Palette,
    keywords: ['تصميم', 'جرافيكس', 'threejs', '3d', 'fabric', 'شيدرز', 'glsl', 'gpu', 'فن', 'رسم', 'تصدير', 'نمذجة'],
    badge: '3D & GPU',
  },
  {
    id: 'sec-lessons-broadcast',
    tabId: 'lessons_broadcast',
    title: 'بث الدروس والمحاضرات المصورة',
    subtitle: 'حصص مرئية مباشرة ومسجلة',
    description: 'قنوات ومحاضرات تعليمية تفاعلية بجودة عالية لكل المراحل الدراسية',
    category: 'التعليم',
    icon: Video,
    keywords: ['بث', 'محاضرات', 'فيديو', 'شروحات', 'مدرسين', 'حصص', 'دروس مصورة'],
  },
  {
    id: 'sec-private-tutor',
    tabId: 'private_tutor',
    title: 'المدرس الخصوصي (بث مباشر فيديو تفاعلي)',
    subtitle: 'حصص خصوصية مرئية مباشرة • سبورة ذكية • أسئلة لحظية',
    description: 'غرف بث مباشر للمدرسين الخصوصيين في العراق لكل المراحل، مع رفع اليد والمداخلات الصوتية',
    category: 'التعليم',
    icon: Video,
    keywords: ['مدرس خصوصي', 'خصوصي', 'بث مباشر', 'فيديو', 'مباشر', 'tutor', 'private tutor', 'حصة خصوصية', 'سبورة', 'سادس', 'وزاري', 'حيدر الموسوي', 'زينب الكرخي', 'أحمد الكرخي'],
    badge: 'مباشر LIVE',
  },
  {
    id: 'sec-analysis',
    tabId: 'analysis',
    title: 'محرك التحليل الذكي الهجين (Analytics Engine)',
    subtitle: 'ربط Firestore + ملفات Excel/CSV + نموذج gemini-2.5-flash',
    description: 'تحليل معمق للمستندات والأكواد والبيانات الضخمة مع تنفيذ بايثون وسحابة Firestore',
    category: 'أدوات الذكاء الاصطناعي',
    icon: FileText,
    keywords: ['تحليل', 'بيانات', 'excel', 'csv', 'firestore', 'analytics', 'تقارير', 'إحصائيات', 'بايثون'],
  },
  {
    id: 'sec-generation',
    tabId: 'generation',
    title: 'استوديو التوليد البصري والسينمائي (Veo 3)',
    subtitle: 'توليد فيديوهات سينمائية وصور فائقة الدقة 4K',
    description: 'صناعة المشاهد والفيديوهات المتحركة والصور الواقعية بأحدث نماذج التوليد',
    category: 'أدوات الذكاء الاصطناعي',
    icon: ImageIcon,
    keywords: ['توليد', 'صور', 'فيديو', 'veo', 'سينما', 'مشاهد', '4k', 'رسم بالذكاء', 'تصميم صور'],
    badge: 'Veo 3 & 4K',
  },
  {
    id: 'sec-builder',
    tabId: 'builder',
    title: 'مختبر البناء والتشييد المعماري (System Builder)',
    subtitle: 'توليد أنظمة متكاملة وهياكل قواعد بيانات',
    description: 'بناء هياكل البرمجيات، قواعد البيانات، واجهات API، والمشاريع البرمجية الكاملة',
    category: 'أدوات الذكاء الاصطناعي',
    icon: Hammer,
    keywords: ['بناء', 'كود', 'برمجة', 'قواعد بيانات', 'سيرفر', 'api', 'fullstack', 'هندسة برمجيات'],
  },
  {
    id: 'sec-bioscience',
    tabId: 'bioscience',
    title: 'بوابة العلوم الحيوية وAlphaFold DB',
    subtitle: 'الهياكل الجزيئية ثلاثية الأبعاد بدقة ذرية',
    description: 'استكشاف هياكل البروتينات والمركبات الكيميائية وديناميكيات الجزيئات والأبحاث',
    category: 'أدوات الذكاء الاصطناعي',
    icon: Dna,
    keywords: ['علوم', 'أحياء', 'بروتين', 'alphafold', 'dna', 'كيمياء حيوية', 'جزيئات', 'أدوية', 'pdb'],
  },
  {
    id: 'sec-chat',
    tabId: 'chat',
    title: 'المساعد الأكاديمي والذكي متعدد الأدوار',
    subtitle: 'استشارات، حل مسائل، وتوجيه دراسي فوري',
    description: 'حوار تفاعلي ذكي مدعوم بالبحث والتوثيق من Google Search Grounding',
    category: 'أدوات الذكاء الاصطناعي',
    icon: MessageSquare,
    keywords: ['مساعد', 'شات', 'محادثة', 'استفسار', 'أستاذ', 'دردشة', 'ذكاء اصطناعي', 'بوت'],
  },
  {
    id: 'sec-drive',
    tabId: 'drive',
    title: 'سحابة Google Drive Workspace',
    subtitle: 'إدارة وتخزين التقارير والصور والملاحظات',
    description: 'مزامنة وحفظ سحابي مباشر لجميع نتائج التحليل والملفات في حساب Drive الخاص بك',
    category: 'السحابة',
    icon: Cloud,
    keywords: ['drive', 'قوقل درايف', 'تخزين سحابي', 'ملفات', 'حفظ', 'مزامنة', 'google'],
  },
  {
    id: 'sec-game',
    tabId: 'game',
    title: 'تحدي الفيزياء والميكانيكا التفاعلي',
    subtitle: 'محاكاة الجاذبية والتصادمات',
    description: 'تطبيق عملي لقوانين الفيزياء والجاذبية في بيئة ألعاب تفاعلية ممتعة',
    category: 'أقسام المنصة',
    icon: Cpu,
    keywords: ['لعبة', 'فيزياء', 'تحدي', 'جاذبية', 'محاكاة', 'تصادم'],
  },
  {
    id: 'sec-ads',
    tabId: 'ads',
    title: 'أعلن معنا (بوابة الرعاية والإعلان)',
    subtitle: 'فرص الرعاية والترويج الأكاديمي',
    description: 'باقات الإعلان الموجه للطلبة والمؤسسات الأكاديمية والشركات',
    category: 'أقسام المنصة',
    icon: Megaphone,
    keywords: ['إعلان', 'رعاية', 'تسويق', 'ترويج', 'باقات إعلانية', 'شركات'],
  },
];

// Popular quick curriculum searches for empty state
const POPULAR_SEARCHES = [
  { label: 'مبرهنة دي موافر (السادس العلمي)', tab: 'academic', query: 'دي موافر' },
  { label: 'حل المعادلات بالدستور (الثالث المتوسط)', tab: 'academic', query: 'دستور' },
  { label: 'محاليل بفر والـ pH (الكيمياء الوزارية)', tab: 'academic', query: 'بفر' },
  { label: 'قانون أوم والتوالي والتوازي (الفيزياء)', tab: 'academic', query: 'أوم' },
  { label: 'أسلوب الاستفهام وإعرابه (اللغة العربية)', tab: 'academic', query: 'استفهام' },
  { label: 'مقياس الرسم والنسبة (السادس الابتدائي)', tab: 'academic', query: 'مقياس الرسم' },
  { label: 'محركات التصميم ثلاثية الأبعاد (3D Engine)', tab: 'graphics', query: '3D' },
  { label: 'بوابة AlphaFold DB والبروتينات', tab: 'bioscience', query: 'alphafold' },
];

export const GlobalQuickSearchBar: React.FC<GlobalQuickSearchBarProps> = ({
  onNavigateToTab,
  onOpenLesson,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'lessons' | 'sections'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time filtering
  const trimmedQuery = query.trim().toLowerCase();

  // Filter lessons
  const matchedLessons = EDUCATIONAL_LESSONS.filter((lesson) => {
    if (!trimmedQuery) return true;
    const inTitle = lesson.title.toLowerCase().includes(trimmedQuery);
    const inSubject = lesson.subject.toLowerCase().includes(trimmedQuery);
    const inGrade = lesson.gradeName.toLowerCase().includes(trimmedQuery);
    const inSummary = lesson.summary.toLowerCase().includes(trimmedQuery);
    const inTags = lesson.tags.some((t) => t.toLowerCase().includes(trimmedQuery));
    return inTitle || inSubject || inGrade || inSummary || inTags;
  });

  // Filter platform sections
  const matchedSections = PLATFORM_SECTIONS.filter((sec) => {
    if (!trimmedQuery) return true;
    const inTitle = sec.title.toLowerCase().includes(trimmedQuery);
    const inSub = sec.subtitle.toLowerCase().includes(trimmedQuery);
    const inDesc = sec.description.toLowerCase().includes(trimmedQuery);
    const inKeywords = sec.keywords.some((k) => k.toLowerCase().includes(trimmedQuery));
    return inTitle || inSub || inDesc || inKeywords;
  });

  const totalResultsCount =
    (activeFilter === 'all' || activeFilter === 'lessons' ? matchedLessons.length : 0) +
    (activeFilter === 'all' || activeFilter === 'sections' ? matchedSections.length : 0);

  const handleSelectLesson = (lesson: EducationalLesson) => {
    setIsOpen(false);
    setQuery('');
    if (onOpenLesson) {
      onOpenLesson(lesson);
    } else {
      onNavigateToTab('academic', { lessonId: lesson.id, topic: lesson.title, subject: lesson.subject });
    }
  };

  const handleSelectSection = (sec: PlatformSection) => {
    setIsOpen(false);
    setQuery('');
    onNavigateToTab(sec.tabId);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-40" dir="rtl">
      {/* Search Input Box */}
      <div
        className={`relative flex items-center w-full rounded-2xl bg-slate-900/90 border transition-all duration-200 backdrop-blur-md shadow-lg ${
          isOpen
            ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-cyan-950/40 bg-slate-900'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/80'
        }`}
      >
        <div className="flex items-center justify-center pl-2 pr-3.5 text-slate-400">
          <Search className={`w-4 h-4 transition ${isOpen ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="بحث فوري في الدروس التعليمية، المناهج، وأقسام المنصة..."
          className="w-full py-2.5 pl-3 pr-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
        />

        {/* Clear or Keyboard Shortcut badge */}
        <div className="flex items-center gap-1 pl-2.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 rounded-md border border-slate-700/80">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Real-time Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-2 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-slate-850 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
          {/* Filter Pills Bar & Results Count */}
          <div className="p-3 bg-slate-900/80 flex items-center justify-between gap-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all' as const, label: 'الكل', count: matchedLessons.length + matchedSections.length },
                { id: 'lessons' as const, label: 'المحتوى والدروس', count: matchedLessons.length },
                { id: 'sections' as const, label: 'أقسام المنصة', count: matchedSections.length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-xl font-semibold transition text-[11px] flex items-center gap-1 ${
                    activeFilter === f.id
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === f.id ? 'bg-white/20' : 'bg-slate-900 text-slate-400'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              تصفية لحظية • {totalResultsCount} نتيجة
            </span>
          </div>

          {/* Results Scrollable Container */}
          <div className="overflow-y-auto p-3 space-y-4 flex-1">
            {/* If Query is Empty: Show Popular Curriculum Searches & Platform Shortcuts */}
            {!trimmedQuery && (
              <div className="space-y-4 py-1">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-2 px-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>مواضيع دراسية ومنهجية شائعة:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {POPULAR_SEARCHES.map((pop, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(pop.query);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 text-right transition group active:scale-98"
                      >
                        <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-300 transition">
                          {pop.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-2 px-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>أقسام المنصة السريعة:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PLATFORM_SECTIONS.slice(0, 6).map((sec) => {
                      const Icon = sec.icon;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => handleSelectSection(sec)}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-right transition active:scale-95"
                        >
                          <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-200 truncate">{sec.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 1. EDUCATIONAL LESSONS RESULTS */}
            {(activeFilter === 'all' || activeFilter === 'lessons') && matchedLessons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>الدروس والمحتوى التعليمي ({matchedLessons.length})</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {matchedLessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className="w-full flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 hover:border-cyan-500/40 border border-slate-800 text-right transition group active:scale-[0.99]"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {lesson.title}
                          </span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            {lesson.gradeName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{lesson.summary}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="text-purple-300 font-semibold">{lesson.subject}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{lesson.readTime}</span>
                          </span>
                          <span>•</span>
                          <span className="text-amber-400/90">{lesson.difficulty}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-600 text-slate-400 group-hover:text-white transition flex-shrink-0 mt-1">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PLATFORM SECTIONS RESULTS */}
            {(activeFilter === 'all' || activeFilter === 'sections') && matchedSections.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>أقسام وأدوات المنصة ({matchedSections.length})</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {matchedSections.map((sec) => {
                    const Icon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleSelectSection(sec)}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 hover:border-purple-500/40 border border-slate-800 text-right transition group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-purple-600/30 text-purple-400 border border-slate-700/80 group-hover:border-purple-500/50 transition flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition">
                                {sec.title}
                              </span>
                              {sec.badge && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                  {sec.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{sec.description}</p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zero Results State */}
            {totalResultsCount === 0 && (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Search className="w-7 h-7 text-slate-600 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold">لا توجد نتائج تطابق "{query}"</p>
                <p className="text-[11px] text-slate-500">جرب كتابة اسم المادة (رياضيات، فيزياء، كيمياء) أو اسم القسم</p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500 px-4">
            <span className="flex items-center gap-1">
              <span>اضغط على أي نتيجة للانتقال الفوري</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              إغلاق (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  FileText,
  Code,
  BarChart3,
  Dna,
  Cpu,
  Download,
  Copy,
  Check,
  CloudUpload,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  Database,
  Terminal,
  FileSpreadsheet,
  GitMerge,
  Flame,
} from 'lucide-react';
import { uploadTextFileToDrive } from '../services/googleDriveService';
import { getQuizScores, getAcademicRecords } from '../services/firestoreService';
import { SocialShareBar } from './SocialShareBar';

interface AnalysisViewProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected: boolean;
  onNavigateHome?: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'deep' | 'data_engine' | 'hybrid_engine'>('deep');
  
  // Deep Analysis State
  const [content, setContent] = useState('');
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'document' | 'data' | 'code' | 'science'>('comprehensive');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'strategic'>('deep');
  const [model, setModel] = useState<string>('gemini-4-argon');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Data Analytics Engine State
  const [dataContent, setDataContent] = useState('');
  const [datasetName, setDatasetName] = useState('financial_performance_q3.csv');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsResult, setAnalyticsResult] = useState<{
    summary: string;
    patterns: string[];
    recommendations: string[];
    pythonCodeExecuted: string;
  } | null>(null);
  const [fromCache, setFromCache] = useState(false);

  // Hybrid Analytics Engine State (Firebase Firestore + Manual Excel/CSV)
  const [hybridFileContent, setHybridFileContent] = useState('');
  const [hybridFileName, setHybridFileName] = useState('student_term_grades.csv');
  const [hybridLoading, setHybridLoading] = useState(false);
  const [hybridResult, setHybridResult] = useState<{
    statisticalSummary: string;
    academicStrengthsAndWeaknesses: string[];
    studyStageRecommendations: string[];
    pythonCodeExecuted: string;
  } | null>(null);
  const [hybridFromCache, setHybridFromCache] = useState(false);
  const [firestoreFetchedData, setFirestoreFetchedData] = useState<string>('');

  const samplePresets = [
    {
      title: 'خوارزمية ذكاء اصطناعي وأمان',
      type: 'code' as const,
      model: 'gemini-4-argon' as const,
      text: `// خوارزمية توزيع المهام وتحليل الحمولات الذكية
class DistributedJobScheduler {
  private queue: Array<{ id: string; priority: number; payload: any }> = [];
  private workers: Map<string, { busy: boolean; capacity: number }> = new Map();

  public schedule(job: { id: string; priority: number; payload: any }) {
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.dispatch();
  }

  private dispatch() {
    for (const [workerId, status] of this.workers.entries()) {
      if (!status.busy && this.queue.length > 0) {
        const job = this.queue.shift();
        status.busy = true;
        this.executeRemote(workerId, job).finally(() => {
          status.busy = false;
          this.dispatch();
        });
      }
    }
  }
}`,
    },
    {
      title: 'تقرير علمي حول طفرات TP53',
      type: 'science' as const,
      model: 'gemini-4-argon' as const,
      text: `التقرير الجيني لجين TP53:
تم فحص تسلسل الحمض النووي لمنطقة ربط الدنا في بروتين P53 (بقايا 102 إلى 292).
المتغير المرصود: طفرة مغلوطة c.743G>A تؤدي إلى الاستبدال الأحماضي R248Q.
الموقع: أرجينين 248 يتفاعل مباشرة مع الثلم الصغير للدنا.
ملاحظات الفحص السريري: انخفاض الاستقرار الحراري للهيكل الثلاثي الأبعاد وفقدان وظيفة التثبيط الورمي مع قابلية للتجمع الليفي غير الطبيعي.`,
    },
  ];

  const sampleDataset = `Month,Department,Revenue,Expenses,ActiveUsers,LatencyMs
Jan,Cloud,125000,42000,450000,38
Feb,Cloud,142000,45000,520000,36
Mar,Cloud,165000,48000,610000,34
Apr,AI-Platform,190000,55000,750000,31
May,AI-Platform,210000,58000,890000,29
Jun,AI-Platform,245000,62000,1050000,27`;

  const sampleHybridDataset = `StudentName,ClassLevel,MathGrade,ScienceGrade,AttendancePct,QuizScore
أحمد علي,الابتدائية,92,88,96,90
فاطمة حسن,المتوسطة,85,91,92,88
محمد كريم,الإعدادية,78,82,88,80
زينب أحمد,الابتدائية,95,94,98,96
علي حسين,المتوسطة,88,86,90,85`;

  const handleRunAnalysis = async () => {
    if (!content.trim()) {
      onNotify('يرجى كتابة أو لصق المحتوى المراد تحليله', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const endpoint = '/api/gemini/analyze';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-tier': 'free',
          'x-user-id': 'awh_user_default',
        },
        body: JSON.stringify({
          content,
          messages: [{ role: 'user', content }], // for chat endpoints
          analysisType,
          depth,
          model: model.replace(/^hermes-/, ''),
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشل التحليل';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data.analysis);
      onNotify(data.fromCache ? 'تم استرجاع التحليل الفوري من الذاكرة (Cache Check)' : 'اكتمل التحليل الذكي بنجاح!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء إجراء التحليل', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDataAnalytics = async () => {
    if (!dataContent.trim()) {
      onNotify('يرجى إدخال محتوى البيانات (CSV / Excel)', 'error');
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsResult(null);

    try {
      const response = await fetch('/api/gemini/data-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataContent,
          fileName: datasetName,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشل تشغيل محرك البيانات';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const resJson = await response.json();
      setAnalyticsResult(resJson.data);
      setFromCache(resJson.fromCache || false);
      onNotify(resJson.fromCache ? 'تم استرجاع نتائج التحليل من الذاكرة المؤقتة (Prompt Caching)' : 'تم تحليل البيانات بنجاح باستخدام gemini-2.5-flash وتنفيذ كود بايثون!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ في محرك البيانات', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Hybrid Analytics Execution: Source 1 (Firebase Firestore) + Source 2 (Excel/CSV)
  const handleRunHybridAnalytics = async () => {
    setHybridLoading(true);
    setHybridResult(null);

    try {
      // 1. Fetch Source 1 automatically from Firebase Firestore
      let firestoreText = '';
      try {
        const [scores, records] = await Promise.all([
          getQuizScores(),
          getAcademicRecords(),
        ]);

        const scoreSummary = scores.map(s => `اختبار: ${s.quizTitle} | النسبة: ${s.percentage}% (${s.score}/${s.total}) | المرحلة: ${s.stage}`).join('\n');
        const recordSummary = records.map(r => `سجل أكاديمي: ${r.title} | المادة: ${r.subject} | المرحلة: ${r.stage}`).join('\n');

        firestoreText = `--- بيانات الاختبارات والدرجات المسترجعة من Firebase Firestore ---\n${scoreSummary || 'لا توجد اختبارات مسجلة'}\n\n--- السجلات الأكاديمية المسترجعة من Firebase Firestore ---\n${recordSummary || 'لا توجد سجلات مسجلة'}`;
        setFirestoreFetchedData(firestoreText);
      } catch (fsErr) {
        console.warn('Firestore fetch warning:', fsErr);
        firestoreText = 'ملاحظة: تعذر جلب سجلات فايرستور المباشرة، تم استخدام البيانات الافتراضية للمنصة.';
        setFirestoreFetchedData(firestoreText);
      }

      // 2. Send both sources to Hybrid Analytics API endpoint
      const response = await fetch('/api/gemini/hybrid-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firestoreData: firestoreText,
          uploadedFileContent: hybridFileContent || sampleHybridDataset,
          fileName: hybridFileName,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشل تشغيل محرك التحليل الهجين';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const resJson = await response.json();
      setHybridResult(resJson.data);
      setHybridFromCache(resJson.fromCache || false);
      onNotify(resJson.fromCache ? 'تم جلب التحليل الهجين من الذاكرة المؤقتة (Context Caching)' : 'تم تشغيل محرك التحليل الهجين بنجاح عبر gemini-2.5-flash وبايثون!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ في محرك التحليل الهجين', 'error');
    } finally {
      setHybridLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('تم النسخ إلى الحافظة', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'data' | 'hybrid') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        if (type === 'data') {
          setDatasetName(file.name);
          setDataContent(text);
        } else {
          setHybridFileName(file.name);
          setHybridFileContent(text);
        }
        onNotify(`تم تحميل الملف "${file.name}" بنجاح (${(file.size / 1024).toFixed(1)} KB)`, 'success');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Title & Mode Switcher Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" />
            <span>محرك التحليل الذكي الهجين (Hybrid Analytics Engine)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            ربط تلقائي مع Firebase Firestore واستقبال ملفات Excel/CSV مع نموذج gemini-2.5-flash وتنفيذ بايثون.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('deep')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl transition ${
              activeTab === 'deep'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>التحليل العميق</span>
          </button>
          <button
            onClick={() => setActiveTab('data_engine')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl transition ${
              activeTab === 'data_engine'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>محرك البيانات</span>
          </button>
          <button
            onClick={() => setActiveTab('hybrid_engine')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl transition ${
              activeTab === 'hybrid_engine'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>المحرك الهجين (Firebase + ملفات)</span>
          </button>
        </div>
      </div>

      {activeTab === 'deep' ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              أمثلة جاهزة للتحليل الفوري:
            </span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setContent(preset.text);
                  setAnalysisType(preset.type);
                  setModel(preset.model);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
              >
                {preset.title}
              </button>
            ))}
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">نوع التحليل المنهجي:</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
                  {[
                    { id: 'comprehensive', label: 'شامل استراتيجي', icon: Layers },
                    { id: 'document', label: 'نصوص ومستندات', icon: FileText },
                    { id: 'data', label: 'بيانات وأرقام', icon: BarChart3 },
                    { id: 'code', label: 'برمجيات وأمان', icon: Code },
                    { id: 'science', label: 'علوم وأبحاث', icon: Dna },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAnalysisType(item.id as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                        analysisType === item.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px] leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">مستوى عمق التفكير:</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'standard', title: 'قياسي متوازن', desc: 'استخلاص فوري' },
                    { id: 'deep', title: 'تحليل عميق', desc: 'تفكيك الجوانب' },
                    { id: 'strategic', title: 'رؤية استراتيجية', desc: 'قرارات ومخاطر' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDepth(item.id as any)}
                      className={`p-2.5 rounded-xl border text-right transition ${
                        depth === item.id
                          ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block font-semibold text-slate-200 text-xs">{item.title}</span>
                      <span className="text-[10px] text-slate-500">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Engine Model Selection (Google Gemini & DeepSeek R1) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">محرك التحليل الذكي المعتمد:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'deepseek-r1', label: 'DeepSeek-R1', provider: 'DeepSeek', badge: 'استنتاج وتفكير منطقي 🐋' },
                  { id: 'gemini-4-argon', label: 'Gemini 4 Argon', provider: 'Google', badge: 'عميق ومنهجي 🧠' },
                  { id: 'gemini-flash-latest', label: 'Gemini Flash', provider: 'Google', badge: 'فائق السرعة ⚡' },
                  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', provider: 'Google', badge: 'تحليل استنتاجي 🧬' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`p-2.5 rounded-xl border text-right transition ${
                      model === m.id
                        ? m.id === 'deepseek-r1'
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold shadow-md'
                          : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block font-bold text-xs">{m.label}</span>
                    <span className="text-[10px] text-slate-500">{m.provider} • {m.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">محتوى النص، البيانات، أو الكود المراد تحليله:</label>
                <span className="text-[11px] text-slate-500 font-mono">{content.length} حرف (فحص Cache Check مفعّل)</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ألصق هنا النص، التقرير الإداري، الكود البرمجي، أو البيانات..."
                rows={7}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleRunAnalysis}
                disabled={loading || !content.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-900/30 transition active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري معالجة التحليل الفوري...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بدء التحليل (gemini-2.5-flash / Cache Check)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">نتائج التحليل المنبثقة</h3>
                    <span className="text-[11px] text-slate-400">
                      تم التوليد بنجاح • فحص الذاكرة المؤقتة (Cache Check) نشط
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(result)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ التقرير</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {result}
              </div>
            </div>
          )}
        </>
      ) : activeTab === 'data_engine' ? (
        /* Data Analytics Engine Tab */
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>محرك التحليل والبيانات (Data Analytics Engine)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  مدعوم بنموذج <span className="text-emerald-400 font-semibold">gemini-2.5-flash</span> مع تنفيذ كود بايثون (Code Execution Tool).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDataContent(sampleDataset)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                >
                  تحميل عينة بيانات CSV
                </button>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition shadow-md">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>رفع ملف CSV / Excel</span>
                  <input type="file" accept=".csv,.txt,.json" onChange={(e) => handleFileUpload(e, 'data')} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">محتوى البيانات ({datasetName}):</span>
                <span className="text-[11px] text-slate-500 font-mono">{dataContent.length} حرف</span>
              </div>
              <textarea
                value={dataContent}
                onChange={(e) => setDataContent(e.target.value)}
                placeholder="ألصق بيانات جدولية، CSV، أو أرقام تحليلية هنا..."
                rows={8}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>أداة بايثون (Code Execution Tool) مفعلة تلقائياً.</span>
              </div>

              <button
                onClick={handleRunDataAnalytics}
                disabled={analyticsLoading || !dataContent.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition active:scale-95"
              >
                {analyticsLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري تحليل الأرقام وتشغيل بايثون...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تشغيل محرك التحليل والبيانات</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {analyticsResult && (
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">نتائج التحليل الإحصائي المهيكل</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-emerald-400 font-medium">نموذج: gemini-2.5-flash</span>
                      {fromCache && <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">مسترجع من الذاكرة المؤقتة (Prompt Caching)</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(JSON.stringify(analyticsResult, null, 2))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ النتائج كـ JSON</span>
                </button>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400">1. الملخص الرقمي العام</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{analyticsResult.summary}</p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-cyan-400">2. الأنماط المستنتجة والاتجاهات</h4>
                <ul className="space-y-2">
                  {analyticsResult.patterns?.map((pattern, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="text-cyan-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-amber-400">3. التوصيات الاستراتيجية</h4>
                <ul className="space-y-2">
                  {analyticsResult.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="text-amber-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {analyticsResult.pythonCodeExecuted && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ملخص أداة تنفيذ كود بايثون:</span>
                  </h4>
                  <pre className="text-xs font-mono text-emerald-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                    {analyticsResult.pythonCodeExecuted}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Hybrid Analytics Engine Tab (Firebase Firestore + Excel/CSV Upload) */
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-purple-400" />
                  <span>محرك التحليل الذكي الهجين (Hybrid Analytics Engine)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  مصدران للبيانات: <span className="text-purple-400 font-semibold">1. تلقائي (Firebase Firestore)</span> + <span className="text-purple-400 font-semibold">2. يدوي (ملف Excel/CSV)</span> باستخدام <span className="text-cyan-400">gemini-2.5-flash</span> وبايثون.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHybridFileContent(sampleHybridDataset)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                >
                  تحميل عينة ملف درجات
                </button>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition shadow-md">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>رفع ملف Excel / CSV يدوي</span>
                  <input type="file" accept=".csv,.xlsx,.xls,.txt" onChange={(e) => handleFileUpload(e, 'hybrid')} className="hidden" />
                </label>
              </div>
            </div>

            {/* Manual file content preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">محتوى المصدر الثاني (الملف اليدوي - {hybridFileName}):</span>
                <span className="text-[11px] text-slate-500 font-mono">{hybridFileContent.length || sampleHybridDataset.length} حرف</span>
              </div>
              <textarea
                value={hybridFileContent || sampleHybridDataset}
                onChange={(e) => setHybridFileContent(e.target.value)}
                placeholder="ألصق محتوى جدول درجات الطلاب أو ملف الـ CSV هنا..."
                rows={6}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>سيقوم المحرك بجلب درجات الطلاب تلقائياً من Firebase Firestore ودمجها مع الملف المرفق.</span>
              </div>

              <button
                onClick={handleRunHybridAnalytics}
                disabled={hybridLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition active:scale-95"
              >
                {hybridLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري سحب بيانات فايرستور وتشغيل التحليل الهجين...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تشغيل التحليل الهجين المدمج</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Firestore Fetched Data Preview */}
          {firestoreFetchedData && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-300">
              <span className="font-bold text-purple-400 block">✨ المصدر الأول المسترجع تلقائياً من Firebase Firestore:</span>
              <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto text-slate-300 max-h-40">{firestoreFetchedData}</pre>
            </div>
          )}

          {/* Hybrid Results Structured JSON Output */}
          {hybridResult && (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <GitMerge className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">نتائج التحليل الذكي الهجين (Structured JSON Output)</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-purple-400 font-medium">نموذج: gemini-2.5-flash</span>
                      {hybridFromCache && <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">مسترجع من الذاكرة المؤقتة (Context Caching)</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(JSON.stringify(hybridResult, null, 2))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ النتائج كـ JSON</span>
                </button>
              </div>

              {/* 1. الملخص الإحصائي */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>1. الملخص الإحصائي الشامل (Statistical Summary)</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">{hybridResult.statisticalSummary}</p>
              </div>

              {/* 2. نقاط القوة والضعف الأكاديمية */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>2. نقاط القوة والضعف الأكاديمية (Academic Strengths & Weaknesses)</span>
                </h4>
                <ul className="space-y-2">
                  {hybridResult.academicStrengthsAndWeaknesses?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="text-cyan-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. التوصيات المقترحة للمرحلة الدراسية */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>3. التوصيات المقترحة للمرحلة الدراسية (Study Stage Recommendations)</span>
                </h4>
                <ul className="space-y-2">
                  {hybridResult.studyStageRecommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="text-amber-400 font-mono font-bold">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Python Code Executed */}
              {hybridResult.pythonCodeExecuted && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>ملخص أداة بايثون لتحليل المصدرين (Python Code Execution Tool):</span>
                  </h4>
                  <pre className="text-xs font-mono text-purple-300 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                    {hybridResult.pythonCodeExecuted}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

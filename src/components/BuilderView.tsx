import React, { useState } from 'react';
import {
  Hammer,
  Code2,
  FolderGit2,
  FileCode,
  Copy,
  Check,
  Download,
  CloudUpload,
  Sparkles,
  Layers,
  Database,
  Network,
  Cpu,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { uploadTextFileToDrive } from '../services/googleDriveService';
import { SocialShareBar } from './SocialShareBar';

interface GeneratedFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

interface BuildResult {
  projectTitle: string;
  summary: string;
  architectureHighlights: string[];
  files: GeneratedFile[];
  setupInstructions: string;
  deploymentTips: string;
  category: string;
}

interface BuilderViewProps {
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

export const BuilderView: React.FC<BuilderViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
}) => {
  const [spec, setSpec] = useState('');
  const [category, setCategory] = useState<'fullstack' | 'database_schema' | 'api_service' | 'science_pipeline'>('fullstack');
  const [model, setModel] = useState<string>('deepseek-r1');
  const [loading, setLoading] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const sampleSpecs = [
    {
      title: 'بوابة تحليلات بيانات حيوية متكاملة',
      cat: 'fullstack' as const,
      text: 'منصة ويب متكاملة تتضمن واجهة تفاعلية لعرض طفرات الجينات، خادم Express API لمعالجة ملفات FASTA و PDB، ونظام تخزين مؤقت ومزامنة سحابية مع لوحة تحكم ذكية.',
    },
    {
      title: 'مخطط قاعدة بيانات PostgreSQL لأبحاث الأدوية',
      cat: 'database_schema' as const,
      text: 'مخطط علاقي متين لقاعدة بيانات أبحاث اكتشاف الأدوية يشمل جداول المركبات الكيميائية، الأهداف البروتينية (UniProt)، قياسات النشاط الحيوي IC50، وسجلات التجارب السريرية.',
    },
    {
      title: 'واجهة API معمارية لمعالجة الصور وتوزيع الحمولات',
      cat: 'api_service' as const,
      text: 'واجهة برمجية Microservice آمنة تعتمد TypeScript مع توثيق OpenAPI، تدعم استلام طلبات المعالجة وتوزيعها على طابور مهام مع معالجة غير متزامنة ودعم Webhooks.',
    },
  ];

  const handleBuild = async () => {
    if (!spec.trim()) {
      onNotify('يرجى إدخال مواصفات النظام أو المشروع المراد بناؤه', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gemini/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec,
          category,
          model,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشلت عملية البناء والتشييد';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setBuildResult(data);
      setSelectedFileIdx(0);
      onNotify('اكتمل بناء وتشييد المشروع المعماري بنجاح!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء بناء المشروع', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurrentFile = () => {
    if (!buildResult || !buildResult.files[selectedFileIdx]) return;
    navigator.clipboard.writeText(buildResult.files[selectedFileIdx].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('تم نسخ كود الملف المحدد إلى الحافظة', 'info');
  };

  const handleExportProjectToDrive = () => {
    if (!buildResult) return;
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const jsonContent = JSON.stringify(buildResult, null, 2);
    const fileName = `AWH_Blueprint_${buildResult.projectTitle.replace(/\s+/g, '_')}_${Date.now()}.json`;

    onRequestDriveConfirmation({
      title: 'تصدير وحفظ حزمة المشروع في Google Drive',
      message: `هل توافق على حفظ الحزمة المعمارية الكاملة (${buildResult.files.length} ملفات برمجية + وثائق التشغيل) في حساب Google Drive الخاص بك؟`,
      itemDetails: `اسم الملف: ${fileName}\nعدد الملفات البرمجية: ${buildResult.files.length} ملف\nالمعمارية: ${buildResult.projectTitle}`,
      onConfirm: async () => {
        const res = await uploadTextFileToDrive({
          name: fileName,
          content: jsonContent,
          mimeType: 'application/json',
          description: `Full Architectural Build by A.W.H AI Studio (${model}) - ${buildResult.projectTitle}`,
        });
        onNotify(`تم حفظ حزمة المشروع بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Hammer className="w-6 h-6 text-amber-400" />
            <span>مختبر البناء والتشييد المعماري (System Builder)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            تحويل المتطلبات المعقدة إلى برمجيات متكاملة، مخططات قواعد بيانات، ومشاريع حقيقية جاهزة للإنتاج.
          </p>
        </div>

        {/* Model switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs self-start md:self-auto flex-wrap">
          <Cpu className="w-4 h-4 text-amber-400 mr-1" />
          <span className="text-slate-400 text-[11px]">النموذج:</span>
          {[
            { id: 'deepseek-r1', label: '🐋 DeepSeek-R1' },
            { id: 'gemini-4-argon', label: '🧠 Argon 4' },
            { id: 'gemini-3.8-flash', label: '⚡ Flash 3.8' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`px-3 py-1.5 rounded-xl transition font-mono ${
                model === m.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick sample chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          قوالب بناء مقترحة:
        </span>
        {sampleSpecs.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSpec(item.text);
              setCategory(item.cat);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">فئة ومجال البناء المطلوب:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'fullstack', label: 'تطبيق برمجي متكامل', icon: Layers, desc: 'واجهة أمامية + خادم' },
              { id: 'database_schema', label: 'مخطط قواعد بيانات', icon: Database, desc: 'SQL / ORM Models' },
              { id: 'api_service', label: 'واجهات API وخدمات', icon: Network, desc: 'Microservice Architecture' },
              { id: 'science_pipeline', label: 'خط معالجة بيانات علمية', icon: Terminal, desc: 'FASTA / PDB Pipeline' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`flex flex-col items-start p-3 rounded-xl border transition text-right ${
                  category === cat.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-medium text-slate-200">
                  <cat.icon className="w-4 h-4 text-amber-400" />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[10px] text-slate-500">{cat.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            مواصفات النظام أو الفكرة المراد بناؤها بالكامل:
          </label>
          <textarea
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder="اشرح النظام المطلوب، المتطلبات الوظيفية، قواعد البيانات، والمسارات البرمجية المرغوبة..."
            rows={4}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition leading-relaxed font-sans"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleBuild}
            disabled={loading || !spec.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-950/40 transition active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري بناء وتشييد النظام بواسطة {model}...</span>
              </>
            ) : (
              <>
                <Hammer className="w-4 h-4" />
                <span>بدء التشييد البرمجي والمعماري</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Build Output Display */}
      {buildResult && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Summary Card */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                  PROD-READY ARCHITECTURE
                </span>
                <span className="text-xs text-slate-400">فئة: {buildResult.category}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">{buildResult.projectTitle}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">{buildResult.summary}</p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
              <button
                onClick={handleExportProjectToDrive}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white transition shadow-md"
                title="تصدير الحزمة المعمارية الكاملة إلى Google Drive"
              >
                <CloudUpload className="w-4 h-4" />
                <span>تصدير الحزمة إلى Google Drive</span>
              </button>
            </div>
          </div>

          {/* Highlights & Directives */}
          {buildResult.architectureHighlights?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {buildResult.architectureHighlights.map((hl, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="flex h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex-shrink-0 items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          )}

          {/* Multi-file Code Explorer */}
          {buildResult.files && buildResult.files.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[480px]">
              {/* File Tree Navigation Sidebar */}
              <div className="w-full md:w-64 bg-slate-950/80 border-b md:border-b-0 md:border-l border-slate-800 p-3 space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <FolderGit2 className="w-4 h-4 text-amber-400" />
                  <span>ملفات المشروع ({buildResult.files.length})</span>
                </div>
                <div className="space-y-1 mt-2">
                  {buildResult.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIdx(idx)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-right transition font-mono ${
                        selectedFileIdx === idx
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Viewer Panel */}
              <div className="flex-1 flex flex-col bg-slate-950">
                {/* Code Header Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-amber-400 font-semibold">{buildResult.files[selectedFileIdx]?.name}</span>
                    <span className="text-slate-500 text-[11px]">({buildResult.files[selectedFileIdx]?.path})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 uppercase">
                      {buildResult.files[selectedFileIdx]?.language}
                    </span>
                    <button
                      onClick={handleCopyCurrentFile}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                </div>

                {/* File description note */}
                {buildResult.files[selectedFileIdx]?.description && (
                  <div className="px-4 py-1.5 bg-slate-900/40 text-[11px] text-slate-400 border-b border-slate-800/60">
                    {buildResult.files[selectedFileIdx].description}
                  </div>
                )}

                {/* Preformatted Code Content */}
                <div className="flex-1 p-4 overflow-auto max-h-[460px] text-xs font-mono leading-relaxed text-slate-200">
                  <pre className="whitespace-pre">
                    <code>{buildResult.files[selectedFileIdx]?.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Setup & Deployment Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildResult.setupInstructions && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>تعليمات التشغيل والتثبيت (Setup):</span>
                </span>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-400">{buildResult.setupInstructions}</p>
              </div>
            )}
            {buildResult.deploymentTips && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>توصيات النشر والإنتاجية (Production):</span>
                </span>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-400">{buildResult.deploymentTips}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

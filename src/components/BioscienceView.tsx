import React, { useState, useEffect } from 'react';
import {
  Dna,
  FlaskConical,
  BookOpen,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  CloudUpload,
  Cpu,
  Layers,
  Activity,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldCheck,
  Check,
  XCircle,
  BarChart2,
  Download,
  Info,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import {
  PRESET_TARGETS,
  fetchAlphaFoldStructure,
  fetchPdbStructure,
  fetchPubChemCompound,
  searchScientificLiterature,
  generateMolecularDynamicsTrajectory,
  ProteinModelMeta,
  CompoundMeta,
  ScienceLiteratureItem,
  MDTrajectoryPoint,
} from '../services/scienceService';
import { MolecularViewer } from './MolecularViewer';
import { ChemicalDrawer } from './ChemicalDrawer';
import { MolecularOrbitalsNetworkViewer } from './MolecularOrbitalsNetworkViewer';
import { uploadTextFileToDrive } from '../services/googleDriveService';
import { SocialShareBar } from './SocialShareBar';

interface BioscienceViewProps {
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

export const BioscienceView: React.FC<BioscienceViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
}) => {
  // Navigation tabs: AlphaFold DB is the primary featured tab
  const [activeTab, setActiveTab] = useState<'alphafold' | 'orbitals' | 'dynamics' | 'chemistry' | 'pathways'>('alphafold');
  const [alphaFoldViewMode, setAlphaFoldViewMode] = useState<'3d' | 'orbitals'>('3d');

  // Query & Targets
  const [targetType, setTargetType] = useState<'protein' | 'compound'>('protein');
  const [query, setQuery] = useState('P04637');
  const [loading, setLoading] = useState(false);
  const [proteinData, setProteinData] = useState<ProteinModelMeta | null>(null);
  const [compoundData, setCompoundData] = useState<CompoundMeta | null>(null);
  const [literature, setLiterature] = useState<ScienceLiteratureItem[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedResidue, setSelectedResidue] = useState<string | null>(null);
  const [model, setModel] = useState<string>('deepseek-r1');

  // Molecular Dynamics State
  const [mdTrajectory, setMdTrajectory] = useState<MDTrajectoryPoint[]>([]);
  const [mdCurrentStep, setMdCurrentStep] = useState(0);
  const [isMdRunning, setIsMdRunning] = useState(false);
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [forceField, setForceField] = useState<'AMBER14' | 'CHARMM36' | 'GROMOS'>('AMBER14');

  // Fast AlphaFold Quick Preset List
  const alphaFoldQuickPresets = [
    { id: 'P04637', symbol: 'TP53', label: 'كابت الأورام البشري p53' },
    { id: 'P00520', symbol: 'ABL1', label: 'كيناز التيروزين (هدف اللوكيميا)' },
    { id: 'P01308', symbol: 'INS', label: 'الأنسولين البشري الكامل' },
    { id: 'P68871', symbol: 'HBB', label: 'سلسلة الهيموغلوبين بيتا' },
    { id: 'P38398', symbol: 'BRCA1', label: 'بروتين ترميم الحمض النووي' },
    { id: 'P0DTC2', symbol: 'SPIKE', label: 'شوكة فيروس كورونا Spike' },
  ];

  // Load default AlphaFold preset on mount
  useEffect(() => {
    handleSearchTarget('P04637', 'protein', 'TP53 (P04637)');
  }, []);

  // Molecular Dynamics simulation loop
  useEffect(() => {
    let timer: any;
    if (isMdRunning && mdTrajectory.length > 0) {
      timer = setInterval(() => {
        setMdCurrentStep((prev) => (prev + 1) % mdTrajectory.length);
      }, 400);
    }
    return () => clearInterval(timer);
  }, [isMdRunning, mdTrajectory]);

  const handleSearchTarget = async (searchQuery: string, type: 'protein' | 'compound', displayName?: string) => {
    if (!searchQuery.trim()) {
      onNotify('يرجى إدخال معرف بروتين صالح (مثل P04637)', 'error');
      return;
    }

    setLoading(true);
    setAiInterpretation(null);
    setSelectedResidue(null);
    setTargetType(type);
    setQuery(searchQuery);

    try {
      if (type === 'protein') {
        let pData: ProteinModelMeta;
        if (/^[0-9][a-zA-Z0-9]{3}$/.test(searchQuery.trim())) {
          pData = await fetchPdbStructure(searchQuery.trim());
        } else {
          pData = await fetchAlphaFoldStructure(searchQuery.trim());
        }
        if (displayName) pData.proteinName = displayName;
        setProteinData(pData);

        // Generate Molecular Dynamics trajectory
        const trajectory = generateMolecularDynamicsTrajectory(searchQuery, 25);
        setMdTrajectory(trajectory);
        setMdCurrentStep(0);

        // Fetch literature
        const lit = await searchScientificLiterature(pData.geneName || searchQuery);
        setLiterature(lit);
        onNotify(`تم جلب بيانات ${pData.geneName || searchQuery} من AlphaFold DB بنجاح!`, 'success');
      } else {
        const cData = await fetchPubChemCompound(searchQuery);
        setCompoundData(cData);
        const lit = await searchScientificLiterature(searchQuery);
        setLiterature(lit);
        onNotify(`تم جلب بيانات المركب ${searchQuery} بنجاح!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'تعذر جلب البيانات الهيكلية من AlphaFold DB', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInterpretWithAI = async () => {
    const currentName = proteinData?.geneName || compoundData?.name || query;
    setAiLoading(true);

    try {
      const response = await fetch('/api/gemini/science-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: currentName,
          targetType,
          metadata: proteinData || compoundData,
          model,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشل التفسير العلمي الذكي';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setAiInterpretation(data.interpretation);
      onNotify('اكتمل التفسير البيولوجي الذكي بنجاح!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء استدعاء محرك التفسير العلمي', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportDossierToDrive = () => {
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const currentName = proteinData?.geneName || compoundData?.name || query;
    const fileName = `AWH_AlphaFold_${currentName}_${Date.now()}.md`;

    const dossierContent = `# ملف بيانات الهيكل الجزيئي من AlphaFold DB: ${currentName}
منصة A.W.H للذكاء الاصطناعي - قسم العلوم الحيوية

## 1. بيانات النموذج الهيكلي من AlphaFold DB
- معرف البروتين (UniProt): ${proteinData?.uniprotId}
- معرف النموذج (Entry ID): ${proteinData?.entryId || 'AF-' + proteinData?.uniprotId + '-F1'}
- الجين: ${proteinData?.geneName}
- الكائن الحي: ${proteinData?.organism}
- عدد الأحماض الأمينية: ${proteinData?.sequenceLength || 'N/A'}
- متوسط ثقة pLDDT العالمي: ${proteinData?.averagePlddt?.toFixed(1) || 'N/A'}%
- رابط ملف mmCIF: ${proteinData?.cifUrl}
- رابط ملف PDB: ${proteinData?.pdbUrl}
- رابط مصفوفة خطأ المحاذاة المتوقع (PAE): ${proteinData?.paeDocUrl}

## 2. التفسير البيولوجي والوظيفي
${aiInterpretation || 'لم يتم استخراج تفسير بعد.'}
`;

    onRequestDriveConfirmation({
      title: 'حفظ تقرير AlphaFold في Google Drive',
      message: 'هل تريد حفظ التقرير العلمي وبيانات النموذج الهيكلي في Google Drive؟',
      itemDetails: `اسم الملف: ${fileName}\nالبروتين: ${currentName}`,
      onConfirm: async () => {
        const res = await uploadTextFileToDrive({
          name: fileName,
          content: dossierContent,
          mimeType: 'text/markdown',
          description: `AlphaFold Structural Report for ${currentName}`,
        });
        onNotify(`تم حفظ التقرير بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  const currentMdPoint = mdTrajectory[mdCurrentStep] || {
    timePicoseconds: 0,
    rmsdAngstrom: 1.15,
    potentialEnergyKcal: -14450,
    kineticEnergyKcal: 3220,
    temperatureKelvin: 300,
  };

  // Helper function for pLDDT badge quality
  const getPlddtQuality = (score?: number) => {
    if (!score) return { text: 'غير محدد', color: 'text-slate-400', bg: 'bg-slate-800' };
    if (score >= 90) return { text: 'دقة فائقة جداً (Very High)', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 70) return { text: 'دقة موثوقة (Confident)', color: 'text-sky-300', bg: 'bg-sky-500/20' };
    if (score >= 50) return { text: 'دقة منخفضة (Low)', color: 'text-amber-300', bg: 'bg-amber-500/20' };
    return { text: 'منخفضة جداً / مناطق غير منتظمة (Disordered)', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  };

  const plddtQuality = getPlddtQuality(proteinData?.averagePlddt);

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Header and Modules Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Dna className="w-6 h-6 text-emerald-400" />
            <span>بوابة العلوم الحيوية وقاعدة بيانات AlphaFold الهيكلية</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            البحث عن الهياكل ثلاثية الأبعاد بدقة ذرية، مقاييس ثقة pLDDT، ديناميكيات الجزيئات، وأدوات الكيمياء.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('alphafold')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'alphafold'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>بحث AlphaFold DB</span>
          </button>
          <button
            onClick={() => setActiveTab('orbitals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'orbitals'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>المدارات والروابط (D3.js)</span>
          </button>
          <button
            onClick={() => setActiveTab('dynamics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'dynamics'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ديناميكيات الجزيئات (MD)</span>
          </button>
          <button
            onClick={() => setActiveTab('chemistry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'chemistry'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>أدوات الكيمياء (Lipinski)</span>
          </button>
          <button
            onClick={() => setActiveTab('pathways')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'pathways'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المسارات والأبحاث</span>
          </button>
        </div>
      </div>

      {/* Featured AlphaFold Search Interface */}
      {activeTab === 'alphafold' && (
        <div className="space-y-6">
          {/* AlphaFold Direct Search Bar */}
          <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>واجهة البحث الهيكلي في قاعدة بيانات AlphaFold DB:</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                AlphaFold v6 Models Live API
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchTarget(query, 'protein')}
                  placeholder="أدخل معرّف البروتين UniProt Accession (مثال: P04637 أو P00520 أو P01308)..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
                <Dna className="w-5 h-5 text-slate-500 absolute right-3 top-3.5" />
              </div>

              <button
                onClick={() => handleSearchTarget(query, 'protein')}
                disabled={loading || !query.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري سحب بيانات AlphaFold...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>بحث واسترجاع الهيكل</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick AlphaFold Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                أشهر البروتينات القياسية:
              </span>
              {alphaFoldQuickPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSearchTarget(p.id, 'protein', `${p.symbol} (${p.id})`)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 transition active:scale-95 flex items-center gap-1.5"
                >
                  <span className="font-mono font-bold text-emerald-400">{p.id}</span>
                  <span className="text-slate-400 font-sans">({p.symbol})</span>
                </button>
              ))}
            </div>
          </div>

          {/* AlphaFold Results Showcase */}
          {proteinData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {/* Left Column: 3D Molecular Model (2 spans) */}
              <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Dna className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-100">
                        {proteinData.proteinName || `النموذج الهيكلي للبروتين ${proteinData.uniprotId}`}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {proteinData.entryId || `AF-${proteinData.uniprotId}-F1`} • {proteinData.organism}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setAlphaFoldViewMode('3d')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          alphaFoldViewMode === '3d'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        3D Mol
                      </button>
                      <button
                        onClick={() => setAlphaFoldViewMode('orbitals')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          alphaFoldViewMode === 'orbitals'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        المدارات D3.js
                      </button>
                    </div>

                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border border-white/10 ${plddtQuality.bg} ${plddtQuality.color}`}>
                      pLDDT: {proteinData.averagePlddt?.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 3D Viewer or D3.js Molecular Orbitals Container */}
                {alphaFoldViewMode === '3d' ? (
                  <div className="h-[480px] my-4 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 relative">
                    <MolecularViewer
                      cifUrl={proteinData.cifUrl}
                      targetName={proteinData.proteinName || proteinData.uniprotId}
                      isAlphaFold={!proteinData.isExperimental}
                      onResidueClick={(r) => setSelectedResidue(r)}
                    />
                  </div>
                ) : (
                  <div className="my-4">
                    <MolecularOrbitalsNetworkViewer
                      uniprotId={proteinData.uniprotId}
                      geneName={proteinData.geneName}
                      proteinName={proteinData.proteinName}
                      averagePlddt={proteinData.averagePlddt}
                    />
                  </div>
                )}

                {/* Selected residue bar */}
                {selectedResidue && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between mb-3">
                    <span className="font-mono">الحمض الأميني المحدد: {selectedResidue}</span>
                    <span className="text-[10px] text-slate-400">إحداثيات ذرية من ملف mmCIF B-factor</span>
                  </div>
                )}

                {/* AlphaFold Canonical pLDDT Color Legend */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                  <span className="font-bold text-slate-300 block">دليل مقياس الثقة AlphaFold pLDDT الرسمي:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#0053D6]" />
                      <span className="text-slate-300">&gt;90: فائقة جداً (Very High)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#65CBF3]" />
                      <span className="text-slate-300">70-90: موثوقة (Confident)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#FFDB13]" />
                      <span className="text-slate-300">50-70: منخفضة (Low)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#FF7D45]" />
                      <span className="text-slate-300">&lt;50: غير منتظمة (Disordered)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AlphaFold Metadata, Confidence & Downloads */}
              <div className="space-y-4">
                {/* Structural Metadata Card */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-3.5 shadow-xl">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>بيانات AlphaFold DB المسترجعة</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">معرف UniProt:</span>
                      <span className="font-mono text-emerald-400 font-bold">{proteinData.uniprotId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">رمز الجين (Gene):</span>
                      <span className="font-mono text-slate-200 font-bold">{proteinData.geneName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">طول التسلسل:</span>
                      <span className="font-mono text-slate-200">{proteinData.sequenceLength || '393'} حمض أميني</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">الكائن الحي:</span>
                      <span className="text-slate-200">{proteinData.organism}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">تقييم الجودة:</span>
                      <span className={`font-semibold ${plddtQuality.color}`}>{plddtQuality.text}</span>
                    </div>
                  </div>

                  {/* Fragment warning if large protein */}
                  {proteinData.isFragment && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        تنبيه القطاعات: هذا البروتين طويل وتم استدعاء الجزء {proteinData.entryId} لنطاق الأحماض الأمينية {proteinData.fragmentSpan}.
                      </span>
                    </div>
                  )}

                  {/* Direct AlphaFold Model Downloads */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">تنزيل ملفات الإحداثيات مباشرة:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <a
                        href={proteinData.cifUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ملف mmCIF</span>
                      </a>
                      {proteinData.pdbUrl && (
                        <a
                          href={proteinData.pdbUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-400" />
                          <span>ملف PDB</span>
                        </a>
                      )}
                    </div>

                    {proteinData.paeImageUrl && (
                      <a
                        href={proteinData.paeImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>عرض مصفوفة خطأ المحاذاة (PAE Error Matrix)</span>
                      </a>
                    )}

                    <a
                      href={`https://alphafold.ebi.ac.uk/entry/${proteinData.uniprotId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح في موقع AlphaFold DB الرسمي</span>
                    </a>
                  </div>
                </div>

                {/* AI Interpretation & Drive Export */}
                <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>التحليل البيولوجي الذكي</span>
                    </span>
                    <button
                      onClick={handleInterpretWithAI}
                      disabled={aiLoading}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md"
                    >
                      {aiLoading ? 'جاري التحليل...' : 'توليد التفسير'}
                    </button>
                  </div>

                  {/* Model Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">المحرك:</span>
                    {[
                      { id: 'deepseek-r1', label: '🐋 DeepSeek-R1' },
                      { id: 'gemini-4-argon', label: '🧠 Gemini 4 Argon' },
                      { id: 'gemini-3.8-flash', label: '⚡ Gemini 3.8 Flash' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setModel(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                          model === m.id
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {aiInterpretation ? (
                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                      {aiInterpretation}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      انقر لتوليد قراءة معمقة لخصائص الطي، الطفرات المقاومة، وآليات الاستهداف الدوائي باستخدام الذكاء الاصطناعي.
                    </p>
                  )}

                  <button
                    onClick={handleExportDossierToDrive}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>حفظ ملف AlphaFold في Google Drive</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standalone D3.js Molecular Orbitals & Interaction Network Tab */}
      {activeTab === 'orbitals' && (
        <div className="space-y-6">
          <MolecularOrbitalsNetworkViewer
            uniprotId={proteinData?.uniprotId || query || 'P04637'}
            geneName={proteinData?.geneName || 'TP53'}
            proteinName={proteinData?.proteinName || 'Protein Complex'}
            averagePlddt={proteinData?.averagePlddt || 88.5}
          />
        </div>
      )}

      {/* Tab 2: Molecular Dynamics Simulation */}
      {activeTab === 'dynamics' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>محاكي ديناميكيات الجزيئات (Molecular Dynamics Simulation Engine)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تتبع مسار التذبذب الهيكلي (RMSD)، تقلبات الطاقة الحركية والكامنة، وتوازن درجات الحرارة عبر مجال القوى {forceField}.
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMdRunning(!isMdRunning)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                >
                  {isMdRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isMdRunning ? 'إيقاف مؤقت' : 'بدء المحاكاة'}</span>
                </button>
                <button
                  onClick={() => {
                    setMdCurrentStep(0);
                    setIsMdRunning(false);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="إعادة ضبط المسار"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulation Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">الزمن المحاكى (Simulation Time):</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {currentMdPoint.timePicoseconds.toFixed(1)} ps
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">الانحراف الهيكلي (Backbone RMSD):</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {currentMdPoint.rmsdAngstrom.toFixed(3)} Å
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">الطاقة الكامنة (Potential Energy):</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {currentMdPoint.potentialEnergyKcal} kcal/mol
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">درجة الحرارة المستقرة:</span>
                <span className="text-lg font-bold font-mono text-purple-400">
                  {currentMdPoint.temperatureKelvin} K
                </span>
              </div>
            </div>

            {/* Settings & Force Fields */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">مجال القوى (Force Field):</span>
                {(['AMBER14', 'CHARMM36', 'GROMOS'] as const).map((ff) => (
                  <button
                    key={ff}
                    onClick={() => setForceField(ff)}
                    className={`px-3 py-1 rounded-lg transition ${
                      forceField === ff ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {ff}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">الحرارة المستهدفة:</span>
                <input
                  type="range"
                  min="280"
                  max="370"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                  className="w-28 accent-cyan-500"
                />
                <span className="font-mono text-cyan-300 font-bold">{temperature} K</span>
              </div>
            </div>

            {/* Live Trajectory Timeline Chart */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">مخطط مسار RMSD الميكانيكي عبر الزمن:</span>
              <div className="h-32 bg-slate-950 rounded-xl border border-slate-800 p-3 flex items-end gap-1.5 overflow-hidden">
                {mdTrajectory.map((pt, idx) => {
                  const heightPct = Math.min(100, Math.max(15, (pt.rmsdAngstrom / 2.2) * 100));
                  const isCurrent = idx === mdCurrentStep;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full transition-all duration-200"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          isCurrent
                            ? 'bg-cyan-400 shadow-lg shadow-cyan-500/50 scale-105'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`Time: ${pt.timePicoseconds}ps | RMSD: ${pt.rmsdAngstrom}Å`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Chemistry Tools & Lipinski Drug-Likeness */}
      {activeTab === 'chemistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-purple-500/30 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {compoundData?.name || 'فحص المركبات الكيميائية واكتشاف الأدوية'}
                </h3>
              </div>
              {compoundData?.cid && (
                <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  PubChem CID: {compoundData.cid}
                </span>
              )}
            </div>

            {/* 2D Chemical Diagram */}
            <div className="h-[280px] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-4">
              {compoundData ? (
                <ChemicalDrawer smiles={compoundData.smiles} name={compoundData.name} />
              ) : (
                <span className="text-xs text-slate-500">اختر مركباً كيميائياً لعرض هيكله ثنائي الأبعاد</span>
              )}
            </div>

            {/* SMILES and IUPAC */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">صيغة SMILES القياسية:</span>
                <span className="font-mono text-purple-300 text-[11px] truncate max-w-md">{compoundData?.smiles || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">الاسم النظامي IUPAC:</span>
                <span className="text-slate-200 text-[11px] truncate max-w-md">{compoundData?.iupacName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Lipinski Rule of 5 Evaluation */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>معايير ليبينسكي للتشابه الدوائي (Rule of 5)</span>
                </h4>
                {compoundData && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      compoundData.isDrugLike
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {compoundData.isDrugLike ? 'مطابق دوائياً (Drug-Like)' : 'مخالف للمعايير'}
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">الوزن الجزيئي (MW ≤ 500):</span>
                  <span className="font-mono text-slate-200">{compoundData?.molecularWeight || '180.16 g/mol'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">معامل الذوبانية (XLogP ≤ 5):</span>
                  <span className="font-mono text-slate-200">{compoundData?.xLogP || 1.2}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">مانحات الروابط الهيدروجينية (HBD ≤ 5):</span>
                  <span className="font-mono text-slate-200">{compoundData?.hBondDonors ?? 1}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">مستقبلات الروابط الهيدروجينية (HBA ≤ 10):</span>
                  <span className="font-mono text-slate-200">{compoundData?.hBondAcceptors ?? 4}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">المساحة السطحية القطبية (TPSA ≤ 140):</span>
                  <span className="font-mono text-slate-200">{compoundData?.tpsa || 63.6} Å²</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportDossierToDrive}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg transition active:scale-95"
            >
              <CloudUpload className="w-4 h-4" />
              <span>تصدير الملف العلمي إلى Google Drive</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Biological Pathways & Literature */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>المسارات الحيوية وقواعد البيانات العلمية (Reactome & Europe PMC)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-blue-400 block">المسارات الحيوية المتداخلة (Biological Pathways):</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(proteinData?.pathways || ['مسار تأشير p53 (p53 Signaling)', 'تنظيم دورة الخلية (Cell Cycle Checkpoint)', 'الموت الخلوي المبرمج (Apoptosis)']).map((p, i) => (
                    <li key={i} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">الأوراق العلمية المحكمة (Europe PMC / PubMed):</span>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {literature.map((lit, i) => (
                    <div key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                      <h5 className="font-bold text-slate-200 line-clamp-1">{lit.title}</h5>
                      <span className="text-[10px] text-slate-400 block">{lit.authorString} ({lit.pubYear})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

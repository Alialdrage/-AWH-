import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Play,
  Copy,
  Check,
  Download,
  Flame,
  HelpCircle,
  Lightbulb,
  Scale,
  Bot,
  CircleDot,
  Square,
  Triangle,
  Send,
} from 'lucide-react';

// Web Audio API Sound Synthesizer for instant, dependency-free audio feedback
class MathAudioSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.09);
        osc.stop(this.ctx!.currentTime + i * 0.09 + 0.3);
      });
    } catch {}
  }

  playBalanceSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const chords = [440, 554.37, 659.25, 880];
      chords.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start();
        osc.stop(this.ctx!.currentTime + 0.6);
      });
    } catch {}
  }
}

const synth = new MathAudioSynth();

export interface FruitNumberItem {
  number: number;
  name: string;
  arabicWord: string;
  fruit: string;
  emoji: string;
  story: string;
  shapeDescription: string;
  interactiveCount: number;
  color: string;
}

export const FRUIT_NUMBERS: FruitNumberItem[] = [
  {
    number: 1,
    name: 'واحد',
    arabicWord: 'وَاحِد',
    fruit: 'تفاحة حمراء ملكية',
    emoji: '🍎',
    story: 'ملك البستان! يقف شامخاً مستقيماً كالقلم، ومعه تفاحة حمراء وحيدة تلمع تحت أشعة الشمس.',
    shapeDescription: 'يشبه القلم المستقيم، أو عصا سحرية عمودية.',
    interactiveCount: 1,
    color: 'from-red-500 to-rose-600',
  },
  {
    number: 2,
    name: 'اثنان',
    arabicWord: 'اِثْنَان',
    fruit: 'موزتان صفراوان',
    emoji: '🍌',
    story: 'صديقانا الموزتان تحبان اللعب معاً! له رأس ورقبة منحنية مثل بطة لطيفة تسبح في شط العرب.',
    shapeDescription: 'يشبه البطة الصغيرة تسبح في الماء، أو أذني أرنب يقفزان.',
    interactiveCount: 2,
    color: 'from-amber-400 to-yellow-500',
  },
  {
    number: 3,
    name: 'ثلاثة',
    arabicWord: 'ثَلَاثَة',
    fruit: 'حبات فراولة حمراء',
    emoji: '🍓',
    story: 'سلة الفراولة اللذيذة في الطبق الأخضر! الرقم ثلاثة له سنون صغيرة كأمواج البحر الهادئ.',
    shapeDescription: 'له ثلاث شُرفات أو أسنان صغيرة تتجه نحو السماء.',
    interactiveCount: 3,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    number: 4,
    name: 'أربعة',
    arabicWord: 'أَرْبَعَة',
    fruit: 'حبات برتقال شهية',
    emoji: '🍊',
    story: 'شجرة البرتقال العملاقة في زاوية البستان! قطفنا 4 برتقالات ذهبية مليئة بالعصير اللذيذ.',
    shapeDescription: 'يشبه المقص المفتوح، أو كرسياً مقلوباً مستعداً للراحة.',
    interactiveCount: 4,
    color: 'from-orange-500 to-amber-600',
  },
  {
    number: 5,
    name: 'خمسة',
    arabicWord: 'خَمْسَة',
    fruit: 'حبات تين مبارك',
    emoji: '🫐',
    story: 'كعكة الأرقام المستديرة كالحلقة الذهبية، وأصابع اليد الواحدة التي نرفعها للسلام والمحبة!',
    shapeDescription: 'دائرة كاملة ناعمة تشبه الحلقة أو كعكة السكر الشهية.',
    interactiveCount: 5,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    number: 6,
    name: 'ستة',
    arabicWord: 'سِتَّة',
    fruit: 'مكعبات ليغو ملونة',
    emoji: '🧱',
    story: 'مكعبات البناء الهندسية في مختبر الروبوت! الرقم ستة ينظر إلى جهة اليسار بكل ثقة.',
    shapeDescription: 'خط عمودي وله رأس يتجه نحو اليسار (عكس رقم 2).',
    interactiveCount: 6,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    number: 7,
    name: 'سبعة',
    arabicWord: 'سَبْعَة',
    fruit: 'فقاعات ضوئية سحرية',
    emoji: '🌟',
    story: 'انفجار الدمج السحري! 4 برتقالات + 3 فراولات = 7 نجمات تدعو الله وترفع ذراعيها للسماء.',
    shapeDescription: 'يرفع يديه الاثنتين إلى السماء شكراً لله وحباً.',
    interactiveCount: 7,
    color: 'from-yellow-400 to-amber-500',
  },
  {
    number: 8,
    name: 'ثمانية',
    arabicWord: 'ثَمَانِيَة',
    fruit: 'أزهار البستان العطرية',
    emoji: '🌸',
    story: 'أزهار الربيع العراقي! الرقم ثمانية يشبه الجبل أو القبعة التي تحمينا من حرارة الشمس.',
    shapeDescription: 'تنظر إلى الأرض وتركع باحترام وتواضع (عكس السبعة).',
    interactiveCount: 8,
    color: 'from-pink-500 to-rose-600',
  },
  {
    number: 9,
    name: 'تسعة',
    arabicWord: 'تِسْعَة',
    fruit: 'كرات ضوء ملونة',
    emoji: '🔮',
    story: 'بالون الأرقام السحري المحلق في الفضاء، وله خيط طويل ينزل به إلى الأرض.',
    shapeDescription: 'دائرة في الأعلى وعصا مستقيمة تنزل للأسفل كالمظلة.',
    interactiveCount: 9,
    color: 'from-violet-500 to-purple-700',
  },
  {
    number: 10,
    name: 'عشرة',
    arabicWord: 'عَشَرَة',
    fruit: 'كواكب مدار المعرفة',
    emoji: '🪐',
    story: 'تاج الأرقام! الواحد البطل يقف وبجانبه النقطة أو الصفر الحارس، ليكتملا سوية في قمة التميز!',
    shapeDescription: 'رقم واحد عمودي وبجانبه نقطة أو صفر مدور صغير.',
    interactiveCount: 10,
    color: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
];

export const DEEPSEEK_AR_PROMPT = `أريدك أن تتقمص دور 'محاكي واقع افتراضي تعليمي (AR Simulation)' مخصص لطلاب الصف الأول الابتدائي. مهمتك هي تعليمهم المهارات الأساسية (قراءة، حساب، علوم) من خلال بيئة تفاعلية غامرة.

قواعد عملك الأساسية:
1. الأسلوب: ابدأ كل جلسة بتهيئة المستخدم (الطالب) للدخول في 'بيئة واقع افتراضي' (مثل: مختبر، غابة، مدينة، بستان). استخدم وصفاً حسياً بصرياً ليتحرك خيال الطفل.
2. التدرج: ابدأ دائماً من المفاهيم الملموسة (أشياء يراها أو يلمسها) ثم انتقل للرموز المجردة.
3. تجنب الجمود: ابتعد تماماً عن أسلوب التلقين المباشر أو الجداول الصماء. كل معلومة يجب أن تكون جزءاً من قصة أو مهمة بطولية أو تحدٍ ممتع.
4. التفاعل: اطرح أسئلة قصيرة ومباشرة، وانتظر إجابة الطالب قبل الانتقال للخطوة التالية. إذا أخطأ الطالب، لا تقل 'خطأ'، بل أظهر له النتيجة بصرياً في بيئتك الافتراضية ليصحح فهمه بنفسه.
5. التعزيز: استخدم عبارات تشجيعية وتأثيرات بصرية افتراضية (مثل: 'لقد أضاء الميزان'، 'انفجرت الفقاعات الرقمية فرحاً') لتعزيز ثقة الطالب.
6. اللغة: استخدم لغة بسيطة، واضحة، ومناسبة لسن (6-7 سنوات).

ابدأ الآن بسؤالي: أي مادة سنبدأ بها في مختبرنا الافتراضي اليوم؟`;

interface ARLivingMathAdventureProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddStars?: (count: number) => void;
  onLaunchPromptInChat?: (promptText: string) => void;
}

export const ARLivingMathAdventure: React.FC<ARLivingMathAdventureProps> = ({
  onNotify,
  onAddStars,
  onLaunchPromptInChat,
}) => {
  const [mathSubTab, setMathSubTab] = useState<
    'orchard' | 'magic_scale' | 'bubble_merge' | 'math_bot' | 'shape_gate' | 'prompt_export'
  >('orchard');

  // Active Fruit Number
  const [activeNumIdx, setActiveNumIdx] = useState(0);
  const currentNum = FRUIT_NUMBERS[activeNumIdx];
  const [touchedItems, setTouchedItems] = useState<number[]>([]);

  // Magic Scale State
  // Left side has target oranges, right side starts with initial oranges
  const [scaleTarget] = useState(4);
  const [rightSideCount, setRightSideCount] = useState(1);
  const [isScaleBalanced, setIsScaleBalanced] = useState(false);

  // Bubble Merge State
  const [bubbleA, setBubbleA] = useState(4);
  const [bubbleB, setBubbleB] = useState(3);
  const [isMerged, setIsMerged] = useState(false);

  // Math Bot Subtraction State
  const [subtractionBlocks, setSubtractionBlocks] = useState(6);
  const [botRemovedCount, setBotRemovedCount] = useState(0);
  const [botQuestionAnswered, setBotQuestionAnswered] = useState(false);

  // Shape Gate State
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  // Speech read aloud
  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch {}
  };

  // Touching fruits inside Orchard
  const handleTouchFruit = (idx: number) => {
    synth.playPop();
    if (!touchedItems.includes(idx)) {
      const next = [...touchedItems, idx];
      setTouchedItems(next);
      speakText(`${next.length}`);

      if (next.length === currentNum.interactiveCount) {
        synth.playChime();
        if (onAddStars) onAddStars(4);
        speakText(`عاشت إيدك عيوني! عدد العناصر كامل: ${currentNum.name}!`);
        onNotify(`أحسنت! أكملت عد ${currentNum.name} عناصر وربحت +4 نجوم ⭐`, 'success');
      }
    }
  };

  const handleResetOrchard = () => {
    setTouchedItems([]);
  };

  // Magic Scale Orange Addition
  const handleAddOrangeToRight = () => {
    if (isScaleBalanced) return;
    synth.playPop();
    const nextCount = rightSideCount + 1;
    setRightSideCount(nextCount);

    if (nextCount === scaleTarget) {
      setIsScaleBalanced(true);
      synth.playBalanceSuccess();
      if (onAddStars) onAddStars(6);
      speakText('أحسنت ضربة معلم! توازن الميزان وأصبح خطاً مستقيماً، واشتعلت الأضواء الخضراء في المختبر!');
      onNotify('مبروك! توازن الميزان السحري تماماً (4 = 4) وربحت +6 نجوم ⭐', 'success');
    } else if (nextCount > scaleTarget) {
      speakText('أوه! الكفة أصبحت أثقل من اللازم، دعنا نعيد الميزان للبداية لنحاول مرة أخرى!');
    }
  };

  const handleResetScale = () => {
    setRightSideCount(1);
    setIsScaleBalanced(false);
  };

  // Bubble Merge
  const handleTriggerMerge = () => {
    synth.playPop();
    setIsMerged(true);
    synth.playChime();
    if (onAddStars) onAddStars(5);
    speakText(`مذهل! لقد أصبت الهدف بدقة! 4 + 3 يساوي 7!`);
    onNotify('رائع! اندمجت الفقاعتان وولد الرقم (7) المضيء، ربحت +5 نجوم ⭐', 'success');
  };

  // Math Bot Subtraction
  const handleBotTakeLego = () => {
    synth.playPop();
    setBotRemovedCount(2);
    speakText('الروبوت مد يده وسحب مكعبين اثنين! كم مكعباً متبقياً في الهواء؟');
  };

  const handleAnswerBot = (answer: number) => {
    if (answer === 4) {
      setBotQuestionAnswered(true);
      synth.playChime();
      if (onAddStars) onAddStars(5);
      speakText('أحسنت يا بطل! 6 ناقص 2 يساوي 4، استعدنا توازن المختبر!');
      onNotify('إجابة صحيحة عبقرية! 6 - 2 = 4، ربحت +5 نجوم ⭐', 'success');
    } else {
      speakText('أعد التفكير يا ذكي! انظر للمكعبات المتبقية وعدّها معي.');
    }
  };

  // Shape Gate
  const handleChooseShape = (shape: 'square' | 'triangle' | 'circle') => {
    setSelectedShape(shape);
    if (shape === 'square') {
      setGateUnlocked(true);
      synth.playBalanceSuccess();
      if (onAddStars) onAddStars(8);
      speakText('لقد فُتحت البوابة! المربع له 4 أضلاع متساوية! مرحباً بك في غرفة المكافآت!');
      onNotify('تهانينا! فُتحت بوابة الأشكال الهندسية وربحت +8 نجوم ذهبية ⭐', 'success');
    } else {
      synth.playPop();
      speakText('فكر جيداً: هذا الشكل أضلاعه مختلفة، نريد شكلاً له 4 أضلاع متساوية تماماً!');
    }
  };

  // Scale angle calculation
  const scaleTiltDeg = isScaleBalanced
    ? 0
    : rightSideCount < scaleTarget
    ? -18
    : 18;

  return (
    <div className="space-y-6">
      {/* HEADER: FLOATING MATH LAB & MISSION CONTROL */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl">
                🍎
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>مختبر الرياضيات وبستان الأرقام السحري (3D AR)</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  منهج الصف الأول الابتدائي 🎒
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تعلّم الأرقام بالقصص الحية (تفاح، موز، فراولة، برتقال)، وميزان التوازن، ودمج الفقاعات السحري.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(DEEPSEEK_AR_PROMPT);
                synth.playChime();
                onNotify('تم نسخ البرومبت التربوي المعتمد لمحاكي الواقع المعزز بنجاح!', 'success');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ برومبت محاكي AR 📋</span>
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS FOR MATH ADVENTURE */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {[
          { id: 'orchard' as const, label: 'بستان الفاكهة (1-10)', emoji: '🍎' },
          { id: 'magic_scale' as const, label: 'ميزان البرتقال', emoji: '⚖️' },
          { id: 'bubble_merge' as const, label: 'دمج الفقاعات', emoji: '🫧' },
          { id: 'math_bot' as const, label: 'روبوت الرياضيات', emoji: '🤖' },
          { id: 'shape_gate' as const, label: 'بوابة الأشكال', emoji: '🚪' },
          { id: 'prompt_export' as const, label: 'برومبت المحاكي', emoji: '📜' },
        ].map((tab) => {
          const isActive = mathSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMathSubTab(tab.id);
                synth.playPop();
              }}
              className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-black transition-all active:scale-95 shadow-md ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: FRUIT ORCHARD (بستان الفاكهة من 1 إلى 10) */}
      {mathSubTab === 'orchard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 3D Fruit Number Presentation (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl flex flex-col justify-between overflow-hidden select-none">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  رقم {currentNum.number} في البستان
                </span>
                <button
                  onClick={() => {
                    synth.playChime();
                    speakText(`${currentNum.name}! ${currentNum.fruit}! ${currentNum.story}`);
                  }}
                  className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition border border-emerald-500/40"
                  title="استمع لصوت المعلم"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Number and Floating Fruit Plate */}
              <div className="flex flex-col items-center justify-center my-auto space-y-4">
                <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 via-teal-300 to-cyan-400 filter drop-shadow-[0_15px_15px_rgba(16,185,129,0.4)]">
                  {currentNum.number}
                </span>

                <div className="text-center space-y-1">
                  <h4 className="text-2xl font-black text-white">{currentNum.arabicWord}</h4>
                  <p className="text-xs text-emerald-300 font-bold">{currentNum.fruit}</p>
                </div>

                {/* Touch/Count interactive plate */}
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 w-full text-center space-y-2">
                  <span className="text-[11px] text-slate-400 block font-bold">
                    المس {currentNum.fruit} بإصبعك لتعدّها ({touchedItems.length} من {currentNum.interactiveCount}):
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: currentNum.interactiveCount }).map((_, fIdx) => {
                      const isTouched = touchedItems.includes(fIdx);
                      return (
                        <button
                          key={fIdx}
                          onClick={() => handleTouchFruit(fIdx)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-75 ${
                            isTouched
                              ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg scale-110'
                              : 'bg-slate-900 border border-slate-700 hover:border-emerald-500/50'
                          }`}
                        >
                          <span>{currentNum.emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Story Banner */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed text-center">
                📖 {currentNum.story}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  synth.playPop();
                  setActiveNumIdx((prev) => (prev > 0 ? prev - 1 : FRUIT_NUMBERS.length - 1));
                  handleResetOrchard();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرقم السابق</span>
              </button>

              <button
                onClick={handleResetOrchard}
                className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
                title="إعادة عد الفواكه"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  synth.playPop();
                  setActiveNumIdx((prev) => (prev < FRUIT_NUMBERS.length - 1 ? prev + 1 : 0));
                  handleResetOrchard();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
              >
                <span>الرقم التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Selector (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-white flex items-center justify-between">
                <span>أرقام بستان الفاكهة (1 إلى 10):</span>
                <span className="text-[10px] text-emerald-400 font-mono">10 أرقام أساسية</span>
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {FRUIT_NUMBERS.map((item, idx) => {
                  const isCurrent = idx === activeNumIdx;
                  return (
                    <button
                      key={item.number}
                      onClick={() => {
                        setActiveNumIdx(idx);
                        handleResetOrchard();
                        synth.playPop();
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-gradient-to-b from-emerald-500 to-teal-500 text-slate-950 font-black border-white shadow-lg ring-2 ring-emerald-400/30 scale-105'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-2xl font-black">{item.number}</span>
                      <span className="text-[10px] mt-0.5">{item.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DeepSeek-R1 Pedagogical Strategy Card */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-emerald-400" />
                <h5 className="text-sm font-black text-white">
                  فلسفة التدريس الحسي: الرقم ككائن ملموس
                </h5>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                كما بيّن نموذج <strong>DeepSeek-R1</strong>: الطفل في عمر 6 سنوات يفكر بأسلوب حسي ملموس (Concrete Stage). استبدال الرموز الصماء بالأطباق الملونة والفواكه الحقيقية يمنع الجفاف المعرفي ويبني ذاكرة رقمية راسخة تدوم طويلاً!
              </p>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 block text-[10px]">الشكل والتخيل الذهني:</span>
                <p className="text-amber-300 font-semibold">{currentNum.shapeDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MAGIC SCALE (ميزان البرتقال السحري والتوازن) */}
      {mathSubTab === 'magic_scale' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>تحدي ميزان البرتقال السحري ⚖️</span>
                {isScaleBalanced && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    متوازن تماماً! ✓
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400">
                الكفة اليسرى بها 4 برتقالات، والكفة اليمنى بها برتقالة واحدة.. كم برتقالة نحتاج ليتوازن الميزان؟
              </p>
            </div>

            <button
              onClick={handleResetScale}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة البدء</span>
            </button>
          </div>

          {/* Interactive Mechanical Scale Arena */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl flex flex-col items-center space-y-6 overflow-hidden">
            {/* The animated beam of the scale */}
            <div className="relative w-full max-w-md h-40 flex items-center justify-center">
              {/* Fulcrum / Base triangle */}
              <div className="absolute bottom-4 w-12 h-14 bg-gradient-to-t from-slate-800 to-amber-500/80 rounded-t-lg flex items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-slate-950 ring-2 ring-white/50" />
              </div>

              {/* The Tilting Beam */}
              <div
                className="relative w-full h-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-full shadow-lg transition-transform duration-500 origin-center flex items-center justify-between px-6 z-20"
                style={{
                  transform: `rotate(${scaleTiltDeg}deg)`,
                }}
              >
                {/* Left Pan (4 Oranges) */}
                <div className="relative -top-10 flex flex-col items-center">
                  <div className="w-24 p-2 rounded-2xl bg-slate-900/90 border-2 border-amber-400 shadow-xl flex flex-wrap items-center justify-center gap-1 min-h-[50px]">
                    {Array.from({ length: scaleTarget }).map((_, i) => (
                      <span key={i} className="text-xl">
                        🍊
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 mt-1">الكفة اليسرى (4)</span>
                </div>

                {/* Right Pan (Dynamic oranges added by pupil) */}
                <div className="relative -top-10 flex flex-col items-center">
                  <div
                    className={`w-24 p-2 rounded-2xl bg-slate-900/90 border-2 shadow-xl flex flex-wrap items-center justify-center gap-1 min-h-[50px] transition ${
                      isScaleBalanced ? 'border-emerald-400 bg-emerald-950/30' : 'border-cyan-400'
                    }`}
                  >
                    {Array.from({ length: rightSideCount }).map((_, i) => (
                      <span key={i} className="text-xl animate-fade-in">
                        🍊
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 mt-1">
                    الكفة اليمنى ({rightSideCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Action Area: Add Orange Button */}
            {!isScaleBalanced ? (
              <div className="text-center space-y-3 pt-4">
                <p className="text-xs text-slate-300">
                  اضغط على زر <strong>إضافة برتقالة</strong> لرفع وزن الكفة اليمنى حتى يتساوى الميزان!
                </p>
                <button
                  onClick={handleAddOrangeToRight}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-xl transition active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <span className="text-base">🍊</span>
                  <span>أضف برتقالة للكفة اليمنى (+1)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2 animate-fade-in w-full">
                <p className="text-sm font-extrabold text-emerald-300">
                  🎉 أحسنت ضربة معلم! توازن الميزان وأصبح خطاً مستقيماً تماماً!
                </p>
                <p className="text-xs text-slate-300">
                  أضفنا 3 برتقالات فوق البرتقالة الأولى: <strong>1 + 3 = 4</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: BUBBLE MERGE (دمج الفقاعات السحري) */}
      {mathSubTab === 'bubble_merge' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>دمج الفقاعات السحري (الجمع اللطيف) 🫧</span>
              </h4>
              <p className="text-xs text-slate-400">
                المس الفقاعتين لدمجهما معاً ورؤية الانفجار الضوئي للرقم الناتج!
              </p>
            </div>

            <button
              onClick={() => setIsMerged(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col items-center justify-center min-h-[300px] space-y-6">
            {!isMerged ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Bubble A */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-purple-500/30 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-lg animate-pulse">
                  <span className="text-4xl font-black text-cyan-300">{bubbleA}</span>
                  <span className="text-[10px] text-cyan-200">برتقالات</span>
                </div>

                <span className="text-3xl font-black text-amber-400">+</span>

                {/* Bubble B */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500/30 via-rose-500/20 to-amber-500/30 border-2 border-pink-400 flex flex-col items-center justify-center shadow-lg animate-pulse">
                  <span className="text-4xl font-black text-pink-300">{bubbleB}</span>
                  <span className="text-[10px] text-pink-200">فراولات</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 animate-fade-in">
                {/* Resulting 7 */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 border-4 border-white flex flex-col items-center justify-center shadow-2xl animate-bounce">
                  <span className="text-6xl font-black text-slate-950">7</span>
                  <span className="text-xs font-black text-slate-900">سَبْعَة</span>
                </div>
                <p className="text-sm font-extrabold text-amber-300">
                  🌟 تطايرت شرارات ضوئية وتشكل الرقم (7) عملاقاً في فضاء الغرفة!
                </p>
              </div>
            )}

            {!isMerged ? (
              <button
                onClick={handleTriggerMerge}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-xl transition active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>المس الفقاعتين لدمجهما سحرياً (4 + 3)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsMerged(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                جرّب مسألة دمج أخرى
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: MATH BOT SUBTRACTION (روبوت الرياضيات المصحح) */}
      {mathSubTab === 'math_bot' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>روبوت الرياضيات المصحح (الطرح الحركي) 🤖</span>
              </h4>
              <p className="text-xs text-slate-400">
                لدينا 6 مكعبات ليغو.. مد الروبوت يده وسحب مكعبين اثنين! كم مكعباً متبقياً؟
              </p>
            </div>

            <button
              onClick={() => {
                setBotRemovedCount(0);
                setBotQuestionAnswered(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col items-center space-y-6">
            {/* Visual Lego Blocks */}
            <div className="space-y-2 text-center">
              <span className="text-xs font-bold text-slate-400 block">المكعبات التي تطفو أمامك:</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: subtractionBlocks }).map((_, i) => {
                  const isRemoved = i >= subtractionBlocks - botRemovedCount;
                  return (
                    <div
                      key={i}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
                        isRemoved
                          ? 'opacity-25 bg-rose-950 border border-rose-500/40 line-through scale-90'
                          : 'bg-cyan-500/20 border-2 border-cyan-400 shadow-md scale-100'
                      }`}
                    >
                      <span>🧱</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {botRemovedCount === 0 ? (
              <button
                onClick={handleBotTakeLego}
                className="px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition active:scale-95 flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>دع الروبوت يسحب مكعبين (-2)</span>
              </button>
            ) : !botQuestionAnswered ? (
              <div className="space-y-3 text-center">
                <span className="text-xs font-bold text-amber-300 block">
                  كم مكعباً متبقياً في الهواء بعد أن أخذ الروبوت مكعبين؟ (6 - 2 = ؟)
                </span>
                <div className="flex items-center justify-center gap-3">
                  {[3, 4, 5].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleAnswerBot(ans)}
                      className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-lg border border-slate-700 transition active:scale-90"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-1 animate-fade-in">
                <p className="text-sm font-extrabold text-emerald-300">
                  🎉 أحسنت يا بطل! 6 ناقص 2 يساوي 4 بدقة تامة!
                </p>
                <p className="text-xs text-slate-300">تم ضبط ترددات الروبوت واستعادة التوازن!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: SHAPE GATE (بوابة الأشكال الهندسية) */}
      {mathSubTab === 'shape_gate' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>بوابة الأشكال الهندسية وغرفة المكافآت 🚪</span>
              </h4>
              <p className="text-xs text-slate-400">
                لغز البوابة: &quot;أنا شكل هندسي، لي 4 أضلاع وكل أضلاعي لها نفس الطول.. فمن أنا؟&quot;
              </p>
            </div>

            <button
              onClick={() => {
                setGateUnlocked(false);
                setSelectedShape(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة</span>
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-950 via-slate-950 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col items-center space-y-6">
            {!gateUnlocked ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {/* Triangle */}
                <button
                  onClick={() => handleChooseShape('triangle')}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-400 flex flex-col items-center space-y-2 transition active:scale-95"
                >
                  <Triangle className="w-12 h-12 text-amber-400" />
                  <span className="text-sm font-black text-white">المثلث</span>
                  <span className="text-[10px] text-slate-400">3 أضلاع</span>
                </button>

                {/* Square (Correct) */}
                <button
                  onClick={() => handleChooseShape('square')}
                  className="p-5 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/60 hover:border-emerald-400 flex flex-col items-center space-y-2 transition active:scale-95 shadow-lg"
                >
                  <Square className="w-12 h-12 text-emerald-400" />
                  <span className="text-sm font-black text-white">المربع</span>
                  <span className="text-[10px] text-emerald-300 font-bold">4 أضلاع متساوية</span>
                </button>

                {/* Circle */}
                <button
                  onClick={() => handleChooseShape('circle')}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-400 flex flex-col items-center space-y-2 transition active:scale-95"
                >
                  <CircleDot className="w-12 h-12 text-cyan-400" />
                  <span className="text-sm font-black text-white">الدائرة</span>
                  <span className="text-[10px] text-slate-400">بدون أضلاع</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 animate-fade-in text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-4xl shadow-2xl animate-bounce">
                  ⭐
                </div>
                <h3 className="text-xl font-black text-white">
                  لقد فُتحت البوابة الذهبية!
                </h3>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  توهجت الأضلاع الأربعة للمربع باللون الذهبي وانفتحت البوابة لتدخل إلى غرفة المكافآت حيث تتساقط النجوم احتفالاً بمهارتك في الهندسة والحساب!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 6: PROMPT EXPORT (برومبت محاكي الواقع المعزز المعتمد) */}
      {mathSubTab === 'prompt_export' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>البرومبت التربوي المعتمد: محاكي الواقع الافتراضي (AR Simulation)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  صيغة الأمر البرمجي المتوافقة مع نموذج DeepSeek-R1 لتعليم طلاب الصف الأول الابتدائي.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(DEEPSEEK_AR_PROMPT);
                    synth.playChime();
                    onNotify('تم نسخ البرومبت بالكامل للحافظة!', 'success');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ البرومبت</span>
                </button>

                {onLaunchPromptInChat && (
                  <button
                    onClick={() => {
                      onLaunchPromptInChat(DEEPSEEK_AR_PROMPT);
                      onNotify('تم إرسال البرومبت إلى جلسة المحادثة النشطة!', 'info');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>تشغيل في المساعد الذكي</span>
                  </button>
                )}
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {DEEPSEEK_AR_PROMPT}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

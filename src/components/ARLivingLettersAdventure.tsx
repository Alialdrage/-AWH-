import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Star,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Camera,
  CameraOff,
  Eye,
  Layers,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  FileText,
  Copy,
  Check,
  Download,
  Flame,
  HelpCircle,
  X,
  Lightbulb,
} from 'lucide-react';

// Sound effect generator using Web Audio API
class SimpleAudioSynth {
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
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  playFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.1);
        osc.stop(this.ctx!.currentTime + i * 0.1 + 0.35);
      });
    } catch {}
  }

  playStarSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }
}

const synth = new SimpleAudioSynth();

export type AvatarId = 'saher' | 'sara';
export type CostumeId = 'astronaut' | 'explorer' | 'artist' | 'superhero' | 'traditional';

export interface CostumeDef {
  id: CostumeId;
  name: string;
  badge: string;
  emoji: string;
  desc: string;
  bgColor: string;
  accentColor: string;
}

export const COSTUMES: CostumeDef[] = [
  {
    id: 'astronaut',
    name: 'رائد الفضاء الصغير',
    badge: 'خوذة النجوم 🚀',
    emoji: '🧑‍🚀',
    desc: 'بدلة فضاء لامعة لاستكشاف كواكب الحروف في مدار المعرفة!',
    bgColor: 'from-blue-600 via-indigo-700 to-cyan-800',
    accentColor: '#38bdf8',
  },
  {
    id: 'explorer',
    name: 'المكتشف الصغير',
    badge: 'بوصلة الغابة 🧭',
    emoji: '🤠',
    desc: 'قبعة المغامرة وحقيبة كشف أسرار الطبيعة وأصوات الحيوانات!',
    bgColor: 'from-amber-600 via-emerald-700 to-yellow-800',
    accentColor: '#f59e0b',
  },
  {
    id: 'artist',
    name: 'الفنان المبدع',
    badge: 'الريشة السحرية 🎨',
    emoji: '🧑‍🎨',
    desc: 'قبعة البيريه ومريلة الألوان لرسم الحروف بأبهى الحركات والزخارف!',
    bgColor: 'from-fuchsia-600 via-pink-600 to-purple-800',
    accentColor: '#ec4899',
  },
  {
    id: 'superhero',
    name: 'البطل الخارق',
    badge: 'وشاح السرعة ⚡',
    emoji: '🦸',
    desc: 'وشاح ذهبي ودرع طاقة خارقة للقبض على الحروف الهاربة في ثوانٍ!',
    bgColor: 'from-rose-600 via-red-600 to-amber-700',
    accentColor: '#ef4444',
  },
  {
    id: 'traditional',
    name: 'الزي البغدادي الأنيق',
    badge: 'تراث الرافدين 🏮',
    emoji: '👑',
    desc: 'زي تراثي أصيل يعكس كبرياء وجمال شط العرب وبغداد الخالدة!',
    bgColor: 'from-emerald-700 via-teal-800 to-slate-900',
    accentColor: '#10b981',
  },
];

export interface LetterCardDef {
  letter: string;
  name: string;
  diacritics: { fatha: string; damma: string; kasra: string };
  word: string;
  wordMeaning: string;
  emoji: string;
  soundText: string;
  praise: string;
  traceGuide: { x: number; y: number }[];
  funFact: string;
  colorTheme: string;
}

export const FIRST_10_LETTERS: LetterCardDef[] = [
  {
    letter: 'أ',
    name: 'ألف',
    diacritics: { fatha: 'أَ', damma: 'أُ', kasra: 'إِ' },
    word: 'أَسَد',
    wordMeaning: 'ملك الغابة الشجاع ذو الزئير القوي',
    emoji: '🦁',
    soundText: 'أَ.. أَ.. أَسَد',
    praise: 'ما شاء الله يا بطل! حرف الألف عمود متين يعلوه تاج الهمزة الجميلة.',
    traceGuide: [
      { x: 50, y: 15 },
      { x: 50, y: 35 },
      { x: 50, y: 60 },
      { x: 50, y: 85 },
    ],
    funFact: 'الأسد يعيش في البراري ويسمى أيضاً الليث والغضنفر!',
    colorTheme: 'from-amber-500 to-orange-600',
  },
  {
    letter: 'ب',
    name: 'باء',
    diacritics: { fatha: 'بَ', damma: 'بُ', kasra: 'بِ' },
    word: 'بَطَّة',
    wordMeaning: 'تسبح في النهر ولها ريش جميل وتصدر صوتاً مرحاً',
    emoji: '🦆',
    soundText: 'بَ.. بَ.. بَطَّة',
    praise: 'عاشت إيدك عيوني! حرف الباء مثل الصحن الحلو وتحته نقطة واحدة.',
    traceGuide: [
      { x: 80, y: 50 },
      { x: 75, y: 70 },
      { x: 50, y: 75 },
      { x: 25, y: 70 },
      { x: 20, y: 50 },
    ],
    funFact: 'البطة تحب السباحة في شط العرب وأهوار جنوب العراق!',
    colorTheme: 'from-blue-500 to-cyan-600',
  },
  {
    letter: 'ت',
    name: 'تاء',
    diacritics: { fatha: 'تَ', damma: 'تُ', kasra: 'تِ' },
    word: 'تَمْر',
    wordMeaning: 'حلو المذاق من نخيل البصرة والعراق المباركة',
    emoji: '🌴',
    soundText: 'تَ.. تَ.. تَمْر',
    praise: 'اللهم صل على محمد وآل محمد! التاء مثل الصحن وفوقه تفاحتان حلوتان.',
    traceGuide: [
      { x: 80, y: 50 },
      { x: 75, y: 70 },
      { x: 50, y: 75 },
      { x: 25, y: 70 },
      { x: 20, y: 50 },
    ],
    funFact: 'تمر البرحي والخستاوي العراقي من ألذ وأطيب التمور في العالم!',
    colorTheme: 'from-emerald-500 to-teal-600',
  },
  {
    letter: 'ث',
    name: 'ثاء',
    diacritics: { fatha: 'ثَ', damma: 'ثُ', kasra: 'ثِ' },
    word: 'ثَعْلَب',
    wordMeaning: 'حيوان ذكي وسريع ذو ذيل كثيف وفرو جميل',
    emoji: '🦊',
    soundText: 'ثَ.. ثَ.. ثَعْلَب',
    praise: 'يا وردة يا شاطر! نخرج طرف لساننا برفق لننطق الثاء بثلاث نقاط ذهبية.',
    traceGuide: [
      { x: 80, y: 50 },
      { x: 75, y: 70 },
      { x: 50, y: 75 },
      { x: 25, y: 70 },
      { x: 20, y: 50 },
    ],
    funFact: 'الثعلب ماهر في التخفي والبحث عن طعامه في الطبيعة!',
    colorTheme: 'from-orange-500 to-amber-700',
  },
  {
    letter: 'ج',
    name: 'جيم',
    diacritics: { fatha: 'جَ', damma: 'جُ', kasra: 'جِ' },
    word: 'جَمَل',
    wordMeaning: 'سفينة الصحراء الصبور يتحمل السفر والحر',
    emoji: '🐪',
    soundText: 'جَ.. جَ.. جَمَل',
    praise: 'فدوة لعينك! حرف الجيم في بطنه نقطة مثل جوهرة كريمة.',
    traceGuide: [
      { x: 30, y: 25 },
      { x: 70, y: 25 },
      { x: 50, y: 45 },
      { x: 75, y: 65 },
      { x: 50, y: 85 },
      { x: 25, y: 70 },
    ],
    funFact: 'الجمل يخزن الدهون في سنامه ليستعين بها في رحلات الصحراء الطويلة.',
    colorTheme: 'from-yellow-500 to-amber-600',
  },
  {
    letter: 'ح',
    name: 'حاء',
    diacritics: { fatha: 'حَ', damma: 'حُ', kasra: 'حِ' },
    word: 'حِصَان',
    wordMeaning: 'رمز الأصالة والسرعة والفروسية العربية',
    emoji: '🐎',
    soundText: 'حِ.. حِ.. حِصَان',
    praise: 'عاشت إيدك! الحاء صوت صافٍ دافئ بدون أي نقطة، مثل نسيم الصباح.',
    traceGuide: [
      { x: 30, y: 25 },
      { x: 70, y: 25 },
      { x: 50, y: 45 },
      { x: 75, y: 65 },
      { x: 50, y: 85 },
      { x: 25, y: 70 },
    ],
    funFact: 'الخيول العربية الأصيلة تشتهر بجمال عيونها وقوة صبرها ووفائها!',
    colorTheme: 'from-purple-500 to-indigo-600',
  },
  {
    letter: 'خ',
    name: 'خاء',
    diacritics: { fatha: 'خَ', damma: 'خُ', kasra: 'خِ' },
    word: 'خَرُوف',
    wordMeaning: 'حيوان أليف لطيف يعطينا الصوف الدافئ والحليب اللذيذ',
    emoji: '🐑',
    soundText: 'خَ.. خَ.. خَرُوف',
    praise: 'يا بطل الأبطال! الخاء يضع نقطته فوق رأسه كقبعة حماية أنيقة.',
    traceGuide: [
      { x: 30, y: 25 },
      { x: 70, y: 25 },
      { x: 50, y: 45 },
      { x: 75, y: 65 },
      { x: 50, y: 85 },
      { x: 25, y: 70 },
    ],
    funFact: 'صوف الخروف يستخدم في نسج السجاد العراقي اليدوي الفاخر.',
    colorTheme: 'from-teal-500 to-emerald-700',
  },
  {
    letter: 'د',
    name: 'دال',
    diacritics: { fatha: 'دَ', damma: 'دُ', kasra: 'دِ' },
    word: 'دَرَّاجَة',
    wordMeaning: 'وسيلة نقل مرحة نقودها في الحديقة والشارع الآمن',
    emoji: '🚲',
    soundText: 'دَ.. دَ.. دَرَّاجَة',
    praise: 'أحسنت! الدال حرف لطيف مثل ذراع مفتوحة للعناق والمحبة.',
    traceGuide: [
      { x: 65, y: 25 },
      { x: 40, y: 55 },
      { x: 70, y: 75 },
    ],
    funFact: 'ركوب الدراجة يقوي عضلات الساقين والقلب ويحافظ على البيئة نقية!',
    colorTheme: 'from-rose-500 to-pink-600',
  },
  {
    letter: 'ذ',
    name: 'ذال',
    diacritics: { fatha: 'ذَ', damma: 'ذُ', kasra: 'ذِ' },
    word: 'ذُرَة',
    wordMeaning: 'نبات أصفر ذهبي حلو الطعم نشويه أو نسلقه للمتعة',
    emoji: '🌽',
    soundText: 'ذُ.. ذُ.. ذُرَة',
    praise: 'تبارك الرحمن! الذال مثل الدال تماماً ولكن فوقه نقطة مضيئة.',
    traceGuide: [
      { x: 65, y: 25 },
      { x: 40, y: 55 },
      { x: 70, y: 75 },
    ],
    funFact: 'الذرة غنية بالطاقة والفيتامينات ويصنع منها الفشار اللذيذ أيضاً!',
    colorTheme: 'from-amber-400 to-yellow-600',
  },
  {
    letter: 'ر',
    name: 'راء',
    diacritics: { fatha: 'رَ', damma: 'رُ', kasra: 'رِ' },
    word: 'رُمَّان',
    wordMeaning: 'فاكهة ياقوتية مباركة مليئة بالحبات الوردية المنعشة',
    emoji: '🍎',
    soundText: 'رُ.. رُ.. رُمَّان',
    praise: 'عاشت إيدك يا ذكي! الراء يتزحلق بانسيابية جميلة مثل الزحليقة في مدينة الألعاب.',
    traceGuide: [
      { x: 60, y: 30 },
      { x: 50, y: 55 },
      { x: 30, y: 80 },
    ],
    funFact: 'رمان مدينة شهربان ومندلي بالعراق يشتهر بطعمه السكري الفريد!',
    colorTheme: 'from-red-500 to-rose-700',
  },
];

interface WordPuzzle {
  id: string;
  word: string;
  letters: string[];
  meaning: string;
  emoji: string;
  voicePrompt: string;
}

export const WORD_PUZZLES: WordPuzzle[] = [
  {
    id: 'w1',
    word: 'دَار',
    letters: ['د', 'ا', 'ر'],
    meaning: 'البيت الآمن الدافئ الذي نسكن فيه مع عائلتنا الحبيبة',
    emoji: '🏡',
    voicePrompt: 'دَ.. ا.. ر.. دَار! البيت الدافئ',
  },
  {
    id: 'w2',
    word: 'دَر',
    letters: ['د', 'ر'],
    meaning: 'الدر واللؤلؤ الثمين اللامع في قاع الخليج العربي',
    emoji: '💎',
    voicePrompt: 'دَ.. ر.. دَر! اللؤلؤة البراقة',
  },
  {
    id: 'w3',
    word: 'أَب',
    letters: ['أ', 'ب'],
    meaning: 'والدنا الحبيب سند البيت وعمود الأسرة',
    emoji: '👨‍👧‍👦',
    voicePrompt: 'أَ.. ب.. أَب! الأب الغالي الحنون',
  },
  {
    id: 'w4',
    word: 'بَاب',
    letters: ['ب', 'ا', 'ب'],
    meaning: 'مدخل الدار والغرفة نفتحه بالسلام ونغلقه بأمان',
    emoji: '🚪',
    voicePrompt: 'بَ.. ا.. ب.. بَاب! نفتحه بالابتسامة',
  },
  {
    id: 'w5',
    word: 'تَمْر',
    letters: ['ت', 'م', 'ر'],
    meaning: 'غذاء العراقيين العريق وحلوى النخيل المباركة',
    emoji: '🌴',
    voicePrompt: 'تَ.. م.. ر.. تَمْر! التمر العراقي الشهي',
  },
];

interface ARLivingLettersAdventureProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddStars?: (count: number) => void;
  initialStars?: number;
}

export const ARLivingLettersAdventure: React.FC<ARLivingLettersAdventureProps> = ({
  onNotify,
  onAddStars,
  initialStars = 25,
}) => {
  // Navigation inside the adventure
  const [adventureMode, setAdventureMode] = useState<
    'cards_3d' | 'tracing' | 'word_builder' | 'hunting_game' | 'pitch_deck'
  >('cards_3d');

  // Avatar and Costumes
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('saher');
  const [selectedCostume, setSelectedCostume] = useState<CostumeId>('astronaut');

  // Active Letter
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const currentLetter = FIRST_10_LETTERS[activeLetterIndex];

  // 3D Card rotation state
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // AR Camera View simulation
  const [isArCameraActive, setIsArCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoArRef = useRef<HTMLVideoElement>(null);

  // Canvas Tracing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPointsCount, setDrawnPointsCount] = useState(0);
  const [isTraceSuccess, setIsTraceSuccess] = useState(false);

  // Word Building state
  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);
  const currentPuzzle = WORD_PUZZLES[activePuzzleIndex];
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);

  // Hunting Game state
  const [gameScore, setGameScore] = useState(0);
  const [gameTargetLetter, setGameTargetLetter] = useState<LetterCardDef>(FIRST_10_LETTERS[0]);
  const [floatingBubbles, setFloatingBubbles] = useState<
    { id: number; letter: string; x: number; y: number; speed: number }[]
  >([]);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Voice synthesis & read aloud
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sound & Speech handler
  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  // Toggle AR Camera
  const toggleArCamera = async () => {
    if (isArCameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      setIsArCameraActive(false);
      onNotify('تم إيقاف كاميرا الواقع المعزز', 'info');
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          onNotify('الكاميرا غير متوفرة، يمكنك استخدام الوضع الافتراضي ثلاثي الأبعاد', 'info');
          return;
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        setCameraStream(stream);
        setIsArCameraActive(true);
        if (videoArRef.current) {
          videoArRef.current.srcObject = stream;
          videoArRef.current.play().catch(() => {});
        }
        synth.playFanfare();
        onNotify('تم تفعيل كاميرا الواقع المعزز 3D AR بنجاح!', 'success');
      } catch {
        // Graceful fallback without throwing or logging console error
        setCameraStream(null);
        setIsArCameraActive(false);
        onNotify('تعذر الوصول للكاميرا، تم تفعيل وضع الاستعراض ثلاثي الأبعاد المباشر!', 'info');
      }
    }
  };

  useEffect(() => {
    if (videoArRef.current && cameraStream && isArCameraActive) {
      videoArRef.current.srcObject = cameraStream;
      videoArRef.current.play().catch(() => {});
    }
  }, [cameraStream, isArCameraActive]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle card tilt with mouse movement
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardRotate({
      x: -(y / (rect.height / 2)) * 14,
      y: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseLeaveCard = () => {
    setCardRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Tracing Canvas logic
  useEffect(() => {
    if (adventureMode === 'tracing') {
      initTraceCanvas();
    }
  }, [adventureMode, activeLetterIndex]);

  const initTraceCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsTraceSuccess(false);
    setDrawnPointsCount(0);

    // Draw background chalkboard
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid stars
    ctx.fillStyle = '#1e293b';
    for (let i = 20; i < canvas.width; i += 40) {
      for (let j = 20; j < canvas.height; j += 40) {
        ctx.fillRect(i, j, 2, 2);
      }
    }

    // Draw Dotted Letter Outline
    ctx.font = 'bold 150px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillText(currentLetter.letter, canvas.width / 2, canvas.height / 2);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(currentLetter.letter, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]);
  };

  const startTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawTrace(e);
  };

  const drawTrace = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Draw luminous glowing trace point
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    synth.playPop();

    setDrawnPointsCount((prev) => {
      const next = prev + 1;
      if (next > 28 && !isTraceSuccess) {
        setIsTraceSuccess(true);
        synth.playFanfare();
        if (onAddStars) onAddStars(5);
        speakText(`عاشت إيدك يا ${selectedAvatar === 'saher' ? 'بطل' : 'وردة'}! كتبت حرف ${currentLetter.name} بإتقان رائع!`);
        onNotify(`أحسنت! أتقنت كتابة حرف (${currentLetter.letter}) وربحت +5 نجوم ⭐`, 'success');
      }
      return next;
    });
  };

  const stopTracing = () => {
    setIsDrawing(false);
  };

  // Word Builder handling
  const handleSnapLetter = (letter: string) => {
    synth.playPop();
    const neededLetter = currentPuzzle.letters[placedLetters.length];
    if (letter === neededLetter) {
      const nextPlaced = [...placedLetters, letter];
      setPlacedLetters(nextPlaced);

      if (nextPlaced.length === currentPuzzle.letters.length) {
        setPuzzleCompleted(true);
        synth.playFanfare();
        if (onAddStars) onAddStars(8);
        speakText(currentPuzzle.voicePrompt);
        onNotify(`رائع جداً! شكّلت كلمة (${currentPuzzle.word}) وربحت +8 نجوم ⭐`, 'success');
      }
    } else {
      speakText('حاول مرة أخرى عيوني، اختر الحرف التالي بالترتيب!');
    }
  };

  const resetWordPuzzle = () => {
    setPlacedLetters([]);
    setPuzzleCompleted(false);
  };

  const nextWordPuzzle = () => {
    setActivePuzzleIndex((prev) => (prev + 1) % WORD_PUZZLES.length);
    setPlacedLetters([]);
    setPuzzleCompleted(false);
  };

  // Hunting Mini-Game Logic
  const startHuntingGame = () => {
    setIsGameRunning(true);
    setGameScore(0);
    pickNewGameTarget();
  };

  const pickNewGameTarget = () => {
    const randomLetter = FIRST_10_LETTERS[Math.floor(Math.random() * FIRST_10_LETTERS.length)];
    setGameTargetLetter(randomLetter);
    speakText(`ابحث عن حرف: ${randomLetter.diacritics.fatha}! واصطد الفقاعة!`);

    // Generate 6 bubbles with random letters including the target
    const bubbles = [
      { id: 1, letter: randomLetter.letter, x: 20, y: 30, speed: 1.2 },
      { id: 2, letter: randomLetter.letter, x: 70, y: 55, speed: 1.5 },
    ];

    const otherLetters = FIRST_10_LETTERS.filter((l) => l.letter !== randomLetter.letter);
    for (let i = 3; i <= 6; i++) {
      const rnd = otherLetters[Math.floor(Math.random() * otherLetters.length)];
      bubbles.push({
        id: i,
        letter: rnd.letter,
        x: Math.floor(Math.random() * 70) + 10,
        y: Math.floor(Math.random() * 60) + 20,
        speed: 1 + Math.random(),
      });
    }

    setFloatingBubbles(bubbles.sort(() => Math.random() - 0.5));
  };

  const handlePopBubble = (bubbleId: number, letter: string) => {
    synth.playPop();
    if (letter === gameTargetLetter.letter) {
      synth.playStarSound();
      setGameScore((prev) => prev + 10);
      setFloatingBubbles((prev) => prev.filter((b) => b.id !== bubbleId));

      if (onAddStars) onAddStars(3);

      if (floatingBubbles.filter((b) => b.letter === gameTargetLetter.letter).length <= 1) {
        synth.playFanfare();
        speakText('ممتاز يا صائد الحروف! أحسنت!');
        setTimeout(() => {
          pickNewGameTarget();
        }, 800);
      }
    } else {
      speakText('هذا حرف مختلف، ابحث عن الحرف المطلوب!');
    }
  };

  const currentCostumeDef =
    COSTUMES.find((c) => c.id === selectedCostume) || COSTUMES[0];

  return (
    <div className="space-y-6">
      {/* HEADER: AVATAR CUSTOMIZER & MISSION CONTROL */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Avatar Profile */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${currentCostumeDef.bgColor} p-1 shadow-xl flex items-center justify-center border-2 border-white/40 ring-4 ring-indigo-500/20`}
              >
                <div className="w-full h-full rounded-xl bg-slate-950/60 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl filter drop-shadow animate-pulse">
                    {currentCostumeDef.emoji}
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black shadow">
                {selectedAvatar === 'saher' ? 'ساهر 👦' : 'سارة 👧'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>مغامرة الحروف الحية والواقع المعزز (3D AR)</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  الصف الأول الابتدائي 🎒
                </span>
              </div>
              <p className="text-xs text-slate-300">
                بطل المغامرة: <strong className="text-amber-300">{selectedAvatar === 'saher' ? 'ساهر الفضائي' : 'سارة المبدعة'}</strong> •{' '}
                الزي النشط: <strong className="text-cyan-300">{currentCostumeDef.name}</strong> ({currentCostumeDef.badge})
              </p>
            </div>
          </div>

          {/* Quick Avatar & Costume Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Character Gender Switcher */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => {
                  setSelectedAvatar('saher');
                  synth.playPop();
                  speakText('أهلاً أنا ساهر! بطل الفضاء والمغامرات، جاهز للتعلم!');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedAvatar === 'saher'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👦</span>
                <span>ساهر (ولد)</span>
              </button>
              <button
                onClick={() => {
                  setSelectedAvatar('sara');
                  synth.playPop();
                  speakText('أهلاً أنا سارة! أميرة الألوان والقصص السحرية، هيا بنا!');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedAvatar === 'sara'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👧</span>
                <span>سارة (بنت)</span>
              </button>
            </div>

            {/* AR Live Camera Toggle */}
            <button
              onClick={toggleArCamera}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition border active:scale-95 shadow-md ${
                isArCameraActive
                  ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400'
              }`}
            >
              {isArCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span>{isArCameraActive ? 'إيقاف كاميرا AR' : 'تشغيل كاميرا AR الحية'}</span>
            </button>
          </div>
        </div>

        {/* Costume Carousel Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap pl-1">
            خزانة الأزياء التفاعلية:
          </span>
          {COSTUMES.map((costume) => {
            const isSelected = selectedCostume === costume.id;
            return (
              <button
                key={costume.id}
                onClick={() => {
                  setSelectedCostume(costume.id);
                  synth.playPop();
                  speakText(`تم ارتداء: ${costume.name}! ${costume.desc}`);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 font-extrabold shadow-lg ring-2 ring-indigo-400/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{costume.emoji}</span>
                <span>{costume.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NAVIGATION TABS: THE 5 ADVENTURE PHASES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'cards_3d' as const, label: 'بطاقات الحروف 3D', icon: Layers, emoji: '🃏' },
          { id: 'tracing' as const, label: 'تتبع الحرف (Trace it)', icon: Sparkles, emoji: '✍️' },
          { id: 'word_builder' as const, label: 'تركيب الكلمات', icon: Star, emoji: '🧩' },
          { id: 'hunting_game' as const, label: 'صيد الحروف الضائعة', icon: Flame, emoji: '🎯' },
          { id: 'pitch_deck' as const, label: 'عرض مدرسة المستقبل', icon: FileText, emoji: '📊' },
        ].map((tab) => {
          const isActive = adventureMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setAdventureMode(tab.id);
                synth.playPop();
              }}
              className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all active:scale-95 shadow-md ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PHASE 1: 3D AR LETTER CARDS */}
      {adventureMode === 'cards_3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 3D Card Display (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* 3D Floating Perspective Card Container */}
            <div
              className="relative w-full max-w-md aspect-[4/5] rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition-transform duration-200 cursor-pointer overflow-hidden border border-white/20 select-none"
              style={{
                perspective: '1000px',
                transform: `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
                background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))`,
              }}
              onMouseMove={handleMouseMoveCard}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeaveCard}
              onClick={() => {
                synth.playStarSound();
                speakText(`${currentLetter.soundText}! ${currentLetter.praise}`);
              }}
            >
              {/* Camera background if AR Camera is active */}
              {isArCameraActive && (
                <div className="absolute inset-0 z-0 opacity-40">
                  <video
                    ref={videoArRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
                </div>
              )}

              {/* Holographic light sheen reflection */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: isHovered
                    ? `radial-gradient(circle at ${50 + cardRotate.y * 3}% ${50 - cardRotate.x * 3}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
                    : 'none',
                }}
              />

              {/* Top Card Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  بطاقة رقم {activeLetterIndex + 1} من 10
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    synth.playPop();
                    speakText(currentLetter.soundText);
                  }}
                  className="p-2.5 rounded-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition border border-cyan-500/40 shadow-lg"
                  title="استمع لصوت الحرف"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Big 3D Letter & Animal Object Center */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-4">
                <div className="relative">
                  <span
                    className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 filter drop-shadow-[0_15px_15px_rgba(245,158,11,0.5)] block transition-transform duration-300 group-hover:scale-110"
                  >
                    {currentLetter.letter}
                  </span>
                  <span className="absolute -top-2 -right-4 text-4xl animate-bounce">
                    {currentLetter.emoji}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                    <span>{currentLetter.word}</span>
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      ({currentLetter.name})
                    </span>
                  </h4>
                  <p className="text-xs text-amber-300 font-bold">{currentLetter.soundText}</p>
                </div>

                {/* Diacritics Pill Selector (الحركات: فتحة، ضمة، كسرة) */}
                <div className="flex items-center gap-2 pt-2">
                  {[
                    { label: 'فَتْحَة', symbol: currentLetter.diacritics.fatha, sound: `${currentLetter.letter}َ` },
                    { label: 'ضَمَّة', symbol: currentLetter.diacritics.damma, sound: `${currentLetter.letter}ُ` },
                    { label: 'كَسْرَة', symbol: currentLetter.diacritics.kasra, sound: `${currentLetter.letter}ِ` },
                  ].map((d, dIdx) => (
                    <button
                      key={dIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        synth.playStarSound();
                        speakText(d.sound);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 flex items-center gap-1 shadow"
                    >
                      <span className="text-sm font-extrabold text-amber-400">{d.symbol}</span>
                      <span className="text-[10px] opacity-75">({d.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="relative z-10 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 text-center leading-relaxed">
                💡 <span className="text-amber-300 font-bold">{currentLetter.funFact}</span>
              </div>
            </div>

            {/* Prev / Next Letter Navigation */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  synth.playPop();
                  setActiveLetterIndex((prev) => (prev > 0 ? prev - 1 : FIRST_10_LETTERS.length - 1));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-95 border border-slate-700"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الحرف السابق</span>
              </button>

              <button
                onClick={() => {
                  synth.playStarSound();
                  speakText(currentLetter.praise);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>تشجيع المعلم بصوت عراقي 🎙️</span>
              </button>

              <button
                onClick={() => {
                  synth.playPop();
                  setActiveLetterIndex((prev) => (prev < FIRST_10_LETTERS.length - 1 ? prev + 1 : 0));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-95 border border-slate-700"
              >
                <span>الحرف التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Letter Strip & Information Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Letter Grid Selector */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-white flex items-center justify-between">
                <span>رحلة الحروف العشرة الأولى:</span>
                <span className="text-[10px] text-amber-400 font-mono">10 حروف أساسية</span>
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {FIRST_10_LETTERS.map((item, idx) => {
                  const isCurrent = idx === activeLetterIndex;
                  return (
                    <button
                      key={item.letter}
                      onClick={() => {
                        setActiveLetterIndex(idx);
                        synth.playPop();
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 font-black border-white shadow-lg ring-2 ring-amber-400/30 scale-105'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-2xl font-black">{item.letter}</span>
                      <span className="text-[10px] mt-0.5">{item.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Explanation Card */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h5 className="text-sm font-black text-white">
                  قصة حرف ({currentLetter.letter}) مع {selectedAvatar === 'saher' ? 'ساهر' : 'سارة'}
                </h5>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                {currentLetter.praise}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">الكلمة الدالة:</span>
                  <strong className="text-white text-base">{currentLetter.word}</strong>
                  <span className="text-2xl block mt-1">{currentLetter.emoji}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">معنى الكلمة:</span>
                  <p className="text-slate-300 text-[11px] mt-1 leading-snug">
                    {currentLetter.wordMeaning}
                  </p>
                </div>
              </div>

              {/* Direct Jump to Trace it */}
              <button
                onClick={() => {
                  setAdventureMode('tracing');
                  synth.playPop();
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>تتبع واكتب حرف ({currentLetter.letter}) بإصبعك الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: TRACING CANVAS ("Trace it") */}
      {adventureMode === 'tracing' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>تتبع مسار حرف ({currentLetter.letter}) بإصبعك ✍️</span>
                {isTraceSuccess && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    أحسنت يا بطل! ✓
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400">
                مرر إصبعك أو الفأرة على النقاط المضيئة لكتابة الحرف وربح النجوم الذهبية!
              </p>
            </div>

            <button
              onClick={initTraceCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
              title="إعادة مسح السبورة"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة</span>
            </button>
          </div>

          {/* Interactive Chalkboard Canvas */}
          <div className="relative aspect-[4/3] w-full rounded-3xl border-4 border-amber-500/40 overflow-hidden shadow-2xl bg-slate-950 flex items-center justify-center touch-none">
            <canvas
              ref={canvasRef}
              width={600}
              height={450}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startTracing}
              onMouseMove={drawTrace}
              onMouseUp={stopTracing}
              onMouseLeave={stopTracing}
              onTouchStart={startTracing}
              onTouchMove={drawTrace}
              onTouchEnd={stopTracing}
            />

            {/* Success Overlay Banner */}
            {isTraceSuccess && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl animate-bounce">
                  <Star className="w-10 h-10 fill-current" />
                </div>
                <h3 className="text-xl font-black text-white">
                  عاشت إيدك يا {selectedAvatar === 'saher' ? 'ساهر البطل' : 'سارة الوردة'}!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm">
                  أتقنت كتابة حرف ({currentLetter.letter}) وفق قواعد خط القراءة السليم! تم إضافة +5 نجوم لرصيدك الأكاديمي.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={initTraceCanvas}
                    className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    أريد كتابته مرة ثانية
                  </button>
                  <button
                    onClick={() => {
                      setActiveLetterIndex((prev) => (prev + 1) % FIRST_10_LETTERS.length);
                      initTraceCanvas();
                      synth.playStarSound();
                    }}
                    className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg transition"
                  >
                    الحرف التالي 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: WORD BUILDER ("تركيب الكلمات") */}
      {adventureMode === 'word_builder' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>مختبر تركيب الكلمات السحرية 🧩</span>
                <span className="text-xs font-mono text-cyan-400">لغز {activePuzzleIndex + 1} من {WORD_PUZZLES.length}</span>
              </h4>
              <p className="text-xs text-slate-400">
                اجمع الحروف بالترتيب الصحيح لتكوين كلمة كاملة مع {selectedAvatar === 'saher' ? 'ساهر' : 'سارة'}!
              </p>
            </div>

            <button
              onClick={resetWordPuzzle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة البدء</span>
            </button>
          </div>

          {/* Word Target Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-5xl shadow-inner">
              {currentPuzzle.emoji}
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-3xl font-black text-white tracking-widest">
                {puzzleCompleted ? currentPuzzle.word : '؟ ؟ ؟'}
              </h3>
              <p className="text-xs text-slate-400">{currentPuzzle.meaning}</p>
            </div>

            {/* Snap Slots (أماكن وضع الحروف) */}
            <div className="flex items-center gap-3">
              {currentPuzzle.letters.map((ltr, idx) => {
                const isFilled = placedLetters.length > idx;
                const letterVal = isFilled ? placedLetters[idx] : '؟';
                return (
                  <div
                    key={idx}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all border-2 ${
                      isFilled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-lg scale-105'
                        : 'bg-slate-950/80 border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {letterVal}
                  </div>
                );
              })}
            </div>

            {/* Letter Pool to pick from */}
            {!puzzleCompleted && (
              <div className="space-y-2 text-center pt-2">
                <span className="text-xs font-bold text-slate-400 block">
                  اضغط على الحرف المطلوب بالترتيب:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {currentPuzzle.letters
                    .slice()
                    .sort(() => 0.5 - Math.random())
                    .map((l, i) => (
                      <button
                        key={i}
                        onClick={() => handleSnapLetter(l)}
                        className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl shadow-md transition active:scale-90 border border-indigo-400"
                      >
                        {l}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Puzzle Completed Notification */}
            {puzzleCompleted && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2 animate-fade-in w-full">
                <p className="text-sm font-extrabold text-emerald-300">
                  🎉 أحسنت صنعاً! ركّبت كلمة ({currentPuzzle.word}) بنجاح!
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={nextWordPuzzle}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>الكلمة التالية</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 4: HUNTING GAME ("صيد الحروف الضائعة") */}
      {adventureMode === 'hunting_game' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>لعبة صيد الحروف والفقاعات الطائرة 🎯</span>
                </h4>
                <p className="text-xs text-slate-400">
                  اسمع صوت الحرف وانقر على الفقاعة الصحيحة قبل هروبها!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>النقاط: {gameScore}</span>
              </div>

              {!isGameRunning ? (
                <button
                  onClick={startHuntingGame}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow transition active:scale-95 flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>بدء اللعبة</span>
                </button>
              ) : (
                <button
                  onClick={pickNewGameTarget}
                  className="px-3 py-1.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold transition border border-slate-700"
                >
                  حرف آخر 🎲
                </button>
              )}
            </div>
          </div>

          {/* Interactive Game Arena */}
          <div className="relative aspect-video w-full rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900 border-2 border-indigo-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-4">
            {!isGameRunning ? (
              <div className="text-center space-y-3 p-6 bg-slate-950/80 rounded-3xl border border-slate-800 max-w-md">
                <span className="text-5xl block animate-bounce">🎈</span>
                <h3 className="text-lg font-black text-white">جاهز لصيد الحروف يا بطل؟</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ستسمع صوت الحرف من المعلم، وكل ما عليك هو النقر على الفقاعة التي تحمله لجمع النجوم والأوسمة!
                </p>
                <button
                  onClick={startHuntingGame}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-xl transition active:scale-95"
                >
                  انطلق في التحدي 🚀
                </button>
              </div>
            ) : (
              <>
                {/* Mission Objective Bar */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between p-3 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">المطلوب صيده:</span>
                    <strong className="text-xl font-black text-amber-400">
                      حرف ({gameTargetLetter.letter})
                    </strong>
                    <span className="text-xs text-cyan-300">
                      - صوت: {gameTargetLetter.diacritics.fatha}
                    </span>
                  </div>

                  <button
                    onClick={() => speakText(`ابحث عن حرف: ${gameTargetLetter.diacritics.fatha}!`)}
                    className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                    title="أعد نطق الصوت"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Floating Bubbles */}
                <div className="relative w-full h-full">
                  {floatingBubbles.map((bubble) => (
                    <button
                      key={bubble.id}
                      onClick={() => handlePopBubble(bubble.id, bubble.letter)}
                      className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-pink-500/40 border-2 border-white/50 text-white font-black text-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-75 animate-pulse"
                      style={{
                        top: `${bubble.y}%`,
                        left: `${bubble.x}%`,
                      }}
                    >
                      <span>{bubble.letter}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PHASE 5: PITCH DECK PRESENTATION ("مدرسة المستقبل في جيبك") */}
      {adventureMode === 'pitch_deck' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm sm:text-base font-black text-white">
                  العرض التقديمي (Pitch Deck): مدرسة المستقبل في جيبك
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                رؤية الواقع المعزز (AR) والذكاء الاصطناعي DeepSeek-R1 لتعليم القراءة في الصف الأول الابتدائي
              </p>
            </div>

            <button
              onClick={() => {
                const pitchText = `# مدرسة المستقبل في جيبك: الواقع المعزز (AR) لتعليم القراءة
## المرحلة: الصف الأول الابتدائي - العراق والوطن العربي
## محرك التفكير والتحليل: DeepSeek-R1 Logic Engine

### 1. المشكلة والفرصة
* جمود الكتاب الورقي وضعف تجاوب جيل الأجهزة الذكية مع التعليم التلقيني التقليدي.
* الحاجة إلى ربط حسي سمعي وبصري ولَمسي لتعليم مخارج الحروف.

### 2. الحل الرقمي المبتكر: "مغامرة الحروف الحية"
* بطاقات واقع معزز (3D AR) تفاعلية تطفو فوق الكاميرا أو الشاشة.
* شخصيات مخصصة (ساهر وسارة) بأزياء متعددة (رائد فضاء، مكتشف، فنان، بطل خارق).
* تتبع مسار الحرف الحركي (Trace it) لتثبيت مهارة الخط العربي السليم.
* مختبر تركيب الكلمات السحرية وصيد الحروف الضائعة بالصوت والصورة.

### 3. الأثر التعليمي والقيمة المضافة
* تحويل وقت الشاشات من استهلاك سلبي إلى إتقان أكاديمي نشط.
* أسلوب عراقي محبب وتدعيم مستمر بالصلاة على النبي وآله والأوسمة والنجوم.`;
                navigator.clipboard.writeText(pitchText);
                synth.playFanfare();
                onNotify('تم نسخ العرض التقديمي بالكامل للحافظة جاهزاً للطباعة والمشاركة!', 'success');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>نسخ العرض التقديمي</span>
            </button>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                الشريحة 1: الرؤية والهدف
              </span>
              <h5 className="text-sm font-black text-white">التحول من التلقين إلى المشاهدة الحية</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                استبدال الأسلوب الصامت بمجسمات ثلاثية الأبعاد تنبض بالحياة، حيث يتحول حرف (أ) إلى أسد ملكي يهدر بلطف، وحرف (ب) إلى بطة تسبح في شط العرب.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300">
                الشريحة 2: التتبع والتفاعل الحسي
              </span>
              <h5 className="text-sm font-black text-white">تتبع الحرف بإصبع الطفل (Trace it)</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                شاشة لمسية مضيئة تهتز وتصدر أصواتاً تشجيعية عند رسم الحرف بدقة، مما يرسخ الذاكرة العضلية لحركات القلم والخط العربي في المرحلة الأولى.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300">
                الشريحة 3: تعدد الشخصيات والأزياء
              </span>
              <h5 className="text-sm font-black text-white">ساهر وسارة والأزياء المحفزة</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                ربط الطفل بشخصية قدوة يحبها ويتزيا بأزياء المستقبل: رائد فضاء يستكشف مدارات الحروف، وفنان يلون الحركات، وبطل خارق يصطاد المفردات.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                الشريحة 4: التلعيب وقواعد البيانات
              </span>
              <h5 className="text-sm font-black text-white">ربط الأداء وحفظ التقدم سحابياً</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                كل نجمة يحصل عليها الطالب تُحفظ فوراً في Firestore لتوثيق تقدم الطفل وتشجيع أولياء الأمور والمعلمين على متابعة إنجازاته يوماً بيوم.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

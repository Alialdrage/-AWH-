import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Star,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  Award,
  Layers,
  Heart,
  Music,
  Compass,
  X,
  Share2,
  Camera,
  CameraOff,
  RefreshCw,
  HelpCircle,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  HandMetal,
  Move,
  Target,
} from 'lucide-react';

// Web Audio API Synthesizer for rich, dependency-free soundscapes
class LetterAudioSynth {
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
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  playSparkle() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.08);
        osc.stop(this.ctx!.currentTime + i * 0.08 + 0.25);
      });
    } catch {}
  }

  playAnimalRoar() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {}
  }
}

const synth = new LetterAudioSynth();

export interface LetterAdventureItem {
  id: string;
  letter: string;
  name: string;
  word: string;
  emoji: string;
  pronunciationLead: string;
  audioDialogue: string;
  characterGreeting: string;
  soundEffectsDesc: string;
  diacritics: {
    fatha: { text: string; example: string };
    damma: { text: string; example: string };
    kasra: { text: string; example: string };
  };
  funFact: string;
  badge: string;
  themeGradient: string;
  accentBorder: string;
  glowColor: string;
  threeDDescription: string;
}

export const FIRST_FIVE_LETTERS: LetterAdventureItem[] = [
  {
    id: 'alif',
    letter: 'أ',
    name: 'أَلِف',
    word: 'أَسَد',
    emoji: '🦁',
    pronunciationLead: 'أ.. أ.. أسد!',
    audioDialogue: 'أ.. أ.. أسد! ما شاء الله يا بطل! حرف الألف عمود مستقيم يرتفع بشموخ ويعلوه تاج الهمزة الملكية، ويتحول رقمياً إلى أسد شجاع يهدر بلطف في الغابة!',
    characterGreeting: 'ساهر: أنا رائد الفضاء ساهر، وأحيي ملك الغابة الشجاع (أسد)!',
    soundEffectsDesc: 'زئير ملكي لطيف + بريق نجوم ثلاثية الأبعاد',
    diacritics: {
      fatha: { text: 'أَ', example: 'أَسَد (بفتح الفم)' },
      damma: { text: 'أُ', example: 'أُمّ (بضم الشفتين)' },
      kasra: { text: 'إِ', example: 'إِبْرِيق (بابتسامة الكسرة)' },
    },
    funFact: 'الأسد في لغتنا العربية الجميلة له أكثر من 300 اسم، منها الليث والغضنفر والسبع!',
    badge: 'ملك الغابة الشجاع 👑',
    themeGradient: 'from-amber-500 via-orange-600 to-yellow-600',
    accentBorder: 'border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    threeDDescription: 'مجسم ثلاثي الأبعاد لحرف الألف مع مجسم الأسد الذهبي ذي اللبدة الكثيفة يتحرك بلطف عند التدوير.',
  },
  {
    id: 'baa',
    letter: 'ب',
    name: 'بَاء',
    word: 'بَطَّة',
    emoji: '🦆',
    pronunciationLead: 'ب.. ب.. بطة!',
    audioDialogue: 'ب.. ب.. بطة! عاشت إيدك عيوني! حرف الباء مثل الصحن الحلو وتحته نقطة واحدة تلمع كالدرة، تسبح البطة في شط العرب وتغطس بمرح!',
    characterGreeting: 'سارة: أنا سارة، انظروا كيف تسبح البطة اللطيفة وتترك تموجات ماء براقة!',
    soundEffectsDesc: 'تموجات ماء شط العرب + صوت بطبطة مرحة',
    diacritics: {
      fatha: { text: 'بَ', example: 'بَطَّة (نفتح فمنا: بَـ)' },
      damma: { text: 'بُ', example: 'بُرْج (نضم شفتينا: بُـ)' },
      kasra: { text: 'بِ', example: 'بِنْت (نبتسم بلطف: بِـ)' },
    },
    funFact: 'ريش البطة لا يتبلل بالماء أبداً لأن عليه طبقة زيتية طبيعية تحميه وتجعله يطفو!',
    badge: 'سبّاحة شط العرب 🌊',
    themeGradient: 'from-blue-500 via-cyan-600 to-teal-600',
    accentBorder: 'border-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    threeDDescription: 'مجسم ثلاثي الأبعاد لصحن حرف الباء المنحني مع نقطة عائمة، وبطة بيضاء بريش ناصع تطفو فوق بحيرة ماء زرقاء.',
  },
  {
    id: 'taa',
    letter: 'ت',
    name: 'تَاء',
    word: 'تَمْر',
    emoji: '🌴',
    pronunciationLead: 'ت.. ت.. تمر!',
    audioDialogue: 'ت.. ت.. تمر! اللهم صل على محمد وآل محمد! حرف التاء مثل الصحن ويحمل فوقه تمرتين شهيتين من نخيل البصرة والعراق المباركة!',
    characterGreeting: 'ساهر: التمر العراقي يمدنا بالطاقة والذكاء لنكون الأوائل في الصف!',
    soundEffectsDesc: 'حفيف سعف النخيل في البستان + صدى أهازيج الخير',
    diacritics: {
      fatha: { text: 'تَ', example: 'تَمْر (بفتح الفم: تَـ)' },
      damma: { text: 'تُ', example: 'تُفَّاح (بضم الشفتين: تُـ)' },
      kasra: { text: 'تِ', example: 'تِمْسَاح (بكسر الشفتين: تِـ)' },
    },
    funFact: 'العراق يضم أجود أنواع النخيل في العالم مثل البرحي والخستاوي والزهدي!',
    badge: 'بركة النخيل الباسقة 🌴',
    themeGradient: 'from-emerald-500 via-teal-600 to-green-700',
    accentBorder: 'border-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    threeDDescription: 'مجسم ثلاثي الأبعاد لنخلة باسقة تتساقط منها عذوق التمر الياقوتية، مع نقطتين مضيئتين تطفوان فوق حرف التاء.',
  },
  {
    id: 'thaa',
    letter: 'ث',
    name: 'ثَاء',
    word: 'ثَعْلَب',
    emoji: '🦊',
    pronunciationLead: 'ث.. ث.. ثعلب!',
    audioDialogue: 'ث.. ث.. ثعلب! يا وردة يا شاطر! نخرج طرف لساننا برفق لننطق الثاء اللثوية بثلاث نقاط ذهبية متلألئة في سماء الحروف!',
    characterGreeting: 'سارة: ما أذكى الثعلب الصغير! يراقبنا بعينيه اللامعتين وفروه البرتقالي الجميل!',
    soundEffectsDesc: 'حركة أوراق الشجر في الغابة + رنين ثلاثي الأبعاد',
    diacritics: {
      fatha: { text: 'ثَ', example: 'ثَعْلَب (نخرج طرف اللسان: ثَـ)' },
      damma: { text: 'ثُ', example: 'ثُعْبَان (بضم الشفتين: ثُـ)' },
      kasra: { text: 'ثِ', example: 'ثِيَاب (بكسر الشفتين: ثِـ)' },
    },
    funFact: 'الثعلب يتميز بحاسة سمع خارقة تمكنه من سماع حركة الحيوانات الصغيرة تحت الأرض!',
    badge: 'مستكشف الغابة الذكي 🧭',
    themeGradient: 'from-orange-500 via-amber-600 to-red-600',
    accentBorder: 'border-orange-400',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    threeDDescription: 'مجسم ثلاثي الأبعاد لثعلب مرح يلوح بذيله الكثيف، تعلوه ثلاث نجوم ذهبية تمثل نقاط حرف الثاء الثلاث.',
  },
  {
    id: 'jeem',
    letter: 'ج',
    name: 'جِيم',
    word: 'جَمَل',
    emoji: '🐪',
    pronunciationLead: 'ج.. ج.. جمل!',
    audioDialogue: 'ج.. ج.. جمل! فدوة لعينك يا بطل! حرف الجيم في بطنه نقطة كالجوهرة الكريمة، والجمل هو سفينة الصحراء الصبور يتحمل السفر والحر!',
    characterGreeting: 'ساهر: الجمل يسير بثقة في صحراء العراق والجزيرة، صبور وقوي ومحبوب!',
    soundEffectsDesc: 'أجراس قافلة الصحراء + نسيم الكثبان الرملية',
    diacritics: {
      fatha: { text: 'جَ', example: 'جَمَل (بفتح الفم: جَـ)' },
      damma: { text: 'جُ', example: 'جُبْن (بضم الشفتين: جُـ)' },
      kasra: { text: 'جِ', example: 'جِدَار (بكسر الشفتين: جِـ)' },
    },
    funFact: 'الجمل يستطيع العيش لأيام طويلة بدون شرب ماء بفضل تخزين الطاقة والدهون في سنامه العالي!',
    badge: 'سفينة الصحراء والوفاء 🏜️',
    themeGradient: 'from-yellow-500 via-amber-600 to-orange-700',
    accentBorder: 'border-yellow-400',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    threeDDescription: 'مجسم ثلاثي الأبعاد لسنام الجمل وكثبان رملية ذهبية، وبداخله جوهرة نقطة الجيم المتوهجة.',
  },
];

interface LetterAdventureViewProps {
  onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onBack?: () => void;
}

export const LetterAdventureView: React.FC<LetterAdventureViewProps> = ({
  onNotify,
  onBack,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<LetterAdventureItem>(FIRST_FIVE_LETTERS[0]);
  const [activeStage, setActiveStage] = useState<'recognition' | 'phonetics' | 'dialogue'>('recognition');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [starsWon, setStarsWon] = useState(15);

  // 3D Card Hover / Tilt Effect
  const [tiltAngles, setTiltAngles] = useState<Record<string, { x: number; y: number }>>({});

  // -------------------------------------------------------------
  // AUGMENTED REALITY (AR TABLETOP SIMULATION) STATE
  // -------------------------------------------------------------
  const [isArActive, setIsArActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isVirtualDeskMode, setIsVirtualDeskMode] = useState(false);

  // AR Tabletop Placement & Gesture states
  const [isPlacedOnSurface, setIsPlacedOnSurface] = useState(false);
  const [surfacePosition, setSurfacePosition] = useState<{ x: number; y: number }>({ x: 50, y: 65 });
  const [modelRotationY, setModelRotationY] = useState(0);
  const [modelScale, setModelScale] = useState(1.1);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [surfaceDetected, setSurfaceDetected] = useState(true);

  const videoArRef = useRef<HTMLVideoElement>(null);
  const arContainerRef = useRef<HTMLDivElement>(null);

  // Web Speech API
  const speakDialogue = (text: string) => {
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

  // Card Mouse Move for 3D Perspective Tilt
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTiltAngles((prev) => ({
      ...prev,
      [id]: {
        x: -(y / (rect.height / 2)) * 14,
        y: (x / (rect.width / 2)) * 14,
      },
    }));
  };

  const handleCardMouseLeave = (id: string) => {
    setTiltAngles((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0 },
    }));
  };

  const handleSelectLetter = (item: LetterAdventureItem) => {
    setSelectedLetter(item);
    synth.playSparkle();
    speakDialogue(`${item.pronunciationLead} ${item.audioDialogue}`);
    if (onNotify) {
      onNotify(`تم فتح بطاقة حرف (${item.letter}) - ${item.word} ثلاثية الأبعاد!`, 'info');
    }
  };

  const handlePlayRoarOrSound = (item: LetterAdventureItem) => {
    if (item.id === 'alif') {
      synth.playAnimalRoar();
    } else {
      synth.playSparkle();
    }
    speakDialogue(item.audioDialogue);
  };

  const handleAwardStar = () => {
    synth.playSparkle();
    setStarsWon((prev) => prev + 3);
    speakDialogue('اللهم صل على محمد وآل محمد! عاشت إيدك يا بطل، ربحت 3 نجوم ذهبية!');
    if (onNotify) {
      onNotify('أحسنت! أتقنت الحرف وكسبت +3 نجوم ذهبية ⭐', 'success');
    }
  };

  // -------------------------------------------------------------
  // AR CAMERA LIFECYCLE & SURFACE TRACKING LOGIC
  // -------------------------------------------------------------
  const startArCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      // Stop existing tracks if any
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsVirtualDeskMode(true);
        setIsArActive(true);
        setIsPlacedOnSurface(false);
        synth.playSparkle();
        if (onNotify) {
          onNotify('تم تشغيل وضع سطح المكتب الافتراضي ثلاثي الأبعاد 🖥️', 'info');
        }
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to basic constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraStream(stream);
      setIsVirtualDeskMode(false);
      setIsArActive(true);
      setIsPlacedOnSurface(false); // Reset to scanning reticle
      setShowInstructionsModal(true); // Show guidance first time

      if (videoArRef.current) {
        videoArRef.current.srcObject = stream;
        videoArRef.current.play().catch(() => {});
      }

      synth.playSparkle();
      speakDialogue(
        `تم تشغيل كاميرا الواقع المعزز! وجّه الكاميرا نحو سطح الطاولة أو المكتب لإنزال مجسم حرف (${selectedLetter.letter})!`
      );
      if (onNotify) {
        onNotify('تم تشغيل كاميرا الواقع المعزز AR! وجّه الكاميرا نحو سطح المكتب.', 'success');
      }
    } catch {
      // Graceful fallback to Virtual Tabletop Desk without throwing or logging console.error
      setIsVirtualDeskMode(true);
      setIsArActive(true);
      setIsPlacedOnSurface(false);
      setCameraStream(null);
      synth.playSparkle();
      speakDialogue(
        `تم تشغيل وضع سطح المكتب الافتراضي ثلاثي الأبعاد! انقر فوق سطح الطاولة لتثبيت مجسم حرف (${selectedLetter.letter})!`
      );
      if (onNotify) {
        onNotify('تم تشغيل وضع سطح المكتب الافتراضي 🖥️ (إذن الكاميرا غير مفعّل)', 'info');
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopArCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsArActive(false);
    setIsPlacedOnSurface(false);
    setShowInstructionsModal(false);
    if (onNotify) {
      onNotify('تم إيقاف وضع الواقع المعزز.', 'info');
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    await startArCamera(nextFacing);
  };

  // Re-attach stream whenever ref or stream changes
  useEffect(() => {
    if (videoArRef.current && cameraStream && isArActive) {
      videoArRef.current.srcObject = cameraStream;
      videoArRef.current.play().catch(() => {});
    }
  }, [cameraStream, isArActive]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  // Tap on AR surface to place or relocate model
  const handleArSurfaceTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = arContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const xPercent = Math.min(85, Math.max(15, ((clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.min(85, Math.max(25, ((clientY - rect.top) / rect.height) * 100));

    setSurfacePosition({ x: xPercent, y: yPercent });
    setIsPlacedOnSurface(true);
    synth.playSparkle();

    if (!isPlacedOnSurface) {
      speakDialogue(`استقر مجسم حرف (${selectedLetter.letter}) و${selectedLetter.word} فوق مكتبك بنجاح!`);
      if (onNotify) {
        onNotify(`تم تثبيت مجسم حرف (${selectedLetter.letter}) فوق سطح المكتب!`, 'success');
      }
    }
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/80 border border-amber-500/40 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl animate-bounce">
                🦁
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  <span>مغامرة الحروف الخمسة الأولى (3D Letter Adventure)</span>
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  أول ابتدائي 🎒
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                استعراض تفاعلي للحروف الخمسة <strong>(أ، ب، ت، ث، ج)</strong> مع مجسمات ثلاثية الأبعاد ووضع الواقع المعزز فوق سطح المكتب.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* AR ACTIVATION BUTTON (HIGHLIGHTED) */}
            <button
              onClick={() => (isArActive ? stopArCamera() : startArCamera())}
              disabled={isCameraLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs shadow-xl transition active:scale-95 border ${
                isArActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400/30 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 border-emerald-300 shadow-emerald-500/20'
              }`}
            >
              {isArActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4 animate-bounce" />}
              <span>{isArActive ? 'إيقاف الواقع المعزز' : 'تفعيل الواقع المعزز'}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs shadow-lg">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 animate-spin" />
              <span>{starsWon} نجمة ذهبية</span>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
              >
                <span>العودة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* AR SHOWCASE & INSTRUCTIONS PREVIEW (WHEN AR INACTIVE) */}
      {/* ------------------------------------------------------------- */}
      {!isArActive && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border-2 border-emerald-500/40 p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-3xl shadow-lg shrink-0">
              🥽
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white">
                  الواقع المعزز (AR) - استكشف الحروف ثلاثية الأبعاد في بيئتك الحقيقية
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  كاميرا المتصفح
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                انقر على زر <strong>'تفعيل الواقع المعزز'</strong> لفتح كاميرا جهازك عبر المتصفح (`getUserMedia`) وتوجيهها نحو سطح المكتب أو الطاولة لرؤية مجسم حرف <strong>({selectedLetter.letter})</strong> ورفيقه <strong>({selectedLetter.word} {selectedLetter.emoji})</strong> يطفو فوق السطح مع الظل والنطق الصوتي التفاعلي!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => startArCamera()}
              disabled={isCameraLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition active:scale-95"
            >
              <Camera className="w-5 h-5 animate-bounce" />
              <span>تفعيل الواقع المعزز</span>
            </button>
            <button
              onClick={() => setShowInstructionsModal(true)}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              title="تعليمات توجيه الكاميرا"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CAMERA AIMING INSTRUCTIONS BAR (ALWAYS VISIBLE WHEN AR IS ACTIVE) */}
      {/* ------------------------------------------------------------- */}
      {isArActive && (
        <div className="rounded-2xl bg-slate-900/95 border border-emerald-500/40 p-3 sm:p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>تعليمات توجيه الكاميرا لضبط وضع الواقع المعزز (AR):</span>
              </h4>
            </div>
            <button
              onClick={() => setShowInstructionsModal(true)}
              className="text-[11px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>دليل الخطوات المفصل</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-white block font-bold text-[11px]">وجّه الكاميرا بميل 45°:</strong>
                <span className="text-slate-400 text-[10px]">نحو سطح مستوٍ مثل طاولة أو مكتب أو أرضية.</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-white block font-bold text-[11px]">الإضاءة والمسافة:</strong>
                <span className="text-slate-400 text-[10px]">احرص على إضاءة واضحة ومسافة 50 سم من السطح.</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-white block font-bold text-[11px]">مؤشر الاستشعار (Reticle):</strong>
                <span className="text-slate-400 text-[10px]">حرّك الهاتف ببطء حتى تظهر دائرة المسح الخضراء.</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-white block font-bold text-[11px]">انقر لتثبيت المجسم:</strong>
                <span className="text-slate-400 text-[10px]">المس السطح لإنزال الحرف والحيوان وسماع النطق!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AUGMENTED REALITY (AR TABLETOP LIVE VIEWPORT) */}
      {/* ------------------------------------------------------------- */}
      {isArActive && (
        <div
          ref={arContainerRef}
          className="relative aspect-video sm:aspect-[16/9] w-full rounded-3xl bg-slate-950 border-4 border-emerald-500/60 overflow-hidden shadow-2xl flex items-center justify-center select-none"
        >
          {/* Live Phone Camera Video Feed or Simulated 3D Classroom Desk Surface */}
          {cameraStream && !isVirtualDeskMode ? (
            <video
              ref={videoArRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col justify-end overflow-hidden">
              {/* Background Classroom Ambient Lights */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/70 via-slate-950 to-slate-950 pointer-events-none" />

              {/* Simulated 3D Wooden Desk with Realistic Perspective and Texture */}
              <div
                className="relative w-full h-[68%] bg-gradient-to-t from-amber-950 via-[#451a03] to-[#78350f] border-t-4 border-amber-500/50 shadow-2xl origin-bottom"
                style={{
                  transform: 'perspective(600px) rotateX(25deg)',
                  boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.6)',
                }}
              >
                {/* Wood grain pattern */}
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_35px)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
                <div className="absolute top-3 left-4 text-[10px] font-mono text-amber-300/60 uppercase tracking-widest pointer-events-none">
                  A.W.H Virtual Tabletop Surface • 3D Desk Plane
                </div>
              </div>
            </div>
          )}

          {/* AR HUD OVERLAYS */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/80" />

          {/* Viewfinder Target Brackets (Camera AR HUD) */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400/80 pointer-events-none rounded-tl-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400/80 pointer-events-none rounded-tr-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400/80 pointer-events-none rounded-bl-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400/80 pointer-events-none rounded-br-sm shadow-[0_0_10px_rgba(16,185,129,0.5)]" />

          {/* Horizon Line / Leveling Indicator */}
          <div className="absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none flex items-center justify-between">
            <span className="text-[9px] font-mono text-emerald-400/60 -mt-4 bg-slate-950/70 px-1.5 py-0.5 rounded border border-emerald-500/20">📐 ميل 45°</span>
            <span className="text-[9px] font-mono text-emerald-400/60 -mt-4 bg-slate-950/70 px-1.5 py-0.5 rounded border border-emerald-500/20">رصد السطح المستوي ✓</span>
          </div>

          {/* Top Floating Controls Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-emerald-500/40 text-xs text-white">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-300">
                {isVirtualDeskMode ? 'سطح المكتب الافتراضي 🖥️' : 'كاميرا الواقع المعزز 📱'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                حرف ({selectedLetter.letter}) - {selectedLetter.word}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-slate-800">
              {/* Toggle Virtual Desk vs Camera */}
              <button
                onClick={() => {
                  if (isVirtualDeskMode) {
                    startArCamera();
                  } else {
                    setIsVirtualDeskMode(true);
                    if (onNotify) onNotify('تم التبديل إلى سطح المكتب الافتراضي 🖥️', 'info');
                  }
                }}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isVirtualDeskMode
                    ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={isVirtualDeskMode ? 'تشغيل كاميرا الهاتف الحقيقية' : 'التبديل لسطح المكتب الافتراضي'}
              >
                {isVirtualDeskMode ? <Camera className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              </button>

              {/* Instructions Tooltip Button */}
              <button
                onClick={() => setShowInstructionsModal(true)}
                className="p-2 rounded-xl text-amber-300 hover:bg-slate-800 transition"
                title="إرشادات توجيه الكاميرا"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Flip camera */}
              <button
                onClick={toggleCameraFacing}
                className="p-2 rounded-xl text-cyan-300 hover:bg-slate-800 transition"
                title="تبديل الكاميرا الخلفية / الأمامية"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Sound prompt */}
              <button
                onClick={() => handlePlayRoarOrSound(selectedLetter)}
                className="p-2 rounded-xl text-emerald-300 hover:bg-slate-800 transition"
                title="نطق صوت الحرف"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Rotate model */}
              <button
                onClick={() => {
                  synth.playPop();
                  setModelRotationY((prev) => (prev + 45) % 360);
                }}
                className="p-2 rounded-xl text-indigo-300 hover:bg-slate-800 transition"
                title="تدوير المجسم 45 درجة"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Scale Zoom In */}
              <button
                onClick={() => {
                  synth.playPop();
                  setModelScale((prev) => Math.min(2.0, prev + 0.15));
                }}
                className="p-2 rounded-xl text-amber-300 hover:bg-slate-800 transition"
                title="تكبير المجسم"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Scale Zoom Out */}
              <button
                onClick={() => {
                  synth.playPop();
                  setModelScale((prev) => Math.max(0.6, prev - 0.15));
                }}
                className="p-2 rounded-xl text-amber-300 hover:bg-slate-800 transition"
                title="تصغير المجسم"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Close AR */}
              <button
                onClick={stopArCamera}
                className="p-2 rounded-xl text-rose-300 hover:bg-rose-500/20 transition"
                title="إغلاق الواقع المعزز"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Tap Plane for surface detection */}
          <div
            onClick={handleArSurfaceTap}
            onTouchStart={handleArSurfaceTap}
            className="absolute inset-0 z-10 cursor-crosshair flex items-center justify-center"
          >
            {/* 1. If NOT placed yet: SCANNING DESK RETICLE */}
            {!isPlacedOnSurface ? (
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none animate-pulse">
                {/* 3D Perspective Reticle simulating a tabletop plane */}
                <div
                  className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-dashed border-emerald-400/80 flex items-center justify-center relative shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                  style={{
                    transform: 'perspective(500px) rotateX(60deg)',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
                  }}
                >
                  <div className="w-24 h-24 rounded-full border-2 border-emerald-300 animate-ping opacity-60" />
                  <div className="w-4 h-4 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 divide-x divide-y divide-emerald-400/20 rounded-full" />
                </div>

                <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-400/50 text-center space-y-1 max-w-sm">
                  <p className="text-xs sm:text-sm font-black text-emerald-300 flex items-center justify-center gap-1.5">
                    <span>📱</span>
                    <span>وجّه الكاميرا نحو سطح الطاولة ثم انقر لتثبيت المجسم</span>
                  </p>
                  <span className="text-[11px] text-slate-300 block">
                    سيظهر مجسم حرف ({selectedLetter.letter}) و{selectedLetter.word} {selectedLetter.emoji} مباشرة فوق مكتبك!
                  </span>
                </div>
              </div>
            ) : (
              /* 2. PLACED 3D HOLOGRAPHIC MODEL ANCHORED ON TABLETOP */
              <div
                className="absolute transition-all duration-300 pointer-events-auto cursor-grab active:cursor-grabbing"
                style={{
                  top: `${surfacePosition.y}%`,
                  left: `${surfacePosition.x}%`,
                  transform: `translate(-50%, -50%) scale(${modelScale})`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayRoarOrSound(selectedLetter);
                }}
              >
                {/* Projected 3D Perspective Shadow on the Desk Surface */}
                <div
                  className="w-40 h-20 rounded-full bg-black/60 blur-md mx-auto -mb-6 transition-all"
                  style={{
                    transform: 'perspective(400px) rotateX(75deg)',
                  }}
                />

                {/* 3D Holographic Card & Animal Character */}
                <div
                  className="flex flex-col items-center justify-center space-y-2 animate-bounce select-none"
                  style={{
                    transform: `rotateY(${modelRotationY}deg)`,
                    transition: 'transform 0.3s ease-out',
                  }}
                >
                  {/* Floating Diacritics Chips */}
                  <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/50 shadow-xl">
                    <span className="text-xs font-black text-amber-300">{selectedLetter.diacritics.fatha.text} (فَتْحة)</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-black text-amber-300">{selectedLetter.diacritics.damma.text} (ضَمّة)</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-black text-amber-300">{selectedLetter.diacritics.kasra.text} (كَسْرة)</span>
                  </div>

                  {/* Floating Letter Crown */}
                  <span
                    className={`text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b ${selectedLetter.themeGradient} filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]`}
                  >
                    {selectedLetter.letter}
                  </span>

                  {/* 3D Animal Entity */}
                  <div className="relative group">
                    <span className="text-7xl sm:text-8xl filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] block transition-transform group-hover:scale-110">
                      {selectedLetter.emoji}
                    </span>
                    <span className="absolute -bottom-2 -right-2 text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black shadow-md">
                      {selectedLetter.word}
                    </span>
                  </div>

                  {/* Tabletop Audio Badge */}
                  <div className="px-3.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-400/40 text-[11px] text-emerald-300 font-black shadow-lg flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>انقر للاستماع للنطق والتفاعل 🔊</span>
                  </div>
                </div>

                {/* Relocate Pin Hint */}
                <div className="text-center mt-2">
                  <span className="text-[9px] text-slate-300 bg-black/70 px-2.5 py-1 rounded-full border border-white/10">
                    انقر في أي مكان آخر على الطاولة لنقل المجسم 📍
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Guidance Status Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>
                {isPlacedOnSurface
                  ? `المجسم مثبت فوق سطح مكتبك! اسحب أو انقر لتغيير موقعه.`
                  : 'جاري مسح أبعاد السطح.. وجّه الكاميرا نحو سطح مستوٍ.'}
              </span>
            </div>

            <button
              onClick={() => setIsPlacedOnSurface(false)}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs text-white font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة مسح السطح</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INSTRUCTIONS MODAL: HOW TO AIM CAMERA AT DESK */}
      {/* ------------------------------------------------------------- */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-emerald-500/50 p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    تعليمات تشغيل الواقع المعزز فوق سطح المكتب 🥽
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    اتبع هذه الخطوات البسيطة لرؤية الحرف يطفو فوق طاولتك!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInstructionsModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-white block font-black">وجّه الكاميرا نحو سطح المكتب:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    اختر طاولة أو مكتباً مستوياً وواضح المعالم، واجعل الهاتف يميل بزاوية 45 درجة تقريباً نحوه.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-white block font-black">حرّك الهاتف ببطء لاكتشاف السطح:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    حرّك الهاتف برفق يميناً ويساراً؛ ستظهر لك دائرة خضراء شبكية ترصد المستوى الأفقي للطاولة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-white block font-black">انقر على السطح لتثبيت المجسم:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    بمجرد النقر فوق سطح الطاولة، سيهبط مجسم الحرف والكائن (مثل الأسد أو البطة) مع ظله الواقعي!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-white block font-black">التفاعل الصوتي والتدوير:</strong>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    المس المجسم المثبت لسماع صوته ونطقه مع الحركات، واستخدم أدوات التدوير والتكبير بكل سهولة.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
              >
                فهمت، ابدأ المغامرة الآن 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THE 5 INTERACTIVE 3D CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>اختر حرفاً لفتح بطاقته المجسمة ثلاثية الأبعاد:</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">5 حروف أساسية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FIRST_FIVE_LETTERS.map((item) => {
            const isSelected = selectedLetter.id === item.id;
            const tilt = tiltAngles[item.id] || { x: 0, y: 0 };

            return (
              <div
                key={item.id}
                onMouseMove={(e) => handleCardMouseMove(e, item.id)}
                onMouseLeave={() => handleCardMouseLeave(item.id)}
                onClick={() => handleSelectLetter(item)}
                className={`relative aspect-[3/4] rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 border-2 select-none overflow-hidden shadow-xl ${
                  isSelected
                    ? `border-white ring-4 ring-amber-400/30 scale-[1.03] shadow-2xl`
                    : `${item.accentBorder} bg-slate-900/80 hover:bg-slate-850 hover:scale-[1.01]`
                }`}
                style={{
                  perspective: '1000px',
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  background: isSelected
                    ? `linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))`
                    : undefined,
                }}
              >
                {/* Glow accent */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${item.glowColor}, transparent 70%)`,
                  }}
                />

                {/* Top Bar of Card */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950/80 text-white border border-white/20">
                    {item.name}
                  </span>
                  <span className="text-2xl filter drop-shadow animate-bounce">
                    {item.emoji}
                  </span>
                </div>

                {/* Center 3D Letter Symbol */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-2">
                  <span
                    className={`text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b ${item.themeGradient} filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]`}
                  >
                    {item.letter}
                  </span>
                  <div className="text-center">
                    <h4 className="text-lg font-black text-white">{item.word}</h4>
                    <p className="text-[11px] text-amber-300 font-bold">{item.pronunciationLead}</p>
                  </div>
                </div>

                {/* Bottom Bar: Action hint */}
                <div className="relative z-10 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-[10px] text-center text-slate-300">
                  <span className="text-amber-400 font-bold">المس للمجسم والصوت 🎙️</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED 3D INTERACTIVE STAGE FOR SELECTED LETTER */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${selectedLetter.themeGradient} p-1 shadow-2xl flex items-center justify-center border-2 border-white/50`}
            >
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-3xl">
                {selectedLetter.emoji}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>حرف {selectedLetter.name} ({selectedLetter.letter})</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {selectedLetter.word}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">{selectedLetter.badge}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => (isArActive ? stopArCamera() : startArCamera())}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{isArActive ? 'إيقاف الواقع المعزز' : 'تفعيل الواقع المعزز'}</span>
            </button>

            <button
              onClick={() => handlePlayRoarOrSound(selectedLetter)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>استمع لمحاكاة الصوت ({selectedLetter.pronunciationLead})</span>
            </button>

            <button
              onClick={handleAwardStar}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>أتقنت الحرف (+3 نجوم ⭐)</span>
            </button>
          </div>
        </div>

        {/* 3 STAGES TABS */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'recognition' as const, label: 'المجسم ثلاثي الأبعاد 3D', icon: Layers },
            { id: 'phonetics' as const, label: 'الأصوات بالحركات (فَتْحَة، ضَمَّة، كَسْرَة)', icon: Music },
            { id: 'dialogue' as const, label: 'نص التوجيه الصوتي والسيناريو', icon: Sparkles },
          ].map((tab) => {
            const isActive = activeStage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveStage(tab.id);
                  synth.playPop();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition border ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-md font-black'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* STAGE 1: 3D HOLOGRAPHIC SIMULATION */}
        {activeStage === 'recognition' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* The 3D Rotating Stage (7 Cols) */}
            <div className="md:col-span-7 aspect-video rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900 border-2 border-indigo-500/30 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
              {/* Circular light halo */}
              <div className="w-48 h-48 rounded-full bg-amber-500/10 blur-2xl absolute animate-pulse" />

              <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                <span className="text-8xl sm:text-9xl filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110">
                  {selectedLetter.emoji}
                </span>
                <span
                  className={`text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b ${selectedLetter.themeGradient}`}
                >
                  حرف ({selectedLetter.letter})
                </span>
                <p className="text-xs text-cyan-300 font-mono">
                  {selectedLetter.soundEffectsDesc}
                </p>
              </div>

              <div className="absolute bottom-3 text-[10px] text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                🔄 دوران ثلاثي الأبعاد بزوايا حرة عند تحريك المؤشر
              </div>
            </div>

            {/* Stage Description & Fun Fact (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">وصف المجسم ثلاثي الأبعاد:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedLetter.threeDDescription}
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 block">💡 معلومة ذكية للأبطال:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedLetter.funFact}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: PHONETICS & DIACRITICS */}
        {activeStage === 'phonetics' && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white">
              أصوات حرف ({selectedLetter.letter}) مع الحركات الثلاث الأساسية:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  title: 'الْفَتْحَة (نفتح فمنا)',
                  symbol: selectedLetter.diacritics.fatha.text,
                  desc: selectedLetter.diacritics.fatha.example,
                  color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
                  soundText: `${selectedLetter.diacritics.fatha.text}.. ${selectedLetter.diacritics.fatha.example}`,
                },
                {
                  title: 'الضَّمَّة (نضم شفتينا)',
                  symbol: selectedLetter.diacritics.damma.text,
                  desc: selectedLetter.diacritics.damma.example,
                  color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-cyan-300',
                  soundText: `${selectedLetter.diacritics.damma.text}.. ${selectedLetter.diacritics.damma.example}`,
                },
                {
                  title: 'الْكَسْرَة (نبتسم بلطف)',
                  symbol: selectedLetter.diacritics.kasra.text,
                  desc: selectedLetter.diacritics.kasra.example,
                  color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
                  soundText: `${selectedLetter.diacritics.kasra.text}.. ${selectedLetter.diacritics.kasra.example}`,
                },
              ].map((d, dIdx) => (
                <div
                  key={dIdx}
                  onClick={() => {
                    synth.playSparkle();
                    speakDialogue(d.soundText);
                  }}
                  className={`p-5 rounded-3xl bg-gradient-to-b ${d.color} border flex flex-col items-center justify-between text-center space-y-3 cursor-pointer hover:scale-105 transition-all shadow-lg active:scale-95`}
                >
                  <span className="text-xs font-bold opacity-80">{d.title}</span>
                  <span className="text-6xl font-black">{d.symbol}</span>
                  <span className="text-xs font-bold text-white bg-slate-950/60 px-3 py-1 rounded-xl">
                    {d.desc}
                  </span>
                  <button className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>انقر للاستماع للنطق</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: SCRIPT & DIALOGUE SIMULATION */}
        {activeStage === 'dialogue' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>نص التوجيه الصوتي التربوي المقترح في جلسة DeepSeek-R1:</span>
                </span>
                <button
                  onClick={() => speakDialogue(selectedLetter.audioDialogue)}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>قراءة النص بصوت المساعد</span>
                </button>
              </div>

              <blockquote className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                &quot;{selectedLetter.audioDialogue}&quot;
              </blockquote>

              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
                <span>💬</span>
                <span>{selectedLetter.characterGreeting}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Download,
  CloudUpload,
  Check,
  Layers,
  Wand2,
  Ratio,
  Sliders,
  ExternalLink,
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Video,
  Clapperboard,
  Tv,
  Camera,
  Compass,
} from 'lucide-react';
import { uploadImageToDrive, uploadTextFileToDrive } from '../services/googleDriveService';
import { saveVideoRecord, auth } from '../services/firestoreService';
import { SocialShareBar } from './SocialShareBar';

interface GenerationViewProps {
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

interface VideoScene {
  sceneNumber: number;
  durationSeconds: number;
  title: string;
  visualDescription: string;
  cameraMovement: string;
  lighting: string;
  narration: string;
  soundEffects: string;
  accentColor: string;
}

interface VideoData {
  title: string;
  summary: string;
  model: string;
  aspectRatio: string;
  totalDurationSeconds: number;
  scenes: VideoScene[];
}

export const GenerationView: React.FC<GenerationViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('video');

  // --- Image Studio State ---
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [style, setStyle] = useState('photorealistic');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string>('');

  // --- Video Studio State (Veo 3) ---
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'1080p' | '720p'>('1080p');
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [videoDuration, setVideoDuration] = useState(8);
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoData | null>(null);

  // Video Player Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const playbackTimerRef = useRef<any>(null);

  const sampleImagePrompts = [
    {
      label: 'مجسم بروتين ثلاثي الأبعاد',
      text: 'تصميم ثلاثي الأبعاد مجسم وفائق الواقعية لجزيء بروتين حيوي معقد محاط بتوهج حيوي أزرق داخل مختبر مستقبلي بتقنية النانو',
      size: '4K' as const,
      ratio: '1:1' as const,
      style: 'molecular-render',
    },
    {
      label: 'برج أبحاث الذكاء الاصطناعي A.W.H',
      text: 'مبنى معماري مستقبلي شاهق يحمل شعار A.W.H يرتفع في مدينة ذكية حديثة ليلاً، مع إضاءات نيون انسيابية وحدائق معلقة',
      size: '2K' as const,
      ratio: '16:9' as const,
      style: 'architectural',
    },
  ];

  const sampleVideoPrompts = [
    {
      label: 'رائد فضاء يستكشف آثار بابل بتقنية الهولوغرام',
      text: 'مشهد سينمائي ملحمي 4K لرائد فضاء يرتدي بذلة استكشافية متطورة، يتجول بين بوابات بابل الأثرية المضاءة بهولوغرام ذهبي متلألئ في سماء ليلية مرصعة بالنجوم، مع حركة كاميرا بطيئة وديناميكية.',
      ratio: '16:9' as const,
      style: 'cinematic',
      duration: 8,
    },
    {
      label: 'رحلة كبسولة نانوية داخل خلية حية',
      text: 'رحلة مجهرية سينمائية فائقة الخيال العلمي لكبسولة طبية مضيئة تبحر داخل خلية حية وتقوم بفحص وإصلاح الحمض النووي DNA بتوهج فسفوري أزرق وأخضر، مع تفاصيل ميكروسكوبية سينمائية.',
      ratio: '16:9' as const,
      style: 'scifi',
      duration: 8,
    },
    {
      label: 'انطلاق قطار مغناطيسي مستقبلي عبر بغداد',
      text: 'لقطة طائرة درون بانورامية لقطار فائق السرعة يعبر جسراً معلقاً فوق نهر دجلة في بغداد عام 2050، مع ناطحات سحاب زجاجية وطاقة شمسية وشفق الغروب الساحر.',
      ratio: '9:16' as const,
      style: 'futuristic',
      duration: 8,
    },
  ];

  // Speech narration helper
  const speakSceneNarration = (text: string) => {
    try {
      if (!isAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech narration error:', e);
    }
  };

  // Video Playback Engine Loop
  useEffect(() => {
    if (!isPlaying || !generatedVideo || generatedVideo.scenes.length === 0) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      return;
    }

    const currentScene = generatedVideo.scenes[currentSceneIdx];
    const durationMs = (currentScene?.durationSeconds || 3) * 1000;
    const intervalMs = 100;
    const stepIncrement = (intervalMs / durationMs) * 100;

    // Speak narration at start of scene
    if (sceneProgress === 0 && currentScene?.narration) {
      speakSceneNarration(currentScene.narration);
    }

    playbackTimerRef.current = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          // Advance to next scene or loop
          setCurrentSceneIdx((sceneIdx) => {
            const nextIdx = (sceneIdx + 1) % generatedVideo.scenes.length;
            if (nextIdx === 0) {
              setIsPlaying(false);
              return 0;
            }
            return nextIdx;
          });
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalMs);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, currentSceneIdx, generatedVideo, isAudioEnabled]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      onNotify('يرجى إدخال وصف الصورة المراد توليدها', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio,
          style,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشل توليد الصورة';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setActivePrompt(data.prompt || prompt);
      onNotify(`تم توليد العمل البصري بنجاح!`, 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء توليد الصورة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      onNotify('يرجى إدخال النص لتحويله إلى فيديو سينمائي', 'error');
      return;
    }

    setVideoLoading(true);
    setIsPlaying(false);
    setCurrentSceneIdx(0);
    setSceneProgress(0);

    try {
      const response = await fetch('/api/gemini/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoRatio,
          resolution: videoResolution,
          style: videoStyle,
          durationSeconds: videoDuration,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشل تحويل النص إلى فيديو';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data.videoData) {
        setGeneratedVideo(data.videoData);
        setIsPlaying(true);
        
        // Save to Firestore
        try {
          await saveVideoRecord({
            userId: auth.currentUser?.uid || 'guest_student',
            title: data.videoData.title || 'فيديو جديد',
            summary: data.videoData.summary || '',
            prompt: videoPrompt,
            videoData: data.videoData,
            createdAt: new Date().toISOString(),
          });
        } catch (saveErr) {
          console.error('Failed to save video record:', saveErr);
        }
        
        onNotify(`تم تحويل النص إلى فيديو سينمائي عبر محرك Veo 3 بنجاح!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء توليد الفيديو', 'error');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `AWH_Gen_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify('جاري تنزيل الصورة إلى جهازك', 'info');
  };

  const handleDownloadVideoScript = () => {
    if (!generatedVideo) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedVideo, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `AWH_Veo3_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify('تم تنزيل سيناريو ومخطط المشاهد السينمائي', 'info');
  };

  const handleSaveToDrive = () => {
    if (!generatedImage) return;
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const fileName = `AWH_Artwork_${Date.now()}.png`;
    onRequestDriveConfirmation({
      title: 'حفظ الصورة المولدة في Google Drive',
      message: 'هل أنت متأكد من رغبتك في رفع وحفظ هذه الصورة في حساب Google Drive الخاص بك؟',
      itemDetails: `اسم الملف: ${fileName}\nالدقة: ${imageSize}`,
      onConfirm: async () => {
        const res = await uploadImageToDrive({
          name: fileName,
          base64DataUrl: generatedImage,
          description: `Generated image by A.W.H AI Studio - Prompt: ${prompt.slice(0, 100)}`,
        });
        onNotify(`تم حفظ الصورة بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  const currentScene = generatedVideo?.scenes[currentSceneIdx];

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Title & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-purple-400" />
            <span>استوديو التوليد البصري والسينمائي (Visual & Veo 3 Video Studio)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            تحويل النصوص إلى فيديوهات سينمائية متحركة بنموذج <span className="font-semibold text-purple-400">Veo 3</span> وتوليد صور فائقة الجودة.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>تحويل النص إلى فيديو (Veo 3)</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>استوديو الصور (Image Studio)</span>
          </button>
        </div>
      </div>

      {activeTab === 'video' ? (
        /* Video Studio (Veo 3) */
        <div className="space-y-6">
          {/* Preset Inspirations for Video */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              أفكار سينمائية ملهمة لتحويل النص إلى فيديو:
            </span>
            {sampleVideoPrompts.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setVideoPrompt(preset.text);
                  setVideoRatio(preset.ratio);
                  setVideoStyle(preset.style);
                  setVideoDuration(preset.duration);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Video Generation Controls */}
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span>اكتب النص أو فكرة الفيديو المراد تحويله (Text-to-Video Prompt):</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">{videoPrompt.length} حرف</span>
              </div>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="اكتب وصفاً سينمائياً للمشهد، حركة الكاميرا، الشخصيات، والإضاءة المطلوبة لتحويلها إلى فيديو..."
                rows={4}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition leading-relaxed"
              />
            </div>

            {/* Video Settings: Ratio, Resolution, Style, Duration */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">أبعاد المشهد (Ratio):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setVideoRatio('16:9')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      videoRatio === '16:9'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    16:9 شاشة سينمائية
                  </button>
                  <button
                    onClick={() => setVideoRatio('9:16')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      videoRatio === '9:16'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    9:16 ستوري / تيك توك
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">دقة الفيديو:</label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="1080p">1080p Full HD فائق الوضوح</option>
                  <option value="720p">720p HD قياسي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">النمط الإخراجي:</label>
                <select
                  value={videoStyle}
                  onChange={(e) => setVideoStyle(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="cinematic">سينمائي واقعي (Cinematic 4K)</option>
                  <option value="scifi">خيال علمي ومستقبلي (Cyberpunk)</option>
                  <option value="animation">رسوم متحركة ثلاثية الأبعاد (3D Animation)</option>
                  <option value="documentary">وثائقي تاريخي (Historical Doc)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">مدة الفيديو التقديرية:</label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(parseInt(e.target.value, 10))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value={6}>6 ثوانٍ (مشهد موجز)</option>
                  <option value={8}>8 ثوانٍ (مشهد كامل متتابع)</option>
                  <option value={12}>12 ثانية (تسلسل ملحمي)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-purple-400" />
                <span>محرك Veo 3 مع محاكاة إخراج المشاهد والحركة والتعليق الصوتي.</span>
              </span>

              <button
                onClick={handleGenerateVideo}
                disabled={videoLoading || !videoPrompt.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition active:scale-95"
              >
                {videoLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري إخراج المشاهد والتحويل بالفيديو...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>توليد الفيديو السينمائي (Veo 3)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Video Player View */}
          {generatedVideo && currentScene && (
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Film className="w-5 h-5 text-purple-400" />
                    <span>{generatedVideo.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{generatedVideo.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`p-2 rounded-xl border text-xs transition ${
                      isAudioEnabled
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    title={isAudioEnabled ? 'التعليق الصوتي مفعّل' : 'التعليق الصوتي مكتوم'}
                  >
                    {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownloadVideoScript}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل السيناريو</span>
                  </button>
                </div>
              </div>

              {/* Cinematic Video Player Screen */}
              <div className={`relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex flex-col justify-between ${
                videoRatio === '9:16' ? 'max-w-xs mx-auto aspect-[9/16]' : 'aspect-video'
              }`}>
                {/* Visual Animated Scene Background */}
                <div
                  className="absolute inset-0 transition-all duration-1000 flex items-center justify-center p-6 text-center"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, rgba(88, 28, 135, 0.45) 0%, rgba(15, 23, 42, 0.95) 85%)`,
                  }}
                >
                  {/* Dynamic Motion Graphic Elements */}
                  <div
                    className="w-full max-w-lg transition-transform duration-1000 ease-out space-y-4"
                    style={{
                      transform: isPlaying ? 'scale(1.04) translateY(-4px)' : 'scale(1)',
                    }}
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{currentScene.cameraMovement}</span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-md">
                      {currentScene.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto line-clamp-3">
                      {currentScene.visualDescription}
                    </p>

                    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-amber-300 font-mono">
                      <Compass className="w-3.5 h-3.5" />
                      <span>إضاءة: {currentScene.lighting}</span>
                    </div>
                  </div>
                </div>

                {/* Subtitles Overlay Bar (Cinematic Subtitles) */}
                <div className="relative z-10 p-4 mt-auto">
                  <div className="bg-black/75 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center max-w-xl mx-auto shadow-xl">
                    <span className="text-xs font-medium text-amber-300 block mb-0.5 font-mono">
                      [المشهد {currentScene.sceneNumber} من {generatedVideo.scenes.length}]
                    </span>
                    <p className="text-sm font-semibold text-white drop-shadow">
                      "{currentScene.narration}"
                    </p>
                  </div>
                </div>

                {/* Top Video Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono border border-white/10">
                    Veo 3 • {videoResolution}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-purple-600/80 text-white text-[10px] font-bold">
                    {currentScene.soundEffects}
                  </span>
                </div>
              </div>

              {/* Video Timeline & Controls */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                {/* Scene progress bars */}
                <div className="grid grid-cols-3 gap-2">
                  {generatedVideo.scenes.map((sc, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-100"
                          style={{
                            width:
                              idx < currentSceneIdx
                                ? '100%'
                                : idx === currentSceneIdx
                                ? `${sceneProgress}%`
                                : '0%',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate text-center">
                        مشهد {sc.sceneNumber} ({sc.durationSeconds}s)
                      </span>
                    </div>
                  ))}
                </div>

                {/* Player Controls Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentSceneIdx(0);
                        setSceneProgress(0);
                        setIsPlaying(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="إعادة التشغيل من البداية"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scene selector pills */}
                  <div className="flex items-center gap-1.5">
                    {generatedVideo.scenes.map((sc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentSceneIdx(idx);
                          setSceneProgress(0);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs transition ${
                          idx === currentSceneIdx
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sc.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Studio */
        <div className="space-y-6">
          {/* Preset Inspirations */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              أفكار للإلهام السريع:
            </span>
            {sampleImagePrompts.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(preset.text);
                  setImageSize(preset.size);
                  setAspectRatio(preset.ratio);
                  setStyle(preset.style);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Prompt Input Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">وصف الصورة المطلوبة بالتفصيل:</label>
                <span className="text-[11px] text-slate-500 font-mono">{prompt.length} حرف</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتب وصفاً دقيقاً للمشهد، الألوان، الإضاءة، والبيئة..."
                rows={4}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleGenerateImage}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-900/30 transition active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري التوليد الفائق...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد الصورة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Image Result */}
          {generatedImage && (
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>العمل البصري المولد</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل</span>
                  </button>
                  <button
                    onClick={handleSaveToDrive}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-md"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>حفظ في Google Drive</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center bg-slate-950 p-2">
                <img
                  src={generatedImage}
                  alt={activePrompt}
                  className="max-h-[500px] w-auto rounded-lg object-contain shadow-2xl"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

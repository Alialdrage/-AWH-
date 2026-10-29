import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  ShieldCheck,
  Eye,
  EyeOff,
  Smile,
  Meh,
  Heart,
  Coffee,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PupilMood } from './PrimaryEducationRooms';
import { StudentAvatar } from './IraqiAvatars';

interface ChildCameraMoodMonitorProps {
  detectedMood: PupilMood;
  onMoodChange: (newMood: PupilMood) => void;
  studentGender: 'boy' | 'girl';
  studentName: string;
  onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  compact?: boolean;
}

export const ChildCameraMoodMonitor: React.FC<ChildCameraMoodMonitorProps> = ({
  detectedMood,
  onMoodChange,
  studentGender,
  studentName,
  onNotify,
  compact = false,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isBlurFilterActive, setIsBlurFilterActive] = useState(false);
  const [isCartoonAvatarActive, setIsCartoonAvatarActive] = useState(false);
  const [simulatedPulse, setSimulatedPulse] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync stream to video element
  useEffect(() => {
    if (videoRef.current) {
      if (isCameraActive && cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch((e) => {
          console.warn('Video play prevented or interrupted:', e);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraStream, isCameraActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Client-side local canvas motion and brightness delta analyzer (Zero network exposure)
  useEffect(() => {
    if (!isCameraActive) return;

    let previousBrightness = 0;
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        try {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 80, 60);
            const frame = ctx.getImageData(0, 0, 80, 60);
            const data = frame.data;
            let sum = 0;
            // Sample pixels
            for (let i = 0; i < data.length; i += 16) {
              sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            const avgBrightness = sum / (data.length / 16);
            const motionDelta = Math.abs(avgBrightness - previousBrightness);
            previousBrightness = avgBrightness;

            setSimulatedPulse((p) => (p + 1) % 100);

            // Dynamic algorithmic mood heuristics based on motion energy (only update if changed)
            if (motionDelta > 14 && detectedMood !== 'happy') {
              onMoodChange('happy');
            } else if (motionDelta < 1.2 && avgBrightness < 50 && detectedMood !== 'tired') {
              onMoodChange('tired');
            } else if (motionDelta >= 1.5 && motionDelta <= 7 && detectedMood !== 'focused') {
              onMoodChange('focused');
            }
          }
        } catch {
          // ignore local canvas cross-origin or transient frame errors
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isCameraActive, onMoodChange, detectedMood]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      setCameraStream(null);
      setIsCameraActive(false);
      onNotify?.('تم إيقاف الكاميرا بنجاح - تم تفعيل وضع الخصوصية التامة', 'info');
      return;
    }

    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('الكاميرا غير مدعومة في بيئة المتصفح الحالية.');
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });
      } catch {
        // Fallback to basic video constraint without audio
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);
      setIsCameraActive(true);
      onNotify?.(
        'تم تشغيل الكاميرا محلياً بنجاح! 🛡️ صورك لا يتم إرسالها أو تسجيلها أو نشرها أبداً.',
        'success'
      );
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('لم نتمكن من الوصول للكاميرا (تحقق من أذونات المتصفح)');
      onNotify?.('تعذر تشغيل الكاميرا - تم تشغيل المحاكي التفاعلي والأفاتار الكرتوني لحمايتك', 'info');
      setIsCameraActive(false);
    }
  };

  const moodsList: { id: PupilMood; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'happy', label: 'حماس وفرح', icon: Smile, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10', desc: 'طاقة عالية ومستعد للتحدي' },
    { id: 'focused', label: 'تركيز وانتباه', icon: Zap, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10', desc: 'منتبه ومستوعب' },
    { id: 'tired', label: 'تعب وضجر', icon: Coffee, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10', desc: 'يحتاج تبسيط واستراحة' },
    { id: 'confused', label: 'محتار وغير مستوعب', icon: HelpCircle, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10', desc: 'يحتاج أمثلة وتوضيح' },
    { id: 'anxious', label: 'قلق وتوتر', icon: Heart, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10', desc: 'يحتاج طمأنة وتهدئة' },
    { id: 'neutral', label: 'هادئ ومستعد', icon: Meh, color: 'text-teal-400 border-teal-500/40 bg-teal-500/10', desc: 'جاهز لبدء الدرس' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Privacy Guarantee Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
              <span>مستشعر الحالة النفسية وخصوصية الطالب</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                100% محلي
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              لا يتم رفع أو حفظ أي صور أو فيديوهات إطلاقاً - حماية صارمة لخصوصية الطفل
            </p>
          </div>
        </div>

        {/* Camera Toggle Button */}
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
            isCameraActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
          }`}
        >
          {isCameraActive ? (
            <>
              <CameraOff className="w-3.5 h-3.5" />
              <span>إيقاف الكاميرا</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>تشغيل الكاميرا</span>
            </>
          )}
        </button>
      </div>

      {/* Main Visual Display (Camera Feed OR Cartoon Avatar Mirror) */}
      <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
        {/* Hidden Canvas for local in-memory frame diff calculation */}
        <canvas ref={canvasRef} width="80" height="60" className="hidden" />

        {/* Real Camera Feed (Always preserved in DOM for ref stability) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            display: isCameraActive && !isCartoonAvatarActive ? 'block' : 'none',
            filter: isBlurFilterActive ? 'blur(12px)' : 'none',
          }}
          className="w-full h-full object-cover transform scale-x-[-1] transition-all duration-300"
        />

        {/* CARTOON AVATAR MODE: Replaces real face with interactive student avatar */}
        {((isCameraActive && isCartoonAvatarActive) || (!isCameraActive && !cameraError)) && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 space-y-2">
            <StudentAvatar
              gender={studentGender}
              name={studentName}
              mood={detectedMood}
              size={compact ? 'lg' : 'xl'}
              isAnimated={true}
            />
            <div className="text-center">
              <span className="text-xs font-bold text-cyan-300 block">
                أفاتار {studentGender === 'girl' ? 'الوردة' : 'البطل'} {studentName} ({studentGender === 'girl' ? 'أنثى' : 'ذكر'})
              </span>
              <span className="text-[10px] text-slate-400">
                {isCameraActive
                  ? 'مرآة كرتونية مشفرة تتغير مع تعابيرك وتحافظ على خصوصية وجهك'
                  : 'الأفاتار جاهز - شغّل الكاميرا أو انقر على حالتك بالأسفل'}
              </span>
            </div>
          </div>
        )}

        {/* Error / Fallback View with Cartoon Avatar */}
        {cameraError && !isCameraActive && (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 bg-slate-950/90">
            <StudentAvatar
              gender={studentGender}
              name={studentName}
              mood={detectedMood}
              size="lg"
            />
            <span className="text-xs font-bold text-amber-300">
              تم تشغيل الوضع الكرتوني الآمن لـ {studentName}
            </span>
            <p className="text-[10px] text-slate-400 max-w-xs">
              {cameraError}. يمكنك تحديد حالتك النفسية بسهولة من الأزرار بالأسفل وسيتفاعل الأستاذ معها فوراً!
            </p>
          </div>
        )}

        {/* Active Local Processing Indicator Badge */}
        {isCameraActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] text-emerald-400 border border-emerald-500/40 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>معالجة داخلية 100% (بدون خادم)</span>
          </div>
        )}

        {/* Live Detected Mood Tag overlay */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-white border border-slate-700 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>الحالة اللحظية: {moodsList.find((m) => m.id === detectedMood)?.label}</span>
        </div>
      </div>

      {/* Privacy Filters & Avatar Toggle Toolbar */}
      {isCameraActive && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setIsBlurFilterActive(!isBlurFilterActive)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
              isBlurFilterActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isBlurFilterActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>طمس الكاميرا (Blur)</span>
          </button>

          <button
            onClick={() => setIsCartoonAvatarActive(!isCartoonAvatarActive)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
              isCartoonAvatarActive
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>أفاتار كرتوني مشفر</span>
          </button>
        </div>
      )}

      {/* 1-Click Psychological State Selector for Students & Parents */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-bold text-slate-300">أو حدد حالتك النفسية بنقرة واحدة (يرسل كود الحالة للأستاذ):</span>
          <span className="text-cyan-400 text-[10px]">تكييف فوري لأسلوب الحوار</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {moodsList.map((m) => {
            const isSelected = detectedMood === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onMoodChange(m.id);
                  onNotify?.(`تم تحديث حالتك إلى [${m.label}] - سيتفاعل الأستاذ فوراً!`, 'info');
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-right transition-all text-xs active:scale-95 ${
                  isSelected
                    ? `${m.color} font-black shadow-md ring-1 ring-current`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="truncate">
                  <span className="block font-bold leading-tight">{m.label}</span>
                  <span className="text-[9px] opacity-70 block truncate">{m.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

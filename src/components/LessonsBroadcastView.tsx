/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lessons & Lectures Live Broadcast View for A.W.H Platform
 * قسم بث الدروس والمحاضرات الأكاديمية الحية
 * 
 * Featuring:
 * - Real-time Multi-source Live Video Player (Webcam, Screen Share, YouTube / MP4 stream, Interactive Studio)
 * - Teacher Broadcast Studio with instant Camera & Screen Sharing
 * - Interactive Lecture Chat, Pinned Announcements, & Floating Reactions (❤️, 👏, 💡, 🔥, ⭐)
 * - Fullscreen, volume controls, audio wave visualization, & elapsed lecture timer
 * - Seamless bridge to Private 1-on-1 Tutor View
 */

import { requestCameraStream, describeMediaError, watchStreamEnded } from '../utils/mediaAccess';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff,
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  School, 
  BookOpen, 
  ArrowRight,
  PlayCircle,
  Tv,
  Sparkles,
  LayoutGrid,
  List,
  PlusCircle,
  X,
  Crown,
  Camera,
  CameraOff,
  Monitor,
  Mic,
  MicOff,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Flame,
  Heart,
  Share2,
  HelpCircle,
  Pin,
  ExternalLink
} from 'lucide-react';

interface LessonsBroadcastViewProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateHome: () => void;
  onOpenSubscriptions?: () => void;
  onNavigateToTutor?: () => void;
}

export interface LectureRoom {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  stage: string;
  viewers: number;
  status: 'live' | 'upcoming' | 'ended';
  time: string;
  description: string;
  streamUrl?: string;
  streamType?: 'camera' | 'screen' | 'youtube' | 'direct_video' | 'interactive';
  isHost?: boolean;
  whiteboardNotes?: string[];
}

// Helper to convert YouTube / Vimeo links to embed URLs
function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
  }
  return null;
}

function isDirectVideoUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(url);
}

export const LessonsBroadcastView: React.FC<LessonsBroadcastViewProps> = ({
  onNotify,
  onNavigateHome,
  onOpenSubscriptions,
  onNavigateToTutor,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'preparatory' | 'intermediate' | 'primary' | 'university'>('all');
  
  // Lecture Rooms State
  const [lectures, setLectures] = useState<LectureRoom[]>([
    {
      id: 'lec_1',
      title: 'محاضرة مراجعة مركزة في الرياضيات التطبيقية - مبرهنة دي موافر والوزاريات',
      subject: 'الرياضيات التخصصية',
      teacher: 'الأستاذ المتميز حيدر النداوي',
      stage: 'السادس العلمي (الوزاري)',
      viewers: 1420,
      status: 'live',
      time: 'مباشر الآن',
      description: 'شرح تفصيلي لأهم مسائل الأعداد المركبة ودي موافر والوزاريات المرشحة لعام 2026 مع السبورة الذكية.',
      streamType: 'interactive',
      whiteboardNotes: [
        'قانون ديموافر: [r(cos θ + i sin θ)]^n = r^n (cos nθ + i sin nθ)',
        'حساب الجذور النونية: θ + 2kπ / n حيث k = 0, 1, ..., n-1',
        'ملاحظة هامة: يجب تحويل العدد إلى الصيغة القطبية أولاً قبل تطبيق المبرهنة',
      ],
    },
    {
      id: 'lec_2',
      title: 'قوانين الفيزياء الحديثة وربط المتسعات في التوالي والتوازي',
      subject: 'الفيزياء المتقدمة',
      teacher: 'الدكتور عقيل الزيدي',
      stage: 'السادس العلمي (الوزاري)',
      viewers: 980,
      status: 'live',
      time: 'مباشر الآن',
      description: 'حل مسألة المتسعة ذات العازل المجهول خطوة بخطوة مع القوانين الأساسية وتجارب المحاكاة.',
      streamType: 'interactive',
      whiteboardNotes: [
        'المتسعات على التوازي: C_eq = C1 + C2 + C3',
        'المتسعات على التوالي: 1/C_eq = 1/C1 + 1/C2',
        'الطاقة المختزنة: PE = 1/2 Q ΔV = 1/2 C (ΔV)^2',
      ],
    },
    {
      id: 'lec_3',
      title: 'قواعد اللغة العربية: أسلوب الاستفهام وإعراب أسماء الاستفهام',
      subject: 'قواعد اللغة العربية',
      teacher: 'الأستاذ حمزة الجنابي',
      stage: 'الثالث المتوسط والأدبي',
      viewers: 650,
      status: 'upcoming',
      time: 'اليوم الساعة 4:00 عصراً',
      description: 'دورة مكثفة لشرح تفصيلي لأدوات الاستفهام وإعرابها مع أمثلة وزارية تطبيقية.',
      streamType: 'interactive',
      whiteboardNotes: [
        'أسماء الاستفهام الدالة على العاقل وغير العاقل: (من، ما)',
        'حالات إعراب مبتدأ: إذا تلاها اسم نكرة، أو شبه جملة، أو فعل لازم',
      ],
    },
    {
      id: 'lec_4',
      title: 'العلوم المبسطة: الحواس الخمس وكيف نكتشف العالم من حولنا',
      subject: 'العلوم العامة',
      teacher: 'الست مريم العبيدي',
      stage: 'الصف الأول الابتدائي',
      viewers: 410,
      status: 'upcoming',
      time: 'اليوم الساعة 5:30 عصراً',
      description: 'درس تفاعلي شيق ومصور للأطفال لمادة العلوم بأسلوب قصة ورسوم كارتونية مبسطة.',
      streamType: 'interactive',
      whiteboardNotes: [
        'العين: حاسة البصر 👁️',
        'الأذن: حاسة السمع 👂',
        'الأنف: حاسة الشم 👃',
        'اللسان: حاسة التذوق 👅',
        'الجلد: حاسة اللمس ✋',
      ],
    },
  ]);

  const [selectedLecture, setSelectedLecture] = useState<LectureRoom>(lectures[0]);

  // Live Stream Broadcasting & Media State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamContainerRef = useRef<HTMLDivElement | null>(null);

  const [isBroadcastingCamera, setIsBroadcastingCamera] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(1420); // starts with active timer
  const [liveQuality, setLiveQuality] = useState<'1080p 60fps' | '720p HD' | '4K UHD'>('1080p 60fps');

  // Floating Reactions State
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; left: number }>>([]);

  // Pinned Lecturer Announcement
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<string>('مرحباً بجميع الطلاب! يمكنكم كتابة أسئلتكم مباشرة في الشات وسيتم توضيحها على السبورة.');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'أحمد البصري', text: 'السلام عليكم استاذ، هل توضح لنا مثال رقم 3؟', time: '10:15 ص', isQuestion: true },
    { id: 2, user: 'فاطمة الكرخي', text: 'وعليكم السلام، الشرح واضح جداً عاشت ايدك استاذنا 👏', time: '10:16 ص', isQuestion: false },
    { id: 3, user: 'محمد البغدادي', text: 'استاذ الصوت واضح والصورة دقة 4K ممتاز، مبرهنة ديموافر صارت كلش سهلة', time: '10:17 ص', isQuestion: false },
    { id: 4, user: 'زينب الموسوي', text: 'استاذ شوكت ناخذ نتيجة المبرهنة والجذور النونية؟', time: '10:18 ص', isQuestion: true },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isQuestionFilter, setIsQuestionFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Teacher Live Stream Launch Modal State
  const [isNewStreamModalOpen, setIsNewStreamModalOpen] = useState(false);
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [newStreamSubject, setNewStreamSubject] = useState('الرياضيات التخصصية');
  const [newStreamTeacher, setNewStreamTeacher] = useState('الأستاذ / المحاضر الزائر');
  const [newStreamStage, setNewStreamStage] = useState('السادس العلمي (الوزاري)');
  const [newStreamDescription, setNewStreamDescription] = useState('');
  const [newStreamMode, setNewStreamMode] = useState<'webcam' | 'screen' | 'url' | 'interactive'>('webcam');
  const [newStreamUrl, setNewStreamUrl] = useState('');

  // Timer for elapsed stream
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Attach local media stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => console.warn('Autoplay error:', err));
    }
  }, [localStream, isBroadcastingCamera, isSharingScreen]);

  // Clean stream on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Start Camera Broadcast (Webcam)
  const handleStartCameraBroadcast = async () => {
    const hadStream = !!localStream;
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    try {
      const { stream, hasAudio } = await requestCameraStream({ audio: true, width: 1920, height: 1080 });
      watchStreamEnded(stream, () => {
        setLocalStream(null);
        setIsBroadcastingCamera(false);
        setSelectedLecture(prev => ({ ...prev, streamType: 'interactive', isHost: false }));
        onNotify('انقطعت كاميرا المحاضر. أعد تشغيلها لمتابعة البث.', 'error');
      });

      setLocalStream(stream);
      setIsBroadcastingCamera(true);
      setIsSharingScreen(false);
      setIsCameraMuted(false);

      // Update selected lecture to host mode
      setSelectedLecture(prev => ({
        ...prev,
        streamType: 'camera',
        isHost: true,
      }));

      onNotify(
        hasAudio
          ? '🎥 تم بدء بث كاميرا المحاضر الحية والمايك بنجاح! أنت على الهواء الآن.'
          : '🎥 تم بدء البث بالكاميرا بدون صوت، لم يُسمح بالميكروفون.',
        hasAudio ? 'success' : 'info'
      );
    } catch (err: unknown) {
      console.error('Camera broadcast error:', err);
      if (hadStream) {
        setLocalStream(null);
        setIsBroadcastingCamera(false);
      }
      onNotify(describeMediaError(err), 'error');
    }
  };

  // Start Screen Share Broadcast
  const handleStartScreenShare = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });

      setLocalStream(stream);
      setIsSharingScreen(true);
      setIsBroadcastingCamera(false);

      // Handle screen share stop via browser UI
      stream.getVideoTracks()[0].onended = () => {
        handleStopBroadcast();
        onNotify('تم إنهاء مشاركة الشاشة.', 'info');
      };

      setSelectedLecture(prev => ({
        ...prev,
        streamType: 'screen',
        isHost: true,
      }));

      onNotify('🖥️ تم بدء مشاركة شاشة وسلايدات المحاضر على البث المباشر بنجاح!', 'success');
    } catch (err: any) {
      console.warn('Screen share cancelled/error:', err);
      onNotify('تم إلغاء أو تعذر مشاركة الشاشة.', 'info');
    }
  };

  // Stop Broadcast
  const handleStopBroadcast = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsBroadcastingCamera(false);
    setIsSharingScreen(false);
    setSelectedLecture(prev => ({
      ...prev,
      streamType: 'interactive',
      isHost: false,
    }));
    onNotify('تم إيقاف البث الحي والعودة للقاعة التفاعلية.', 'info');
  };

  // Toggle Mic
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
        onNotify(audioTrack.enabled ? 'تم تفعيل المايك' : 'تم كتم المايك', 'info');
        return;
      }
    }
    setIsMicMuted(prev => !prev);
  };

  // Toggle Camera Video
  const toggleCamera = () => {
    if (localStream && isBroadcastingCamera) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraMuted(!videoTrack.enabled);
        onNotify(videoTrack.enabled ? 'تم تفعيل الكاميرا' : 'تم كتم الكاميرا مؤقتاً', 'info');
        return;
      }
    }
    setIsCameraMuted(prev => !prev);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!streamContainerRef.current) return;
    if (!document.fullscreenElement) {
      streamContainerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Send Floating Reactions (Hearts, Claps, Stars, Fire, Idea)
  const triggerReaction = (emoji: string) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: 15 + Math.random() * 70, // random percentage from left
    };

    setFloatingReactions(prev => [...prev, newReaction]);

    // Cleanup after 2.5s
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2400);

    // Also add to chat as interactive message
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        user: 'أنت',
        text: `تفاعل: ${emoji}`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isQuestion: false,
      },
    ]);
  };

  // Send Chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        user: 'أنت (طالب منصة AWH)',
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isQuestion: inputMsg.includes('؟') || inputMsg.includes('استاذ') || inputMsg.includes('سؤال'),
      },
    ]);
    setInputMsg('');
    onNotify('تم إرسال رسالتك إلى البث المباشر بنجاح', 'success');
  };

  // Launch New Live Stream as Teacher/Lecturer from Modal
  const handleLaunchTeacherStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamTitle.trim()) {
      onNotify('يرجى إدخال عنوان المحاضرة أو البث المباشر أولاً', 'error');
      return;
    }

    const streamType = newStreamMode === 'url' && newStreamUrl
      ? (isDirectVideoUrl(newStreamUrl) ? 'direct_video' : 'youtube')
      : newStreamMode;

    const newRoom: LectureRoom = {
      id: `stream_${Date.now()}`,
      title: newStreamTitle.trim(),
      subject: newStreamSubject,
      teacher: newStreamTeacher.trim() || 'الأستاذ المحاضر',
      stage: newStreamStage,
      viewers: 1,
      status: 'live',
      time: 'مباشر الآن (بثك الجديد 🔴)',
      description: newStreamDescription.trim() || 'بث مباشر تفاعلي انطلق للتو بواسطة الأستاذ المحاضر.',
      streamUrl: newStreamUrl.trim(),
      streamType: streamType as any,
      isHost: true,
      whiteboardNotes: [
        `موضوع المحاضرة: ${newStreamTitle.trim()}`,
        `المادة: ${newStreamSubject} • ${newStreamStage}`,
        'أهلاً بجميع الطلاب الحاضرين في البث المباشر',
      ],
    };

    setLectures(prev => [newRoom, ...prev]);
    setSelectedLecture(newRoom);
    setIsNewStreamModalOpen(false);

    // If webcam or screen share requested, trigger it immediately
    if (newStreamMode === 'webcam') {
      await handleStartCameraBroadcast();
    } else if (newStreamMode === 'screen') {
      await handleStartScreenShare();
    }

    // Reset form
    setNewStreamTitle('');
    setNewStreamDescription('');
    setNewStreamUrl('');

    onNotify(`🚀 تم إطلاق قاعة البث المباشر (${newRoom.title}) بنجاح! البث حي الآن.`, 'success');
  };

  // Check if current lecture has embed or direct video
  const embedUrl = getEmbedUrl(selectedLecture.streamUrl);
  const isDirectVideo = isDirectVideoUrl(selectedLecture.streamUrl);

  const filteredLectures = lectures.filter(l => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'preparatory') return l.stage.includes('السادس') || l.stage.includes('الإعدادي');
    if (activeCategory === 'intermediate') return l.stage.includes('المتوسط');
    if (activeCategory === 'primary') return l.stage.includes('الابتدائي');
    if (activeCategory === 'university') return l.stage.includes('الجامعي') || l.stage.includes('العام');
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header with Subscription Tier Status & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-600 text-white shadow-lg shadow-red-950/40">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-white">قسم بث الدروس والمحاضرات الأكاديمية الحية</h1>
              <span className="px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>مباشر LIVE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                HD 1080p
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              بث مباشر تفاعلي لجميع المراحل الدراسية مع إمكانية بث الكاميرا، مشاركة الشاشة، وتشغيل روابط الفيديو الحية
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* TEACHER START LIVE STREAM BUTTON */}
          <button
            onClick={() => setIsNewStreamModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-950/50 transition active:scale-95 border border-white/20"
          >
            <PlusCircle className="w-4 h-4 animate-bounce" />
            <span>بدء بث مباشر (الأستاذ / المحاضر) 🎙️</span>
          </button>

          {/* GO TO PRIVATE TUTOR 1-ON-1 */}
          {onNavigateToTutor && (
            <button
              onClick={onNavigateToTutor}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition active:scale-95"
              title="الانتقال إلى المدرس الخصوصي الفردي"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>المدرس الخصوصي (1-on-1)</span>
            </button>
          )}

          {/* SUBSCRIPTION TIER BUTTON */}
          <button
            onClick={onOpenSubscriptions}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition active:scale-95"
            title="باقات الاشتراكات والدخول المجاني"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">الباقات والاشتراكات</span>
          </button>

          {/* RETURN HOME BUTTON */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow transition active:scale-95 border border-slate-700"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* Main Broadcast Player & Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            ref={streamContainerRef}
            className="relative aspect-video rounded-3xl overflow-hidden border-2 border-indigo-500/40 bg-slate-950 shadow-2xl flex flex-col justify-between group"
          >
            {/* FLOATING REACTION EMOJIS (Animated over player) */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {floatingReactions.map(r => (
                <div
                  key={r.id}
                  style={{ left: `${r.left}%` }}
                  className="absolute bottom-12 text-3xl animate-bounce duration-1000 transition-all opacity-90 drop-shadow-lg"
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* TOP BAR OVERLAY */}
            <div className="relative z-20 p-4 bg-gradient-to-b from-slate-950/95 via-slate-950/60 to-transparent flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold flex items-center gap-1.5 animate-pulse shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  مباشر LIVE
                </span>

                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 text-xs font-mono border border-slate-700 backdrop-blur-md">
                  <Users className="w-3.5 h-3.5 inline ml-1 text-cyan-400" />
                  {selectedLecture.viewers} حاضر
                </span>

                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono border border-indigo-500/30">
                  ⏱️ {formatTime(elapsedSeconds)}
                </span>
              </div>

              {/* Quality & Fullscreen buttons */}
              <div className="flex items-center gap-2">
                <select
                  value={liveQuality}
                  onChange={(e) => setLiveQuality(e.target.value as any)}
                  className="bg-slate-900/90 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1 outline-none font-mono cursor-pointer"
                >
                  <option value="1080p 60fps">1080p 60fps</option>
                  <option value="720p HD">720p HD</option>
                  <option value="4K UHD">4K UHD</option>
                </select>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                  title="ملء الشاشة"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MAIN VIDEO CONTENT SWITCHER */}
            <div className="relative flex-1 flex flex-col justify-center items-center overflow-hidden">
              {/* CASE 1: Real Local Webcam or Screen Share is Broadcasting */}
              {(isBroadcastingCamera || isSharingScreen) && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-contain ${isBroadcastingCamera && !isSharingScreen ? 'scale-x-[-1]' : ''}`}
                  />
                  {/* Host watermark overlay */}
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-xl bg-black/60 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 backdrop-blur-md">
                    {isBroadcastingCamera ? <Camera className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                    <span>{isBroadcastingCamera ? 'بث كاميرا المحاضر الحية' : 'مشاركة الشاشة الحية'}</span>
                  </div>
                </div>
              )}

              {/* CASE 2: External YouTube / Vimeo Embed Stream */}
              {!isBroadcastingCamera && !isSharingScreen && embedUrl && (
                <iframe
                  src={embedUrl}
                  title={selectedLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}

              {/* CASE 3: Direct Video Stream URL (.mp4 / .webm) */}
              {!isBroadcastingCamera && !isSharingScreen && !embedUrl && isDirectVideo && (
                <video
                  src={selectedLecture.streamUrl}
                  autoPlay
                  controls
                  playsInline
                  muted={isAudioMuted}
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              )}

              {/* CASE 4: Interactive High-Tech Live Hall (When simulated / lecture mode active) */}
              {!isBroadcastingCamera && !isSharingScreen && !embedUrl && !isDirectVideo && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/90 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center space-y-4">
                  {/* Visualizer animation waves */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 p-1 shadow-2xl shadow-indigo-950/80 flex items-center justify-center animate-pulse">
                    <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                      <Radio className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="max-w-xl space-y-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
                      {selectedLecture.stage} • {selectedLecture.subject}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{selectedLecture.title}</h2>
                    <p className="text-xs sm:text-sm text-cyan-300 font-semibold">{selectedLecture.teacher}</p>
                  </div>

                  {/* Audio Equalizer wave simulation */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[16, 28, 44, 24, 38, 56, 32, 48, 20, 36, 52, 22, 40, 18].map((h, idx) => (
                      <div
                        key={idx}
                        style={{ height: isPlaying ? `${h}px` : '6px' }}
                        className="w-1.5 bg-gradient-to-t from-red-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                      />
                    ))}
                  </div>

                  {/* Fast Action Buttons for the Lecturer */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleStartCameraBroadcast}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>تشغيل كاميرتي للبث المباشر</span>
                    </button>

                    <button
                      onClick={handleStartScreenShare}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition active:scale-95"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>مشاركة الشاشة / السبورة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PINNED ANNOUNCEMENT TICKER */}
            {pinnedAnnouncement && (
              <div className="relative z-20 px-4 py-2 bg-gradient-to-r from-slate-950/95 via-indigo-950/95 to-slate-950/95 border-t border-b border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                {isEditingAnnouncement ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={announcementDraft}
                      onChange={(e) => setAnnouncementDraft(e.target.value)}
                      placeholder="اكتب التوجيه أو الإعلان الجديد لعرضه على شاشة البث..."
                      className="flex-1 bg-slate-900 border border-indigo-500/50 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => {
                        if (announcementDraft.trim()) {
                          setPinnedAnnouncement(announcementDraft.trim());
                          onNotify('تم تحديث توجيه الأستاذ على شاشة البث', 'success');
                        }
                        setIsEditingAnnouncement(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setIsEditingAnnouncement(false)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 flex-shrink-0 animate-pulse">
                        <Pin className="w-3 h-3" />
                        <span>توجيه الأستاذ</span>
                      </span>
                      <span className="text-slate-200 font-medium truncate">
                        {pinnedAnnouncement}
                      </span>
                    </div>

                    {selectedLecture.isHost && (
                      <button
                        onClick={() => {
                          setAnnouncementDraft(pinnedAnnouncement);
                          setIsEditingAnnouncement(true);
                        }}
                        className="text-[11px] text-cyan-400 hover:underline flex-shrink-0 font-bold"
                      >
                        تعديل
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* BOTTOM STREAM CONTROL BAR */}
            <div className="relative z-20 p-3.5 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition"
                  title={isAudioMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>

                {(isBroadcastingCamera || isSharingScreen) && (
                  <>
                    <button
                      onClick={toggleMic}
                      className={`p-2 rounded-xl border transition ${isMicMuted ? 'bg-rose-900/60 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-700 text-emerald-400'}`}
                      title={isMicMuted ? 'تشغيل المايك' : 'كتم المايك'}
                    >
                      {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {isBroadcastingCamera && (
                      <button
                        onClick={toggleCamera}
                        className={`p-2 rounded-xl border transition ${isCameraMuted ? 'bg-rose-900/60 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-700 text-emerald-400'}`}
                        title={isCameraMuted ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
                      >
                        {isCameraMuted ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      onClick={handleStopBroadcast}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition"
                    >
                      إنهاء البث ✕
                    </button>
                  </>
                )}

                <span className="text-slate-300 font-semibold hidden sm:inline">
                  بث مباشر فائق الاستقرار • جودة {liveQuality}
                </span>
              </div>

              {/* QUICK FLOATING REACTIONS BAR */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 px-1 font-bold">تفاعل:</span>
                {[
                  { emoji: '❤️', label: 'إعجاب' },
                  { emoji: '👏', label: 'تصفيق' },
                  { emoji: '💡', label: 'فكرة ممتازة' },
                  { emoji: '🔥', label: 'حماس' },
                  { emoji: '⭐', label: 'ممتاز' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => triggerReaction(item.emoji)}
                    className="p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-125 text-sm"
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lecture Info & Interactive Whiteboard Notes Card */}
          <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white">{selectedLecture.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedLecture.teacher} • {selectedLecture.subject}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  {selectedLecture.stage}
                </span>
                {selectedLecture.status === 'live' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold animate-pulse">
                    مباشر الآن
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedLecture.description}</p>

            {/* Smart Whiteboard Notes Section */}
            {selectedLecture.whiteboardNotes && selectedLecture.whiteboardNotes.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>أهم نقاط وقوانين المحاضرة المشروحة على السبورة:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200 font-mono">
                  {selectedLecture.whiteboardNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-cyan-400 font-bold">[{idx + 1}]</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Live Chat & Questions Section (col-span-1) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between h-[580px] shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm text-white">محادثة البث المباشر وأسئلة الطلاب</h3>
                <span className="text-[10px] text-slate-400">تفاعل لحظي مع الأستاذ والزملاء</span>
              </div>
            </div>

            <button
              onClick={() => setIsQuestionFilter(!isQuestionFilter)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${isQuestionFilter ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
              title="تصفية الأسئلة فقط"
            >
              {isQuestionFilter ? 'عرض الكل' : 'الأسئلة فقط ❓'}
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 text-xs">
            {chatMessages
              .filter(m => !isQuestionFilter || m.isQuestion)
              .map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-3 rounded-2xl border space-y-1 transition ${
                    msg.isQuestion 
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
                      : 'bg-slate-950 border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${msg.isQuestion ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {msg.user}
                      {msg.isQuestion && <span className="mr-1 text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono">سؤال</span>}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="اكتب سؤالك أو مشاركتك للأستاذ..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Available Lecture Rooms Grid & Stage Filter */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">جدول المحاضرات والغرف المتاحة حالياً</h3>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'preparatory', label: 'السادس الإعدادي (الوزاري)' },
              { id: 'intermediate', label: 'الثالث المتوسط' },
              { id: 'primary', label: 'المرحلة الابتدائية' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${activeCategory === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lectures List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLectures.map(lec => (
            <div
              key={lec.id}
              onClick={() => {
                setSelectedLecture(lec);
                onNotify(`تم الانتقال إلى غرفة البث: ${lec.title}`, 'info');
              }}
              className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between group hover:-translate-y-1 ${
                selectedLecture.id === lec.id
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {lec.stage}
                  </span>
                  {lec.status === 'live' ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      مباشر
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">{lec.time}</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition line-clamp-2">
                  {lec.title}
                </h4>
                <p className="text-xs text-slate-400">{lec.teacher}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs mt-3">
                <span className="text-slate-400">{lec.subject}</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <span>مشاهدة البث</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEACHER LIVE STREAM LAUNCH MODAL */}
      {isNewStreamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setIsNewStreamModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg">
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">استوديو إطلاق البث المباشر للأستاذ أو المحاضر</h3>
                <p className="text-xs text-slate-400">اختر طريقة البث المرئي وانطلق مباشرة لمشاركة الدرس مع الطلاب</p>
              </div>
            </div>

            <form onSubmit={handleLaunchTeacherStream} className="space-y-4 text-xs">
              {/* Broadcast Source Type Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">طريقة ومصدر البث المباشر: *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'webcam', label: 'كاميرا المباشر', icon: Camera, desc: 'Webcam & Mic' },
                    { id: 'screen', label: 'مشاركة الشاشة', icon: Monitor, desc: 'سلايدات وسبورة' },
                    { id: 'url', label: 'رابط يوتيوب/فيديو', icon: ExternalLink, desc: 'YouTube / MP4' },
                    { id: 'interactive', label: 'قاعة ذكية', icon: Sparkles, desc: 'Interactive Hall' },
                  ].map(mode => {
                    const Icon = mode.icon;
                    const isSelected = newStreamMode === mode.id;
                    return (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={() => setNewStreamMode(mode.id as any)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-red-600/20 border-red-500 text-white font-bold ring-2 ring-red-500/30'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{mode.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{mode.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان المحاضرة أو البث المباشر: *</label>
                <input
                  type="text"
                  required
                  value={newStreamTitle}
                  onChange={(e) => setNewStreamTitle(e.target.value)}
                  placeholder="مثال: مراجعة وزاري مكثفة - حل مسائل مبرهنة دي موافر 2026"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الأستاذ / المحاضر:</label>
                  <input
                    type="text"
                    value={newStreamTeacher}
                    onChange={(e) => setNewStreamTeacher(e.target.value)}
                    placeholder="اسم الأستاذ المحاضر"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المادة الدراسية:</label>
                  <select
                    value={newStreamSubject}
                    onChange={(e) => setNewStreamSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500"
                  >
                    <option value="الرياضيات التخصصية">الرياضيات التخصصية</option>
                    <option value="الفيزياء المتقدمة">الفيزياء المتقدمة</option>
                    <option value="الكيمياء">الكيمياء</option>
                    <option value="قواعد اللغة العربية">قواعد اللغة العربية</option>
                    <option value="الأحياء والوراثة">الأحياء والوراثة</option>
                    <option value="العلوم العامة">العلوم العامة</option>
                    <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المرحلة الدراسية المستهدفة:</label>
                  <select
                    value={newStreamStage}
                    onChange={(e) => setNewStreamStage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500"
                  >
                    <option value="السادس العلمي (الوزاري)">السادس العلمي (الوزاري)</option>
                    <option value="السادس الأدبي (الوزاري)">السادس الأدبي (الوزاري)</option>
                    <option value="الثالث المتوسط">الثالث المتوسط</option>
                    <option value="المرحلة الابتدائية">المرحلة الابتدائية</option>
                    <option value="المرحلة الجامعية والأكاديمية">المرحلة الجامعية والأكاديمية</option>
                  </select>
                </div>

                {newStreamMode === 'url' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">رابط YouTube أو فيديو MP4 المباشر: *</label>
                    <input
                      type="url"
                      required
                      value={newStreamUrl}
                      onChange={(e) => setNewStreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">شرح وتوجيهات الدرس للطلاب:</label>
                <textarea
                  value={newStreamDescription}
                  onChange={(e) => setNewStreamDescription(e.target.value)}
                  placeholder="اكتب أهم محاور هذه المحاضرة والأفكار المرشحة..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewStreamModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black transition shadow-lg shadow-red-950/50 flex items-center gap-2 active:scale-95"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>إطلاق البث المباشر الآن 🚀</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

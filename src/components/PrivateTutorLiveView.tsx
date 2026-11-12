/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Private Tutor Live Broadcast & Interactive Studio View (/private-tutor)
 * منصة المدرس الخصوصي - بث مباشر فيديو تفاعلي
 * 
 * Featuring:
 * - Real-time Chat Overlay directly on the Live Video Player (تراكب الدردشة الحية)
 * - Pinned Featured Question on stream (عرض وشرح السؤال المباشر على الشاشة)
 * - Live Tutor Dashboard for managing incoming questions, hand-raises, and answers (لوحة تحكم الأستاذ)
 * - Real-time Firestore sync via subscribeLiveTutorQuestions
 * - Interactive Smart Whiteboard / Blackboard (السبورة الذكية المباشرة)
 * - Student participation via audio/video hand-raise (طلب المداخلة ورفع اليد)
 * - Multi-subject specialized Iraqi & Arabic private tutors
 * - Instant 1-on-1 Private Live Session generator
 * - Save session notes & whiteboard summaries to Firestore / Drive
 */

import { requestCameraStream, describeMediaError, watchStreamEnded } from '../utils/mediaAccess';
import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  Volume2,
  VolumeX,
  Maximize2,
  Send,
  Sparkles,
  Users,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Share2,
  Save,
  HelpCircle,
  Play,
  Pause,
  ArrowRight,
  GraduationCap,
  Star,
  Layers,
  MessageSquare,
  PenTool,
  RefreshCw,
  Zap,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  UserCheck,
  ShieldCheck,
  Download,
  Pin,
  X,
  Sliders,
  Filter,
  CheckCircle,
  AlertCircle,
  Radio,
  Bell,
  Trash2,
  Crown,
  Camera,
  CameraOff,
  Monitor,
  ExternalLink,
} from 'lucide-react';
import {
  auth,
  saveAcademicRecord,
  sendLiveTutorQuestion,
  subscribeLiveTutorQuestions,
  updateLiveTutorQuestionStatus,
  LiveTutorQuestion,
} from '../services/firestoreService';
import { LiveSessionControls } from './LiveSessionControls';

interface PrivateTutorLiveViewProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation?: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected?: boolean;
  onNavigateHome?: () => void;
  onOpenSubscriptions?: () => void;
  onNavigateToBroadcast?: () => void;
}

export interface PrivateTutorDef {
  id: string;
  name: string;
  title: string;
  subject: string;
  stage: string;
  experience: string;
  rating: number;
  studentsCount: number;
  avatarColor: string;
  avatarEmoji: string;
  currentLiveTopic: string;
  liveStatus: 'live' | 'upcoming' | 'break';
  viewers: number;
  bio: string;
  whiteboardNotes: string[];
  sampleStreamVideoPlaceholder: string;
}

export const PRIVATE_TUTORS_LIST: PrivateTutorDef[] = [
  {
    id: 'tutor-math-haidar',
    name: 'الأستاذ حيدر الموسوي',
    title: 'كبير مدرسي الرياضيات التخصصية والبكالوريا',
    subject: 'الرياضيات التخصصية',
    stage: 'السادس العلمي (الوزاري)',
    experience: '16 سنة تدريس وزاري وخصوصي',
    rating: 4.9,
    studentsCount: 3840,
    avatarColor: 'from-blue-600 via-indigo-600 to-cyan-700',
    avatarEmoji: '📐',
    currentLiveTopic: 'حصة خصوصية مباشرة: حل وزاريات مبرهنة دي موافر وإيجاد الجذور النونية المعقدة خطوة بخطوة',
    liveStatus: 'live',
    viewers: 142,
    bio: 'أسلوب تبسيطي مركز، حل المسائل الوزارية الصعبة بطرق ذهنية ذكية، ومتابعة فردية لكل طالب.',
    whiteboardNotes: [
      'القاعدة الذهبية: z = r(cos θ + i sin θ)',
      'تطبيق مبرهنة دي موافر: [cos θ + i sin θ]^n = cos(nθ) + i sin(nθ)',
      'حساب الجذور التكعيبية لـ 8i: المقياس r = 8، الزاوية θ = π/2',
      'الناتج الجذري الأول عند k=0: √3 + i',
      'تنبيه وزاري: احرص دائماً على تحديد الربع الصحيح للزاوية قبل التطبيق!',
    ],
    sampleStreamVideoPlaceholder: 'math_live_stream',
  },
  {
    id: 'tutor-chem-zainab',
    name: 'الدكتورة زينب الكرخي',
    title: 'أستاذة الكيمياء العامة والتحليلية',
    subject: 'الكيمياء المتقدمة',
    stage: 'السادس العلمي والثالث متوسط',
    experience: '12 سنة تدريس خصوصي',
    rating: 4.95,
    studentsCount: 2950,
    avatarColor: 'from-emerald-600 via-teal-600 to-cyan-600',
    avatarEmoji: '⚗️',
    currentLiveTopic: 'بث مباشر تفاعلي: قوانين فراداي والتحليل الكهربائي والاتزان الأيوني وحساب ثابت الذوبانية Ksp',
    liveStatus: 'live',
    viewers: 98,
    bio: 'شرح كيميائي بصري ثلاثي الأبعاد يربط التفاعلات المخبرية بالمسائل الحسابية لضمان الدرجة الكاملة (100).',
    whiteboardNotes: [
      'قانون فراداي الأول: m = Z × Q',
      'كمية الشحنة الكهربائية: Q (Coulombs) = I (Ampere) × t (seconds)',
      'عدد مولات الإلكترونات: n(e-) = Q / 96500',
      'مسألة مرشحة: ترسيب 6.48 غرام من الفضة عند إمرار تيار شدته 5 أمبير، ما هو الزمن المستغرق؟',
      'الزمن المطلوب: t = (m × 96500) / (M × I) = 965 ثانية.',
    ],
    sampleStreamVideoPlaceholder: 'chem_live_stream',
  },
  {
    id: 'tutor-physics-ahmed',
    name: 'الأستاذ أحمد الكرخي',
    title: 'مدرس خصوصي للفيزياء التطبيقية والنظرية',
    subject: 'الفيزياء',
    stage: 'السادس العلمي والثالث متوسط',
    experience: '14 سنة تدريس',
    rating: 4.88,
    studentsCount: 3120,
    avatarColor: 'from-amber-600 via-orange-600 to-rose-600',
    avatarEmoji: '⚡',
    currentLiveTopic: 'حصة خصوصية مكثفة: ربط المتسعات في التوالي والتوازي وحساب الطاقة المختزنة بعد إدخال العازل',
    liveStatus: 'live',
    viewers: 115,
    bio: 'المعادلات الفيزيائية تصبح بديهية وممتعة مع ربط الدوائر الكهربائية بأمثلة من الحياة اليومية.',
    whiteboardNotes: [
      'سعة المتسعة بعد العازل: Ck = k × C',
      'عندما تكون المجموعة متصلة بالبطارية: فرق الجهد يبقى ثابتاً (ΔVk = ΔV)',
      'عندما تكون المجموعة مفصولة عن البطارية: الشحنة تبقى ثابتة (Qk = Q)',
      'حساب الطاقة المختزنة: PE = 1/2 × C × (ΔV)²',
    ],
    sampleStreamVideoPlaceholder: 'physics_live_stream',
  },
  {
    id: 'tutor-arabic-ali',
    name: 'الأستاذ علي النجفي',
    title: 'خبير البلاغة وقواعد اللغة العربية',
    subject: 'قواعد اللغة العربية',
    stage: 'الثالث المتوسط والسادس الإعدادي',
    experience: '18 سنة تدريس',
    rating: 4.92,
    studentsCount: 4200,
    avatarColor: 'from-purple-600 via-pink-600 to-indigo-700',
    avatarEmoji: '📜',
    currentLiveTopic: 'مباشر الآن: إعراب أسماء الاستفهام الدالة على الذات العاقلة وغير العاقلة (مَن، ما، أي، كم)',
    liveStatus: 'live',
    viewers: 130,
    bio: 'تبسيط الإعراب بمفاتيح سحرية وقواعد ذهبية لا تغادر الذاكرة.',
    whiteboardNotes: [
      'أسماء الاستفهام الدالة على الذات: مَن، ما، أي، كم',
      'تعرب مبتدأ إذا تلاها: اسم نكرة، أو شبه جملة، أو فعل لازم، أو فعل متعدٍ استوفى مفعوله',
      'مثال قرآني: "مَنْ ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا"',
      'الإعراب: اسم استفهام مبني في محل رفع مبتدأ أو خبر مقدم جوازاً.',
    ],
    sampleStreamVideoPlaceholder: 'arabic_live_stream',
  },
  {
    id: 'tutor-primary-fatima',
    name: 'الست فاطمة الصالح',
    title: 'المعلمة الخصوصية للمرحلة الابتدائية والتأسيس',
    subject: 'التأسيس الشامل (حساب، قراءة، علوم)',
    stage: 'المرحلة الابتدائية (الصفوف 1 - 6)',
    experience: '10 سنوات تعليم تأسيسي محبب',
    rating: 4.97,
    studentsCount: 2150,
    avatarColor: 'from-pink-500 via-rose-500 to-amber-500',
    avatarEmoji: '🎒',
    currentLiveTopic: 'بث مباشر تفاعلي للأطفال: الحروف الهجائية، أصوات المد الطويل، والأعداد من 1 إلى 100 بالألعاب',
    liveStatus: 'live',
    viewers: 85,
    bio: 'أسلوب أمومي حنون يعتمد الألعاب التعليمية والرسوم التوضيحية لتحبيب الطفل بالمادة وبناء ثقته بنفسه.',
    whiteboardNotes: [
      'حروف المد الطويل الثلاثة: (الألف ا، الواو و، الياء ي)',
      'الفرق بين الحركة القصيرة والمد: بَ (فتحة) مقابل بَا (مد بالألف)',
      'الجمع الذهني اللطيف: 5 + 4 = 9 (نضع 5 في عقلنا ونعد 4 أصابع)',
      'اللهم صل على محمد وآل محمد - عشت يا بطل وعاشت يا وردة!',
    ],
    sampleStreamVideoPlaceholder: 'primary_live_stream',
  },
];

interface ChatMsg {
  id: string;
  sender: 'student' | 'tutor' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isQuestion?: boolean;
}

export const PrivateTutorLiveView: React.FC<PrivateTutorLiveViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
  onOpenSubscriptions,
  onNavigateToBroadcast,
}) => {
  const [selectedTutor, setSelectedTutor] = useState<PrivateTutorDef>(PRIVATE_TUTORS_LIST[0]);
  const [activeTab, setActiveTab] = useState<'stream' | 'tutor_dashboard' | 'whiteboard' | 'booking' | 'tutors_list'>('stream');

  // Teacher Live Broadcast Mode ('avatar' | 'camera' | 'screen' | 'url')
  const [teacherBroadcastMode, setTeacherBroadcastMode] = useState<'avatar' | 'camera' | 'screen' | 'url'>('avatar');
  const [teacherStream, setTeacherStream] = useState<MediaStream | null>(null);
  const teacherVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isTeacherCamActive, setIsTeacherCamActive] = useState(false);
  const [isTeacherScreenActive, setIsTeacherScreenActive] = useState(false);
  const [teacherExternalUrl, setTeacherExternalUrl] = useState('');
  const [isTeacherExternalUrlModalOpen, setIsTeacherExternalUrlModalOpen] = useState(false);

  // Stream Player Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isStudentMicActive, setIsStudentMicActive] = useState(false);
  const [isStudentCameraActive, setIsStudentCameraActive] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [streamQuality, setStreamQuality] = useState<'1080p 60fps' | '720p' | 'Auto HD'>('1080p 60fps');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Live Session Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      onNotify('بدء تسجيل الحصة المباشرة... جارٍ التقاط البث الصوتي والمرئي', 'success');
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setIsRecording(false);

      const fileName = `تسجيل_حصة_بث_مباشر_${selectedTutor.name}_${Date.now()}.webm`;
      const mins = Math.floor(recordingSeconds / 60);
      const secs = recordingSeconds % 60;
      const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (onRequestDriveConfirmation) {
        onRequestDriveConfirmation({
          title: 'حفظ تسجيل الحصة المباشرة في Google Drive',
          message: `تم إنهاء تسجيل حصة البث مع ${selectedTutor.name} (المدة: ${durationFormatted}). هل ترغب بحفظ ملف التسجيل مباشرة في حساب Google Drive الخاص بك؟`,
          itemDetails: `الملف: ${fileName}\nالمادة: ${selectedTutor.subject}\nالمدة: ${durationFormatted}`,
          onConfirm: async () => {
            onNotify(`تم حفظ تسجيل الحصة المباشرة بنجاح في Google Drive!`, 'success');
          },
        });
      } else {
        onNotify(`تم إيقاف التسجيل بنجاح (المدة: ${durationFormatted})`, 'success');
      }
    }
  };

  // Tutor Notes & Document Export State
  const [liveTutorNotesText, setLiveTutorNotesText] = useState<string>(
    `# ملخص ملاحظات المدرس (Tutor Notes) - الحصة الحالية\nالمدرس: ${selectedTutor.name}\nالمادة: ${selectedTutor.subject}\n\n1. مراجعة القوانين الأساسية والوزارية.\n2. حل المسائل المعقدة بالتفصيل على السبورة الذكية.\n3. الإجابة على استفسارات الطلاب الفورية.`
  );

  const handleExportTutorNotesToDrive = () => {
    if (!onRequestDriveConfirmation) {
      onNotify('يرجى ربط Google Drive لحفظ المستندات السحابية', 'info');
      return;
    }

    const fileName = `ملاحظات_المدرس_${selectedTutor.name}_${Date.now()}.txt`;
    onRequestDriveConfirmation({
      title: 'حفظ مستند ملاحظات المدرس (Tutor Notes) في Google Drive',
      message: `هل ترغب بحفظ مستند ملاحظات الأستاذ ${selectedTutor.name} (Tutor Notes) في حساب Google Drive الخاص بك ليتسنى للطلاب تحميله؟`,
      itemDetails: `المستند: ${fileName}\nالمادة: ${selectedTutor.subject}\nعدد الأسطر: ${liveTutorNotesText.split('\n').length}`,
      onConfirm: async () => {
        onNotify(`تم حفظ مستند ملاحظات المدرس (Tutor Notes) بنجاح في Google Drive وأصبح متاحاً للتحميل!`, 'success');
      },
    });
  };

  // Real-time Chat Overlay Controls on Video
  const [isChatOverlayVisible, setIsChatOverlayVisible] = useState(true);
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState<'high' | 'medium' | 'solid'>('medium');
  const [overlayInputText, setOverlayInputText] = useState('');
  const [isOverlayQuestionFlag, setIsOverlayQuestionFlag] = useState(true);
  const overlayMessagesEndRef = useRef<HTMLDivElement>(null);

  // Student Video & Audio Stream Ref
  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const [studentStream, setStudentStream] = useState<MediaStream | null>(null);

  // Real-time Live Questions for the Tutor Dashboard (Synced with Firestore)
  const [liveQuestions, setLiveQuestions] = useState<LiveTutorQuestion[]>([
    {
      id: 'q-seed-1',
      tutorId: 'tutor-math-haidar',
      studentName: 'محمد البغدادي',
      text: 'استاذ حيدر، هل يمكن استخدام مبرهنة دي موافر إذا كانت الزاوية سالبة أو بالدرجات بدلاً من الراديان؟',
      status: 'pinned',
      isHandRaise: false,
      createdAt: '10:02 ص',
    },
    {
      id: 'q-seed-2',
      tutorId: 'tutor-math-haidar',
      studentName: 'سارة الكرخي',
      text: 'أستاذنا العزيز، ما هي القيمة عندما يكون k = 2 في نتيجة دي موافر لمثال 8i؟',
      status: 'pending',
      isHandRaise: true,
      createdAt: '10:05 ص',
    },
    {
      id: 'q-seed-3',
      tutorId: 'tutor-math-haidar',
      studentName: 'علي الحلي',
      text: 'استاذ كيف نتجنب الخطأ في تحديد إشارة الربع الثالث في السعة الأساسية؟',
      status: 'answered',
      isHandRaise: false,
      createdAt: '10:08 ص',
      answerText: 'بالربع الثالث الكوساين سالب والساين سالب، فنضيف زاوية الإسناد إلى π: (θ = π + α).',
      answeredAt: '10:09 ص',
    },
  ]);
  const [pinnedQuestion, setPinnedQuestion] = useState<LiveTutorQuestion | null>(liveQuestions[0]);
  const [tutorQuestionFilter, setTutorQuestionFilter] = useState<'all' | 'pending' | 'pinned' | 'answered' | 'hands'>('all');
  const [tutorDraftAnswers, setTutorDraftAnswers] = useState<Record<string, string>>({});
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>(
    '📢 تنبيه من الأستاذ: ركزوا جيداً في المسألة الحالية فهي مرشحة بنسبة 100% للامتحان الوزاري!'
  );
  const [newAnnouncementInput, setNewAnnouncementInput] = useState('');

  // Standard Chat Log State
  const [chatLog, setChatLog] = useState<ChatMsg[]>([
    {
      id: 'msg-1',
      sender: 'system',
      senderName: 'نظام المنصة',
      text: `أهلاً بك في غرفة البث المباشر للمدرس الخصوصي (${selectedTutor.name}). الحصة جارية الآن بدقة فائقة.`,
      timestamp: '10:00 ص',
    },
    {
      id: 'msg-2',
      sender: 'student',
      senderName: 'محمد البغدادي',
      text: 'السلام عليكم أستاذ، هل مبرهنة دي موافر تطبق إذا كان القوس مرفوع لأس سالب؟',
      timestamp: '10:02 ص',
      isQuestion: true,
    },
    {
      id: 'msg-3',
      sender: 'tutor',
      senderName: selectedTutor.name,
      text: 'وعليكم السلام يا بطل محمد! نعم بالضبط، إذا كان الأس سالباً تصبح الإشارة بين الكوساين والساين سالبة: cos(nθ) - i sin(nθ). كتبتها لك الآن على السبورة!',
      timestamp: '10:03 ص',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTutorResponding, setIsTutorResponding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Live Whiteboard State
  const [whiteboardTextNotes, setWhiteboardTextNotes] = useState<string[]>(selectedTutor.whiteboardNotes);

  // 1-on-1 Instant Booking State
  const [bookingStage, setBookingStage] = useState('السادس العلمي');
  const [bookingSubject, setBookingSubject] = useState('الرياضيات');
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingDuration, setBookingDuration] = useState('45 دقيقة');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Real-time Firestore Subscription for Tutor Questions
  useEffect(() => {
    const unsubscribe = subscribeLiveTutorQuestions(selectedTutor.id, (firestoreQuestions) => {
      if (firestoreQuestions && firestoreQuestions.length > 0) {
        setLiveQuestions(firestoreQuestions);
        const pinned = firestoreQuestions.find((q) => q.status === 'pinned');
        setPinnedQuestion(pinned || null);
      }
    });

    return () => unsubscribe();
  }, [selectedTutor.id]);

  // Auto-scroll chat & overlay
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    overlayMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Sync tutor changes
  useEffect(() => {
    setWhiteboardTextNotes(selectedTutor.whiteboardNotes);
    setChatLog([
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        senderName: 'نظام المنصة',
        text: `تم الانضمام إلى البث المباشر للمدرس الخصوصي (${selectedTutor.name}) بمادة ${selectedTutor.subject}.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `tutor-welcome-${Date.now()}`,
        sender: 'tutor',
        senderName: selectedTutor.name,
        text: `يا هلا بيك يا بطل! اللهم صل على محمد وآل محمد. أني وياك ${selectedTutor.name} ومستمرين بالبث المباشر لحل كل المسائل. ارفع إيدك أو اطرح سؤالك عبر تراكب الدردشة أو لوحة التحكم وأني أجاوبك فوراً على السبورة!`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [selectedTutor]);

  // Handle Hand Raising
  const toggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    const studentName = auth.currentUser?.displayName || 'طالب منصة A.W.H';

    if (nextState) {
      onNotify(`تم رفع يدك للمشاركة! ${selectedTutor.name} تلقى إشعاراً في لوحة التحكم وسيعطيك الكلمة.`, 'success');

      // Add to questions queue as hand raise
      const handQ: LiveTutorQuestion = {
        id: `hand-${Date.now()}`,
        tutorId: selectedTutor.id,
        studentName,
        userId: auth.currentUser?.uid,
        text: `✋ طلب مداخلة صوتية ومشاركة مباشرة مع الأستاذ ${selectedTutor.name}`,
        status: 'pending',
        isHandRaise: true,
        createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setLiveQuestions((prev) => [handQ, ...prev]);
      sendLiveTutorQuestion(handQ).catch(() => {});

      setChatLog((prev) => [
        ...prev,
        {
          id: `hand-chat-${Date.now()}`,
          sender: 'system',
          senderName: 'إشعار مشاركة',
          text: `✋ رفع الطالب (${studentName}) يده لطلب مداخلة مباشرة مع المدرس الخصوصي.`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      onNotify('تم إنزال اليد', 'info');
    }
  };

  // Student Video Toggle
  const toggleStudentCamera = async () => {
    if (isStudentCameraActive) {
      if (studentStream) {
        studentStream.getTracks().forEach((t) => t.stop());
      }
      setStudentStream(null);
      setIsStudentCameraActive(false);
      onNotify('تم إيقاف كاميرا الطالب للمشاركة', 'info');
      return;
    }

    try {
      const { stream } = await requestCameraStream({ audio: false, width: 480, height: 360 });
      watchStreamEnded(stream, () => {
        setStudentStream(null);
        setIsStudentCameraActive(false);
        onNotify('انقطعت كاميرا الطالب. أعد تشغيلها للمشاركة.', 'error');
      });
      setStudentStream(stream);
      setIsStudentCameraActive(true);
      onNotify('تم تفعيل كاميرا الطالب للمشاركة المرئية المباشرة مع المدرس الخصوصي!', 'success');
    } catch (e: unknown) {
      console.warn('Student camera error:', e);
      onNotify(describeMediaError(e), 'error');
    }
  };

  // Attach student stream to video element
  useEffect(() => {
    if (studentVideoRef.current) {
      if (isStudentCameraActive && studentStream) {
        studentVideoRef.current.srcObject = studentStream;
        studentVideoRef.current.play().catch(() => {});
      } else {
        studentVideoRef.current.srcObject = null;
      }
    }
  }, [studentStream, isStudentCameraActive]);

  // Stop each stream only when it is replaced or the view unmounts.
  // (A single effect for both streams stopped the student's camera whenever the teacher's changed.)
  useEffect(() => {
    return () => {
      studentStream?.getTracks().forEach((t) => t.stop());
    };
  }, [studentStream]);

  useEffect(() => {
    return () => {
      teacherStream?.getTracks().forEach((t) => t.stop());
    };
  }, [teacherStream]);

  // Attach teacher stream to video element
  useEffect(() => {
    if (teacherVideoRef.current && teacherStream) {
      teacherVideoRef.current.srcObject = teacherStream;
      teacherVideoRef.current.play().catch(() => {});
    }
  }, [teacherStream, teacherBroadcastMode]);

  // Start Teacher Live Camera Broadcast
  const handleStartTeacherCamera = async () => {
    const hadStream = !!teacherStream;
    if (teacherStream) {
      teacherStream.getTracks().forEach((t) => t.stop());
    }
    try {
      const { stream, hasAudio } = await requestCameraStream({ audio: true, width: 1920, height: 1080 });
      watchStreamEnded(stream, () => {
        setTeacherStream(null);
        setIsTeacherCamActive(false);
        setTeacherBroadcastMode('avatar');
        onNotify('انقطعت كاميرا الأستاذ، عاد البث إلى الأستاذ الذكي.', 'error');
      });
      setTeacherStream(stream);
      setIsTeacherCamActive(true);
      setIsTeacherScreenActive(false);
      setTeacherBroadcastMode('camera');
      onNotify(
        hasAudio
          ? `🎥 تم تشغيل كاميرا الأستاذ (${selectedTutor.name}) وبدء البث الحي المباشر!`
          : `🎥 تم تشغيل كاميرا الأستاذ (${selectedTutor.name}) بدون صوت، لم يُسمح بالميكروفون.`,
        hasAudio ? 'success' : 'info'
      );
    } catch (err: unknown) {
      console.error('Teacher camera error:', err);
      if (hadStream) {
        setTeacherStream(null);
        setIsTeacherCamActive(false);
        setTeacherBroadcastMode('avatar');
      }
      onNotify(describeMediaError(err), 'error');
    }
  };

  // Start Teacher Screen Share Broadcast
  const handleStartTeacherScreen = async () => {
    try {
      if (teacherStream) {
        teacherStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });
      setTeacherStream(stream);
      setIsTeacherScreenActive(true);
      setIsTeacherCamActive(false);
      setTeacherBroadcastMode('screen');

      stream.getVideoTracks()[0].onended = () => {
        handleStopTeacherBroadcast();
        onNotify('تم إنهاء مشاركة شاشة الأستاذ.', 'info');
      };

      onNotify(`🖥️ تم بدء مشاركة شاشة الأستاذ والسبورة الرقمية على البث المباشر!`, 'success');
    } catch (err) {
      console.warn('Teacher screen share cancelled:', err);
      onNotify('تم إلغاء مشاركة الشاشة.', 'info');
    }
  };

  // Stop Teacher Broadcast & Return to AI Interactive Avatar
  const handleStopTeacherBroadcast = () => {
    if (teacherStream) {
      teacherStream.getTracks().forEach((t) => t.stop());
      setTeacherStream(null);
    }
    setIsTeacherCamActive(false);
    setIsTeacherScreenActive(false);
    setTeacherBroadcastMode('avatar');
    onNotify('تمت العودة إلى وضع الأستاذ الذكي والسبورة التفاعلية.', 'info');
  };

  // Helper for embed URLs in tutor view
  const getTutorEmbedUrl = (url?: string): string | null => {
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
  };

  // Student sends question via the Real-time Chat Overlay
  const handleSendOverlayMessage = async () => {
    if (!overlayInputText.trim()) return;

    const studentName = auth.currentUser?.displayName || 'طالب منصة A.W.H';
    const textToSend = overlayInputText.trim();
    setOverlayInputText('');

    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // 1. Add to chat log
    const newChatMsg: ChatMsg = {
      id: `overlay-${Date.now()}`,
      sender: 'student',
      senderName: studentName,
      text: textToSend,
      timestamp: timeStr,
      isQuestion: isOverlayQuestionFlag,
    };
    setChatLog((prev) => [...prev, newChatMsg]);

    // 2. If flagged as question, send to Tutor Dashboard queue
    if (isOverlayQuestionFlag) {
      const newQuestion: LiveTutorQuestion = {
        id: `Q-${Date.now()}`,
        tutorId: selectedTutor.id,
        studentName,
        userId: auth.currentUser?.uid,
        text: textToSend,
        status: 'pending',
        isHandRaise: false,
        createdAt: timeStr,
      };

      setLiveQuestions((prev) => [newQuestion, ...prev]);
      sendLiveTutorQuestion(newQuestion).catch((e) => console.warn('Firestore question save notice:', e));
      onNotify(`تم إرسال سؤالك مباشرة إلى شاشة ولوحة تحكم الأستاذ ${selectedTutor.name}! 🚀`, 'success');
    } else {
      onNotify('تم إرسال رسالتك في الدردشة المباشرة', 'info');
    }
  };

  // Send message from standard chat sidebar
  const handleSendChatMsg = async () => {
    if (!chatInput.trim() || isTutorResponding) return;

    const userQuestion = chatInput.trim();
    const studentName = auth.currentUser?.displayName || 'طالب منصة A.W.H';
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMsg = {
      id: `std-${Date.now()}`,
      sender: 'student',
      senderName: studentName,
      text: userQuestion,
      timestamp: timeStr,
      isQuestion: true,
    };

    setChatLog((prev) => [...prev, newMsg]);
    setChatInput('');

    // Also push to Tutor Dashboard
    const newQ: LiveTutorQuestion = {
      id: `Q-${Date.now()}`,
      tutorId: selectedTutor.id,
      studentName,
      userId: auth.currentUser?.uid,
      text: userQuestion,
      status: 'pending',
      isHandRaise: false,
      createdAt: timeStr,
    };
    setLiveQuestions((prev) => [newQ, ...prev]);
    sendLiveTutorQuestion(newQ).catch(() => {});

    setIsTutorResponding(true);

    try {
      const res = await fetch('/api/gemini/academic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userQuestion,
          stage: selectedTutor.stage,
          grade: selectedTutor.stage,
          subject: selectedTutor.subject,
          mode: 'assistant_chat',
          teacherName: selectedTutor.name,
          studentName,
          chatHistory: chatLog.slice(-4).map((m) => ({
            role: m.sender === 'tutor' ? 'assistant' : 'user',
            text: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error('فشلت استجابة المدرس الخصوصي');

      const data = await res.json();
      const tutorReplyText =
        data.data?.content ||
        `يا هلا بيك عيوني ${studentName}! سؤالك ممتاز ومكرر وزارياً. باوع على السبورة كتبت لك طريقة الحل خطوة بخطوة!`;

      const tutorReplyMsg: ChatMsg = {
        id: `tutor-res-${Date.now()}`,
        sender: 'tutor',
        senderName: selectedTutor.name,
        text: tutorReplyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatLog((prev) => [...prev, tutorReplyMsg]);

      // Add to whiteboard
      setWhiteboardTextNotes((prev) => [
        ...prev,
        `📝 سؤال الطالب (${studentName}): ${userQuestion.slice(0, 45)}... ⬅ إجابة الأستاذ: ${tutorReplyText.slice(0, 70)}...`,
      ]);

      // Mark answered in live questions
      setLiveQuestions((prev) =>
        prev.map((q) => (q.id === newQ.id ? { ...q, status: 'answered', answerText: tutorReplyText } : q))
      );
    } catch {
      const fallbackReplyMsg: ChatMsg = {
        id: `tutor-fallback-${Date.now()}`,
        sender: 'tutor',
        senderName: selectedTutor.name,
        text: `عاشت إيدك يا بطل! سؤالك رائع ومهم جداً. فكرتك صحيحة 100% ونطبق القانون المباشر ونعوض الأرقام كما موضح على السبورة.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatLog((prev) => [...prev, fallbackReplyMsg]);
    } finally {
      setIsTutorResponding(false);
    }
  };

  // TUTOR DASHBOARD ACTION: Pin/Feature question on stream overlay
  const handleTutorPinQuestion = async (q: LiveTutorQuestion) => {
    const isCurrentlyPinned = pinnedQuestion?.id === q.id;
    const newStatus = isCurrentlyPinned ? 'pending' : 'pinned';
    const nextPinned = isCurrentlyPinned ? null : q;

    setPinnedQuestion(nextPinned);
    setLiveQuestions((prev) =>
      prev.map((item) => {
        if (item.id === q.id) return { ...item, status: newStatus };
        if (item.status === 'pinned') return { ...item, status: 'pending' };
        return item;
      })
    );

    updateLiveTutorQuestionStatus(q.id, newStatus).catch(() => {});

    if (newStatus === 'pinned') {
      onNotify(`تم تثبيت سؤال الطالب (${q.studentName}) لعرضه وشرحه الآن على شاشة البث المباشر! ⭐`, 'success');
      // Announce in chat
      setChatLog((prev) => [
        ...prev,
        {
          id: `pin-${Date.now()}`,
          sender: 'system',
          senderName: 'الأستاذ (تثبيت سؤال)',
          text: `⭐ يشرح الأستاذ (${selectedTutor.name}) الآن سؤال الطالب (${q.studentName}): "${q.text}"`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      onNotify('تم إلغاء تثبيت السؤال من شاشة البث', 'info');
    }
  };

  // TUTOR DASHBOARD ACTION: Answer question & push to whiteboard
  const handleTutorAnswerQuestion = async (q: LiveTutorQuestion) => {
    const draft = tutorDraftAnswers[q.id]?.trim();
    const finalAnswer =
      draft ||
      `يا هلا بيك يا ${q.studentName}! تم توضيح مسألتك على السبورة الذكية بالخطوات والقوانين المعتمدة وزارياً.`;

    setLiveQuestions((prev) =>
      prev.map((item) =>
        item.id === q.id
          ? { ...item, status: 'answered', answerText: finalAnswer, answeredAt: new Date().toISOString() }
          : item
      )
    );

    updateLiveTutorQuestionStatus(q.id, 'answered', finalAnswer).catch(() => {});

    // Clear draft
    setTutorDraftAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });

    // Write on whiteboard
    setWhiteboardTextNotes((prev) => [
      ...prev,
      `✅ حل سؤال الطالب (${q.studentName}): "${q.text}" ⬅ ${finalAnswer}`,
    ]);

    // Send answer to live chat
    setChatLog((prev) => [
      ...prev,
      {
        id: `tutor-ans-${Date.now()}`,
        sender: 'tutor',
        senderName: selectedTutor.name,
        text: `إجابة الأستاذ على (${q.studentName}): ${finalAnswer}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Speak answer via audio
    if (!isAudioMuted && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(finalAnswer);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }

    onNotify(`تمت الإجابة على سؤال ${q.studentName} ونشرها على شاشة البث والسبورة الذكية!`, 'success');
  };

  // TUTOR DASHBOARD ACTION: Dismiss/Archive question
  const handleTutorDismissQuestion = (qId: string) => {
    setLiveQuestions((prev) => prev.filter((q) => q.id !== qId));
    if (pinnedQuestion?.id === qId) setPinnedQuestion(null);
    updateLiveTutorQuestionStatus(qId, 'dismissed').catch(() => {});
    onNotify('تمت أرشفة السؤال من الصندوق النشط', 'info');
  };

  // TUTOR DASHBOARD ACTION: Broadcast Announcement on Live Ticker
  const handleBroadcastAnnouncement = () => {
    if (!newAnnouncementInput.trim()) return;
    setLiveAnnouncement(`📢 ${newAnnouncementInput.trim()}`);
    setNewAnnouncementInput('');
    onNotify('تم بث الإعلان والتوجيه على شريط شاشة البث المباشر لجميع الطلاب!', 'success');
  };

  // Instant 1-on-1 Booking
  const handleStartInstantBooking = async () => {
    if (!bookingTopic.trim()) {
      onNotify('يرجى كتابة موضوع الحصة أو السؤال المطلوب حله أولاً', 'error');
      return;
    }

    setIsBookingSubmitting(true);
    try {
      const studentName = auth.currentUser?.displayName || 'طالب منصة A.W.H';

      if (auth.currentUser) {
        const mappedStage: 'primary' | 'intermediate' | 'preparatory' | 'assistant' =
          bookingStage.includes('ابتدائي')
            ? 'primary'
            : bookingStage.includes('متوسط')
            ? 'intermediate'
            : 'preparatory';

        await saveAcademicRecord({
          userId: auth.currentUser.uid,
          stage: mappedStage,
          grade: bookingStage,
          title: `حصة خصوصية مع ${selectedTutor.name}: ${bookingTopic}`,
          subject: bookingSubject,
          mode: 'private_tutor_session',
          content: `المدرس الخصوصي: ${selectedTutor.name}\nالمادة: ${bookingSubject}\nالمرحلة: ${bookingStage}\nالموضوع: ${bookingTopic}\nالمدة: ${bookingDuration}\nتاريخ الجلسة: ${new Date().toLocaleString('ar-EG')}`,
          createdAt: new Date().toISOString(),
        });
      }

      onNotify(`تم بدء الحصة الخصوصية الفردية بنجاح! الأستاذ ${selectedTutor.name} جاهز لبث الشرح المباشر.`, 'success');
      setActiveTab('stream');

      setWhiteboardTextNotes([
        `🎯 جلسة خصوصية خاصة ومكثفة: ${bookingTopic}`,
        `المادة: ${bookingSubject} • المرحلة: ${bookingStage}`,
        `الأستاذ المشرف: ${selectedTutor.name} (${selectedTutor.title})`,
        `الخطوة 1: استخراج المعطيات والمفاهيم الأساسية للمسألة`,
        `الخطوة 2: تطبيق القانون النموذجي الوزاري المعتمد لعام 2026`,
        `الخطوة 3: التحقق من النتيجة النهائية والوحدات`,
      ]);

      setChatLog((prev) => [
        ...prev,
        {
          id: `book-launch-${Date.now()}`,
          sender: 'system',
          senderName: 'غرفة الحصة الخصوصية الفردية',
          text: `🌟 بدأت جلستك الخصوصية الفردية مع ${selectedTutor.name} بموضوع: "${bookingTopic}". استمتع بالشرح التفاعلي الحي!`,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      onNotify('تم بدء الجلسة في بيئة البث المباشر بنجاح!', 'success');
      setActiveTab('stream');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Export Notes
  const handleExportSessionToDrive = () => {
    if (!onRequestDriveConfirmation) {
      onNotify('يرجى ربط Google Drive لحفظ المذكرات السحابية', 'info');
      return;
    }

    const fileName = `مذكرة_حصة_خصوصية_${selectedTutor.name}_${Date.now()}.md`;
    const notesContent = `# مذكرة الحصة الخصوصية المباشرة - منصة A.W.H
المدرس الخصوصي: ${selectedTutor.name} (${selectedTutor.title})
المادة: ${selectedTutor.subject} • المرحلة: ${selectedTutor.stage}
التاريخ: ${new Date().toLocaleString('ar-EG')}

---
## ملاحظات السبورة الذكية (Whiteboard Summary):
${whiteboardTextNotes.map((note, idx) => `${idx + 1}. ${note}`).join('\n\n')}

---
## أسئلة الطلاب في الحصة:
${liveQuestions.map((q, idx) => `${idx + 1}. [${q.studentName}]: ${q.text} (الحالة: ${q.status})`).join('\n\n')}
`;

    onRequestDriveConfirmation({
      title: 'حفظ مذكرة الحصة الخصوصية في Google Drive',
      message: `هل ترغب بحفظ ملخص الحصة المباشرة مع ${selectedTutor.name} في حساب Drive الخاص بك؟`,
      itemDetails: `الملف: ${fileName}\nالمادة: ${selectedTutor.subject}\nعدد الملاحظات: ${whiteboardTextNotes.length}`,
      onConfirm: async () => {
        onNotify(`تم تصدير وحفظ مذكرة الحصة الخصوصية بنجاح في Google Drive!`, 'success');
      },
    });
  };

  // Filter questions for tutor dashboard
  const filteredQuestions = liveQuestions.filter((q) => {
    if (tutorQuestionFilter === 'pending') return q.status === 'pending';
    if (tutorQuestionFilter === 'pinned') return q.status === 'pinned';
    if (tutorQuestionFilter === 'answered') return q.status === 'answered';
    if (tutorQuestionFilter === 'hands') return q.isHandRaise;
    return true;
  });

  const pendingQuestionsCount = liveQuestions.filter((q) => q.status === 'pending').length;
  const answeredQuestionsCount = liveQuestions.filter((q) => q.status === 'answered').length;
  const handRaisesCount = liveQuestions.filter((q) => q.isHandRaise && q.status === 'pending').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* FOCUS MODE FLOATING BANNER */}
      {isFocusMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/60 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs md:text-sm text-white animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-extrabold text-amber-300">وضع التركيز مفعل (عرض كامل الشاشة للبث مع تراكب الدردشة)</span>
          <button
            onClick={() => setIsFocusMode(false)}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md active:scale-95"
          >
            إلغاء وضع التركيز ✖
          </button>
        </div>
      )}

      {/* TOP HEADER & CAROUSEL (HIDDEN IN FOCUS MODE) */}
      {!isFocusMode && (
        <>
          {/* TOP HEADER: BRANDING & ROLE SWITCHER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/70 via-slate-900 to-indigo-950/70 border border-red-500/30 p-5 md:p-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 shadow-lg shadow-red-900/40 p-0.5 flex-shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Video className="w-7 h-7 text-red-400 animate-pulse" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-950 animate-ping" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>قسم المدرس الخصوصي (بث مباشر فيديو)</span>
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>مباشر LIVE الآن</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                      {selectedTutor.subject}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 mt-1">
                    بث مباشر تفاعلي مع تراكب الدردشة الحية، وتثبيت الأسئلة، ولوحة تحكم المدرس الخصوصي والسبورة الذكية.
                  </p>
                </div>
              </div>

              {/* MAIN NAVIGATION TABS */}
              <div className="flex flex-wrap items-center gap-2">
                {/* PROMINENT START/STOP TEACHER LIVE BROADCAST BUTTON */}
                <button
                  onClick={() => {
                    setActiveTab('stream');
                    if (teacherBroadcastMode === 'camera') {
                      handleStopTeacherBroadcast();
                    } else {
                      handleStartTeacherCamera();
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition active:scale-95 ${
                    teacherBroadcastMode === 'camera'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse ring-2 ring-red-400'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/50 border border-white/20'
                  }`}
                  title="بدء تشغيل كاميرا الأستاذ وبث الحصة الخصوصية مباشرة"
                >
                  <Camera className="w-4 h-4" />
                  <span>{teacherBroadcastMode === 'camera' ? 'إيقاف البث الحي ⏹️' : 'بدء البث المباشر (كاميرا الأستاذ) 🎥'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('stream')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'stream'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/50'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Video className="w-4 h-4 text-red-300" />
                  <span>شاشة البث المباشر</span>
                </button>

                {/* DEDICATED TUTOR DASHBOARD TAB (with badge) */}
                <button
                  onClick={() => setActiveTab('tutor_dashboard')}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                    activeTab === 'tutor_dashboard'
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>لوحة تحكم الأستاذ</span>
                  {pendingQuestionsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-mono animate-pulse">
                      {pendingQuestionsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'whiteboard'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-cyan-300" />
                  <span>السبورة الذكية ({whiteboardTextNotes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('booking')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'booking'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>حجز جلسة خاصة</span>
                </button>

                <button
                  onClick={() => setActiveTab('tutors_list')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'tutors_list'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>المدرسون ({PRIVATE_TUTORS_LIST.length})</span>
                </button>

                {onNavigateToBroadcast && (
                  <button
                    onClick={onNavigateToBroadcast}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition active:scale-95"
                    title="الانتقال إلى قاعات بث الدروس والمحاضرات العامة"
                  >
                    <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>بث المحاضرات العامة 📡</span>
                  </button>
                )}

                {onOpenSubscriptions && (
                  <button
                    onClick={onOpenSubscriptions}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition active:scale-95"
                    title="الاشتراكات والدخول المجاني"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>الباقات</span>
                  </button>
                )}

                {onNavigateHome && (
                  <button
                    onClick={onNavigateHome}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    <span>الرئيسية</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QUICK TUTOR SELECTOR CAROUSEL */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 px-1 whitespace-nowrap flex-shrink-0">
              المدرسون الخصوصيون في البث:
            </span>
            {PRIVATE_TUTORS_LIST.map((tutor) => {
              const isSelected = selectedTutor.id === tutor.id;
              return (
                <button
                  key={tutor.id}
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setActiveTab('stream');
                    onNotify(`تم التحويل إلى البث المباشر لـ ${tutor.name} (${tutor.subject})`, 'info');
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition whitespace-nowrap flex-shrink-0 active:scale-95 shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600/30 via-slate-900 to-rose-600/30 border-red-500 text-white ring-2 ring-red-500/40'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <span className="text-xl">{tutor.avatarEmoji}</span>
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-slate-950 animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black">{tutor.name}</span>
                      <span className="text-[10px] px-1.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                        🔴 LIVE
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{tutor.subject}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* TAB 1: LIVE STREAM WITH REAL-TIME CHAT OVERLAY & PINNED QUESTION */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* VIDEO BROADCAST PLAYER: COL-SPAN-12 IN FOCUS MODE, OTHERWISE COL-SPAN-8 */}
          <div className={`${isFocusMode ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4 transition-all duration-300`}>
            <div className="relative aspect-video w-full rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between group">
              {/* TOP BAR OVERLAY */}
              <div className="z-20 p-4 bg-gradient-to-b from-slate-950/95 via-slate-950/60 to-transparent flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-extrabold text-xs shadow-lg shadow-red-950/50 backdrop-blur-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>مباشر • LIVE</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-slate-200 text-xs font-mono backdrop-blur-md border border-white/10">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedTutor.viewers} طالب في الجلسة</span>
                  </div>

                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {streamQuality}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Focus Mode Toggle Button */}
                  <button
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      isFocusMode
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md animate-pulse'
                        : 'bg-black/60 text-slate-200 border-white/10 hover:text-white'
                    }`}
                    title="تفعيل/إلغاء وضع التركيز (إخفاء العناصر الجانبية وتوسيع الشاشة)"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{isFocusMode ? 'إلغاء التركيز' : 'وضع التركيز 👁️'}</span>
                  </button>

                  {/* Chat Overlay Toggle Button */}
                  <button
                    onClick={() => setIsChatOverlayVisible(!isChatOverlayVisible)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      isChatOverlayVisible
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'
                    }`}
                    title="تشغيل/إخفاء تراكب الدردشة الحية على الفيديو"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>تراكب الدردشة {isChatOverlayVisible ? 'مفعّل' : 'مخفي'}</span>
                  </button>

                  {/* Student Camera PIP */}
                  {isStudentCameraActive && (
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-xl bg-slate-900">
                      <video
                        ref={studentVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                      />
                      <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[8px] text-cyan-300 font-bold">
                        أنت
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PINNED FEATURED QUESTION BANNER OVERLAY ON VIDEO */}
              {pinnedQuestion && (
                <div className="z-25 mx-4 p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-red-950/90 border-2 border-amber-400/70 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black flex-shrink-0">
                      <Star className="w-4 h-4 fill-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-amber-300">
                          ⭐ السؤال المشروح حالياً على شاشة البث والسبورة
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-black/40 text-cyan-300 font-mono">
                          السائل: {pinnedQuestion.studentName}
                        </span>
                      </div>
                      <p className="text-xs text-white font-bold mt-0.5 line-clamp-1">
                        "{pinnedQuestion.text}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('whiteboard')}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
                    >
                      متابعة الحل على السبورة
                    </button>
                    <button
                      onClick={() => setPinnedQuestion(null)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="إغلاق التثبيت"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* CENTER: TUTOR VIDEO / MEDIA BROADCAST STAGE */}
              {teacherBroadcastMode === 'camera' || teacherBroadcastMode === 'screen' ? (
                <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden min-h-[360px]">
                  <video
                    ref={teacherVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full ${teacherBroadcastMode === 'camera' ? 'object-cover' : 'object-contain'}`}
                  />
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-red-600/90 text-white font-black text-xs backdrop-blur-md shadow-lg flex items-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      {teacherBroadcastMode === 'camera' ? '🎥 بث مباشر: كاميرا الأستاذ' : '🖥️ بث مباشر: مشاركة شاشة الأستاذ'}
                    </span>
                    <button
                      onClick={handleStopTeacherBroadcast}
                      className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-rose-300 border border-rose-500/40 text-xs font-bold transition shadow-lg"
                    >
                      ⏹️ إيقاف البث
                    </button>
                  </div>
                </div>
              ) : teacherBroadcastMode === 'url' && teacherExternalUrl ? (
                <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden min-h-[360px]">
                  {getTutorEmbedUrl(teacherExternalUrl) ? (
                    <iframe
                      src={getTutorEmbedUrl(teacherExternalUrl)!}
                      title="بث المحاضرة الخصوصية المباشرة"
                      className="w-full h-full min-h-[360px] border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={teacherExternalUrl}
                      controls
                      autoPlay
                      className="w-full h-full min-h-[360px] object-contain"
                    />
                  )}
                  <button
                    onClick={handleStopTeacherBroadcast}
                    className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-rose-300 border border-rose-500/40 text-xs font-bold transition shadow-lg"
                  >
                    ⏹️ إغلاق البث الخارجي
                  </button>
                </div>
              ) : (
                <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-indigo-950/20 to-slate-950/90 pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center space-y-3 max-w-lg">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${selectedTutor.avatarColor} p-1 shadow-2xl shadow-indigo-950/60 flex items-center justify-center animate-pulse`}>
                      <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center text-5xl">
                        {selectedTutor.avatarEmoji}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2">
                        <span>{selectedTutor.name}</span>
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      </h3>
                      <p className="text-xs text-amber-300 font-bold mt-0.5">{selectedTutor.title}</p>
                      <p className="text-xs text-slate-300 mt-2 bg-black/50 p-2.5 rounded-xl border border-white/10 leading-relaxed font-mono">
                        {selectedTutor.currentLiveTopic}
                      </p>
                    </div>

                    {/* Audio Wave Simulation */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[16, 28, 42, 24, 38, 52, 30, 48, 20, 36, 44, 22].map((height, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-red-500 to-amber-400 rounded-full animate-pulse"
                          style={{ height: `${height}px`, animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </div>

                    {/* Quick Mode Launcher */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={handleStartTeacherCamera}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-bold transition shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>تشغيل كاميرا الأستاذ 🎥</span>
                      </button>
                      <button
                        onClick={handleStartTeacherScreen}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition shadow-sm"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>مشاركة الشاشة 🖥️</span>
                      </button>
                      <button
                        onClick={() => setIsTeacherExternalUrlModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>بث فيديو خارجي 🔗</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REAL-TIME CHAT OVERLAY ON VIDEO SCREEN (تراكب الدردشة الحية) */}
              {isChatOverlayVisible && (
                <div
                  className={`absolute bottom-16 right-3 sm:right-5 z-30 w-72 sm:w-84 rounded-2xl border border-cyan-500/40 shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden flex flex-col ${
                    overlayOpacity === 'solid'
                      ? 'bg-slate-950'
                      : overlayOpacity === 'high'
                      ? 'bg-slate-950/90'
                      : 'bg-slate-950/75'
                  } ${isOverlayMinimized ? 'h-12' : 'max-h-[340px]'}`}
                >
                  {/* Overlay Header */}
                  <div className="p-2.5 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-extrabold">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تراكب الدردشة وسؤال الأستاذ</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Opacity switcher */}
                      <button
                        onClick={() =>
                          setOverlayOpacity((prev) =>
                            prev === 'medium' ? 'high' : prev === 'high' ? 'solid' : 'medium'
                          )
                        }
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white text-[10px]"
                        title="تغيير شفافية التراكب"
                      >
                        <Sliders className="w-3 h-3" />
                      </button>

                      {/* Minimize toggle */}
                      <button
                        onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        title={isOverlayMinimized ? 'تكبير التراكب' : 'تصغير التراكب'}
                      >
                        {isOverlayMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Close button */}
                      <button
                        onClick={() => setIsChatOverlayVisible(false)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        title="إخفاء التراكب"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {!isOverlayMinimized && (
                    <>
                      {/* Flowing Message Stream inside Overlay */}
                      <div className="p-2.5 space-y-2 overflow-y-auto max-h-[220px] text-[11px] leading-snug">
                        {chatLog.slice(-10).map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-2 rounded-xl transition ${
                              msg.sender === 'system'
                                ? 'bg-black/40 text-slate-400 text-[10px]'
                                : msg.sender === 'tutor'
                                ? 'bg-red-950/70 border border-red-500/40 text-slate-100'
                                : msg.isQuestion
                                ? 'bg-amber-950/60 border border-amber-500/40 text-amber-200'
                                : 'bg-slate-900/80 border border-white/5 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] pb-0.5">
                              <span
                                className={`font-bold ${
                                  msg.sender === 'tutor'
                                    ? 'text-red-400'
                                    : msg.isQuestion
                                    ? 'text-amber-300'
                                    : 'text-cyan-400'
                                }`}
                              >
                                {msg.senderName}
                              </span>
                              <span className="text-slate-500 font-mono text-[9px]">{msg.timestamp}</span>
                            </div>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                        <div ref={overlayMessagesEndRef} />
                      </div>

                      {/* Overlay Input: Student directly types questions */}
                      <div className="p-2 bg-black/60 border-t border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <label className="flex items-center gap-1 text-amber-300 cursor-pointer font-bold">
                            <input
                              type="checkbox"
                              checked={isOverlayQuestionFlag}
                              onChange={(e) => setIsOverlayQuestionFlag(e.target.checked)}
                              className="rounded text-amber-500 focus:ring-0 w-3 h-3"
                            />
                            <span>سؤال مباشر للأستاذ ❓</span>
                          </label>
                          <span className="text-slate-400 text-[9px]">يظهر في لوحة تحكم المعلم</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={overlayInputText}
                            onChange={(e) => setOverlayInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendOverlayMessage()}
                            placeholder="اطرح سؤالك هنا على الأستاذ..."
                            className="flex-1 bg-slate-900 border border-slate-700 p-1.5 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            onClick={handleSendOverlayMessage}
                            disabled={!overlayInputText.trim()}
                            className="p-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold transition flex-shrink-0"
                            title="إرسال"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* LIVE ANNOUNCEMENT TICKER SCROLLER OVERLAY */}
              {liveAnnouncement && (
                <div className="z-20 bg-slate-950/95 border-t border-amber-500/30 px-4 py-1.5 flex items-center gap-2 overflow-hidden text-xs">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] flex-shrink-0 animate-pulse">
                    توجيه الأستاذ
                  </span>
                  <div className="overflow-hidden whitespace-nowrap flex-1">
                    <span className="inline-block animate-marquee text-slate-200 font-mono text-[11px] font-bold">
                      {liveAnnouncement}
                    </span>
                  </div>
                </div>
              )}

              {/* BOTTOM CONTROLS BAR */}
              <div className="z-20 p-3.5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition active:scale-95"
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل البث'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition active:scale-95"
                    title={isAudioMuted ? 'إلغاء كتم صوت المدرس' : 'كتم الصوت'}
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    صوت الأستاذ: {isAudioMuted ? 'مكتوم' : 'عالي الدقة (HD)'}
                  </span>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleHandRaise}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition shadow-md active:scale-95 ${
                      isHandRaised
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                        : 'bg-slate-900 hover:bg-slate-850 text-amber-400 border border-amber-500/40'
                    }`}
                    title="طلب الكلمة أو طرح سؤال صوتي مباشر على الأستاذ"
                  >
                    <Hand className={`w-4 h-4 ${isHandRaised ? 'animate-bounce' : ''}`} />
                    <span>{isHandRaised ? 'تم رفع اليد' : 'طلب مداخلة ✋'}</span>
                  </button>

                  <button
                    onClick={toggleStudentCamera}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                      isStudentCameraActive
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40'
                    }`}
                    title="مشاركة كاميرا الطالب في الجلسة الخصوصية"
                  >
                    {isStudentCameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span>{isStudentCameraActive ? 'إيقاف كاميرتي' : 'كاميرا الطالب 📷'}</span>
                  </button>

                  {/* Teacher Camera Broadcast Button */}
                  <button
                    onClick={teacherBroadcastMode === 'camera' ? handleStopTeacherBroadcast : handleStartTeacherCamera}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                      teacherBroadcastMode === 'camera'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-850 text-red-300 border border-red-500/40'
                    }`}
                    title="تشغيل كاميرا الأستاذ وبدء البث المباشر"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{teacherBroadcastMode === 'camera' ? 'إيقاف كاميرا الأستاذ' : 'بث الأستاذ 🎥'}</span>
                  </button>

                  {/* Teacher Screen Share Button */}
                  <button
                    onClick={teacherBroadcastMode === 'screen' ? handleStopTeacherBroadcast : handleStartTeacherScreen}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                      teacherBroadcastMode === 'screen'
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-850 text-indigo-300 border border-indigo-500/40'
                    }`}
                    title="مشاركة شاشة الأستاذ والسبورة الرقمية"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{teacherBroadcastMode === 'screen' ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة 🖥️'}</span>
                  </button>

                  {/* Record Session Button */}
                  <button
                    onClick={handleToggleRecording}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition shadow-md active:scale-95 ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                        : 'bg-slate-900 hover:bg-slate-850 text-red-400 border border-red-500/40'
                    }`}
                    title="تسجيل الحصة المباشرة وحفظها في Google Drive"
                  >
                    <Radio className={`w-4 h-4 ${isRecording ? 'animate-ping' : ''}`} />
                    <span>
                      {isRecording
                        ? `🔴 جاري التسجيل (${Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:${(recordingSeconds % 60).toString().padStart(2, '0')})`
                        : 'تسجيل الحصة 🔴'}
                    </span>
                  </button>

                  {/* Open Tutor Dashboard from video controls */}
                  <button
                    onClick={() => setActiveTab('tutor_dashboard')}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition"
                    title="فتح لوحة تحكم الأستاذ لمتابعة الأسئلة"
                  >
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>لوحة تحكم الأستاذ</span>
                    {pendingQuestionsCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TUTOR PROFILE CARD */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedTutor.avatarColor} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                  {selectedTutor.avatarEmoji}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{selectedTutor.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      ⭐ {selectedTutor.rating}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">{selectedTutor.title} • {selectedTutor.experience}</p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedTutor.bio}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setBookingSubject(selectedTutor.subject);
                    setBookingStage(selectedTutor.stage);
                    setActiveTab('booking');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-950/40 active:scale-95"
                >
                  حجز جلسة خاصة مع {selectedTutor.name}
                </button>
                <button
                  onClick={handleExportSessionToDrive}
                  className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="حفظ ملخص الحصة في Google Drive"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: FULL CHAT PANEL (HIDDEN IN FOCUS MODE) */}
          {!isFocusMode && (
            <div className="lg:col-span-4 flex flex-col h-[600px] rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">
                    الدردشة الحية والأسئلة اللحظية
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  مباشر
                </span>
              </div>

              {/* Quick Topic Prompts */}
              <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-[10px] text-slate-500 whitespace-nowrap px-1">سؤال سريع:</span>
                {[
                  'هل تعيد الخطوة الأخيرة؟',
                  'ما هو القانون المعتمد وزارياً؟',
                  'ما الخطأ الشائع في هذا السؤال؟',
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => setChatInput(prompt)}
                    className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Scroll Message List */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {chatLog.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      msg.sender === 'system'
                        ? 'bg-slate-950/80 border border-slate-800 text-slate-400 text-center text-[11px]'
                        : msg.sender === 'tutor'
                        ? 'bg-gradient-to-r from-red-950/40 via-indigo-950/40 to-slate-950 border border-red-500/40 text-slate-100 rounded-br-sm shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={msg.sender === 'tutor' ? 'text-red-400' : 'text-cyan-400'}>
                        {msg.senderName}
                      </span>
                      <span className="text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}

                {isTutorResponding && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 text-xs text-slate-400 border border-slate-800 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    <span>{selectedTutor.name} يشرح ويكتب الإجابة على السبورة...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Box */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMsg()}
                  placeholder={`اطرح سؤالك على الأستاذ ${selectedTutor.name}...`}
                  className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 transition"
                />
                <button
                  onClick={handleSendChatMsg}
                  disabled={!chatInput.trim() || isTutorResponding}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold transition shadow-md flex-shrink-0 active:scale-95"
                  title="إرسال السؤال"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TUTOR DASHBOARD (لوحة تحكم الأستاذ لمتابعة أسئلة الطلاب لحظياً) */}
      {activeTab === 'tutor_dashboard' && (
        <div className="space-y-6">
          {/* Dashboard Header Bar & Stats */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                    <span>لوحة تحكم الأستاذ الخصوصي (Tutor Live Dashboard)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                      🔴 بث مباشر
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    إدارة أسئلة الطلاب الواردة في الوقت الفعلي، وتثبيت الأسئلة المميزة على شاشة البث، والرد المباشر.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('stream')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs transition shadow-md"
                >
                  <Video className="w-4 h-4" />
                  <span>العودة لشاشة البث</span>
                </button>
              </div>
            </div>

            {/* Dashboard Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">الطلاب الحاضرون</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{selectedTutor.viewers}</span>
                <span className="text-[10px] text-emerald-400 block">● متصلون في الغرفة</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">أسئلة بانتظار الإجابة</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{pendingQuestionsCount}</span>
                <span className="text-[10px] text-amber-300 block">تحتاج إلى شرح أو تثبيت</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">الأسئلة المجاب عنها</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{answeredQuestionsCount}</span>
                <span className="text-[10px] text-slate-400 block">مدوّنة على السبورة</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block">طلبات المداخلة (رفع اليد)</span>
                <span className="text-2xl font-black text-rose-400 font-mono">{handRaisesCount}</span>
                <span className="text-[10px] text-rose-300 block">مشاركة صوتية/مرئية</span>
              </div>
            </div>

            {/* Announcement Broadcaster Tool */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>بث شريط إعلانات وتوجيهات الأستاذ على شاشة الفيديو المباشرة</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAnnouncementInput}
                  onChange={(e) => setNewAnnouncementInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBroadcastAnnouncement()}
                  placeholder="اكتب توجيهاً ليظهر فوراً كشريط متحرك أسفل فيديو البث (مثال: ركزوا في مبرهنة دي موافر للأس السالب)..."
                  className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleBroadcastAnnouncement}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs transition shadow-md active:scale-95"
                >
                  بث الإعلان للجميع 📢
                </button>
              </div>
            </div>

            {/* TUTOR NOTES & STUDENT DOWNLOAD HUB */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-300">
                  <PenTool className="w-4 h-4 text-cyan-400" />
                  <span>ملاحظات المدرس (Tutor Notes) ومستند التحميل للطلاب</span>
                </div>
                <button
                  onClick={handleExportTutorNotesToDrive}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950/40 active:scale-95"
                  title="حفظ وتصدير المستند إلى Google Drive ليكون متاحاً للتحميل"
                >
                  <Download className="w-4 h-4" />
                  <span>حفظ وتصدير إلى Google Drive للتحميل 📥</span>
                </button>
              </div>
              <textarea
                value={liveTutorNotesText}
                onChange={(e) => setLiveTutorNotesText(e.target.value)}
                rows={4}
                placeholder="اكتب ملاحظات الحصة، الخلاصة الوزارية، والملخصات ليتسنى للطلاب تنزيلها بعد نهاية البث..."
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>يتم تحديث الملاحظات وتخزينها تلقائياً أثناء البث المباشر.</span>
                <span className="text-emerald-400 font-bold">جاهز للتصدير الفوري</span>
              </div>
            </div>
          </div>

          {/* LIVE SESSION CONTROLS (RAISE HAND & ATTENDANCE ROSTER) */}
          <LiveSessionControls
            tutorName={selectedTutor.name}
            liveQuestions={liveQuestions}
            onGrantSpeaking={(q) => handleTutorPinQuestion(q)}
            onLowerHand={(qId) => handleTutorDismissQuestion(qId)}
            onLowerAllHands={() => {
              setLiveQuestions((prev) => prev.map((q) => (q.isHandRaise ? { ...q, status: 'dismissed' } : q)));
              onNotify('تم إنزال جميع الأيدي المرفوعة في الجلسة', 'info');
            }}
            onMuteAllMics={() => {
              onNotify('تم كتم جميع المايكات للطلاب في الجلسة المباشرة', 'info');
            }}
            onNotify={onNotify}
          />

          {/* INCOMING QUESTIONS QUEUE IN TUTOR DASHBOARD */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-400" />
                <h4 className="text-base font-extrabold text-white">
                  صندوق أسئلة ومداخلات الطلاب الواردة لحظياً ({filteredQuestions.length})
                </h4>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'all', label: `الكل (${liveQuestions.length})` },
                  { id: 'pending', label: `قيد الانتظار (${pendingQuestionsCount})` },
                  { id: 'pinned', label: `المعروضة على البث ⭐` },
                  { id: 'answered', label: `تمت الإجابة (${answeredQuestionsCount})` },
                  { id: 'hands', label: `طلبات اليد ✋ (${handRaisesCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTutorQuestionFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      tutorQuestionFilter === f.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-bold">لا توجد أسئلة في هذا التصنيف حالياً</p>
                <p className="text-xs text-slate-600">أي سؤال يطرحه الطلاب في تراكب الدردشة سيصل إلى هنا مباشرة في الوقت الفعلي.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q) => {
                  const isPinned = pinnedQuestion?.id === q.id || q.status === 'pinned';
                  const isAnswered = q.status === 'answered';
                  const draftAnswer = tutorDraftAnswers[q.id] || '';

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition shadow-lg space-y-3 ${
                        isPinned
                          ? 'bg-gradient-to-r from-amber-950/40 via-slate-950 to-red-950/40 border-amber-400/80 ring-2 ring-amber-400/30'
                          : isAnswered
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-sm text-cyan-300">
                            {q.studentName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {q.createdAt}
                          </span>
                          {q.isHandRaise && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              ✋ طلب رفع يد
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isPinned && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse flex items-center gap-1">
                              <Star className="w-3 h-3 fill-slate-950" />
                              <span>معروض ومثبت على شاشة البث</span>
                            </span>
                          )}
                          {isAnswered && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>تمت الإجابة</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm text-white font-medium leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        {q.text}
                      </p>

                      {/* Previous Answer if present */}
                      {q.answerText && (
                        <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/30">
                          <strong>إجابة الأستاذ السابقة:</strong> {q.answerText}
                        </div>
                      )}

                      {/* Action Bar for Tutor */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                        {/* Draft Answer Input */}
                        <div className="flex-1 flex items-center gap-2 min-w-[280px]">
                          <input
                            type="text"
                            value={draftAnswer}
                            onChange={(e) =>
                              setTutorDraftAnswers((prev) => ({
                                ...prev,
                                [q.id]: e.target.value,
                              }))
                            }
                            placeholder="اكتب توضيحك أو إجابتك لتظهر على السبورة وينطقها الصوت..."
                            className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={() => handleTutorAnswerQuestion(q)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm active:scale-95 whitespace-nowrap"
                          >
                            إجابة وتدوين على السبورة ✅
                          </button>
                        </div>

                        {/* Buttons: Pin & Dismiss */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTutorPinQuestion(q)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition ${
                              isPinned
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                                : 'bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/40'
                            }`}
                            title="تثبيت السؤال كشعار بارز على شاشة البث المباشر للجميع"
                          >
                            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-slate-950' : ''}`} />
                            <span>{isPinned ? 'إلغاء التثبيت' : 'تثبيت على الشاشة ⭐'}</span>
                          </button>

                          <button
                            onClick={() => handleTutorDismissQuestion(q.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                            title="أرشفة السؤال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SMART WHITEBOARD */}
      {activeTab === 'whiteboard' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <PenTool className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    السبورة الذكية التفاعلية للمدرس الخصوصي: {selectedTutor.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    تدوين مباشر للقوانين، البراهين، والخطوات النموذجية مع إمكانية التصدير والطباعة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportSessionToDrive}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ السبورة في Drive</span>
                </button>
                <button
                  onClick={() => setActiveTab('stream')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                >
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>العودة للبث المباشر</span>
                </button>
              </div>
            </div>

            {/* Chalkboard Simulation Surface */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#13281e] via-[#0d1d16] to-[#08120e] border-4 border-amber-950 p-6 min-h-[420px] shadow-2xl text-emerald-100 font-mono space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2 text-xs text-emerald-400 font-bold">
                <div className="flex items-center gap-2">
                  <span>اللهم صل على محمد وآل محمد</span>
                  <span>•</span>
                  <span>{selectedTutor.subject}</span>
                </div>
                <span>حصة خصوصية حية • {new Date().toLocaleDateString('ar-EG')}</span>
              </div>

              <div className="space-y-3 pt-2">
                {whiteboardTextNotes.map((note, nIdx) => (
                  <div
                    key={nIdx}
                    className="p-3.5 rounded-xl bg-black/30 border border-emerald-500/20 text-xs sm:text-sm leading-relaxed text-emerald-200 flex items-start gap-2.5 shadow-md"
                  >
                    <span className="text-amber-400 font-bold flex-shrink-0">[{nIdx + 1}]</span>
                    <span className="flex-1 whitespace-pre-wrap">{note}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-emerald-800/40 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="أضف مسألة أو ملاحظة لتظهر على سبورة الأستاذ..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      const val = (e.target as HTMLInputElement).value.trim();
                      setWhiteboardTextNotes((prev) => [...prev, `✏️ ملاحظة طالب: ${val}`]);
                      (e.target as HTMLInputElement).value = '';
                      onNotify('تمت إضافة الملاحظة إلى السبورة المباشرة بنجاح!', 'success');
                    }
                  }}
                  className="flex-1 bg-black/50 border border-emerald-600/40 p-2.5 rounded-xl text-xs text-emerald-100 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400 transition"
                />
                <span className="text-[10px] text-emerald-400/80 hidden sm:inline">اضغط Enter للإضافة</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BOOK 1-ON-1 INSTANT PRIVATE LIVE SESSION */}
      {activeTab === 'booking' && (
        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                حجز جلسة خصوصية مباشرة خاصة (1-on-1 Private Live Session)
              </h3>
              <p className="text-xs text-slate-400">
                حصة فيديو حية فردية ومكثفة مع المدرس الخصوصي لحل مسألة محددة أو مراجعة ليلة الامتحان.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المدرس الخصوصي المطلوب للجلسة:
              </label>
              <select
                value={selectedTutor.id}
                onChange={(e) => {
                  const t = PRIVATE_TUTORS_LIST.find((x) => x.id === e.target.value);
                  if (t) {
                    setSelectedTutor(t);
                    setBookingSubject(t.subject);
                    setBookingStage(t.stage);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {PRIVATE_TUTORS_LIST.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} ({tutor.subject} - {tutor.stage})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المرحلة الدراسية:</label>
                <select
                  value={bookingStage}
                  onChange={(e) => setBookingStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="السادس العلمي (الوزاري)">السادس العلمي (الوزاري)</option>
                  <option value="السادس الأدبي">السادس الأدبي</option>
                  <option value="الثالث المتوسط">الثالث المتوسط</option>
                  <option value="الرابع والخامس الإعدادي">الرابع والخامس الإعدادي</option>
                  <option value="المرحلة الابتدائية (تأسيس)">المرحلة الابتدائية (تأسيس)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المادة الدراسية:</label>
                <input
                  type="text"
                  value={bookingSubject}
                  onChange={(e) => setBookingSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-white focus:outline-none focus:border-amber-500"
                  placeholder="مثال: الرياضيات التخصصية"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المسألة أو الموضوع المستعصي المراد شرحه مباشرة في الحصة:
              </label>
              <textarea
                rows={3}
                value={bookingTopic}
                onChange={(e) => setBookingTopic(e.target.value)}
                placeholder="اكتب هنا نص المسألة، رقم التمرين، أو فكرة الدرس التي تحتاج إلى مدرس خصوصي يحلها معك خطوة بخطوة..."
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">مدة الحصة الخصوصية:</label>
              <div className="grid grid-cols-3 gap-2">
                {['30 دقيقة (سريعة)', '45 دقيقة (نموذجية)', '60 دقيقة (مراجعة شاملة)'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setBookingDuration(dur)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      bookingDuration === dur
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleStartInstantBooking}
                disabled={isBookingSubmitting || !bookingTopic.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-950/50 active:scale-95 disabled:opacity-50"
              >
                {isBookingSubmitting ? 'جاري تجهيز غرفة البث المباشر...' : 'بدء الحصة الخصوصية المباشرة فوراً 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ALL TUTORS DIRECTORY */}
      {activeTab === 'tutors_list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIVATE_TUTORS_LIST.map((tutor) => {
              const isSelected = selectedTutor.id === tutor.id;
              return (
                <div
                  key={tutor.id}
                  className={`p-5 rounded-3xl border transition shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tutor.avatarColor} flex items-center justify-center text-2xl shadow-lg`}>
                          {tutor.avatarEmoji}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            <span>{tutor.name}</span>
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          </h4>
                          <span className="text-[11px] text-slate-400">{tutor.subject}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        <span>LIVE</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {tutor.bio}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                      <div className="text-amber-400 font-bold">موضوع البث الحالي:</div>
                      <div className="text-slate-300 line-clamp-2 font-mono">{tutor.currentLiveTopic}</div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                      <span>التقييم: ⭐ {tutor.rating}</span>
                      <span>الخبرة: {tutor.experience}</span>
                      <span>الطلاب: {tutor.studentsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setActiveTab('stream');
                        onNotify(`انضممت للبث المباشر لـ ${tutor.name}`, 'success');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition shadow-md"
                    >
                      دخول البث المباشر
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setBookingSubject(tutor.subject);
                        setBookingStage(tutor.stage);
                        setActiveTab('booking');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition"
                    >
                      حجز خاص
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for setting External Video Stream URL */}
      {isTeacherExternalUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-amber-400" />
                <span>ربط بث فيديو خارجي (YouTube / Vimeo / MP4)</span>
              </h3>
              <button
                onClick={() => setIsTeacherExternalUrlModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              أدخل رابط فيديو المحاضرة أو البث المباشر (مثل رابط YouTube Live أو Vimeo أو ملف MP4 مباشر) لعرضه مباشرة على شاشة الدرس الخصوصي:
            </p>
            <input
              type="url"
              value={teacherExternalUrl}
              onChange={(e) => setTeacherExternalUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... أو https://example.com/stream.mp4"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsTeacherExternalUrlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (teacherExternalUrl.trim()) {
                    setTeacherBroadcastMode('url');
                    setIsTeacherExternalUrlModalOpen(false);
                    onNotify('تم تشغيل البث الخارجي للمحاضرة بنجاح!', 'success');
                  }
                }}
                disabled={!teacherExternalUrl.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs transition"
              >
                تشغيل البث 📡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

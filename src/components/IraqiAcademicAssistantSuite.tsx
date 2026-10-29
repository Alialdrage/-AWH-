import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  Award,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Smile,
  Heart,
  Coffee,
  HelpCircle,
  RotateCcw,
  Copy,
  Check,
  CloudUpload,
  Database,
  Settings,
  ArrowRight,
  User,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Camera,
  Radio,
} from 'lucide-react';
import { PupilMood } from './PrimaryEducationRooms';
import {
  IRAQI_TEACHERS_LIST,
  TeacherDef,
  TeacherAvatar,
  StudentAvatar,
} from './IraqiAvatars';
import { ChildCameraMoodMonitor } from './ChildCameraMoodMonitor';
import { saveAcademicRecord, auth } from '../services/firestoreService';
import { uploadTextFileToDrive } from '../services/googleDriveService';

interface IraqiAcademicAssistantSuiteProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected: boolean;
  onBackToStages?: () => void;
  onNavigateToBroadcast?: () => void;
}

interface AssistantMsg {
  id: string;
  sender: 'teacher' | 'pupil';
  text: string;
  time: string;
  badge?: string;
  moodAtTime?: PupilMood;
}

export const IraqiAcademicAssistantSuite: React.FC<IraqiAcademicAssistantSuiteProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onBackToStages,
  onNavigateToBroadcast,
}) => {
  // Iraqi Teacher Persona
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return localStorage.getItem('awh_teacher_id') || 'ali';
  });

  // Student Identity
  const [studentGender, setStudentGender] = useState<'boy' | 'girl'>(() => {
    return (localStorage.getItem('awh_pupil_gender') as 'boy' | 'girl') || 'boy';
  });
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('awh_pupil_name') || 'أحمد';
  });

  // Target Educational Stage & Subject
  const [targetStage, setTargetStage] = useState<'primary' | 'intermediate' | 'preparatory'>('preparatory');
  const [currentSubject, setCurrentSubject] = useState<string>('الرياضيات والفيزياء الوزارية');

  // Psychological State of Student (from Camera or 1-Click selection)
  const [pupilMood, setPupilMood] = useState<PupilMood>('focused');

  // Audio Speech & Dictation
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Onboarding / Setup Card Toggle (Show by default or via button)
  const [showSetupCard, setShowSetupCard] = useState<boolean>(() => {
    return !localStorage.getItem('awh_persona_configured');
  });

  // Camera Panel Collapsible Toggle
  const [showCameraPanel, setShowCameraPanel] = useState<boolean>(true);

  // Active Teacher Object
  const activeTeacher =
    IRAQI_TEACHERS_LIST.find((t) => t.id === selectedTeacherId) || IRAQI_TEACHERS_LIST[0];

  const pupilHonorific = studentGender === 'girl' ? `يا وردة (${studentName})` : `يا بطل (${studentName})`;

  // Chat Log
  const [chatLog, setChatLog] = useState<AssistantMsg[]>([
    {
      id: 'init-1',
      sender: 'teacher',
      text: `يا مية هلا وكل الهلا بيك عيوني ${pupilHonorific}! اللهم صل على محمد وآل محمد. أني وياك أستاذك ${activeTeacher.name} لمرحلة (${
        targetStage === 'primary' ? 'الابتدائي' : targetStage === 'intermediate' ? 'المتوسط' : 'الإعدادي والثانوي الوزاري'
      }). تدلل بأي مسألة أو درس أو استفسار، وما يحتاج تشيل أي هم! شنو الموضوع اللي تحب نبدي بيه اليوم؟`,
      time: 'الآن',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isAiLoading]);

  // When teacher or student changes, update greeting warmly
  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    localStorage.setItem('awh_teacher_id', teacherId);
    const chosen = IRAQI_TEACHERS_LIST.find((t) => t.id === teacherId) || IRAQI_TEACHERS_LIST[0];

    const greetingText = `يا هلا وكل الهلا بيك عيوني ${pupilHonorific}! اللهم صل على محمد وآل محمد. أني وياك ${chosen.name}، وأنت اليوم ${
      studentGender === 'girl' ? 'وردة المنصة' : 'بطل المنصة'
    }. شنو الموضوع اللي تحب نبسطه ونشرحه سوية؟`;

    setChatLog((prev) => [
      ...prev,
      {
        id: `teacher-switch-${Date.now()}`,
        sender: 'teacher',
        text: greetingText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    speakTeacherText(greetingText, chosen);
    onNotify(`أهلاً بك مع ${chosen.name}! اللهم صل على محمد وآل محمد`, 'success');
  };

  const handleStudentIdentitySave = (newGender: 'boy' | 'girl', newName: string) => {
    const trimmed = newName.trim() || (newGender === 'girl' ? 'فاطمة' : 'أحمد');
    setStudentGender(newGender);
    setStudentName(trimmed);
    localStorage.setItem('awh_pupil_gender', newGender);
    localStorage.setItem('awh_pupil_name', trimmed);
    localStorage.setItem('awh_persona_configured', 'true');
    setShowSetupCard(false);

    const honorific = newGender === 'girl' ? `يا وردة (${trimmed})` : `يا بطل (${trimmed})`;
    const confirmGreeting = `عاشت إيدك ${honorific}! اللهم صل على محمد وآل محمد. تشرفت بمعرفتك، وأني أستاذك ${activeTeacher.name}، جاهز أساعدك خطوة بخطوة وتدلل!`;

    setChatLog((prev) => [
      ...prev,
      {
        id: `student-welcome-${Date.now()}`,
        sender: 'teacher',
        text: confirmGreeting,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    speakTeacherText(confirmGreeting, activeTeacher);
    onNotify('تم حفظ بياناتك بنجاح! اللهم صل على محمد وآل محمد', 'success');
  };

  // Text-to-speech for Iraqi teacher
  const speakTeacherText = (text: string, teacherObj: TeacherDef = activeTeacher) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.92;
      utterance.pitch = teacherObj.gender === 'female' ? 1.25 : 1.05;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // Microphone Speech-to-text
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onNotify('ميزة الميكروفون الصوتي غير مدعومة في هذا المتصفح', 'info');
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningMic(true);
        onNotify(`تحدث الآن بصوتك، ${activeTeacher.name} يستمع إليك...`, 'info');
      };

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          setInputText(spokenText);
          handleSendMessage(spokenText);
        }
        setIsListeningMic(false);
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
      onNotify('حدث خطأ في الميكروفون', 'error');
    }
  };

  // Send message to Iraqi Academic Tutor
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputText).trim();
    if (!promptToSend || isAiLoading) return;

    const pupilMsg: AssistantMsg = {
      id: `pupil-${Date.now()}`,
      sender: 'pupil',
      text: promptToSend,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      moodAtTime: pupilMood,
    };

    setChatLog((prev) => [...prev, pupilMsg]);
    setInputText('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/academic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: promptToSend,
          stage: targetStage,
          grade:
            targetStage === 'preparatory'
              ? 'السادس الإعدادي والثانوي الوزاري'
              : targetStage === 'intermediate'
              ? 'الثالث المتوسط الوزاري'
              : 'المرحلة الابتدائية',
          subject: currentSubject,
          mode: 'assistant_chat',
          model: 'gemini-3.8-flash',
          teacherName: activeTeacher.name,
          teacherGender: activeTeacher.gender,
          studentName,
          studentGender,
          pupilMood,
          chatHistory: chatLog.slice(-6).map((m) => ({
            role: m.sender === 'teacher' ? 'assistant' : 'user',
            text: m.text,
          })),
        }),
      });

      const res = await response.json();
      const botReply =
        res.data?.content ||
        `يا هلا بيك عيوني ${studentName}! اللهم صل على محمد وآل محمد. أني وياك ${activeTeacher.name} وتدلل بأي مسألة أو سؤال!`;

      const teacherMsg: AssistantMsg = {
        id: `teacher-${Date.now()}`,
        sender: 'teacher',
        text: botReply,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatLog((prev) => [...prev, teacherMsg]);
      speakTeacherText(teacherMsg.text, activeTeacher);

      // Auto save to Firestore
      if (auth.currentUser) {
        saveAcademicRecord({
          userId: auth.currentUser.uid,
          stage: targetStage,
          grade: targetStage === 'preparatory' ? 'إعدادي' : targetStage === 'intermediate' ? 'متوسط' : 'ابتدائي',
          title: `حوار مع ${activeTeacher.name}: ${promptToSend.slice(0, 35)}`,
          subject: currentSubject,
          mode: 'assistant_chat',
          content: `سؤال الطالب: ${promptToSend}\nرد الأستاذ (${activeTeacher.name}): ${teacherMsg.text}`,
          createdAt: new Date().toISOString(),
        }).catch((e) => console.warn('Firestore assistant note:', e));
      }
    } catch (err: any) {
      console.error('Tutor chat request error:', err);
      const fallbackMsg: AssistantMsg = {
        id: `teacher-err-${Date.now()}`,
        sender: 'teacher',
        text: `يا هلا بيك عيوني ${studentName}! اللهم صل على محمد وآل محمد. مسألتك جداً ممتعة، وأني وياك ${activeTeacher.name} خطوة بخطوة، وما يحتاج تشيل أي هم وتدلل عيوني! باوعلي، نبدأ نبسط المعطيات والمفهوم أولاً ونحله بالتسلسل.`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatLog((prev) => [...prev, fallbackMsg]);
      speakTeacherText(fallbackMsg.text, activeTeacher);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onNotify('تم نسخ النص إلى الحافظة بنجاح', 'info');
  };

  const handleSaveAllToFirestore = async () => {
    if (chatLog.length <= 1) {
      onNotify('لا توجد محادثة كافية لحفظها حالياً', 'info');
      return;
    }

    setIsSavingDb(true);
    try {
      const fullContent = chatLog
        .map((m) => `[${m.sender === 'teacher' ? activeTeacher.name : studentName}]:\n${m.text}`)
        .join('\n\n---\n\n');

      await saveAcademicRecord({
        userId: auth.currentUser?.uid || 'guest_student',
        stage: targetStage,
        grade:
          targetStage === 'preparatory'
            ? 'السادس الإعدادي الوزاري'
            : targetStage === 'intermediate'
            ? 'الثالث المتوسط'
            : 'الابتدائي',
        title: `جلسة محادثة مع ${activeTeacher.name} (${studentName})`,
        subject: currentSubject,
        mode: 'assistant_chat',
        content: fullContent,
        createdAt: new Date().toISOString(),
      });

      onNotify('تم حفظ جلسة المساعد الأكاديمي بنجاح في قاعدة البيانات الحقيقية Firestore!', 'success');
    } catch {
      onNotify('فشل الحفظ في قاعدة البيانات', 'error');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleExportToDrive = () => {
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const fullContent = chatLog
      .map((m) => `[${m.sender === 'teacher' ? activeTeacher.name : studentName} - ${m.time}]:\n${m.text}`)
      .join('\n\n====================\n\n');

    const fileName = `AWH_Tutor_${studentName}_${activeTeacher.name}_${Date.now()}.txt`;

    onRequestDriveConfirmation({
      title: 'تصدير المحادثة الأكاديمية إلى Google Drive',
      message: `هل ترغب في حفظ كافة ردود وشروحات ${activeTeacher.name} في حساب Drive الخاص بك؟`,
      itemDetails: `الملف: ${fileName}\nالأستاذ: ${activeTeacher.name}\nالمرحلة: ${targetStage}`,
      onConfirm: async () => {
        await uploadTextFileToDrive({
          name: fileName,
          content: fullContent,
          mimeType: 'text/plain',
          description: `A.W.H Academic Tutor session with ${activeTeacher.name} for ${studentName}`,
        });
        onNotify('تم تصدير ملف المحادثة بنجاح إلى Google Drive!', 'success');
      },
    });
  };

  // Stage-specific Quick Starter Questions
  const stageQuickQuestions: Record<'primary' | 'intermediate' | 'preparatory', string[]> = {
    primary: [
      'اللهم صل على محمد وآل محمد! اشرح لي جدول الضرب بأسلوب قصة ممتعة',
      'ما هي الحواس الخمس وكيف نعتني بها؟',
      'كيف أميز بين اللام الشمسية واللام القمرية؟',
      'أعطني لغز رياضي ذكي يا أستاذي!',
    ],
    intermediate: [
      'اللهم صل على محمد وآل محمد! اشرح لي حل المعادلات الخطية بمتغيرين',
      'كيف نفرق بين الخلية النباتية والخلية الحيوانية؟',
      'ما هي علامات إعراب الفعل المضارع؟',
      'طريقة سهلة لموازنة المعادلات الكيميائية للمتوسط',
    ],
    preparatory: [
      'اللهم صل على محمد وآل محمد! اشرح لي مبرهنة ديموافر ونمطها الوزاري',
      'مسألة في الكيمياء الكهربائية وقانون فرداي خطوة بخطوة',
      'أهم الأسئلة الوزارية المكررة في مادة الأحياء',
      'كيف أنظم وقتي في المراجعة المركزة قبل الامتحانات الوزارية؟',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TeacherAvatar
            teacher={activeTeacher}
            size="md"
            isSpeaking={isSpeaking}
            showBadge={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
                <span>المساعد الأكاديمي العراقي الذكي</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {activeTeacher.name}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              الأستاذ: <strong className="text-slate-200">{activeTeacher.name}</strong> • الطالب: <strong className="text-cyan-300">{studentName} ({studentGender === 'girl' ? 'وردة' : 'بطل'})</strong> • المرحلة: <strong className="text-amber-300">{targetStage === 'primary' ? 'الابتدائي' : targetStage === 'intermediate' ? 'المتوسط' : 'الإعدادي'}</strong>
            </p>
          </div>
        </div>

        {/* Toolbar action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSetupCard(!showSetupCard)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 transition"
            title="تغيير الأستاذ أو اسم وجنس الطالب"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>التعارف وتغيير الأستاذ</span>
            {showSetupCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowCameraPanel(!showCameraPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showCameraPanel
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-850 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{showCameraPanel ? 'إخفاء الكاميرا' : 'إظهار الكاميرا والمشاعر'}</span>
          </button>

          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (voiceEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className={`p-2 rounded-xl border text-xs transition ${
              voiceEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-850 text-slate-500 border-slate-700'
            }`}
            title={voiceEnabled ? 'كتم صوت الأستاذ' : 'تفعيل صوت الأستاذ'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSaveAllToFirestore}
            disabled={isSavingDb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition"
            title="حفظ المحادثة في Firestore"
          >
            <Database className="w-3.5 h-3.5" />
            <span>حفظ</span>
          </button>

          <button
            onClick={handleExportToDrive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition"
            title="تصدير إلى Google Drive"
          >
            <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drive</span>
          </button>

          {onNavigateToBroadcast && (
            <button
              onClick={onNavigateToBroadcast}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-bold transition shadow-lg shadow-red-950/20"
              title="الانتقال إلى بث الدروس والمحاضرات"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>بث مباشر</span>
            </button>
          )}

          {onBackToStages && (
            <button
              onClick={onBackToStages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>رجوع للمراحل</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: INTERACTIVE WELCOME & TEACHER SELECTION CARD (الخطوة الأولى والأساسية) */}
      {showSetupCard && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base md:text-lg font-black text-slate-100">
                  الخطوة الأولى والأساسية: التعارف واختيار الأستاذ أو الأستاذة
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                حدد أستاذك المفضل (رجل أو امرأة)، واكتب اسمك الكريم لتلتزم المنصة به طوال الحوار باللهجة العراقية الدافئة مع ذكر الصلاة على محمد وآل محمد
              </p>
            </div>
            <button
              onClick={() => setShowSetupCard(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800 self-start md:self-auto"
            >
              إغلاق البطاقة ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Male Teachers (الأساتذة الرجال) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-300 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>إذا اخترت أستاذ (ذكر):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 خيارات معتمدة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {IRAQI_TEACHERS_LIST.filter((t) => t.gender === 'male').map((t) => {
                  const isSelected = selectedTeacherId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTeacherChange(t.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600/25 border-blue-400 ring-2 ring-blue-400 text-white shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <TeacherAvatar teacher={t} size="sm" />
                      <div>
                        <span className="text-xs font-black block">{t.name}</span>
                        <span className="text-[9px] text-slate-400 block line-clamp-1">{t.subjectSpecialty}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                          المختار ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Female Teachers (الأستاذات الإناث) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>إذا اخترت أستاذة (أنثى):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 خيارات معتمدة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {IRAQI_TEACHERS_LIST.filter((t) => t.gender === 'female').map((t) => {
                  const isSelected = selectedTeacherId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTeacherChange(t.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 active:scale-95 ${
                        isSelected
                          ? 'bg-rose-600/25 border-rose-400 ring-2 ring-rose-400 text-white shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <TeacherAvatar teacher={t} size="sm" />
                      <div>
                        <span className="text-xs font-black block">{t.name}</span>
                        <span className="text-[9px] text-slate-400 block line-clamp-1">{t.subjectSpecialty}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          المختارة ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Student Identity: Name, Gender & Stage */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-slate-200">
              بيانات الطالب (شنو اسمك يا بطل / يا وردة؟):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">اسم الطالب المفضل:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="مثال: أحمد، فاطمة، مصطفى، زينب..."
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">جنس الطالب:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStudentGender('boy')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      studentGender === 'boy'
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    ولد (بطل 👦)
                  </button>
                  <button
                    onClick={() => setStudentGender('girl')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      studentGender === 'girl'
                        ? 'bg-pink-600/30 border-pink-400 text-pink-300 ring-1 ring-pink-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    بنت (وردة 👧)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">المرحلة الدراسية:</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="primary">الابتدائي (مرح، قصص، تشجيع)</option>
                  <option value="intermediate">المتوسط (أمثلة عملية، سن المراهقة)</option>
                  <option value="preparatory">الإعدادي / الثانوي (رصين، وزاري وبكالوريا)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleStudentIdentitySave(studentGender, studentName)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>تثبيت هوية التعارف وبدء الحوار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Side Chat, Right Side Camera & Student Avatar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Conversational Dialog Area (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header Bar */}
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TeacherAvatar teacher={activeTeacher} size="sm" isSpeaking={isSpeaking} />
                <div>
                  <span className="text-xs font-black text-slate-100 block">
                    حوار مباشر مع {activeTeacher.name} ({activeTeacher.gender === 'female' ? 'أستاذة أنثى' : 'أستاذ ذكر'})
                  </span>
                  <span className="text-[10px] text-cyan-400 block">
                    {targetStage === 'primary' ? 'التعليم الابتدائي' : targetStage === 'intermediate' ? 'التعليم المتوسط' : 'التعليم الإعدادي والثانوي'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  الحالة: {pupilMood}
                </span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatLog.map((msg) => {
                const isTeacher = msg.sender === 'teacher';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isTeacher ? 'justify-start' : 'justify-end'}`}
                  >
                    {isTeacher && (
                      <TeacherAvatar
                        teacher={activeTeacher}
                        size="sm"
                        isSpeaking={isSpeaking}
                        className="mt-1"
                      />
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-md text-xs leading-relaxed space-y-2 ${
                        isTeacher
                          ? 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tr-none'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tl-none font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 pb-1 border-b border-white/10">
                        <span className="font-bold">
                          {isTeacher ? activeTeacher.name : `${studentName} (${studentGender === 'girl' ? 'وردة' : 'بطل'})`}
                        </span>
                        <span>{msg.time}</span>
                      </div>

                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {isTeacher && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1 rounded text-slate-400 hover:text-white transition"
                            title="نسخ"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakTeacherText(msg.text, activeTeacher)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 transition"
                            title="استماع بالصوت"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {!isTeacher && (
                      <StudentAvatar
                        gender={studentGender}
                        name={studentName}
                        mood={msg.moodAtTime || pupilMood}
                        size="sm"
                        className="mt-1"
                      />
                    )}
                  </div>
                );
              })}

              {isAiLoading && (
                <div className="flex items-center gap-3">
                  <TeacherAvatar teacher={activeTeacher} size="sm" isSpeaking={true} />
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 rounded-tr-none text-xs text-slate-300 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>{activeTeacher.name} يفكر ويجهز إجابة عراقية مشجعة مع الصلاة على محمد وآل محمد...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Stage Quick Presets Starter Pills */}
            <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 font-bold whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>اقتراحات سريعة لـ ({targetStage === 'primary' ? 'الابتدائي' : targetStage === 'intermediate' ? 'المتوسط' : 'الإعدادي'}):</span>
              </span>
              {stageQuickQuestions[targetStage].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isAiLoading}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition whitespace-nowrap text-[10px]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Toolbar & Form */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2.5 rounded-xl border transition ${
                    isListeningMic
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title="تحدث بصوتك مباشرة"
                >
                  {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`اسأل ${activeTeacher.name} أي مسألة، قانون، أو موضوع تعليمي...`}
                  className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  disabled={isAiLoading}
                />

                <button
                  type="submit"
                  disabled={isAiLoading || !inputText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side Column: Camera & Psychological Mood Monitor (1 Col on lg) */}
        <div className="space-y-4">
          {showCameraPanel && (
            <ChildCameraMoodMonitor
              detectedMood={pupilMood}
              onMoodChange={(m) => setPupilMood(m)}
              studentGender={studentGender}
              studentName={studentName}
              onNotify={onNotify}
            />
          )}

          {/* Teacher Info Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center gap-3">
              <TeacherAvatar teacher={activeTeacher} size="md" isSpeaking={isSpeaking} />
              <div>
                <span className="text-xs font-black text-slate-100 block">{activeTeacher.name}</span>
                <span className="text-[10px] text-cyan-400 font-semibold block">{activeTeacher.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{activeTeacher.personality}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-amber-300/90 leading-relaxed">
              ⭐ يلتزم الأستاذ بذكر الصلاة على النبي وآله ("اللهم صل على محمد وآل محمد") في كافة المراحل، وتكييف الشرح حسب حالتك النفسية اللحظية.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

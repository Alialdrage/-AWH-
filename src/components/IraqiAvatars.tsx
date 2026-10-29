import React from 'react';
import { PupilMood } from './PrimaryEducationRooms';

export interface TeacherDef {
  id: string;
  name: string;
  gender: 'male' | 'female';
  title: string;
  subjectSpecialty: string;
  personality: string;
  colorScheme: {
    bgGradient: string;
    primaryColor: string;
    badgeBg: string;
    border: string;
  };
}

export const IRAQI_TEACHERS_LIST: TeacherDef[] = [
  {
    id: 'ali',
    name: 'أستاذ علي',
    gender: 'male',
    title: 'أستاذ الرياضيات والفيزياء المنهجية',
    subjectSpecialty: 'الرياضيات، الهندسة، والفيزياء للمراحل كافة',
    personality: 'هادئ، منطقي، يشرح القوانين بأمثلة من الحياة العراقية اليومية ويبسط أصعب المعادلات.',
    colorScheme: {
      bgGradient: 'from-blue-600 via-indigo-600 to-cyan-700',
      primaryColor: '#3b82f6',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      border: 'border-blue-500',
    },
  },
  {
    id: 'mohammed',
    name: 'أستاذ محمد',
    gender: 'male',
    title: 'أستاذ العلوم والتحضير الوزاري',
    subjectSpecialty: 'العلوم، الكيمياء، والأحياء ونماذج الأسئلة الوزارية',
    personality: 'صبور، حكيم، خبير في التنبؤ بأسئلة الامتحانات الوزارية وتثبيت المعلومات بالذاكرة.',
    colorScheme: {
      bgGradient: 'from-amber-600 via-orange-600 to-yellow-600',
      primaryColor: '#f59e0b',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      border: 'border-amber-500',
    },
  },
  {
    id: 'adnan',
    name: 'أستاذ عدنان',
    gender: 'male',
    title: 'أستاذ التحدي والمسائل الذكية',
    subjectSpecialty: 'حل المسائل الرياضية المعقدة والمنطق والألغاز',
    personality: 'حماسي، يشعل روح المنافسة والشجاعة في الطالب، ويحب التحديات وحل التمارين الصعبة.',
    colorScheme: {
      bgGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      primaryColor: '#10b981',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500',
    },
  },
  {
    id: 'sara',
    name: 'ست سارة',
    gender: 'female',
    title: 'معلمة الشرح المبسط والتأسيس الشامل',
    subjectSpecialty: 'اللغة العربية، القراءة، والقواعد والتأسيس القوي',
    personality: 'حنونة جداً، دافئة، تزرع الثقة في نفس الطالب وتكرر الشرح بصدر رحب دون أي ضجر.',
    colorScheme: {
      bgGradient: 'from-rose-600 via-pink-600 to-purple-600',
      primaryColor: '#f43f5e',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      border: 'border-rose-500',
    },
  },
  {
    id: 'maryam',
    name: 'ست مريم',
    gender: 'female',
    title: 'معلمة الحساب والأنشطة التفاعلية',
    subjectSpecialty: 'الحساب، جداول الضرب، والإحصاء والأنشطة الذهنية',
    personality: 'صبورة ومرحة، تحول الدروس والمسائل إلى قصص ممتعة ومسابقات ملونة تحفز الطالب.',
    colorScheme: {
      bgGradient: 'from-purple-600 via-fuchsia-600 to-indigo-700',
      primaryColor: '#a855f7',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      border: 'border-purple-500',
    },
  },
  {
    id: 'zainab',
    name: 'ست زينب',
    gender: 'female',
    title: 'معلمة العلوم والتفوق الأكاديمي',
    subjectSpecialty: 'العلوم، الطبيعيات، والتفكير الابتكاري والبحثي',
    personality: 'ملهمة وذكية، تشجع على جمع الأوسمة وتساعد الطلاب على الوصول للدرجات الكاملة.',
    colorScheme: {
      bgGradient: 'from-teal-600 via-cyan-600 to-blue-700',
      primaryColor: '#14b8a6',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      border: 'border-teal-500',
    },
  },
];

interface TeacherAvatarProps {
  teacher?: Partial<TeacherDef> | any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  className?: string;
  showBadge?: boolean;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  teacher,
  size = 'md',
  isSpeaking = false,
  className = '',
  showBadge = false,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  // Guaranteed fallback resolution
  const matched =
    IRAQI_TEACHERS_LIST.find((t) => t.id === teacher?.id) ||
    IRAQI_TEACHERS_LIST.find((t) => t.name === teacher?.name);

  const isMale = (teacher?.gender || matched?.gender || 'male') === 'male';
  const teacherId = teacher?.id || matched?.id || (isMale ? 'ali' : 'sara');

  const colorScheme =
    matched?.colorScheme ||
    teacher?.colorScheme || {
      bgGradient: isMale
        ? 'from-blue-600 via-indigo-600 to-cyan-700'
        : 'from-rose-600 via-pink-600 to-purple-600',
      primaryColor: isMale ? '#3b82f6' : '#f43f5e',
      badgeBg: isMale
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        : 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      border: isMale ? 'border-blue-500' : 'border-rose-500',
    };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {/* Outer Glow Ring when Speaking */}
      <div
        className={`relative ${sizeClasses} rounded-2xl p-1 bg-gradient-to-br ${colorScheme.bgGradient} shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isSpeaking ? 'ring-4 ring-amber-400 scale-105 animate-pulse' : 'ring-1 ring-white/20'
        }`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full rounded-xl overflow-hidden bg-slate-950/40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Background Glow */}
          <radialGradient id={`glow-${teacherId}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={colorScheme.primaryColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </radialGradient>
          <rect width="120" height="120" fill={`url(#glow-${teacherId})`} />

          {isMale ? (
            /* =================== MALE TEACHER AVATAR (أستاذ رجل) =================== */
            <g>
              {/* Shoulders & Suit Jacket */}
              <path
                d="M15 120 C18 95, 35 82, 60 82 C85 82, 102 95, 105 120 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* White Shirt Collar */}
              <polygon points="60,83 48,100 60,118 72,100" fill="#f8fafc" />
              {/* Academic Tie */}
              <polygon
                points="57,100 63,100 65,120 55,120"
                fill={colorScheme.primaryColor}
              />

              {/* Neck */}
              <rect x="52" y="68" width="16" height="18" rx="4" fill="#fed7aa" />

              {/* Head / Face */}
              <ellipse cx="60" cy="52" rx="24" ry="26" fill="#fde68a" />

              {/* Hair (Male Professional Cut) */}
              <path
                d="M36 50 C36 32, 45 22, 60 22 C75 22, 84 32, 84 50 C84 42, 80 34, 60 34 C42 34, 38 42, 36 50 Z"
                fill={teacherId === 'mohammed' ? '#475569' : '#1e293b'}
              />

              {/* Beard / Goatee for Professor Mohammed */}
              {teacherId === 'mohammed' && (
                <path
                  d="M48 62 C52 74, 68 74, 72 62 C70 76, 50 76, 48 62 Z"
                  fill="#334155"
                  opacity="0.9"
                />
              )}

              {/* Eyebrows */}
              <path d="M44 42 Q50 39 56 42" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M64 42 Q70 39 76 42" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Friendly Eyes */}
              <ellipse cx="50" cy="48" rx="3.5" ry="4" fill="#0f172a" />
              <ellipse cx="70" cy="48" rx="3.5" ry="4" fill="#0f172a" />
              <circle cx="51.5" cy="46.5" r="1.2" fill="#ffffff" />
              <circle cx="71.5" cy="46.5" r="1.2" fill="#ffffff" />

              {/* Eyeglasses for Professor Ali */}
              {teacherId === 'ali' && (
                <g stroke="#38bdf8" strokeWidth="2" fill="none">
                  <rect x="42" y="42" width="16" height="12" rx="3" />
                  <rect x="62" y="42" width="16" height="12" rx="3" />
                  <line x1="58" y1="48" x2="62" y2="48" />
                  <line x1="38" y1="46" x2="42" y2="46" />
                  <line x1="78" y1="46" x2="82" y2="46" />
                </g>
              )}

              {/* Nose */}
              <path d="M60 48 L58 56 L62 56" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Warm Smile / Speaking Mouth */}
              {isSpeaking ? (
                <ellipse cx="60" cy="65" rx="6" ry="4.5" fill="#e11d48" />
              ) : (
                <path
                  d="M52 64 Q60 71 68 64"
                  stroke="#b45309"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>
          ) : (
            /* =================== FEMALE TEACHER AVATAR (ست / أستاذة امرأة) =================== */
            <g>
              {/* Shoulders & Modest Elegant Dress */}
              <path
                d="M16 120 C20 96, 38 84, 60 84 C82 84, 100 96, 104 120 Z"
                fill="#312e81"
                stroke="#4338ca"
                strokeWidth="2"
              />
              <path
                d="M48 85 L60 102 L72 85"
                fill="#fdf2f8"
                opacity="0.95"
              />

              {/* Hijab Base & Frame */}
              <path
                d="M30 64 C28 35, 42 20, 60 20 C78 20, 92 35, 90 64 C88 88, 76 92, 60 92 C44 92, 32 88, 30 64 Z"
                fill={colorScheme.primaryColor}
              />

              {/* Neck inner cover */}
              <ellipse cx="60" cy="74" rx="14" ry="12" fill="#fed7aa" />

              {/* Inner Face Oval framed by Hijab */}
              <ellipse cx="60" cy="54" rx="20" ry="23" fill="#fde68a" />

              {/* Eyebrows (Elegant arch) */}
              <path d="M46 43 Q51 39 56 42" stroke="#451a03" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M64 42 Q69 39 74 43" stroke="#451a03" strokeWidth="2.2" fill="none" strokeLinecap="round" />

              {/* Kind Expressive Eyes with Eyelashes */}
              <ellipse cx="51" cy="48" rx="3.5" ry="4" fill="#0f172a" />
              <ellipse cx="69" cy="48" rx="3.5" ry="4" fill="#0f172a" />
              <circle cx="52.5" cy="46.5" r="1.3" fill="#ffffff" />
              <circle cx="70.5" cy="46.5" r="1.3" fill="#ffffff" />
              <path d="M46 46 Q51 44 55 46" stroke="#0f172a" strokeWidth="1.2" fill="none" />
              <path d="M65 46 Q69 44 74 46" stroke="#0f172a" strokeWidth="1.2" fill="none" />

              {/* Nose */}
              <path d="M60 49 L58.5 56 L61.5 56" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Compassionate Teacher Smile / Speaking mouth */}
              {isSpeaking ? (
                <ellipse cx="60" cy="65" rx="5.5" ry="4" fill="#db2777" />
              ) : (
                <path
                  d="M53 64 Q60 70 67 64"
                  stroke="#be185d"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Hijab decorative pin / brooch */}
              <circle cx="60" cy="85" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}

          {/* AI Badge in Top-Right Corner */}
          <g transform="translate(86, 6)">
            <rect width="28" height="15" rx="4" fill="#0f172a" opacity="0.85" stroke="#38bdf8" strokeWidth="1" />
            <text x="14" y="11" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              AI
            </text>
          </g>
        </svg>

        {/* Dynamic Speaking Waves Animation */}
        {isSpeaking && (
          <span className="absolute bottom-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow-md animate-bounce">
            يتحدث الآن 🎙️
          </span>
        )}
      </div>

      {showBadge && (
        <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-200 shadow-md">
          {isMale ? 'أستاذ (رجل)' : 'أستاذة (امرأة)'}
        </span>
      )}
    </div>
  );
};

interface StudentAvatarProps {
  gender: 'boy' | 'girl';
  name: string;
  mood?: PupilMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isAnimated?: boolean;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  gender,
  name,
  mood = 'focused',
  size = 'md',
  className = '',
  isAnimated = true,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  const isGirl = gender === 'girl';

  // Mood accent colors & expressions
  const moodTheme = {
    happy: { bg: 'from-amber-500/30 to-yellow-500/30', border: 'border-amber-400', badge: 'حماس وفرح 🌟', emoji: '⭐' },
    focused: { bg: 'from-cyan-500/30 to-blue-500/30', border: 'border-cyan-400', badge: 'تركيز وانتباه 🧠', emoji: '💡' },
    tired: { bg: 'from-indigo-500/30 to-slate-500/30', border: 'border-indigo-400', badge: 'تعب واستراحة ☕', emoji: '💤' },
    confused: { bg: 'from-purple-500/30 to-pink-500/30', border: 'border-purple-400', badge: 'محتار ويبحث 🤔', emoji: '❓' },
    anxious: { bg: 'from-rose-500/30 to-orange-500/30', border: 'border-rose-400', badge: 'قلق ومطمئن 🛡️', emoji: '❤️' },
    neutral: { bg: 'from-teal-500/30 to-emerald-500/30', border: 'border-teal-400', badge: 'هادئ ومستعد 🎈', emoji: '✨' },
  }[mood] || { bg: 'from-cyan-500/30 to-blue-500/30', border: 'border-cyan-400', badge: 'مستعد 🌟', emoji: '⭐' };

  return (
    <div className={`relative inline-flex flex-col items-center flex-shrink-0 ${className}`}>
      <div
        className={`relative ${sizeClasses} rounded-2xl p-1 bg-gradient-to-br ${moodTheme.bg} ${
          moodTheme.border
        } border-2 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isAnimated ? 'hover:scale-105' : ''
        }`}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full rounded-xl overflow-hidden bg-slate-900/60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isGirl ? (
            /* =================== STUDENT GIRL AVATAR (طالبة بنت / وردة) =================== */
            <g>
              {/* Soft Background */}
              <circle cx="60" cy="60" r="50" fill="#f43f5e" opacity="0.1" />

              {/* School Uniform / Dress */}
              <path
                d="M20 120 C24 98, 40 86, 60 86 C80 86, 96 98, 100 120 Z"
                fill="#be123c"
                stroke="#fda4af"
                strokeWidth="1.5"
              />
              {/* White Peter Pan Collar */}
              <ellipse cx="50" cy="88" rx="10" ry="5" fill="#ffffff" />
              <ellipse cx="70" cy="88" rx="10" ry="5" fill="#ffffff" />

              {/* Long Twin Ponytails / Braids or Ribbon */}
              <path d="M26 50 C18 65, 20 85, 28 98 C30 85, 32 65, 34 50 Z" fill="#451a03" />
              <path d="M94 50 C102 65, 100 85, 92 98 C90 85, 88 65, 86 50 Z" fill="#451a03" />
              {/* Pink Hair Ribbons */}
              <circle cx="28" cy="55" r="4.5" fill="#fb7185" />
              <circle cx="92" cy="55" r="4.5" fill="#fb7185" />

              {/* Neck */}
              <rect x="54" y="72" width="12" height="15" rx="3" fill="#fed7aa" />

              {/* Cute Child Face */}
              <ellipse cx="60" cy="56" rx="22" ry="23" fill="#fde68a" />

              {/* Hair Bangs / Front Hair */}
              <path
                d="M38 52 C38 34, 46 25, 60 25 C74 25, 82 34, 82 52 C76 40, 68 44, 60 40 C52 44, 44 40, 38 52 Z"
                fill="#451a03"
              />

              {/* Eyebrows reflecting Mood */}
              {mood === 'confused' ? (
                <>
                  <path d="M46 45 Q51 38 56 42" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M64 42 Q69 46 74 44" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              ) : mood === 'tired' ? (
                <>
                  <path d="M46 44 Q51 46 56 45" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M64 45 Q69 46 74 44" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              ) : mood === 'anxious' ? (
                <>
                  <path d="M46 43 Q51 47 56 44" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M64 44 Q69 47 74 43" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M46 44 Q51 40 56 44" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M64 44 Q69 40 74 44" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              )}

              {/* Big Expressive Anime/Cartoon Eyes */}
              {mood === 'tired' ? (
                <>
                  <path d="M46 52 Q51 56 56 52" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M64 52 Q69 56 74 52" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              ) : mood === 'happy' ? (
                <>
                  <path d="M46 52 Q51 46 56 52" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M64 52 Q69 46 74 52" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                  {/* Rosy Cheeks */}
                  <ellipse cx="44" cy="58" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6" />
                  <ellipse cx="76" cy="58" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6" />
                </>
              ) : (
                <>
                  <ellipse cx="51" cy="50" rx="4.2" ry="5.2" fill="#0f172a" />
                  <ellipse cx="69" cy="50" rx="4.2" ry="5.2" fill="#0f172a" />
                  <circle cx="53" cy="48" r="1.6" fill="#ffffff" />
                  <circle cx="71" cy="48" r="1.6" fill="#ffffff" />
                  <circle cx="49.5" cy="52" r="0.8" fill="#ffffff" />
                  <circle cx="67.5" cy="52" r="0.8" fill="#ffffff" />
                  {/* Rosy Cheeks */}
                  <ellipse cx="44" cy="58" rx="3.5" ry="2" fill="#f43f5e" opacity="0.4" />
                  <ellipse cx="76" cy="58" rx="3.5" ry="2" fill="#f43f5e" opacity="0.4" />
                </>
              )}

              {/* Tiny Nose */}
              <circle cx="60" cy="56" r="1.2" fill="#fbbf24" />

              {/* Mouth matching Mood */}
              {mood === 'happy' ? (
                <path d="M52 64 Q60 73 68 64" fill="#e11d48" stroke="#be123c" strokeWidth="1" />
              ) : mood === 'confused' ? (
                <ellipse cx="62" cy="65" rx="3.5" ry="3" fill="#be123c" />
              ) : mood === 'tired' ? (
                <path d="M54 66 Q60 63 66 66" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              ) : mood === 'anxious' ? (
                <path d="M54 67 Q60 63 66 67" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              ) : (
                <path d="M54 64 Q60 70 66 64" stroke="#b45309" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              )}
            </g>
          ) : (
            /* =================== STUDENT BOY AVATAR (طالب ولد / بطل) =================== */
            <g>
              {/* Soft Background */}
              <circle cx="60" cy="60" r="50" fill="#0284c7" opacity="0.1" />

              {/* School Uniform / Polo Shirt */}
              <path
                d="M20 120 C24 98, 40 86, 60 86 C80 86, 96 98, 100 120 Z"
                fill="#0369a1"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              {/* Shirt Collar */}
              <polygon points="60,86 48,96 60,105 72,96" fill="#f0f9ff" />

              {/* Neck */}
              <rect x="54" y="72" width="12" height="15" rx="3" fill="#fed7aa" />

              {/* Face */}
              <ellipse cx="60" cy="56" rx="22" ry="23" fill="#fde68a" />

              {/* Spiky / Clean Boyish Hair */}
              <path
                d="M36 50 C36 32, 45 22, 60 22 C75 22, 84 32, 84 50 C80 38, 72 32, 60 32 C48 32, 40 38, 36 50 Z"
                fill="#1e293b"
              />
              <path d="M50 22 L55 16 L60 22 L65 17 L70 23" fill="#1e293b" />

              {/* Eyebrows */}
              {mood === 'confused' ? (
                <>
                  <path d="M46 44 Q51 37 56 41" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                  <path d="M64 41 Q69 46 74 43" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                </>
              ) : mood === 'tired' ? (
                <>
                  <path d="M46 44 Q51 46 56 45" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                  <path d="M64 45 Q69 46 74 44" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                </>
              ) : mood === 'anxious' ? (
                <>
                  <path d="M46 43 Q51 47 56 44" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                  <path d="M64 44 Q69 47 74 43" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M46 43 Q51 39 56 43" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                  <path d="M64 43 Q69 39 74 43" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                </>
              )}

              {/* Eyes */}
              {mood === 'tired' ? (
                <>
                  <path d="M46 51 Q51 55 56 51" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M64 51 Q69 55 74 51" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              ) : mood === 'happy' ? (
                <>
                  <path d="M46 51 Q51 45 56 51" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M64 51 Q69 45 74 51" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <ellipse cx="51" cy="50" rx="4.2" ry="5.2" fill="#0f172a" />
                  <ellipse cx="69" cy="50" rx="4.2" ry="5.2" fill="#0f172a" />
                  <circle cx="53" cy="48" r="1.6" fill="#ffffff" />
                  <circle cx="71" cy="48" r="1.6" fill="#ffffff" />
                </>
              )}

              {/* Nose */}
              <circle cx="60" cy="56" r="1.2" fill="#fbbf24" />

              {/* Mouth */}
              {mood === 'happy' ? (
                <path d="M52 64 Q60 74 68 64" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
              ) : mood === 'confused' ? (
                <ellipse cx="62" cy="65" rx="3.5" ry="3" fill="#0369a1" />
              ) : mood === 'tired' ? (
                <path d="M54 66 Q60 63 66 66" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              ) : mood === 'anxious' ? (
                <path d="M54 67 Q60 63 66 67" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              ) : (
                <path d="M53 64 Q60 70 67 64" stroke="#b45309" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              )}
            </g>
          )}
        </svg>

        {/* Small Mood Corner Badge */}
        <span className="absolute top-1 right-1 text-xs">{moodTheme.emoji}</span>
      </div>

      <span className="mt-1 text-[11px] font-bold text-slate-200 truncate max-w-[80px]">
        {name || (isGirl ? 'الوردة' : 'البطل')}
      </span>
      <span className="text-[9px] text-cyan-400 font-semibold">{isGirl ? 'طالبة (بنت)' : 'طالب (ولد)'}</span>
    </div>
  );
};

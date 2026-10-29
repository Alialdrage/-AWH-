import React, { useState, useEffect, useRef } from 'react';
import {
  School,
  Camera,
  CameraOff,
  ShieldCheck,
  Sparkles,
  Star,
  Award,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  Heart,
  Smile,
  Meh,
  BookOpen,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Lock,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Coffee,
  Sliders,
  Check,
  UserCheck,
  User,
  Users,
  Settings,
  X,
} from 'lucide-react';
import { saveAcademicRecord, auth } from '../services/firestoreService';
import { TeacherAvatar, StudentAvatar, IRAQI_TEACHERS_LIST } from './IraqiAvatars';
import { ARLivingLettersAdventure } from './ARLivingLettersAdventure';
import { ARLivingMathAdventure } from './ARLivingMathAdventure';
import { LetterAdventureView } from './LetterAdventureView';

interface PrimaryEducationRoomsProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onBackToMainAcademic?: () => void;
}

export type PupilMood = 'happy' | 'focused' | 'tired' | 'confused' | 'anxious' | 'neutral';

export interface IraqiTeacherDef {
  id: string;
  name: string;
  gender: 'male' | 'female';
  title: string;
  description: string;
  avatarColor: string;
  badge: string;
  greetingVoice: string;
  colorScheme: {
    bgGradient: string;
    primaryColor: string;
    badgeBg: string;
    border: string;
  };
}

export const IRAQI_TEACHERS: IraqiTeacherDef[] = [
  // 3 الأساتذة (رجال)
  {
    id: 'ali',
    name: 'أستاذ علي',
    gender: 'male',
    title: 'أستاذ الرياضيات والعلوم الذكية',
    description: 'أسلوب مرح، يشجع بالصلاة على النبي، ويبسط المسائل المعقدة كأنها لعبة!',
    avatarColor: 'from-blue-600 to-cyan-600',
    badge: 'خبير الرياضيات والذكاء 🔢',
    greetingVoice: 'يا مية هلا بيك عيوني! اللهم صل على محمد وآل محمد، أني أستاذ علي وجاهز أخليك الأول بالصف!',
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
    title: 'أستاذ اللغة العربية والتفكير الإبداعي',
    description: 'مفعم بالحماس والطاقة الإيجابية، يعشق تحدي الأبطال والمسابقات.',
    avatarColor: 'from-amber-600 to-orange-600',
    badge: 'بطل الكلمات والتحدي 🏆',
    greetingVoice: 'هلا والله يا بطل! اللهم صل على محمد وآل محمد، أني أستاذ محمد واليوم راح نكسب نجوم التميز كلها!',
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
    title: 'أستاذ الاستكشاف والعلوم العامة',
    description: 'أستاذ قدير وهادئ، صبور جداً، يشرح التجارب والكون بروح أبوية حنونة.',
    avatarColor: 'from-emerald-600 to-teal-600',
    badge: 'خبير الطبيعة والاستكشاف 🌱',
    greetingVoice: 'أهلاً وسهلاً بيك عيوني، اللهم صل على محمد وآل محمد. أني أستاذ عدنان، تعال نستكشف العالم سوية!',
    colorScheme: {
      bgGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      primaryColor: '#10b981',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500',
    },
  },
  // 3 الأستاذات (نساء)
  {
    id: 'sara',
    name: 'ست سارة',
    gender: 'female',
    title: 'معلمة الحروف والقراءة والقصص',
    description: 'ابتسامة دافئة، تشرح بالقواعد والقصص المصورة وتغمر التلميذ بالحب والتشجيع.',
    avatarColor: 'from-pink-600 to-rose-600',
    badge: 'فراشة القصص والقراءة 📖',
    greetingVoice: 'يا هلا وكل الهلا بعيوني! اللهم صل على محمد وآل محمد، أني ست سارة، ومتحمسة نبدأ درسنا الحلو!',
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
    title: 'معلمة الحساب والأنشطة المرحة',
    description: 'صبورة جداً، حنونة وتهدئ من روع التلميذ وتبسط الأرقام والجداول بحب كبير.',
    avatarColor: 'from-purple-600 to-indigo-600',
    badge: 'أميرة الحساب والنجوم ⭐',
    greetingVoice: 'يا مية هلا بيك وبطلنا الغالي، اللهم صل على محمد وآل محمد. أني ست مريم، ولا تشيل هم أي درس!',
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
    description: 'ملهمة ومحفزة، تشجع على التفكير المستقل والابتكار وجمع الأوسمة الذهبية.',
    avatarColor: 'from-teal-600 to-cyan-600',
    badge: 'قائدة التفوق والإبداع 🔬',
    greetingVoice: 'هلا بالبطلة وبالبطل! اللهم صل على محمد وآل محمد، أني ست زينب، اليوم راح نتفوق ونرفع الراس!',
    colorScheme: {
      bgGradient: 'from-teal-600 via-cyan-600 to-blue-700',
      primaryColor: '#14b8a6',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      border: 'border-teal-500',
    },
  },
];

interface QuickQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PrimaryGradeRoom {
  gradeNumber: number;
  gradeId: string;
  title: string;
  ageRange: string;
  subtitle: string;
  themeColor: string;
  badgeBg: string;
  accentBg: string;
  iconChar: string;
  subjects: {
    name: string;
    icon: string;
    starterTopic: string;
    sampleQuestions: string[];
    quickCards: { title: string; desc: string; emoji: string }[];
    quizChallenge: QuickQuestion[];
  }[];
}

export const PrimaryEducationRooms: React.FC<PrimaryEducationRoomsProps> = ({
  onNotify,
  onBackToMainAcademic,
}) => {
  // Student & Teacher Identity State (Iraqi Persona)
  const [studentGender, setStudentGender] = useState<'boy' | 'girl'>(() => {
    return (localStorage.getItem('awh_pupil_gender') as 'boy' | 'girl') || 'boy';
  });
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('awh_pupil_name') || 'أحمد';
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return localStorage.getItem('awh_teacher_id') || 'ali';
  });

  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('awh_persona_configured');
  });

  const activeTeacher =
    IRAQI_TEACHERS.find((t) => t.id === selectedTeacherId) || IRAQI_TEACHERS[0];

  // 6 Dedicated Pages for 1st through 6th grade
  const [selectedGradeNum, setSelectedGradeNum] = useState<number>(1);
  const [activeClassroomTab, setActiveClassroomTab] = useState<'chat' | 'quiz' | 'cards' | 'ar_adventure'>('chat');
  const [arLessonSubject, setArLessonSubject] = useState<'five_letters' | 'reading' | 'math'>('five_letters');

  // Classroom grades definition for all 6 primary school years
  const primaryRooms: PrimaryGradeRoom[] = [
    {
      gradeNumber: 1,
      gradeId: 'grade-1',
      title: 'الصف الأول الابتدائي',
      ageRange: 'العمر: 6 سنوات',
      subtitle: 'روضة الحروف والأرقام التأسيسية والمشاعر الأولى',
      themeColor: 'from-amber-500 via-orange-500 to-yellow-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accentBg: 'border-amber-500/30 bg-amber-950/20',
      iconChar: '🎒',
      subjects: [
        {
          name: 'الرياضيات والحساب',
          icon: '🔢',
          starterTopic: 'تعلم الأعداد والعد بالترتيب من 1 إلى 20',
          sampleQuestions: [
            'كم عصفوراً على الشجرة لو كان لدينا 3 ثم جاء 2؟',
            'ما هو الرقم الذي يأتي بعد الرقم 7؟',
            'أرني كيف نعد أصابع يد واحدة كاملة!',
          ],
          quickCards: [
            { title: 'العد حتى 10', desc: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10 تفاحات لذيذة!', emoji: '🍎' },
            { title: 'الجمع اللطيف', desc: 'قطتان + قطة واحدة = ثلاث قطط تموء بمرح!', emoji: '🐱' },
            { title: 'الأكبر والأصغر', desc: 'تمساح الأرقام يفتح فمه الكبير ليأكل الرقم الأكبر دائماً (>).', emoji: '🐊' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'كم ناتج جمع: 2 + 3 ؟',
              options: ['4', '5', '6'],
              correctIndex: 1,
              explanation: 'عاشت إيدك يا بطل! نضع 3 في عقلنا ونضيف 2 ليصبح الناتج 5.',
            },
            {
              id: 2,
              question: 'ما هو الرقم الذي يأتي مباشرة بعد الرقم 9؟',
              options: ['8', '10', '11'],
              correctIndex: 1,
              explanation: 'اللهم صل على محمد وآل محمد! بعد الرقم 9 يأتي الرقم 10.',
            },
            {
              id: 3,
              question: 'أي عدد هو الأكبر بين الأعداد التالية؟',
              options: ['4', '7', '2'],
              correctIndex: 1,
              explanation: 'عاشت إيدك يا ذكي! الرقم 7 هو الأكبر بين 4 و 2.',
            },
          ],
        },
        {
          name: 'لغتي والحروف',
          icon: '📖',
          starterTopic: 'الحروف الهجائية بالفتحة والضمة والكسرة',
          sampleQuestions: [
            'ما هي الكلمة التي تبدأ بحرف (أ)؟',
            'كيف ننطق حرف (ب) عندما نضع فوقه فتحة؟',
            'هل تحب قصة الأرنب السريع؟',
          ],
          quickCards: [
            { title: 'حرف الألف (أ)', desc: 'أرنب يقفز في البستان ويأكل الجزرة الحلوة.', emoji: '🐰' },
            { title: 'حرف الباء (ب)', desc: 'بطة تسبح في شط العرب بريشها الأبيض الجميل.', emoji: '🦆' },
            { title: 'الحركات الثلاث', desc: 'الفتحة تفتح الشفتين (بَ)، الضمة تضمهما (بُ)، والكسرة تبتسم (بِ)!', emoji: '✨' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'أي كلمة من الكلمات التالية تبدأ بحرف (أ)؟',
              options: ['أسد', 'باب', 'تمر'],
              correctIndex: 0,
              explanation: 'عاشت إيدك عيوني! (أسد) يبدأ بحرف الألف (أ).',
            },
            {
              id: 2,
              question: 'كيف ننطق حرف الباء عندما يكون فوقه فتحة (بَ)؟',
              options: ['بَ (بفتح الفم)', 'بُ (بضم الفم)', 'بِ (بكسر الفم)'],
              correctIndex: 0,
              explanation: 'اللهم صل على محمد وآل محمد! الفتحة تجعلنا نفتح فمنا وننطق (بَ).',
            },
            {
              id: 3,
              question: 'ما هو الحرف الأول في كلمة (دَار)؟',
              options: ['راء (ر)', 'دال (د)', 'ألف (ا)'],
              correctIndex: 1,
              explanation: 'فدوة لعمرك يا شاطر! كلمة (دار) تبدأ بحرف الدال (د).',
            },
          ],
        },
        {
          name: 'العلوم والحواس',
          icon: '🌱',
          starterTopic: 'الحواس الخمس وكيف نكتشف بها العالم',
          sampleQuestions: [
            'بماذا نرى الألوان الجميلة والغيوم في السماء؟',
            'ما هي الحاسة التي نتذوق بها العسل اللذيذ؟',
            'كيف نحافظ على نظافة أيدينا قبل تناول الطعام؟',
          ],
          quickCards: [
            { title: 'حاسة البصر', desc: 'العينان لنرى بهما الأزهار وقوس قزح والكتب الجميلة.', emoji: '👀' },
            { title: 'حاسة السمع', desc: 'الأذنان لنستمع بهما لصوت المعلم وتغريد البلابل.', emoji: '👂' },
            { title: 'حاسة التذوق', desc: 'اللسان لنتذوق به طعم العسل الحلو والتفاح اللذيذ.', emoji: '👅' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'بأي حاسة نشم رائحة الورد والياسمين الجميلة؟',
              options: ['العين', 'الأنف', 'الأذن'],
              correctIndex: 1,
              explanation: 'اللهم صل على محمد وآل محمد! الأنف هو عضو حاسة الشم.',
            },
            {
              id: 2,
              question: 'أي عضو من أعضاء جسمنا نستخدمه لنرى به الأشياء والألوان؟',
              options: ['العينان', 'الأذنان', 'اليدان'],
              correctIndex: 0,
              explanation: 'عاشت إيدك يا بطل! العينان هما عضوا حاسة البصر.',
            },
            {
              id: 3,
              question: 'بأي حاسة نسمع صوت جرس المدرسة والقرآن الكريم؟',
              options: ['اللسان', 'الأذن', 'الأنف'],
              correctIndex: 1,
              explanation: 'يا وردة يا ذكي! الأذن هي عضو حاسة السمع.',
            },
          ],
        },
        {
          name: 'التربية الأخلاقية',
          icon: '💖',
          starterTopic: 'الصدق والتعاون ومساعدة الأصدقاء في المدرسة والبيت',
          sampleQuestions: [
            'كيف نبتسم في وجه زملائنا كل صباح ونقول صباح الخير؟',
            'ماذا نفعل عندما نرى صديقاً يحتاج مساعدة؟',
          ],
          quickCards: [
            { title: 'الابتسامة الصباحية', desc: 'نبتسم ونقول (صباح الخير عيوني) لننشر المحبة.', emoji: '☀️' },
            { title: 'النظام والنظافة', desc: 'نضع أقلامنا ودفاترنا بالحقيبة بكل ترتيب.', emoji: '🎒' },
            { title: 'إفشاء السلام', desc: 'نقول: السلام عليكم ورحمة الله وبركاته لكل من نلقاه.', emoji: '🤝' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'ماذا نقول لصديقنا عندما يقدم لنا هدية أو يساعدنا؟',
              options: ['شكراً جزيلاً', 'لا أريد', 'أهلاً'],
              correctIndex: 0,
              explanation: 'فدوة لعمرك! كلمة (شكراً جزيلاً) تدل على الأخلاق العالية.',
            },
            {
              id: 2,
              question: 'ماذا نفعل عندما يدخل المعلم إلى الصف؟',
              options: ['نقف بأدب ونحييه', 'نركض في الصف', 'نغمض أعيننا'],
              correctIndex: 0,
              explanation: 'اللهم صل على محمد وآل محمد! احترام المعلم سر التفوق والبركة.',
            },
            {
              id: 3,
              question: 'أين نضع الأوراق والمخلفات في المدرسة والصف؟',
              options: ['في سلة المهملات', 'على الأرض', 'تحت المقعد'],
              correctIndex: 0,
              explanation: 'عاشت إيدك! النظافة من الإيمان والتربية الصالحة.',
            },
          ],
        },
      ],
    },
    {
      gradeNumber: 2,
      gradeId: 'grade-2',
      title: 'الصف الثاني الابتدائي',
      ageRange: 'العمر: 7 سنوات',
      subtitle: 'مغامرة الكلمات والجمع الذكي والأشكال الهندسية',
      themeColor: 'from-emerald-500 via-teal-500 to-green-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentBg: 'border-emerald-500/30 bg-emerald-950/20',
      iconChar: '🎨',
      subjects: [
        {
          name: 'الرياضيات والحساب',
          icon: '➕',
          starterTopic: 'الجمع بإعادة التجميع (الجمع بالحمل) ومقارنة الأعداد حتى 100',
          sampleQuestions: [
            'كم ناتج 15 + 8 يا بطل؟',
            'أيهما أكبر: 45 أم 54؟ ولماذا؟',
            'ما هو الشكل الهندسي الذي له ثلاثة أضلاع؟',
          ],
          quickCards: [
            { title: 'الجمع بالحمل', desc: 'إذا زادت الآحاد عن 9، نرفع 1 فوق منزلة العشرات كهدية حلوة!', emoji: '🎁' },
            { title: 'المثلث والمربع', desc: 'المثلث 3 أضلاع، والمربع 4 أضلاع متساوية بالضبط.', emoji: '📐' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'ما ناتج: 24 + 7 ؟',
              options: ['30', '31', '32'],
              correctIndex: 1,
              explanation: 'عاشت إيدك! 4 + 7 = 11، نكتب 1 ونضيف 1 للعشرات فيصير 31.',
            },
          ],
        },
        {
          name: 'لغتي العربية',
          icon: '📝',
          starterTopic: 'اللام الشمسية واللام القمرية وتركيب الجمل المفيدة',
          sampleQuestions: [
            'كلمة (الشمس) هل لامها شمسية أم قمرية؟',
            'ركب جملة مفيدة من: (المدرسة - أحمد - ذهب - إلى)',
          ],
          quickCards: [
            { title: 'اللام الشمسية', desc: 'تُكتب ولا تُنطق، والحرف اللي بعدها مشدود (الشَّمس).', emoji: '☀️' },
            { title: 'اللام القمرية', desc: 'تُكتب وتُنطق بوضوح وعليها سكون حلو (الْقمر).', emoji: '🌙' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'كلمة (الْقَمَرُ) لامها:',
              options: ['قمرية تُنطق', 'شمسية لا تُنطق', 'بدون لام'],
              correctIndex: 0,
              explanation: 'اللهم صل على محمد وآل محمد! اللام القمرية تُكتب وتُنطق واضحة.',
            },
          ],
        },
        {
          name: 'العلوم الطبيعية',
          icon: '🐾',
          starterTopic: 'احتياجات النباتات والحيوانات للنمو والحياة',
          sampleQuestions: [
            'ماذا تحتاج النبتة في الحديقة لتصنع غذاءها؟',
            'أين تعيش الأسماك وبماذا تتنفس؟',
          ],
          quickCards: [
            { title: 'غذاء النبات', desc: 'شمس دافية، ماء عذب، هواء نقي، وتربة زينة.', emoji: '🌻' },
            { title: 'تنفس الأسماك', desc: 'تتنفس الأسماك بالخياشيم من الأكسجين الذائب بالماء.', emoji: '🐠' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'ما الجزء في النبتة الذي يمتص الماء من التربة؟',
              options: ['الأوراق', 'الجذور', 'الأزهار'],
              correctIndex: 1,
              explanation: 'برافو عيوني! الجذور هي اللي تمتص الماء والغذاء من الأرض.',
            },
          ],
        },
        {
          name: 'اللغة الإنجليزية',
          icon: '🔤',
          starterTopic: 'Colors & Family (الألوان والعائلة)',
          sampleQuestions: [
            'What is the color of the sun?',
            'How do we say (أمي) in English?',
          ],
          quickCards: [
            { title: 'Colors', desc: 'Red (أحمر), Blue (أزرق), Yellow (أصفر), Green (أخضر).', emoji: '🌈' },
            { title: 'Family', desc: 'Father (أبي), Mother (أمي), Brother (أخي), Sister (أختي).', emoji: '👨‍👩‍👧‍👦' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'What is the English word for (كتاب) ?',
              options: ['Pen', 'Book', 'Bag'],
              correctIndex: 1,
              explanation: 'Well done! Book means كتاب.',
            },
          ],
        },
      ],
    },
    {
      gradeNumber: 3,
      gradeId: 'grade-3',
      title: 'الصف الثالث الابتدائي',
      ageRange: 'العمر: 8 سنوات',
      subtitle: 'نادي أبطال جدول الضرب ومستكشفو الطبيعة والكون',
      themeColor: 'from-cyan-500 via-blue-500 to-sky-500',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accentBg: 'border-cyan-500/30 bg-cyan-950/20',
      iconChar: '🚀',
      subjects: [
        {
          name: 'الرياضيات',
          icon: '✖️',
          starterTopic: 'جدول الضرب من (2 إلى 5) ومفهوم القسمة التوزيعية',
          sampleQuestions: [
            'كم يساوي 4 × 5 ؟',
            'لو وزعنا 12 تفاحة على 3 أطفال بالتساوي، كم يأخذ كل طفل؟',
          ],
          quickCards: [
            { title: 'سر جدول الضرب', desc: 'الضرب هو جمع متكرر: 3 × 4 يعني نجمع الـ 4 ثلاث مرات (4+4+4 = 12).', emoji: '✖️' },
            { title: 'القسمة العادلة', desc: 'القسمة توزيع بالتساوي بالعدل.', emoji: '⚖️' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'كم حاصل ضرب 5 × 6 ؟',
              options: ['25', '30', '35'],
              correctIndex: 1,
              explanation: 'عاشت إيدك! 5 × 6 = 30، بطل جدول الضرب!',
            },
          ],
        },
        {
          name: 'قواعد لغتي',
          icon: '📚',
          starterTopic: 'أدوات الاستفهام، والمفرد والمثنى والجمع',
          sampleQuestions: [
            'ما هو جمع كلمة (كتاب) و(معلم)؟',
            'متى نستخدم أداة الاستفهام (لماذا)؟',
          ],
          quickCards: [
            { title: 'المفرد والمثنى', desc: 'قلم (مفرد) -> قلمان (مثنى) -> أقلام (جمع).', emoji: '✏️' },
            { title: 'أدوات السؤال', desc: 'أين (للمكان)، متى (للزمان)، كم (للعدد)، كيف (للحال).', emoji: '❓' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'ما هي الأداة المناسبة للسؤال عن الوقت والزمان؟',
              options: ['أين', 'متى', 'من'],
              correctIndex: 1,
              explanation: 'اللهم صل على محمد وآل محمد! نستخدم (متى) للسؤال عن الوقت.',
            },
          ],
        },
        {
          name: 'العلوم الحية',
          icon: '🦋',
          starterTopic: 'دورة حياة الفراشة والضفدع والنباتات الزهرية',
          sampleQuestions: ['ما هي مراحل تحول يرقة الفراشة؟', 'كيف تنمو البذرة الصغيرة لتصير شجرة؟'],
          quickCards: [
            { title: 'دورة الفراشة', desc: 'بيضة -> دودة يرقة -> شرنقة حريرية -> فراشة تطير بالألوان!', emoji: '🐛' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'أين يضع الضفدع بيضه في بداية حياته؟',
              options: ['في الماء', 'فوق الشجرة', 'في الرمل'],
              correctIndex: 0,
              explanation: 'صحيح! يضع الضفدع بيضه بالماء ليطلع منه أبو ذنيبة.',
            },
          ],
        },
        {
          name: 'الاجتماعيات والوطن',
          icon: '🗺️',
          starterTopic: 'الجهات الأصلية الأربع والرافدين ومعالم الوطن الحبيب',
          sampleQuestions: ['من أين تشرق الشمس كل صباح؟', 'ما هما النهران الخالدان في العراق؟'],
          quickCards: [
            { title: 'الجهات الأربع', desc: 'شمال، جنوب، شرق (شروق الشمس)، غرب (غروبها).', emoji: '🧭' },
            { title: 'دجلة والفرات', desc: 'شريان الخير والعطاء في بلادنا الحبيبة.', emoji: '🌊' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'من أي جهة تشرق الشمس في الصباح الباكر؟',
              options: ['الشمال', 'الشرق', 'الغرب'],
              correctIndex: 1,
              explanation: 'عاشت إيدك يا وردة! تشرق الشمس من الشرق دائماً.',
            },
          ],
        },
      ],
    },
    {
      gradeNumber: 4,
      gradeId: 'grade-4',
      title: 'الصف الرابع الابتدائي',
      ageRange: 'العمر: 9 سنوات',
      subtitle: 'مختبر التفكير اللغوي، القسمة المطولة، والتكيف البيئي',
      themeColor: 'from-indigo-500 via-purple-500 to-pink-500',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      accentBg: 'border-indigo-500/30 bg-indigo-950/20',
      iconChar: '🔍',
      subjects: [
        {
          name: 'الرياضيات',
          icon: '📐',
          starterTopic: 'القسمة المطولة، الكسور الاعتيادية، ومساحة المربع والمستطيل',
          sampleQuestions: ['ما ناتج 84 ÷ 4 ؟', 'أيهما أكبر: نصف (1/2) أم ربع (1/4)؟'],
          quickCards: [
            { title: 'القسمة السهلة', desc: '1. اقسم -> 2. اضرب -> 3. اطرح -> 4. نزل الرقم اللي بعده.', emoji: '➗' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'ما ناتج قسمة 60 ÷ 5 ؟',
              options: ['10', '12', '15'],
              correctIndex: 1,
              explanation: 'ممتاز! 12 × 5 = 60 إذن الناتج 12.',
            },
          ],
        },
        {
          name: 'قواعد اللغة العربية',
          icon: '🖋️',
          starterTopic: 'أقسام الكلمة (اسم، فعل، حرف) والجملة الفعلية والاسمية',
          sampleQuestions: ['ما هي أقسام الكلمة؟', 'ما علامة رفع الفاعل في الجملة؟'],
          quickCards: [
            { title: 'أقسام الكلمة', desc: 'اسم (محمد)، فعل (كتبَ)، حرف (في، على).', emoji: '📜' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'كلمة (يَقرَأُ) تدل على:',
              options: ['اسم', 'فعل مضارع', 'حرف جر'],
              correctIndex: 1,
              explanation: 'اللهم صل على محمد وآل محمد! (يقرأ) فعل مضارع مستمر.',
            },
          ],
        },
        {
          name: 'العلوم واستكشاف الطاقة',
          icon: '⚡',
          starterTopic: 'صور الطاقة (الحرارية، الضوئية، الصوتية) وتكيف الكائنات',
          sampleQuestions: ['كيف يتكيف الجمل مع الصحراء؟', 'كيف ينتقل الصوت في الهواء؟'],
          quickCards: [
            { title: 'سفينة الصحراء', desc: 'الخف العريض يمنع غوص أقدام الجمل في الرمال.', emoji: '🐪' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'أي كائن يغير لونه للتخفي من الخطر؟',
              options: ['الحرباء', 'الأسد', 'الفيل'],
              correctIndex: 0,
              explanation: 'عاشت إيدك! الحرباء تملك مهارة التمويه العجيبة.',
            },
          ],
        },
        {
          name: 'الدراسات الاجتماعية',
          icon: '🌍',
          starterTopic: 'قراءة الخرائط، وتضاريس العراق وآثاره الحضارية الخالدة',
          sampleQuestions: ['ما هو مفتاح الخريطة؟', 'ما أهمية آثار بابل وسومر؟'],
          quickCards: [
            { title: 'مفتاح الخريطة', desc: 'مربع يشرح الرموز والألوان بالخريطة.', emoji: '🗺️' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'اللون الأزرق في الخريطة يرمز إلى:',
              options: ['الجبال', 'المسطحات المائية', 'الصحاري'],
              correctIndex: 1,
              explanation: 'برافو! الأزرق يرمز للماء والبحار والأنهار.',
            },
          ],
        },
      ],
    },
    {
      gradeNumber: 5,
      gradeId: 'grade-5',
      title: 'الصف الخامس الابتدائي',
      ageRange: 'العمر: 10 سنوات',
      subtitle: 'أكاديمية الكسور العشرية، أجهزة جسم الإنسان، وبناء الفهم العميق',
      themeColor: 'from-pink-500 via-rose-500 to-red-500',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      accentBg: 'border-pink-500/30 bg-pink-950/20',
      iconChar: '🔬',
      subjects: [
        {
          name: 'الرياضيات',
          icon: '📊',
          starterTopic: 'الكسور العشرية وحساب الحجوم ومساحة الأشكال',
          sampleQuestions: ['احسب: 2.5 + 1.5', 'كيف نحسب حجم المكعب؟'],
          quickCards: [
            { title: 'الفاصلة العشرية', desc: 'تفصل العدد الصحيح عن الأجزاء العشرية.', emoji: '🔢' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'كم ناتج: 2.5 + 1.5 ؟',
              options: ['3.0', '4.0', '4.5'],
              correctIndex: 1,
              explanation: 'عاشت إيدك! 2.5 + 1.5 = 4.0 بالضبط.',
            },
          ],
        },
        {
          name: 'قواعد النحو العربي',
          icon: '📜',
          starterTopic: 'المبتدأ والخبر، الفاعل، المفعول به، وكان وأخواتها',
          sampleQuestions: ['أعرب: (كان الجوُّ لطيفاً)', 'ما حكم المفعول به الإعرابي؟'],
          quickCards: [
            { title: 'كان وأخواتها', desc: 'ترفع المبتدأ وتنصب الخبر (كان الامتحانُ سهلاً).', emoji: '⚡' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'حكم المفعول به الإعرابي دائماً:',
              options: ['مرفوع', 'منصوب بالفتحة', 'مجرور'],
              correctIndex: 1,
              explanation: 'اللهم صل على محمد وآل محمد! المفعول به اسم منصوب دائماً.',
            },
          ],
        },
        {
          name: 'العلوم وجسم الإنسان',
          icon: '🫀',
          starterTopic: 'الجهاز الهضمي، الدوران، والتنفس، وحالات المادة',
          sampleQuestions: ['ما هي وظيفة القلب وضخ الدم؟', 'كيف يتم تبادل الغازات في الرئتين؟'],
          quickCards: [
            { title: 'القلب النابض', desc: 'يضخ الدم النقي لكل خلية بجسمنا ليل نهار.', emoji: '❤️' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'العضو المسؤول عن تبادل الأكسجين والتنفس هو:',
              options: ['المعدة', 'الرئتان', 'الكبد'],
              correctIndex: 1,
              explanation: 'إجابة عبقرية! الرئتان هما العضو الرئيسي لتبادل الغازات.',
            },
          ],
        },
        {
          name: 'اللغة الإنجليزية',
          icon: '🌍',
          starterTopic: 'Simple Past & Daily Routines',
          sampleQuestions: ['What is the past of "go"?', 'Name 3 healthy foods in English.'],
          quickCards: [
            { title: 'Past Tense', desc: 'play -> played, watch -> watched, go -> went.', emoji: '⏳' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'What is the past tense of "go"?',
              options: ['Goed', 'Went', 'Going'],
              correctIndex: 1,
              explanation: 'Awesome! "Went" is the past of go.',
            },
          ],
        },
      ],
    },
    {
      gradeNumber: 6,
      gradeId: 'grade-6',
      title: 'الصف السادس الابتدائي',
      ageRange: 'العمر: 11 - 12 سنة',
      subtitle: 'فضاء التفوق والاستعداد للامتحانات المدرسية والوزارية',
      themeColor: 'from-violet-500 via-indigo-600 to-purple-600',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      accentBg: 'border-violet-500/30 bg-violet-950/20',
      iconChar: '🏆',
      subjects: [
        {
          name: 'الرياضيات التخصصية',
          icon: '📐',
          starterTopic: 'النسبة والتناسب، مقياس الرسم، ومساحة الدائرة والأعداد الصحيحة',
          sampleQuestions: ['قانون مساحة الدائرة؟', 'كيف نحسب مقياس الرسم في الخارطة؟'],
          quickCards: [
            { title: 'مساحة الدائرة', desc: 'المساحة = نق² × ط (نصف القطر تربيع في 22/7).', emoji: '⭕' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'محيط الدائرة يساوي:',
              options: ['القطر × ط', 'نق² × ط', 'القطر + ط'],
              correctIndex: 0,
              explanation: 'عاشت إيدك! محيط الدائرة = القطر × ط.',
            },
          ],
        },
        {
          name: 'قواعد اللغة العربية',
          icon: '✒️',
          starterTopic: 'الأفعال الخمسة، نائب الفاعل، وإن وأخواتها، والأسماء الخمسة',
          sampleQuestions: ['ما هي علامة رفع الأفعال الخمسة؟', 'ما عمل إنّ وأخواتها؟'],
          quickCards: [
            { title: 'الأفعال الخمسة', desc: 'ترفع بثبوت النون (الطلاب يدرسونَ بجد).', emoji: '📝' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'علامة رفع الأفعال الخمسة هي:',
              options: ['الضمة', 'ثبوت النون', 'الواو'],
              correctIndex: 1,
              explanation: 'اللهم صل على محمد وآل محمد! ترفع الأفعال الخمسة بثبوت النون.',
            },
          ],
        },
        {
          name: 'العلوم العامة والذرة',
          icon: '⚛️',
          starterTopic: 'الخلية، الذرة والعناصر، والكهرباء الساكنة والمتحركة',
          sampleQuestions: ['مما تتركب نواة الذرة؟', 'ما الفرق بين الشحنة الموجبة والسالبة؟'],
          quickCards: [
            { title: 'نواة الذرة', desc: 'بروتونات موجبة (+) ونيوترونات متعادلة، وتدور إلكترونات سالبة (-).', emoji: '⚛️' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'شحنة البروتون داخل نواة الذرة هي:',
              options: ['موجبة', 'سالبة', 'متعادلة'],
              correctIndex: 0,
              explanation: 'بطل حقيقي! البروتونات موجبة والإلكترونات سالبة.',
            },
          ],
        },
        {
          name: 'الاجتماعيات والوطنية',
          icon: '🏛️',
          starterTopic: 'جغرافية العراق والموارد المائية والحضارات السومرية والبابلية',
          sampleQuestions: ['أين يلتقي دجلة والفرات؟', 'ما أهمية سدود العراق؟'],
          quickCards: [
            { title: 'شط العرب', desc: 'يلتقي دجلة والفرات عند كرمة علي شمال البصرة الفيحاء.', emoji: '🌊' },
          ],
          quizChallenge: [
            {
              id: 1,
              question: 'يلتقي نهرا دجلة والفرات ليكونا شط العرب في:',
              options: ['كرمة علي شمال البصرة', 'بغداد', 'الموصل'],
              correctIndex: 0,
              explanation: 'صحيح 100%! يلتقيان في كرمة علي ليكونا شط العرب الخالد.',
            },
          ],
        },
      ],
    },
  ];

  const currentRoom =
    primaryRooms.find((r) => r.gradeNumber === selectedGradeNum) || primaryRooms[0];
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(
    currentRoom.subjects[0].name
  );

  // Conversational Chat Messages
  interface ChatMsg {
    id: string;
    sender: 'teacher' | 'pupil';
    text: string;
    emotion?: 'caring' | 'cheering' | 'explaining' | 'celebrating';
    stars?: number;
    badge?: string;
    timestamp: string;
  }

  const [chatLog, setChatLog] = useState<ChatMsg[]>([
    {
      id: 'init-1',
      sender: 'teacher',
      text: `يا هلا وكل الهلا بيك عيوني ${studentName}! اللهم صل على محمد وآل محمد. أني أستاذك ${activeTeacher.name}، وأنت اليوم ${studentGender === 'girl' ? 'وردة المنصة' : 'بطل المنصة'}. شنو تحب نتعلم بـ ${currentRoom.title}؟`,
      emotion: 'caring',
      timestamp: 'الآن',
    },
  ]);

  const [pupilInput, setPupilInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    'تدلل أستاذي! أنا جاهز ومتحمس',
    'اللهم صل على محمد وآل محمد',
    'اشرح لي فكرة ممتعة عيوني',
    'أعطني لغز أو مسابقة!',
  ]);

  // Audio / Speech Synthesis state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Rewards state
  const [totalStars, setTotalStars] = useState<number>(() => {
    const saved = localStorage.getItem('awh_pupil_stars');
    return saved ? parseInt(saved, 10) : 15;
  });
  const [earnedBadges, setEarnedBadges] = useState<string[]>([
    '🌟 نجمة الصلاة على النبي وآله',
    '🏅 وسام بطل العراق الأكاديمي',
  ]);
  const [showCelebration, setShowCelebration] = useState(false);

  // CAMERA & PSYCHOLOGICAL MOOD STATE
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [detectedMood, setDetectedMood] = useState<PupilMood>('happy');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // EXTRA PRIVACY FILTERS (Child Privacy Protections)
  const [isBlurFilterActive, setIsBlurFilterActive] = useState(false);
  const [isCartoonAvatarActive, setIsCartoonAvatarActive] = useState(false);

  // Quiz state for the active subject (composite key: gradeNum_subjectName_questionId)
  const currentSubjectObj =
    currentRoom.subjects.find((s) => s.name === selectedSubjectName) ||
    currentRoom.subjects[0];
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const getQuestionKey = (gradeNum: number, subName: string, qId: number) =>
    `${gradeNum}_${subName}_${qId}`;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Sync camera stream with video DOM element reliably
  useEffect(() => {
    if (videoRef.current) {
      if (isCameraActive && cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraStream, isCameraActive]);

  // When room changes or teacher changes, greet pupil appropriately
  useEffect(() => {
    const newRoom =
      primaryRooms.find((r) => r.gradeNumber === selectedGradeNum) || primaryRooms[0];
    setSelectedSubjectName(newRoom.subjects[0].name);

    const pupilHonorific = studentGender === 'girl' ? `يا وردة (${studentName})` : `يا بطل (${studentName})`;

    setChatLog([
      {
        id: `room-${newRoom.gradeNumber}-${Date.now()}`,
        sender: 'teacher',
        text: `يا هلا وكل الهلا بيك عيوني ${pupilHonorific}! اللهم صل على محمد وآل محمد. أني وياك ${activeTeacher.name} في ${newRoom.title}. جهزت لك أحلى الألعاب والمسابقات بمادة (${newRoom.subjects[0].name})، جاهز يا ذكي؟`,
        emotion: 'caring',
        timestamp: 'الآن',
      },
    ]);
    setSuggestedReplies([
      'تدلل أستاذي! جاهز للمغامرة',
      'اللهم صل على محمد وآل محمد',
      `اشرح لي ${newRoom.subjects[0].name}`,
      'أعطني سؤال أو لغز ذكي!',
    ]);
    setQuizAnswers({});
    setQuizSubmitted({});
  }, [selectedGradeNum, selectedTeacherId, studentName, studentGender]);

  // Save persona to localStorage
  const handleSavePersona = (tId: string, sGender: 'boy' | 'girl', sName: string) => {
    setSelectedTeacherId(tId);
    setStudentGender(sGender);
    setStudentName(sName.trim() || (sGender === 'girl' ? 'فاطمة' : 'أحمد'));
    localStorage.setItem('awh_teacher_id', tId);
    localStorage.setItem('awh_pupil_gender', sGender);
    localStorage.setItem('awh_pupil_name', sName.trim() || (sGender === 'girl' ? 'فاطمة' : 'أحمد'));
    localStorage.setItem('awh_persona_configured', 'true');
    setIsPersonaModalOpen(false);
    onNotify('تم حفظ اختيار الأستاذ وهوية الطالب بنجاح! اللهم صل على محمد وآل محمد', 'success');
  };

  // TTS Voice Output for Child
  const speakTextToChild = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean emojis from speech
      const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.92;
      // Slightly higher pitch for female teacher, normal friendly for male teacher
      utterance.pitch = activeTeacher.gender === 'female' ? 1.25 : 1.05;

      utterance.onstart = () => setIsSpeakingNow(true);
      utterance.onend = () => setIsSpeakingNow(false);
      utterance.onerror = () => setIsSpeakingNow(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // CAMERA INITIALIZATION WITH ROBUST LIFECYCLE & PRIVACY (Visual Delta only, Audio: false)
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      setCameraStream(null);
      setIsCameraActive(false);
      onNotify('تم إيقاف الكاميرا بنجاح - تم تفعيل وضع الخصوصية التامة', 'info');
      return;
    }

    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('الكاميرا غير متاحة، يمكنك استخدام الأفاتار الكرتوني المخصص واختيار حالتك النفسية مباشرة.');
        setIsCartoonAvatarActive(true);
        onNotify('الكاميرا غير متاحة، تم تفعيل الأفاتار الكرتوني الذكي للطالب', 'info');
        return;
      }

      // ONLY request video (audio: false).
      // Mood detection is strictly optical pixel delta on an internal local canvas.
      // Requesting audio: true caused browsers to fail with "Camera access error: Permission denied" if microphone was blocked.
      let stream: MediaStream;
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
        // Fallback with basic constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraStream(stream);
      setIsCameraActive(true);

      onNotify(
        'تم تشغيل الكاميرا محلياً بنجاح! 🛡️ صورك لا يتم إرسالها أو تسجيلها أو نشرها أبداً.',
        'success'
      );
    } catch (err: any) {
      // Graceful local fallback without throwing or logging console.error
      console.warn('Camera notice (safe fallback applied):', err?.message || err);
      setCameraError('لم يتم منح إذن الكاميرا أو الكاميرا غير متوفرة - تم تفعيل الأفاتار الكرتوني الذكي واختيار المشاعر يدوياً');
      setIsCartoonAvatarActive(true);
      setIsCameraActive(false);
      onNotify('تم تفعيل وضع الأفاتار الكرتوني واختيار المشاعر بنقرة واحدة!', 'info');
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [cameraStream]);

  // Periodic client-side in-memory canvas analysis (Movement & Energy)
  // Ensures 100% of calculation happens locally in browser RAM with ZERO network exposure
  useEffect(() => {
    if (!isCameraActive) return;

    let previousBrightness = 0;

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        try {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 80, 60);
            const imgData = ctx.getImageData(0, 0, 80, 60);
            let total = 0;
            for (let i = 0; i < imgData.data.length; i += 16) {
              total += imgData.data[i];
            }
            const currentBrightness = total / (imgData.data.length / 16);
            const delta = Math.abs(currentBrightness - previousBrightness);
            previousBrightness = currentBrightness;

            // If the child is actively moving and engaging
            if (delta > 8) {
              setDetectedMood('happy');
            } else if (delta > 2) {
              setDetectedMood('focused');
            }
          }
        } catch {
          // Ignore any canvas read errors (safe fallback)
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  // Speech Recognition (Mic)
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
          setPupilInput(spokenText);
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

  // SEND MESSAGE TO AI PRIMARY TUTOR
  const handleSendMessage = async (customText?: string) => {
    const messageToSend = customText || pupilInput;
    if (!messageToSend.trim() || isAiResponding) return;

    const pupilMsg: ChatMsg = {
      id: `pupil-${Date.now()}`,
      sender: 'pupil',
      text: messageToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setChatLog((prev) => [...prev, pupilMsg]);
    setPupilInput('');
    setIsAiResponding(true);

    try {
      const response = await fetch('/api/gemini/primary-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeName: currentRoom.title,
          gradeNumber: currentRoom.gradeNumber,
          subject: selectedSubjectName,
          childMessage: messageToSend,
          pupilMood: detectedMood,
          teacherName: activeTeacher.name,
          teacherGender: activeTeacher.gender,
          studentName,
          studentGender,
          chatHistory: chatLog.slice(-4).map((m) => ({
            role: m.sender === 'teacher' ? 'assistant' : 'user',
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('فشلت استجابة المعلم الذكي');
      }

      const res = await response.json();
      const aiData = res.data;

      const earned = aiData.awardedStars || 3;
      const newTotal = totalStars + earned;
      setTotalStars(newTotal);
      localStorage.setItem('awh_pupil_stars', newTotal.toString());

      if (aiData.encouragementBadge && !earnedBadges.includes(aiData.encouragementBadge)) {
        setEarnedBadges((prev) => [...prev, aiData.encouragementBadge]);
      }

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);

      const teacherMsg: ChatMsg = {
        id: `teacher-${Date.now()}`,
        sender: 'teacher',
        text:
          aiData.reply ||
          `يا هلا بيك عيوني ${studentName}! اللهم صل على محمد وآل محمد، عاشت إيدك وإجابتك ممتازة جداً!`,
        emotion: aiData.teacherEmotion || 'caring',
        stars: earned,
        badge: aiData.encouragementBadge,
        timestamp: new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setChatLog((prev) => [...prev, teacherMsg]);
      speakTextToChild(teacherMsg.text);

      if (aiData.suggestedReplies && Array.isArray(aiData.suggestedReplies)) {
        setSuggestedReplies(aiData.suggestedReplies);
      }

      // Safe Firestore auto-save of child's accomplishment
      if (auth.currentUser) {
        saveAcademicRecord({
          userId: auth.currentUser.uid,
          stage: 'primary',
          grade: currentRoom.title,
          title: `حوار مع ${activeTeacher.name}: ${selectedSubjectName} (${studentName})`,
          subject: selectedSubjectName,
          mode: 'child_dialogue',
          content: `سؤال الطالب: ${messageToSend}\nرد الأستاذ (${activeTeacher.name}): ${teacherMsg.text}\nالنجوم: +${earned}`,
          createdAt: new Date().toISOString(),
        }).catch((e) => console.warn('Firestore child record note:', e));
      }
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: ChatMsg = {
        id: `teacher-err-${Date.now()}`,
        sender: 'teacher',
        text: `عاشت إيدك يا بطل ${studentName}! اللهم صل على محمد وآل محمد. سؤالك يجنن، وأني وياك ${activeTeacher.name} ما أعوفك أبداً! ⭐`,
        emotion: 'caring',
        timestamp: 'الآن',
      };
      setChatLog((prev) => [...prev, fallbackMsg]);
      speakTextToChild(fallbackMsg.text);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Quick Quiz Question Answer Handler (keyed by unique qKey)
  const handleSelectQuizOption = (qKey: string, optionIndex: number, correctIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qKey]: optionIndex }));
    setQuizSubmitted((prev) => ({ ...prev, [qKey]: true }));

    if (optionIndex === correctIndex) {
      const newTotal = totalStars + 3;
      setTotalStars(newTotal);
      localStorage.setItem('awh_pupil_stars', newTotal.toString());
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      speakTextToChild(`اللهم صل على محمد وآل محمد! عاشت إيدك يا ذكي، إجابة صحيحة وحصلت ثلاث نجوم ذهبية!`);
      onNotify('إجابة صحيحة! اللهم صل على محمد وآل محمد (+3 نجوم) ⭐⭐⭐', 'success');
    } else {
      speakTextToChild('محاولة حلوة عيوني! لا تقلق، باوع على الشرح وراح تعرف الجواب الصح فدوة لعمرك!');
    }
  };

  const moodConfig: Record<
    PupilMood,
    { label: string; icon: any; color: string; advice: string }
  > = {
    happy: {
      label: 'سعيد ومتحمس 🌟',
      icon: Smile,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      advice: 'طاقتك عالية وابتسامتك تفتح النفس! اللهم صل على محمد وآل محمد، المعلم يشاركك الحماس ويجهز لك تحدي الأذكياء.',
    },
    focused: {
      label: 'مركّز ومنتبه 💡',
      icon: CheckCircle2,
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      advice: 'تركيزك ممتاز اليوم! المعلم يشرح لك الفكرة خطوة بخطوة بطريقة سلسة.',
    },
    tired: {
      label: 'يشعر بالتعب 😴',
      icon: Coffee,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      advice: 'المعلم يراعي تعبك: الشرح قصير ومبسط، ويذكر الصلاة على النبي وينصحك برشفة ماء واستراحة.',
    },
    confused: {
      label: 'محتار ويبحث عن تبسيط 🤔',
      icon: HelpCircle,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      advice: 'لا تشيل أي هم! المعلم يهدئك ويبسط الفكرة بقصة عراقية خفيفة تقرب المفهوم لعقلك.',
    },
    anxious: {
      label: 'قلق ومتردد 💖',
      icon: Heart,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      advice: 'أنت في أمان تام! المعلم يقول لك: فدوة لعينك لا تخاف، الخطأ أول خطوة بالتعلم وأني وياك.',
    },
    neutral: {
      label: 'مستعد وهادئ ✨',
      icon: Meh,
      color: 'bg-slate-800 text-slate-300 border-slate-700',
      advice: 'مستعدون لمغامرة تعليمية ممتعة ومليئة بالمعرفة والنجوم الذهبية!',
    },
  };

  const currentMoodInfo = moodConfig[detectedMood];

  return (
    <div className="space-y-6">
      {/* Hidden Canvas for Local In-Memory Motion Evaluation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} width="80" height="60" />

      {/* TOP BANNER: PERSONA BAR & STRICT CHILD PRIVACY GUARANTEE */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            {/* Active Teacher Visual Icon */}
            <div
              onClick={() => setIsPersonaModalOpen(true)}
              className="cursor-pointer"
              title="اضغط لتغيير الأستاذ أو هوية الطالب"
            >
              <TeacherAvatar teacher={activeTeacher as any} size="md" isSpeaking={isSpeakingNow} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>منظومة التعليم العراقي الذكي ومراعاة المشاعر</span>
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold">
                  🛡️ درع خصوصية الطفل مفعل 100%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                الأستاذ المختار: <strong className="text-amber-300">{activeTeacher.name}</strong> •{' '}
                الطالب: <strong className="text-cyan-300">{studentName} ({studentGender === 'girl' ? 'طالبة بنت 👧' : 'طالب ولد 👦'})</strong> •{' '}
                الكاميرا تعمل <strong>محلياً فقط داخل المتصفح دون حفظ أو رفع أي صور إطلاقاً</strong>.
              </p>
            </div>
          </div>

          {/* Quick Buttons: Switch Persona + Stars + Back */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => setIsPersonaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>تغيير الأستاذ / الطالب</span>
            </button>

            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs shadow-lg">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{totalStars} نجمة</span>
            </div>

            {onBackToMainAcademic && (
              <button
                onClick={onBackToMainAcademic}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
              >
                <span>المراحل الأخرى</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* THE SIX GRADE CLASSROOM PAGES SWITCHER (الصفحات الست للصفوف من الأول إلى السادس) */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              الصفحات الست للمرحلة الابتدائية (من الصف 1 إلى 6):
            </h3>
          </div>

          {/* Paging Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGradeNum((prev) => Math.max(1, prev - 1))}
              disabled={selectedGradeNum <= 1}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 font-bold transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الصف السابق</span>
            </button>
            <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-slate-800">
              صفحة {selectedGradeNum} من 6
            </span>
            <button
              onClick={() => setSelectedGradeNum((prev) => Math.min(6, prev + 1))}
              disabled={selectedGradeNum >= 6}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 font-bold transition"
            >
              <span>الصف التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Grid Classroom Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {primaryRooms.map((room) => {
            const isSelected = selectedGradeNum === room.gradeNumber;
            return (
              <button
                key={room.gradeNumber}
                onClick={() => setSelectedGradeNum(room.gradeNumber)}
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 active:scale-95 shadow-md ${
                  isSelected
                    ? `bg-gradient-to-b ${room.themeColor} text-white font-extrabold border-white/50 shadow-2xl ring-2 ring-white/30 scale-[1.03]`
                    : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow">{room.iconChar}</span>
                <span className="text-xs font-black block leading-snug">{room.title}</span>
                <span
                  className={`text-[9px] mt-1 px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {room.ageRange}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade 1 Feature Banner: AR Living Letters Adventure */}
      {selectedGradeNum === 1 && activeClassroomTab !== 'ar_adventure' && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/60 via-indigo-950/60 to-purple-950/60 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🌟</span>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>جديد الصف الأول: مغامرة الحروف والواقع المعزز (3D AR) مع ساهر وسارة!</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                  تجربة تفاعلية 🚀
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                تعلّم القراءة والحروف الـ 10 الأولى مع أزياء الفضاء والاستكشاف وتتبع الحروف وصيد الفقاعات.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveClassroomTab('ar_adventure')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex-shrink-0"
          >
            <span>انطلق في مغامرة الواقع المعزز الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN DUAL-PANEL CLASSROOM INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / TOP: CONVERSATIONAL INTERACTIVE TEACHER (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/70 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Classroom Header Bar */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Teacher Avatar Portrait */}
              <TeacherAvatar
                teacher={activeTeacher as any}
                size="sm"
                isSpeaking={isSpeakingNow}
              />

              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{activeTeacher.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    {activeTeacher.title}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentRoom.title} • الطالب: <strong className="text-cyan-300">{studentName}</strong>
                </p>
              </div>
            </div>

            {/* Mode Switcher inside the classroom */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveClassroomTab('chat')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeClassroomTab === 'chat'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💬 حوار {activeTeacher.name}
              </button>
              <button
                onClick={() => setActiveClassroomTab('quiz')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeClassroomTab === 'quiz'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⭐ مسابقة النجوم
              </button>
              <button
                onClick={() => setActiveClassroomTab('cards')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeClassroomTab === 'cards'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎨 السبورة المصورة
              </button>
              <button
                onClick={() => setActiveClassroomTab('ar_adventure')}
                className={`px-3 py-1.5 rounded-xl font-black transition flex items-center gap-1 ${
                  activeClassroomTab === 'ar_adventure'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <span>🌟</span>
                <span>الواقع المعزز والحروف (3D AR)</span>
              </button>
            </div>

            {/* Voice Read Aloud Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  voiceEnabled
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="تشغيل/إيقاف القراءة الصوتية للمعلم"
              >
                {voiceEnabled ? (
                  <>
                    <Volume2
                      className={`w-3.5 h-3.5 ${isSpeakingNow ? 'animate-bounce text-cyan-400' : ''}`}
                    />
                    <span>صوت {activeTeacher.name}: مفعل</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>صوت المعلم: صامت</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject Tabs within this grade */}
          <div className="flex items-center gap-1.5 p-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-xs">
            <span className="text-[11px] text-slate-500 font-semibold px-2 flex-shrink-0">
              المادة الدراسية:
            </span>
            {currentRoom.subjects.map((sub, sIdx) => {
              const isSubActive = selectedSubjectName === sub.name;
              return (
                <button
                  key={sIdx}
                  onClick={() => setSelectedSubjectName(sub.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition flex-shrink-0 ${
                    isSubActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CONVERSATIONAL CHAT */}
          {activeClassroomTab === 'chat' && (
            <>
              {/* Interactive Chat Scroll Area */}
              <div className="flex-1 p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[460px] overflow-y-auto">
                {chatLog.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'pupil' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Teacher Message Avatar */}
                    {msg.sender === 'teacher' && (
                      <TeacherAvatar
                        teacher={activeTeacher as any}
                        size="sm"
                        isSpeaking={isSpeakingNow}
                        className="mt-1"
                      />
                    )}

                    <div
                      className={`p-4 rounded-3xl max-w-[85%] sm:max-w-[78%] space-y-2 shadow-md ${
                        msg.sender === 'pupil'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-950/90 border border-slate-800 text-slate-100 rounded-bl-sm ring-1 ring-white/5'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {/* Badges or Stars celebration if awarded */}
                      {msg.stars && msg.stars > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/80">
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>+{msg.stars} نجوم تشجيعية!</span>
                          </div>
                          {msg.badge && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs">
                              <Award className="w-3.5 h-3.5 text-purple-400" />
                              <span>{msg.badge}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] opacity-60 pt-1 font-mono">
                        <span>
                          {msg.sender === 'teacher'
                            ? activeTeacher.name
                            : `${studentName} (${studentGender === 'girl' ? 'الوردة' : 'البطل'})`}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {/* Student Message Avatar (Boy or Girl) */}
                    {msg.sender === 'pupil' && (
                      <StudentAvatar
                        gender={studentGender}
                        name={studentName}
                        mood={detectedMood}
                        size="sm"
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}

                {isAiResponding && (
                  <div className="flex items-center gap-3 text-xs text-slate-400 animate-pulse">
                    <TeacherAvatar teacher={activeTeacher as any} size="sm" isSpeaking={true} />
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
                      <span>{activeTeacher.name} يفكر ويجهز رداً عراقياً مشجعاً ولطيفاً...</span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Tap Suggested Iraqi Replies */}
              <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[10px] text-slate-500 font-semibold px-1 whitespace-nowrap">
                  رد سريع:
                </span>
                {suggestedReplies.map((reply, rIdx) => (
                  <button
                    key={rIdx}
                    onClick={() => handleSendMessage(reply)}
                    disabled={isAiResponding}
                    className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition whitespace-nowrap text-xs flex-shrink-0 active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input Box: Text and Microphone */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`p-3 rounded-2xl transition flex-shrink-0 shadow-md ${
                    isListeningMic
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                  title="تحدث بصوتك مباشرة مع الأستاذ"
                >
                  {isListeningMic ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <input
                  type="text"
                  value={pupilInput}
                  onChange={(e) => setPupilInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`اكتب سؤالك أو إجابتك لـ ${activeTeacher.name}...`}
                  className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={isAiResponding || !pupilInput.trim()}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition shadow-lg flex-shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">إرسال</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: QUICK QUIZ CHALLENGE */}
          {activeClassroomTab === 'quiz' && (
            <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[500px]">
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-300">
                    مسابقة النجوم والأبطال: {selectedSubjectName} ({currentRoom.title})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    أجب صح واكسب +3 نجوم ذهبية وصلاة على النبي وآله!
                  </p>
                </div>
                <Award className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>

              {currentSubjectObj.quizChallenge.map((q, qIdx) => {
                const qKey = getQuestionKey(selectedGradeNum, selectedSubjectName, q.id);
                const selectedOpt = quizAnswers[qKey];
                const isAnswered = quizSubmitted[qKey];

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <span className="text-xs font-bold text-cyan-400 block">السؤال {qIdx + 1}:</span>
                    <h5 className="text-sm font-extrabold text-white">{q.question}</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = selectedOpt === oIdx;
                        const isCorrect = oIdx === q.correctIndex;

                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';
                        if (isAnswered) {
                          if (isCorrect)
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                          else if (isChosen) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isAnswered}
                            onClick={() => handleSelectQuizOption(qKey, oIdx, q.correctIndex)}
                            className={`p-3 rounded-xl border text-xs sm:text-sm text-center transition ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: VISUAL CONCEPT CARDS */}
          {activeClassroomTab === 'cards' && (
            <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[500px]">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-cyan-300">
                    السبورة المصورة للطفل: {selectedSubjectName} ({currentRoom.title})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    بطاقات ملونة ومبسطة لشرح المفاهيم بأجمل أسلوب عراقي محبب!
                  </p>
                </div>
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSubjectObj.quickCards.map((card, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-amber-500/40 transition shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{card.emoji}</span>
                      <h5 className="text-xs sm:text-sm font-black text-white">{card.title}</h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `اشرح لي بالتفصيل يا ${activeTeacher.name} عن: ${card.title}`
                        )
                      }
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 pt-1"
                    >
                      <span>اسأل {activeTeacher.name} عن هذا المفهوم</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AR LIVING LETTERS & MATH ADVENTURE (مغامرات الواقع المعزز) */}
          {activeClassroomTab === 'ar_adventure' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[650px] space-y-4">
              {/* AR Subject Switcher: Five Letters 3D vs Reading & Letters 10 vs Math Fruit Orchard */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold ml-1">ميدان الواقع المعزز:</span>
                  <button
                    onClick={() => setArLessonSubject('five_letters')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      arLessonSubject === 'five_letters'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black ring-2 ring-white/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🦁</span>
                    <span>بطاقات الحروف الـ 5 الأولى (3D)</span>
                  </button>
                  <button
                    onClick={() => setArLessonSubject('reading')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      arLessonSubject === 'reading'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md font-black'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>📖</span>
                    <span>مغامرة الحروف والتتبع (10 حروف)</span>
                  </button>
                  <button
                    onClick={() => setArLessonSubject('math')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      arLessonSubject === 'math'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>🍎</span>
                    <span>بستان الأرقام ومختبر الرياضيات</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  محرك DeepSeek-R1 التربوي 🐋
                </span>
              </div>

              {arLessonSubject === 'five_letters' ? (
                <LetterAdventureView
                  onNotify={onNotify}
                  onBack={() => setArLessonSubject('reading')}
                />
              ) : arLessonSubject === 'reading' ? (
                <ARLivingLettersAdventure
                  onNotify={onNotify}
                  onAddStars={(count) => {
                    setTotalStars((prev) => {
                      const next = prev + count;
                      localStorage.setItem('awh_pupil_stars', next.toString());
                      return next;
                    });
                  }}
                  initialStars={totalStars}
                />
              ) : (
                <ARLivingMathAdventure
                  onNotify={onNotify}
                  onAddStars={(count) => {
                    setTotalStars((prev) => {
                      const next = prev + count;
                      localStorage.setItem('awh_pupil_stars', next.toString());
                      return next;
                    });
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* RIGHT: CAMERA MOOD MONITOR & DYNAMIC STUDENT/TEACHER AVATAR (4 COLS) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* CAMERA MONITOR CARD */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  مراقب المشاعر والحالة النفسية
                </h4>
              </div>

              <button
                onClick={toggleCamera}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition active:scale-95 ${
                  isCameraActive
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
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

            {/* Video Viewport / Mirror or Animated Cartoon Avatar Mode */}
            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Always kept in DOM so videoRef is never null */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  display: isCameraActive && !isCartoonAvatarActive ? 'block' : 'none',
                  filter: isBlurFilterActive ? 'blur(10px)' : 'none',
                }}
                className="w-full h-full object-cover transform scale-x-[-1] transition-all duration-300"
              />

              {isCameraActive && isCartoonAvatarActive && (
                /* Cartoon Avatar Privacy Mirror tailored to Student Gender */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 p-4 space-y-2">
                  <StudentAvatar
                    gender={studentGender}
                    name={studentName}
                    mood={detectedMood}
                    size="lg"
                  />
                  <span className="text-[10px] text-slate-400">حماية بصرية كاملة لوجه الطفل (أفاتار مشفر)</span>
                </div>
              )}

              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <StudentAvatar
                    gender={studentGender}
                    name={studentName}
                    mood={detectedMood}
                    size="lg"
                  />
                  <p className="text-[10px] text-slate-400 max-w-[210px] leading-relaxed">
                    شغّل الكاميرا لتحليل حالتك النفسية محلياً، أو اختر حالتك بالأسفل بنقرة واحدة!
                  </p>
                </div>
              )}

              {/* Local Processing Privacy Indicator */}
              {isCameraActive && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] text-emerald-400 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>معالجة داخلية محمية</span>
                </div>
              )}
            </div>

            {/* Privacy Controls for Camera */}
            {isCameraActive && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  onClick={() => setIsBlurFilterActive(!isBlurFilterActive)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                    isBlurFilterActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>طمس الكاميرا (Blur)</span>
                </button>

                <button
                  onClick={() => setIsCartoonAvatarActive(!isCartoonAvatarActive)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                    isCartoonAvatarActive
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>أفاتار {studentGender === 'girl' ? 'بنت' : 'ولد'} آمن</span>
                </button>
              </div>
            )}

            {cameraError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded-xl border border-rose-800/40">
                {cameraError}
              </p>
            )}

            {/* Current Psychological State Detection */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                الحالة النفسية المستخرجة للطالب:
              </span>

              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${currentMoodInfo.color}`}
              >
                <div className="flex items-center gap-2">
                  <currentMoodInfo.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-extrabold text-xs sm:text-sm">{currentMoodInfo.label}</span>
                </div>
                <span className="text-[10px] font-mono opacity-75">تحليل لحظي</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-850">
                {currentMoodInfo.advice}
              </p>
            </div>

            {/* Manual Mood Override / Selection for Parent or Pupil */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 block">
                أو اختر حالتك النفسية يدوياً بدون كاميرا:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['happy', 'focused', 'tired', 'confused', 'anxious'] as PupilMood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setDetectedMood(m);
                      onNotify(`تم ضبط حالة الطالب على: ${moodConfig[m].label}`, 'info');
                    }}
                    className={`p-1.5 rounded-xl border text-[11px] text-center transition ${
                      detectedMood === m
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {moodConfig[m].label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Guarantee Seal */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-start gap-2 text-[10px] text-slate-300 leading-relaxed">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>ضمان الخصوصية التامة:</strong> البث المباشر محصور تماماً داخل متصفح التلميذ ولا يغادر جهازه، لحماية خصوصية القاصرين بنسبة 100%.
              </span>
            </div>
          </div>

          {/* ACTIVE TEACHER & STUDENT PROFILE CARD */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>هوية المعلم والتلميذ</span>
              </h4>
              <button
                onClick={() => setIsPersonaModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:underline font-bold"
              >
                تعديل
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeTeacher.avatarColor} flex items-center justify-center text-2xl text-white shadow-md`}
              >
                {activeTeacher.gender === 'female' ? '👩‍🏫' : '👨‍🏫'}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-extrabold text-white truncate">{activeTeacher.name}</h5>
                <p className="text-[10px] text-amber-300 font-medium truncate">{activeTeacher.badge}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{activeTeacher.description}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${
                  studentGender === 'girl'
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-600'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                } flex items-center justify-center text-2xl text-white shadow-md`}
              >
                {studentGender === 'girl' ? '👧' : '👦'}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-extrabold text-white truncate">
                  {studentName} ({studentGender === 'girl' ? 'طالبة بنت' : 'طالب ولد'})
                </h5>
                <p className="text-[10px] text-cyan-300 font-medium">
                  {currentRoom.title} • {totalStars} نجمة تميز
                </p>
              </div>
            </div>

            {/* Badges Vault */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] text-slate-500 block">الأوسمة المكتسبة:</span>
              {earnedBadges.map((badge, bIdx) => (
                <div
                  key={bIdx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: IRAQI TEACHER & STUDENT PERSONA SELECTION (القاعدة 1: التعارف واختيار الأستاذ) */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    التعارف واختيار الأستاذ المفضل (منصة العراق الذكية)
                  </h3>
                  <p className="text-xs text-slate-400">
                    يا مية هلا وغلا عيوني! اللهم صل على محمد وآل محمد
                  </p>
                </div>
              </div>

              {localStorage.getItem('awh_persona_configured') && (
                <button
                  onClick={() => setIsPersonaModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Student Gender & Name */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-extrabold text-cyan-300 block">
                أولاً: حدد هويتك واسمك يا شاطر (طالب ولد 👦 أو طالبة بنت 👧):
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStudentGender('boy')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-3 transition ${
                    studentGender === 'boy'
                      ? 'bg-blue-600/30 border-cyan-400 text-white font-bold ring-2 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-3xl">👦</span>
                  <div className="text-right">
                    <span className="block text-xs font-black">طالب ولد (بطل)</span>
                    <span className="text-[10px] text-cyan-300">أحمد، علي، حيدر...</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentGender('girl')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-3 transition ${
                    studentGender === 'girl'
                      ? 'bg-pink-600/30 border-pink-400 text-white font-bold ring-2 ring-pink-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-3xl">👧</span>
                  <div className="text-right">
                    <span className="block text-xs font-black">طالبة بنت (وردة)</span>
                    <span className="text-[10px] text-pink-300">فاطمة، زينب، نور...</span>
                  </div>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  شنو اسمك الحقيقي أو المفضل؟ ({studentGender === 'girl' ? 'يا وردة' : 'يا بطل'}):
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={studentGender === 'girl' ? 'مثال: فاطمة' : 'مثال: أحمد'}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Choose Teacher Persona: 3 Men or 3 Women */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-amber-300 block">
                ثانياً: اختر أستاذك أو أستاذتك المفضلة (رجل أو امرأة):
              </label>

              {/* Men Teachers */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 block">الأساتذة (رجال 👨‍🏫):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {IRAQI_TEACHERS.filter((t) => t.gender === 'male').map((t) => {
                    const isSelected = selectedTeacherId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(t.id)}
                        className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-b from-blue-900/60 to-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-2xl">👨‍🏫</span>
                          <div>
                            <span className="text-xs font-extrabold block text-white">{t.name}</span>
                            <span className="text-[10px] text-cyan-300 font-mono">{t.badge}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Women Teachers */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 block">الأستاذات (نساء 👩‍🏫):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {IRAQI_TEACHERS.filter((t) => t.gender === 'female').map((t) => {
                    const isSelected = selectedTeacherId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(t.id)}
                        className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-b from-pink-900/60 to-purple-950/60 border-pink-400 ring-2 ring-pink-400 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-2xl">👩‍🏫</span>
                          <div>
                            <span className="text-xs font-extrabold block text-white">{t.name}</span>
                            <span className="text-[10px] text-pink-300 font-mono">{t.badge}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSavePersona(selectedTeacherId, studentGender, studentName)}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>تأكيد الهوية والبدء مع {activeTeacher.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

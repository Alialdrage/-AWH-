import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Calculator,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  CloudUpload,
  Cpu,
  RefreshCw,
  Award,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  Brain,
  Send,
  Trash2,
  Clock,
  RotateCcw,
  Lightbulb,
  School,
  Backpack,
  MessageSquare,
  MessageCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  Filter,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Smile,
  Heart,
  Coffee,
  Meh,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { uploadTextFileToDrive } from '../services/googleDriveService';
import { SocialShareBar } from './SocialShareBar';
import {
  saveAcademicRecord,
  getAcademicRecords,
  deleteAcademicRecord,
  saveQuizScore,
  getQuizScores,
  saveStudySchedule,
  getStudySchedules,
  saveAcademicComment,
  getAcademicComments,
  deleteAcademicComment,
  AcademicRecord,
  QuizScoreRecord,
  StudyScheduleRecord,
  AcademicComment,
  auth,
  GradeContentRecord,
  saveGradeContent,
  getGradeContents,
  deleteGradeContent,
} from '../services/firestoreService';
import { PrimaryEducationRooms, IRAQI_TEACHERS, PupilMood } from './PrimaryEducationRooms';
import { IraqiAcademicAssistantSuite } from './IraqiAcademicAssistantSuite';
import { EducationalLibraryViewer } from './EducationalLibraryViewer';

interface AcademicEducationViewProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  isDriveConnected: boolean;
  onNavigateHome?: () => void;
  onNavigateToBroadcast?: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizData {
  quizTitle: string;
  stage: string;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
}

interface Flashcard {
  id: number;
  front: string;
  back: string;
  hint?: string;
}

interface FlashcardData {
  title: string;
  stage: string;
  subject: string;
  cards: Flashcard[];
}

interface GradeDef {
  id: string;
  name: string;
  levelBadge: string;
  description: string;
  subjects: string[];
  quickTopics: { label: string; subject: string; topic: string }[];
}

export const AcademicEducationView: React.FC<AcademicEducationViewProps> = ({
  onNotify,
  onRequestDriveConfirmation,
  isDriveConnected,
  onNavigateHome,
  onNavigateToBroadcast,
}) => {
  const [activeStage, setActiveStage] = useState<'primary' | 'intermediate' | 'preparatory' | 'assistant'>('primary');
  const [primaryViewMode, setPrimaryViewMode] = useState<'interactive_room' | 'academic_studio'>('interactive_room');

  const gradeDivisions: Record<'primary' | 'intermediate' | 'preparatory' | 'assistant', GradeDef[]> = {
    primary: [
      {
        id: 'p1',
        name: 'الصف الأول الابتدائي',
        levelBadge: 'تأسيسي 1',
        description: 'الأعداد من 1 إلى 100، الحروف الهجائية بالحركات، الجمع والطرح البسيط، والحواس الخمس',
        subjects: ['الرياضيات والحساب', 'لغتي العربية والقراءة', 'العلوم المبسطة والاستكشاف', 'التربية الأخلاقية'],
        quickTopics: [
          { label: 'العد والترتيب التصاعدي والتنازلي (1 - 20)', subject: 'الرياضيات والحساب', topic: 'العد من 1 إلى 20 ومقارنة الأكبر والأصغر بأمثلة ممتعة' },
          { label: 'نطق الحروف بالحركات القصيرة (فتح، ضم، كسر)', subject: 'لغتي العربية والقراءة', topic: 'نطق وكتابة الحروف بالحركات الثلاث مع كلمات توضيحية' },
          { label: 'الحواس الخمس وكيف نعتني بها', subject: 'العلوم المبسطة والاستكشاف', topic: 'أعضاء الحواس الخمس ووظيفة كل حاسة في حمايتنا واكتشاف العالم' },
          { label: 'الحروف المتشابهة في الرسم (ب، ت، ث، ن)', subject: 'لغتي العربية والقراءة', topic: 'التمييز بين مواضع النقاط ونطق الحروف المتشابهة بدقة' },
          { label: 'مقارنة الأطوال والأحجام (أطول، أقصر، أكبر)', subject: 'الرياضيات والحساب', topic: 'مقارنة الأشياء المحيطة بالأطوال والمقاييس المصورة' },
        ],
      },
      {
        id: 'p2',
        name: 'الصف الثاني الابتدائي',
        levelBadge: 'تأسيسي 2',
        description: 'الجمع بالحمل، الأشكال الهندسية، تكوين الجمل، واحتياجات الكائنات الحية',
        subjects: ['الرياضيات والحساب', 'لغتي العربية', 'العلوم الطبيعية', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'الجمع بإعادة التجميع (الجمع بالحمل)', subject: 'الرياضيات والحساب', topic: 'طريقة جمع عددين مع إعادة التجميع بطريقة بصرية سهلة' },
          { label: 'اللام الشمسية واللام القمرية', subject: 'لغتي العربية', topic: 'التمييز بين نطق اللام الشمسية والقمرية مع أمثلة ملونة' },
          { label: 'ماذا تحتاج النباتات والحيوانات لتعيش؟', subject: 'العلوم الطبيعية', topic: 'الماء والضوء والهواء والغذاء وكيف يتغذى كل كائن حي' },
          { label: 'جدول الضرب للعددين 2 و 3 بطريقة القفز', subject: 'الرياضيات والحساب', topic: 'العد القفزي بمقدار 2 و 3 وحفظ حقائق الضرب الأولية' },
          { label: 'التنوين بأنواعه: فتح وضم وكسر', subject: 'لغتي العربية', topic: 'الفرق بين النون الساكنة والتنوين مع جمل تطبيقية' },
        ],
      },
      {
        id: 'p3',
        name: 'الصف الثالث الابتدائي',
        levelBadge: 'تأسيسي 3',
        description: 'جداول الضرب الأساسية (2-5)، أدوات الاستفهام، ودورات حياة الكائنات الحية',
        subjects: ['الرياضيات', 'العلوم', 'قواعد اللغة العربية', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'جدول الضرب للأعداد (2، 3، 4، 5) بطريقة بصرية', subject: 'الرياضيات', topic: 'حفظ وفهم جدول الضرب عن طريق الأنماط والجمع المتكرر' },
          { label: 'دورة حياة الفراشة والضفدع', subject: 'العلوم', topic: 'مراحل نمو وتحول الفراشة والضفدع من البيضة إلى الكائن الكامل' },
          { label: 'أدوات الاستفهام (من، أين، متى، كيف، لماذا)', subject: 'قواعد اللغة العربية', topic: 'استخدام أدوات الاستفهام لصياغة أسئلة صحيحة' },
          { label: 'الكسور الاعتيادية كجزء من كل (نصف، ربع، ثلث)', subject: 'الرياضيات', topic: 'تمثيل الكسور برسومات دائرية ومستطيلة وتطبيقاتها' },
          { label: 'حالات المادة الثلاث: صلبة وسائلة وغازية', subject: 'العلوم', topic: 'خواص كل حالة من حالات المادة وكيف تتغير بالتسخين والتبريد' },
        ],
      },
      {
        id: 'p4',
        name: 'الصف الرابع الابتدائي',
        levelBadge: 'ابتدائي 4',
        description: 'القسمة والضرب المطول، الكسور الاعتيادية، أقسام الكلمة، والتكيف الحيوي',
        subjects: ['الرياضيات', 'العلوم', 'قواعد اللغة العربية', 'الاجتماعيات', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'القسمة المطولة على رقم واحد بدون باقٍ', subject: 'الرياضيات', topic: 'خطوات القسمة الأربع: اقسم، اضرب، اطرح، أنزل الرقم' },
          { label: 'أقسام الكلمة: الاسم والفعل والحرف', subject: 'قواعد اللغة العربية', topic: 'علامات الاسم وأنواع الأفعال (ماضٍ، مضارع، أمر) مع تمارين' },
          { label: 'تكيف الحيوانات مع بيئتها (الجمل والدب القطبي)', subject: 'العلوم', topic: 'كيف تساعد الصفات الجسدية والسلوكية الحيوانات على البقاء' },
          { label: 'محيط ومساحة المربع والمستطيل', subject: 'الرياضيات', topic: 'قانون المحيط والمساحة وتطبيقات حياتية مع التمارين' },
          { label: 'الجملة الاسمية وركناها المبتدأ والخبر', subject: 'قواعد اللغة العربية', topic: 'تعريف المبتدأ والخبر وكيفية ضبطهما بحركة الضمة' },
        ],
      },
      {
        id: 'p5',
        name: 'الصف الخامس الابتدائي',
        levelBadge: 'ابتدائي 5',
        description: 'الكسور العشرية، المساحات والمحيط، الفاعل والمفعول به، وأجهزة جسم الإنسان',
        subjects: ['الرياضيات', 'العلوم', 'قواعد اللغة العربية', 'الاجتماعيات', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'جمع وطرح الكسور العشرية', subject: 'الرياضيات', topic: 'ترتيب الفواصل العشرية وجمع الأجزاء من عشرة ومئة' },
          { label: 'الفاعل والمفعول به وعلامات إعرابهما', subject: 'قواعد اللغة العربية', topic: 'إعراب الفاعل والمفعول به في الجملة الفعلية بحركاتهما الأصلية' },
          { label: 'جهاز الدوران ومكونات الدم ووظيفة القلب', subject: 'العلوم', topic: 'وظائف القلب والشرايين والأوردة وخلايا الدم في نقل الأكسجين' },
          { label: 'الجهاز الهضمي وأعضاؤه وكيفية هضم الطعام', subject: 'العلوم', topic: 'وظائف الفم، المريء، المعدة، والأمعاء في امتصاص الغذاء' },
          { label: 'إن وأخواتها وكان وأخواتها والفروق بينهما', subject: 'قواعد اللغة العربية', topic: 'عمل النواسخ في المبتدأ والخبر مع علامات الإعراب' },
        ],
      },
      {
        id: 'p6',
        name: 'الصف السادس الابتدائي',
        levelBadge: 'شهادة 6 وزاري',
        description: 'النسبة والتناسب ومقياس الرسم، الأعداد الصحيحة، الذرة والخلية، والأفعال الخمسة',
        subjects: ['الرياضيات', 'العلوم', 'قواعد اللغة العربية', 'الاجتماعيات', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'النسبة والتناسب ومسائل مقياس الرسم', subject: 'الرياضيات', topic: 'حل مسائل مقياس الرسم وحساب المسافات الحقيقية وعلى الخارطة' },
          { label: 'الأفعال الخمسة وعلامات إعرابها (ثبوت النون وحذفها)', subject: 'قواعد اللغة العربية', topic: 'صياغة الأفعال الخمسة وإعرابها في حالات الرفع والنصب والجزم' },
          { label: 'الذرة ومكوناتها والروابط الكيميائية', subject: 'العلوم', topic: 'البروتونات، النيوترونات، والإلكترونات وكيف تترابط العناصر' },
          { label: 'محيط ومساحة الدائرة وقيمة النسبة الثابتة باي π', subject: 'الرياضيات', topic: 'حساب مساحة ومحيط الدائرة بنصف القطر مع مسائل وزارية' },
          { label: 'الصفات الوراثية وتكاثر النباتات بالبذور والدرنات', subject: 'العلوم', topic: 'طرق التكاثر الطبيعي والاصطناعي كالتطعيم والفسائل' },
        ],
      },
    ],
    intermediate: [
      {
        id: 'i1',
        name: 'الصف الأول المتوسط',
        levelBadge: 'متوسط 1',
        description: 'الأعداد النسبية، حل المعادلات الخطية، المادة والذرة، وأقسام الكلام والمبتدأ والخبر',
        subjects: ['الرياضيات', 'العلوم (كيمياء وفيزياء)', 'قواعد اللغة العربية', 'الاجتماعيات', 'الحاسوب', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'العمليات على الأعداد النسبية وتوحيد المقامات', subject: 'الرياضيات', topic: 'جمع وطرح وضرب وقسمة الأعداد النسبية مع مسائل تطبيقية' },
          { label: 'الجدول الدوري ومستويات الطاقة الذرية', subject: 'العلوم (كيمياء وفيزياء)', topic: 'التوزيع الإلكتروني للعناصر وكيفية استنتاج رقم الدورة والزمرة' },
          { label: 'المبتدأ والخبر وأنواعه وإعرابه', subject: 'قواعد اللغة العربية', topic: 'أشكال الخبر (مفرد، جملة فعلية، شبه جملة) وإعرابه النموذجي' },
          { label: 'نظرية فيثاغورس وتطبيقات المثلث قائم الزاوية', subject: 'الرياضيات', topic: 'إيجاد أطوال أضلاع المثلث القائم وتطبيقات فيثاغورس الحياتية' },
          { label: 'القوى والحركة وقوانين نيوتن في الفيزياء', subject: 'العلوم (كيمياء وفيزياء)', topic: 'قانون القصور الذاتي وقانون التسارع F=ma والفعل ورد الفعل' },
        ],
      },
      {
        id: 'i2',
        name: 'الصف الثاني المتوسط',
        levelBadge: 'متوسط 2',
        description: 'تحليل المقادير الجبرية، الروابط الكيميائية، الصوت والضوء، والمفعول المطلق والمفعول فيه',
        subjects: ['الرياضيات والجبر', 'العلوم المتكاملة', 'قواعد اللغة العربية', 'الاجتماعيات', 'الحاسوب', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'تحليل المقادير الجبرية بالعامل المشترك الأكبر والفرق بين مربعين', subject: 'الرياضيات والجبر', topic: 'خطوات التحليل الجبري مع نماذج تمارين وامتحانات' },
          { label: 'الروابط الأيونية والتساهمية والفرق بينهما', subject: 'العلوم المتكاملة', topic: 'كيف تفقد وتكتسب الذرات الإلكترونات لتكوين الروابط المستقرة' },
          { label: 'المفعول المطلق وأنواعه (مؤكد للفعل، مبين للنوع، مبين للعدد)', subject: 'قواعد اللغة العربية', topic: 'إعراب المفعول المطلق وصياغته مع جمل نموذجية' },
          { label: 'الموجات الصوتية وترددات الصوت وسرعته في الأوساط', subject: 'العلوم المتكاملة', topic: 'خصائص الصوت وشدته ودرجته والصدى وتطبيقات الموجات فوق الصوتية' },
          { label: 'الأعداد الحقيقية وخواص الجذور التربيعية والتكعيبية', subject: 'الرياضيات والجبر', topic: 'تبسيط الجذور وجمعها وطرحها وإنطاق المقام' },
        ],
      },
      {
        id: 'i3',
        name: 'الصف الثالث المتوسط',
        levelBadge: 'وزاري حاسم 3',
        description: 'الشهادة المتوسطة: المتتابعات، المعادلات التربيعية بالدستور، الدوائر الكهربائية، والمشتقات',
        subjects: ['الرياضيات الوزارية', 'الفيزياء الوزارية', 'الكيمياء الوزارية', 'الأحياء', 'قواعد اللغة العربية', 'اللغة الإنجليزية', 'الاجتماعيات'],
        quickTopics: [
          { label: 'حل المعادلات التربيعية بالقانون العام (الدستور) والمميز', subject: 'الرياضيات الوزارية', topic: 'تطبيق قانون الدستور وحساب المميز لمعرفة طبيعة جذري المعادلة' },
          { label: 'قانون أوم وربط المقاومات على التوالي والتوازي', subject: 'الفيزياء الوزارية', topic: 'حل مسائل وزارية شاملة لحساب المقاومة المكافئة والتيار والجهد' },
          { label: 'التركيب الذري وكتابة الترتيب الإلكتروني ورمز لويس', subject: 'الكيمياء الوزارية', topic: 'استخراج الدورة والزمرة وعدد الإلكترونات المنفردة' },
          { label: 'المشتقات: اسم الفاعل واسم المفعول والصفة المشبهة', subject: 'قواعد اللغة العربية', topic: 'اشتقاق وشروط عمل المشتقات وإعراب معمولها بدقة' },
          { label: 'المتتابعات الحسابية وإيجاد الحد العام والحدود المفقودة', subject: 'الرياضيات الوزارية', topic: 'قانون الحد العام un = a + (n-1)d وتطبيقات المتتابعات' },
          { label: 'المركبات الهيدروكربونية: غاز الميثان والإثيلين والأسيتيلين', subject: 'الكيمياء الوزارية', topic: 'معادلات التحضير وخواص الهيدروكربونات المشبعة وغير المشبعة' },
        ],
      },
    ],
    preparatory: [
      {
        id: 'pr4',
        name: 'الصف الرابع الإعدادي',
        levelBadge: 'إعدادي 4',
        description: 'المجموعات والدوال الحقيقية، المتجهات، الحسابات الكيميائية، وعلم التصنيف',
        subjects: ['الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة العربية والبلاغة', 'اللغة الإنجليزية', 'الاجتماعيات'],
        quickTopics: [
          { label: 'المتجهات: إيجاد طول واتجاه المتجه والتعبير عنه بمتجهات الوحدة', subject: 'الرياضيات', topic: 'حساب مقدار واتجاه المتجه والجمع الهندسي والجبري' },
          { label: 'الحسابات الكيميائية والمعادلة الكيميائية الموزونة', subject: 'الكيمياء', topic: 'حساب عدد المولات والكتلة والنسبة المئوية للمكونات' },
          { label: 'معادلات الحركة الخطية بتسارع ثابت وتطبيقاتها', subject: 'الفيزياء', topic: 'اشتقاق وحل مسائل السقوط الحر والحركة الخطية المنتظمة' },
          { label: 'علم تصنيف الكائنات الحية والممالك الحيوية', subject: 'الأحياء', topic: 'أسس التصنيف الحديث والمستويات التصنيفية من النوع إلى المملكة' },
        ],
      },
      {
        id: 'pr5',
        name: 'الصف الخامس الإعدادي',
        levelBadge: 'إعدادي 5',
        description: 'المتطابقات المثلثية، الحركة الدائرية وقوانين نيوتن، الكيمياء الحركية، والفلسفة',
        subjects: ['الرياضيات', 'الفيزياء الميكانيكية', 'الكيمياء الحركية', 'الأحياء الفسيولوجية', 'الفلسفة والمنطق', 'اللغة العربية'],
        quickTopics: [
          { label: 'المتطابقات المثلثية وقوانين مجموع وضعف الزاوية', subject: 'الرياضيات', topic: 'إثبات صحة المتطابقات المثلثية وحل المعادلات المثلثية' },
          { label: 'الحركة الدائرية المنتظمة وقوة الجذب المركزي', subject: 'الفيزياء الميكانيكية', topic: 'حساب السرعة المماسية والتسارع المركزي وتطبيقات المنعطفات' },
          { label: 'قانون سرعة التفاعل وتحديد مراتب المتفاعلات', subject: 'الكيمياء الحركية', topic: 'إيجاد رتبة التفاعل الكلية وحساب ثابت السرعة k مع الوحدات' },
          { label: 'قانون هس وحساب حرارة التفاعل الكيميائية القياسية ΔH', subject: 'الكيمياء الحركية', topic: 'تطبيق قانون هس في جمع المعادلات الحرارية لحساب أنثالبي التفاعل' },
        ],
      },
      {
        id: 'pr6_sci',
        name: 'السادس العلمي (البكالوريا الوزاري)',
        levelBadge: 'بكالوريا علمي 6',
        description: 'الأعداد المركبة ودي موافر، التفاضل والتكامل، المتسعات والحث الكهرومغناطيسي، بفر والاتزان، والوراثة',
        subjects: ['الرياضيات التخصصية', 'الفيزياء المتقدمة', 'الكيمياء التخصصية', 'علم الأحياء والوراثة', 'قواعد اللغة العربية', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'مبرهنة دي موافر والنتيجة في الأعداد المركبة', subject: 'الرياضيات التخصصية', topic: 'حل مسائل وزارية متكررة لحساب الجذور باستخدام الصيغة القطبية' },
          { label: 'مسائل المتسعات مع إدخال العازل الكهربائي المتصل والمفصول', subject: 'الفيزياء المتقدمة', topic: 'حساب فرق الجهد والشحنة والطاقة المختزنة في المجال الكهربائي' },
          { label: 'محاليل بفر المنظمة وحساب التغير في الرقم الهيدروجيني ΔpH', subject: 'الكيمياء التخصصية', topic: 'قوانين البفر بعد إضافة حمض أو قاعدة قوية مع أمثلة وزارية' },
          { label: 'حل مسائل الوراثة المندلية وقانون التوزيع الحر', subject: 'علم الأحياء والوراثة', topic: 'التضريب الوراثي واستنتاج الطرز الوراثية والمظهرية للأبوين والأبناء' },
          { label: 'مبرهنة رول ومبرهنة القيمة المتوسطة في التفاضل', subject: 'الرياضيات التخصصية', topic: 'شروط تحقق المبرهنتين وإيجاد قيمة الثابت c مع التفسير الهندسي' },
          { label: 'الحث الكهرومغناطيسي وقانون فراداي وقوة لورنز', subject: 'الفيزياء المتقدمة', topic: 'حساب القوة الدافعة الكهربائية الحركية المحتثة ε_ind والفيض المغناطيسي' },
        ],
      },
      {
        id: 'pr6_lit',
        name: 'السادس الأدبي (البكالوريا الوزاري)',
        levelBadge: 'بكالوريا أدبي 6',
        description: 'أسلوب الاستفهام والتوكيد، الأدب والنصوص، التاريخ الحديث والمعاصر، الجغرافيا، والاقتصاد',
        subjects: ['قواعد اللغة العربية والأدب', 'التاريخ الحديث والمعاصر', 'الجغرافيا الاقتصادية', 'علم الاقتصاد', 'الرياضيات الأدبية', 'اللغة الإنجليزية'],
        quickTopics: [
          { label: 'أسلوب الاستفهام وإعراب أسماء الاستفهام بدقة', subject: 'قواعد اللغة العربية والأدب', topic: 'حالات إعراب من، ما، أين، متى، كم، أي في محل رفع أو نصب' },
          { label: 'ثورة العشرين والمقاومة الوطنية في التاريخ الحديث', subject: 'التاريخ الحديث والمعاصر', topic: 'أسباب ونتائج الثورة وأهم الشخصيات والمعارك الواردة بالوزاري' },
          { label: 'الدخل القومي وطرق احتسابه والسياسات المالية', subject: 'علم الاقتصاد', topic: 'طريقة الإنفاق والقيمة المضافة والفرق بين الدخل الاسمي والحقيقي' },
          { label: 'أسلوب التوكيد: اللفظي والمعنوي وبأحرف التوكيد', subject: 'قواعد اللغة العربية والأدب', topic: 'أحكام التوكيد بـ (نفس، عين، كلا، كلتا، جميع) وأحرف التوكيد الزائدة' },
        ],
      },
    ],
    assistant: [
      {
        id: 'as_all',
        name: 'مساعد جميع الصفوف والمراحل',
        levelBadge: 'شامل الذكاء',
        description: 'حل فوري لأي مسألة دراسية، تلخيص المناهج، إعداد جداول المذاكرة، وتوليد بطاقات الاستذكار',
        subjects: ['حل المسائل والتمارين', 'تلخيص المناهج والمحاضرات', 'إعداد جداول المذاكرة', 'بطاقات استذكار وفلاش كاردز', 'محادثة الأستاذ الخصوصي'],
        quickTopics: [
          { label: 'حل مسألة دراسية معقدة خطوة بخطوة', subject: 'حل المسائل والتمارين', topic: 'اكتب المسألة وسيقوم المساعد باستخراج المعطيات والقوانين والحل النموذجي والتحقق' },
          { label: 'تلخيص فصل دراسي كامل في نقاط مركزة وجداول', subject: 'تلخيص المناهج والمحاضرات', topic: 'تلخيص شامل يبرز أهم التعريفات والقوانين والأسئلة المتوقعة' },
          { label: 'جدول مذاكرة أسبوعي ذكي مع تقنية بومودورو', subject: 'إعداد جداول المذاكرة', topic: 'تنظيم 3 إلى 5 ساعات مذاكرة يومياً وتوزيع المواد الصعبة والسهلة' },
        ],
      },
    ],
  };

  const currentStageGrades = gradeDivisions[activeStage] || gradeDivisions.preparatory;
  const [selectedGradeId, setSelectedGradeId] = useState<string>(currentStageGrades[0]?.id || 'pr6_sci');

  const currentGrade = currentStageGrades.find((g) => g.id === selectedGradeId) || currentStageGrades[0];

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(currentGrade?.subjects[0] || '');
  const [mode, setMode] = useState<
    'explain' | 'quiz' | 'solve_problem' | 'summarize' | 'study_plan' | 'flashcards' | 'assistant_chat'
  >('explain');
  const [model, setModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash'>('gemini-3.8-flash');
  const [hoursPerDay, setHoursPerDay] = useState(3);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: 'مرحباً بك! أنا مساعدك الأكاديمي الذكي في منصة A.W.H وركس.كود. يمكنني حل أي مسألة دراسية، تلخيص الدروس، إعداد جداول المذاكرة، وتجهيزك للامتحانات بأعلى الدرجات. بأي مادة أو سؤال نبدأ؟',
      time: 'الآن',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
  const [flippedCards, setFlippedCards] = useState<{ [id: number]: boolean }>({});

  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'study' | 'library' | 'database' | 'comments'>('study');
  const [savedRecords, setSavedRecords] = useState<AcademicRecord[]>([]);
  const [savedScores, setSavedScores] = useState<QuizScoreRecord[]>([]);
  const [savedSchedules, setSavedSchedules] = useState<StudyScheduleRecord[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);

  const [comments, setComments] = useState<AcademicComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(true);

  // Dedicated grade pages. 'pr6' is one page covering the scientific and literary branches.
  const [openedPage, setOpenedPage] = useState<string | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [contentSubject, setContentSubject] = useState('');
  const [gradeContents, setGradeContents] = useState<GradeContentRecord[]>([]);
  const [isSavingContent, setIsSavingContent] = useState(false);

  useEffect(() => {
    setOpenedPage(null);
    const grades = gradeDivisions[activeStage] || [];
    if (grades.length > 0) {
      setSelectedGradeId(grades[0].id);
      setSubject(grades[0].subjects[0] || '');
      setTopic('');
      setResultText(null);
      setQuizData(null);
      setFlashcardData(null);
    }
  }, [activeStage]);

  useEffect(() => {
    if (currentGrade && currentGrade.subjects.length > 0) {
      setSubject(currentGrade.subjects[0]);
    }
  }, [selectedGradeId]);

  useEffect(() => {
    if (!openedPage || !selectedGradeId) {
      setGradeContents([]);
      return;
    }
    getGradeContents(selectedGradeId)
      .then(setGradeContents)
      .catch(() => setGradeContents([]));
  }, [openedPage, selectedGradeId]);

  const loadDatabaseRecords = async () => {
    setLoadingDb(true);
    try {
      const [recs, scores, scheds] = await Promise.all([
        getAcademicRecords(),
        getQuizScores(),
        getStudySchedules(),
      ]);
      setSavedRecords(recs);
      setSavedScores(scores);
      setSavedSchedules(scheds);
    } catch (err: any) {
      console.error(err);
      onNotify('تعذر استرجاع السجلات من Cloud Firestore', 'error');
    } finally {
      setLoadingDb(false);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await getAcademicComments();
      setComments(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'database') {
      loadDatabaseRecords();
    } else if (activeSubTab === 'comments') {
      loadComments();
    }
  }, [activeSubTab]);

  const handlePostComment = async () => {
    if (!newCommentText.trim()) {
      onNotify('يرجى كتابة نص التعليق أو الملاحظة أولاً', 'error');
      return;
    }

    setIsPostingComment(true);
    try {
      const authorName =
        newCommentAuthor.trim() || auth.currentUser?.displayName || 'طالب منصة A.W.H';

      await saveAcademicComment({
        userId: auth.currentUser?.uid || 'guest_student',
        userName: authorName,
        stage: activeStage,
        grade: currentGrade?.name || 'عام',
        subject: subject || 'عام',
        topic: topic.slice(0, 80) || 'ملاحظة دراسية عامة',
        commentText: newCommentText.trim(),
        createdAt: new Date().toISOString(),
      });

      setNewCommentText('');
      onNotify('تم رفع التعليق وحفظه بنجاح في قاعدة البيانات الحقيقية!', 'success');
      await loadComments();
    } catch (err: any) {
      console.error(err);
      onNotify('تعذر رفع التعليق إلى قاعدة البيانات', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteAcademicComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onNotify('تم رفع وحذف التعليق بنجاح من المنصة', 'info');
    } catch (err: any) {
      onNotify('فشل حذف التعليق من قاعدة البيانات', 'error');
    }
  };

  const handleClearAllMyComments = async () => {
    if (comments.length === 0) {
      onNotify('لا توجد تعليقات منشورة على المنصة حالياً', 'info');
      return;
    }

    try {
      for (const c of comments) {
        await deleteAcademicComment(c.id);
      }
      setComments([]);
      onNotify('تم رفع وإزالة كافة التعليقات من المنصة وقاعدة البيانات بنجاح!', 'success');
    } catch (err: any) {
      onNotify('تعذر حذف بعض التعليقات', 'error');
    }
  };

  const handleRunAcademicActivity = async () => {
    if (!topic.trim()) {
      onNotify('يرجى إدخال أو اختيار موضوع الدرس أو المسألة الدراسية', 'error');
      return;
    }

    setLoading(true);
    setResultText(null);
    setQuizData(null);
    setFlashcardData(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch('/api/gemini/academic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          stage: activeStage,
          grade: currentGrade?.name || '',
          subject,
          mode,
          model,
          hoursPerDay,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشلت معالجة الطلب الأكاديمي';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const res = await response.json();

      if (mode === 'quiz' && res.data?.questions) {
        setQuizData(res.data);
        onNotify(`تم إنشاء الاختبار التفاعلي لـ ${currentGrade?.name} بنجاح!`, 'success');
      } else if (mode === 'flashcards' && res.data?.cards) {
        setFlashcardData(res.data);
        onNotify('تم إنشاء بطاقات الاستذكار السريعة بنجاح!', 'success');
      } else {
        const textContent = res.data?.content || JSON.stringify(res.data, null, 2);
        setResultText(textContent);
        onNotify(`اكتمل إعداد المحتوى لـ ${currentGrade?.name} بواسطة ${model}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء معالجة المحتوى الأكاديمي', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAssistantChat = async () => {
    if (!chatInput.trim() || loading) return;

    const userMsg = {
      role: 'user' as const,
      text: chatInput,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/academic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userMsg.text,
          stage: activeStage,
          grade: currentGrade?.name || 'عام',
          subject,
          mode: 'assistant_chat',
          model,
          chatHistory: chatMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        let errorMsg = 'فشلت استجابة المساعد الذكي';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `خطأ في استجابة الخادم (${response.status})`;
        }
        throw new Error(errorMsg);
      }
      const res = await response.json();

      const botMsg = {
        role: 'assistant' as const,
        text: res.data?.content || 'عذراً، لم أتمكن من استخراج الإجابة بشكل صحيح.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      onNotify('حدث خطأ أثناء المحادثة مع المساعد الأكاديمي', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToRealDatabase = async () => {
    setIsSavingDb(true);
    try {
      if (mode === 'quiz' && quizSubmitted && quizData) {
        const score = calculateScore();
        await saveQuizScore({
          userId: auth.currentUser?.uid || 'guest_student',
          stage: activeStage,
          quizTitle: `${currentGrade?.name} - ${quizData.quizTitle}`,
          score: score.correct,
          total: score.total,
          percentage: Math.round((score.correct / score.total) * 100),
          createdAt: new Date().toISOString(),
        });
        onNotify('تم حفظ نتيجة الاختبار وسجل الأداء بنجاح في قاعدة البيانات الحقيقية Firestore!', 'success');
      } else if (mode === 'study_plan' && resultText) {
        await saveStudySchedule({
          userId: auth.currentUser?.uid || 'guest_student',
          stage: activeStage,
          title: `جدول مذاكرة (${currentGrade?.name}): ${topic.slice(0, 30)}`,
          hoursPerDay,
          scheduleData: resultText,
          createdAt: new Date().toISOString(),
        });
        onNotify('تم حفظ جدول المذاكرة الأسبوعي بنجاح في قاعدة البيانات الحقيقية!', 'success');
      } else if (resultText) {
        await saveAcademicRecord({
          userId: auth.currentUser?.uid || 'guest_student',
          stage: activeStage,
          grade: currentGrade?.name || 'عام',
          title: `${currentGrade?.name}: ${topic.slice(0, 60)}`,
          subject: subject || 'عام',
          mode,
          content: resultText,
          createdAt: new Date().toISOString(),
        });
        onNotify('تم حفظ الدرس بنجاح في قاعدة البيانات السحابية Firestore!', 'success');
      } else if (flashcardData) {
        await saveAcademicRecord({
          userId: auth.currentUser?.uid || 'guest_student',
          stage: activeStage,
          grade: currentGrade?.name || 'عام',
          title: flashcardData.title,
          subject: subject || 'عام',
          mode: 'flashcards',
          content: JSON.stringify(flashcardData.cards, null, 2),
          createdAt: new Date().toISOString(),
        });
        onNotify('تم حفظ بطاقات الاستذكار بنجاح في قاعدة البيانات Firestore!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      onNotify('حدث خطأ أثناء الحفظ في قاعدة البيانات الحقيقية', 'error');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleDeleteDbRecord = async (recordId: string) => {
    try {
      await deleteAcademicRecord(recordId);
      setSavedRecords((prev) => prev.filter((r) => r.id !== recordId));
      onNotify('تم حذف السجل من قاعدة البيانات بنجاح', 'info');
    } catch (err) {
      onNotify('فشل حذف السجل', 'error');
    }
  };

  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0 };
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return { correct, total: quizData.questions.length };
  };

  const handleCopyContent = () => {
    const textToCopy =
      mode === 'quiz' && quizData
        ? `${quizData.quizTitle} - ${currentGrade?.name}\n\n` +
          quizData.questions
            .map(
              (q, i) =>
                `س ${i + 1}: ${q.question}\n` +
                q.options.map((opt, oIdx) => `  [${oIdx === q.correctIndex ? '✓' : ' '}] ${opt}`).join('\n') +
                `\nالشرح الأكاديمي: ${q.explanation}`
            )
            .join('\n\n')
        : resultText || '';

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('تم نسخ المحتوى إلى الحافظة', 'info');
  };

  const handleSaveToDrive = () => {
    if (!isDriveConnected) {
      onNotify('يرجى تسجيل الدخول إلى Google Drive من الشريط العلوي أولاً', 'error');
      return;
    }

    const fileName = `AWH_${activeStage}_${selectedGradeId}_${Date.now()}.md`;
    const contentToSave = `# المحتوى الأكاديمي - منصة A.W.H (ركس.كود)
المرحلة: ${activeStage} • الصف: ${currentGrade?.name}
المادة: ${subject}
الموضوع: ${topic}
تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}

${resultText || (quizData ? JSON.stringify(quizData, null, 2) : '')}`;

    onRequestDriveConfirmation({
      title: 'حفظ الملف في Google Drive',
      message: `هل توافق على حفظ الملف في حساب Google Drive الخاص بك؟`,
      itemDetails: `اسم الملف: ${fileName}\nالصف: ${currentGrade?.name}\nالموضوع: ${topic.slice(0, 50)}...`,
      onConfirm: async () => {
        const res = await uploadTextFileToDrive({
          name: fileName,
          content: contentToSave,
          mimeType: 'text/markdown',
          description: `Academic Education (${currentGrade?.name}) - A.W.H AI`,
        });
        onNotify(`تم حفظ الملف بنجاح في Google Drive باسم "${res.name}"`, 'success');
      },
    });
  };

  // One page per grade in primary, intermediate and preparatory stages.
  type GradePage = { key: string; gradeIds: string[]; def: GradeDef };
  const byGradeId = (id: string): GradeDef => currentStageGrades.find((g) => g.id === id) ?? currentStageGrades[0];
  const gradePages: GradePage[] =
    activeStage === 'preparatory'
      ? [
          { key: 'pr4', gradeIds: ['pr4'], def: byGradeId('pr4') },
          { key: 'pr5', gradeIds: ['pr5'], def: byGradeId('pr5') },
          { key: 'pr6', gradeIds: ['pr6_sci', 'pr6_lit'], def: { ...byGradeId('pr6_sci'), name: 'الصف السادس الإعدادي' } },
        ]
      : currentStageGrades.map((g) => ({ key: g.id, gradeIds: [g.id], def: g }));
  const activePage = gradePages.find((p) => p.key === openedPage);

  const openGradePage = (page: GradePage) => {
    setOpenedPage(page.key);
    setSelectedGradeId(page.gradeIds[0]);
    setContentTitle('');
    setContentBody('');
    setContentSubject(page.def.subjects[0] || '');
  };

  const handleSaveGradeContent = async () => {
    if (!activePage) return;
    if (!auth.currentUser) {
      onNotify('سجّل الدخول أولاً لإضافة المحتوى', 'error');
      return;
    }
    if (!contentTitle.trim() || !contentBody.trim()) {
      onNotify('أدخل عنوان المحتوى ونصه', 'error');
      return;
    }
    setIsSavingContent(true);
    try {
      await saveGradeContent({
        gradeId: selectedGradeId,
        stage: activeStage,
        subject: contentSubject || activePage.def.subjects[0] || 'عام',
        title: contentTitle.trim(),
        body: contentBody.trim(),
      });
      setContentTitle('');
      setContentBody('');
      setGradeContents(await getGradeContents(selectedGradeId));
      onNotify('تمت إضافة المحتوى إلى الصف', 'success');
    } catch {
      onNotify('تعذر حفظ المحتوى، تحقق من تسجيل الدخول والصلاحيات', 'error');
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteGradeContent = async (id: string) => {
    try {
      await deleteGradeContent(id);
      setGradeContents((prev) => prev.filter((item) => item.id !== id));
      onNotify('تم حذف المحتوى', 'info');
    } catch {
      onNotify('تعذر حذف المحتوى', 'error');
    }
  };

  // Hub: the grade pages of the chosen stage.
  const gradeHub = (
    <div className="space-y-4">
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs md:text-sm font-bold text-slate-100">صفحات الصفوف ({gradePages.length} صفحات)</h3>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">اختر صفاً لفتح صفحته المخصصة، ويمكنك إضافة المحتوى التعليمي إليها.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {gradePages.map((page) => (
          <button
            key={page.key}
            onClick={() => openGradePage(page)}
            className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 text-right transition-all flex flex-col justify-between active:scale-95"
          >
            <div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 block mb-1 w-fit">
                {page.def.levelBadge}
              </span>
              <span className="text-xs font-bold leading-tight block">{page.def.name}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{page.def.description}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Header of an opened grade page: back to the academic section, and branch switch for 6th preparatory.
  const gradePageHeader = activePage ? (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
      <button
        onClick={() => setOpenedPage(null)}
        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        <span>رجوع إلى قسم التعليم الأكاديمي</span>
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-extrabold text-white">{activePage.def.name}</span>
        {activePage.gradeIds.length > 1 &&
          activePage.gradeIds.map((id) => (
            <button
              key={id}
              onClick={() => setSelectedGradeId(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedGradeId === id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {byGradeId(id).name}
            </button>
          ))}
      </div>
    </div>
  ) : null;

  // Educational content added to this grade page.
  const gradeContentPanel = activePage ? (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <FileText className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs md:text-sm font-bold text-slate-100">المحتوى التعليمي لهذا الصف</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={contentTitle}
          onChange={(e) => setContentTitle(e.target.value)}
          placeholder="عنوان المحتوى (مثال: ملخص الدرس الأول)"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={contentSubject}
          onChange={(e) => setContentSubject(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
        >
          {activePage.def.subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>
      <textarea
        rows={5}
        value={contentBody}
        onChange={(e) => setContentBody(e.target.value)}
        placeholder="اكتب الشرح أو الملخص أو الأسئلة التي تريد إضافتها لهذا الصف"
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSaveGradeContent}
          disabled={isSavingContent}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold disabled:opacity-50 transition"
        >
          {isSavingContent ? 'جارٍ الحفظ...' : 'إضافة المحتوى'}
        </button>
      </div>

      <div className="space-y-2">
        {gradeContents.length === 0 ? (
          <p className="text-xs text-slate-500">لا يوجد محتوى مضاف لهذا الصف بعد.</p>
        ) : (
          gradeContents.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.subject} • {item.authorName} • {new Date(item.createdAt).toLocaleDateString('ar-IQ')}
                  </p>
                </div>
                {item.userId === auth.currentUser?.uid && (
                  <button
                    onClick={() => handleDeleteGradeContent(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="حذف المحتوى"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Real Firestore Live Badge & Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Database className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs md:text-sm text-slate-100">
                منظومة التعليم الأكاديمي الشامل وتقسيم الصفوف
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                Cloud Firestore Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              قاعدة البيانات المتصلة: <span className="font-mono text-cyan-300">ai-studio-awhaiplatform-25cab7e5-e42b-46ef-aca6-1f500f4d4b80</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToBroadcast}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-950/40 transition active:scale-95 border border-white/10"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>بدء البث المباشر (المحاضرة والدرس)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('study')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'study'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            المراحل والصفوف
          </button>

          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'library'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>مكتبة المحتوى والدروس الشاملة</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-400/20 text-cyan-300 font-mono">
              جديد
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('comments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'comments'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>تعليقات وملاحظات الطلاب ({comments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'database'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>سجلاتي المحفوظة</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'study' && (
        <>
          {/* THE FOUR CORE STAGE BUTTONS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              اختر المرحلة التعليمية:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  id: 'primary' as const,
                  label: 'الابتدائي',
                  subtitle: 'الصفوف 1 - 6 (واقع معزز 3D)',
                  icon: School,
                  desc: 'مغامرة الحروف وحوار المعلم',
                  activeClass: 'from-amber-600 to-orange-600 border-amber-400 text-white shadow-amber-950/50',
                },
                {
                  id: 'intermediate' as const,
                  label: 'المتوسط',
                  subtitle: 'الصفوف 1 - 3 متوسط',
                  icon: Backpack,
                  desc: 'بناء التفكير المنطقي',
                  activeClass: 'from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-cyan-950/50',
                },
                {
                  id: 'preparatory' as const,
                  label: 'الإعدادي',
                  subtitle: 'البكالوريا والثانوية',
                  icon: GraduationCap,
                  desc: 'تدريب وزاري مكثف',
                  activeClass: 'from-purple-600 to-pink-600 border-purple-400 text-white shadow-purple-950/50',
                },
                {
                  id: 'assistant' as const,
                  label: 'المساعد الأكاديمي الذكي',
                  subtitle: 'حلول ومراجعات فورية',
                  icon: Brain,
                  desc: 'مسائل، تلخيص، جداول',
                  activeClass: 'from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-emerald-950/50',
                },
              ].map((btn) => {
                const Icon = btn.icon;
                const isCurrent = activeStage === btn.id;

                return (
                  <button
                    key={btn.id}
                    onClick={() => setActiveStage(btn.id)}
                    className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-right active:scale-95 shadow-lg ${
                      isCurrent
                        ? `bg-gradient-to-br ${btn.activeClass} ring-2 ring-white/20 font-bold scale-[1.02]`
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-2 rounded-xl ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isCurrent ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {btn.subtitle}
                      </span>
                    </div>

                    <span className="text-base font-extrabold tracking-tight block">{btn.label}</span>
                    <span className={`text-[11px] mt-0.5 ${isCurrent ? 'text-white/80' : 'text-slate-500'}`}>
                      {btn.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Stage Mode Switcher (غرفة المعلم التفاعلية أو المختبر الأكاديمي الشامل) */}
          {activeStage === 'primary' && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-white">
                    أدوات المرحلة الابتدائية (الصفوف 1 - 6):
                  </span>
                  <p className="text-[11px] text-slate-400">
                    يمكنك التبديل بحرية بين غرف الأساتذة العراقيين الذكية أو المختبر الأكاديمي الشامل للشروحات والاختبارات
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrimaryViewMode('interactive_room')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    primaryViewMode === 'interactive_room'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🏫 غرف الصفوف التفاعلية والأفاتار
                </button>
                <button
                  onClick={() => setPrimaryViewMode('academic_studio')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    primaryViewMode === 'academic_studio'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  📚 المختبر الأكاديمي (شروحات واختبارات)
                </button>
              </div>
            </div>
          )}

          {/* Render the appropriate view */}
          {activeStage === 'primary' && primaryViewMode === 'interactive_room' && activePage ? (
            <>
              {gradePageHeader}
              <PrimaryEducationRooms
                onNotify={onNotify}
                onBackToMainAcademic={() => setPrimaryViewMode('academic_studio')}
              />
            </>
          ) : activeStage === 'assistant' ? (
            <IraqiAcademicAssistantSuite
              onNotify={onNotify}
              onRequestDriveConfirmation={onRequestDriveConfirmation}
              isDriveConnected={isDriveConnected}
              onBackToStages={() => setActiveStage('preparatory')}
              onNavigateToBroadcast={onNavigateToBroadcast}
            />
          ) : !activePage ? (
            gradeHub
          ) : (
            <>
              {gradePageHeader}
              {gradeContentPanel}

          {/* Model switcher and current class info */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {currentGrade?.name}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-medium">{currentGrade?.description}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
              <Cpu className="w-4 h-4 text-cyan-400 mr-1" />
              <span className="text-slate-400 text-[11px]">النموذج:</span>
              <button
                onClick={() => setModel('gemini-4-argon')}
                className={`px-3 py-1 rounded-lg transition ${
                  model === 'gemini-4-argon'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                gemini-4-argon (أعلى عمق استدلالي)
              </button>
              <button
                onClick={() => setModel('gemini-3.8-flash')}
                className={`px-3 py-1 rounded-lg transition ${
                  model === 'gemini-3.8-flash'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3.8-flash (فائق السرعة)
              </button>
            </div>
          </div>

          {/* Quick Preset Topics for this exact Grade */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              مقررات ودروس نموذجية لـ {currentGrade?.name}:
            </span>
            {currentGrade?.quickTopics.map((qt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(qt.topic);
                  setSubject(qt.subject);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95 text-right"
              >
                <span className="font-semibold text-cyan-300 ml-1">[{qt.subject}]</span>
                <span>{qt.label}</span>
              </button>
            ))}
          </div>

          {/* Activity Input Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  المادة الدراسية المقررة لـ {currentGrade?.name}:
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {currentGrade?.subjects.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الصف المحدد:</label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-bold truncate">
                  {currentGrade?.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">ساعات المذاكرة اليومية (للجدول):</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value, 10) || 3)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">نوع النشاط التعليمي:</label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                {[
                  { id: 'explain', label: 'شرح الدرس', icon: BookOpen, desc: 'تبسيط وتسلسل للمفاهيم' },
                  { id: 'quiz', label: 'اختبار تفاعلي', icon: HelpCircle, desc: 'أسئلة وتصحيح ذكي' },
                  { id: 'solve_problem', label: 'حل مسألة خطوة بخطوة', icon: Calculator, desc: 'معطيات وقوانين وبرهان' },
                  { id: 'summarize', label: 'تلخيص شامل', icon: FileText, desc: 'نقاط وجداول الامتحانات' },
                  { id: 'flashcards', label: 'بطاقات استذكار', icon: Layers, desc: 'فلاش كاردز للحفظ' },
                  { id: 'study_plan', label: 'جدول مذاكرة ذكي', icon: Calendar, desc: 'تنظيم أسبوعي مخصص' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id as any)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-right transition ${
                      mode === item.id
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-slate-200">
                      <item.icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {mode === 'solve_problem'
                  ? `اكتب نص المسألة لـ ${currentGrade?.name} المراد حلها بالتفصيل:`
                  : mode === 'study_plan'
                  ? `اكتب المواد والتركيز المطلوب في جدول مذاكرة ${currentGrade?.name}:`
                  : `موضوع الدرس أو المفهوم العلمي لـ ${currentGrade?.name}:`}
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="اكتب عنوان الدرس أو المسألة بالتفصيل..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs md:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                الصف: <strong className="text-cyan-300">{currentGrade?.name}</strong> • المادة:{' '}
                <strong className="text-slate-200">{subject}</strong>
              </span>

              <button
                onClick={handleRunAcademicActivity}
                disabled={loading || !topic.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg transition active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري المعالجة بواسطة {model}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {mode === 'quiz'
                        ? 'إنشاء الاختبار التفاعلي'
                        : mode === 'solve_problem'
                        ? 'تفكيك وحل المسألة'
                        : mode === 'summarize'
                        ? 'توليد التلخيص الأكاديمي'
                        : mode === 'flashcards'
                        ? 'توليد بطاقات الاستذكار'
                        : mode === 'study_plan'
                        ? 'إنشاء جدول المذاكرة'
                        : 'بدء شرح الدرس'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Flashcards output */}
          {flashcardData && (
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                    SMART FLASHCARDS • {currentGrade?.name}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">{flashcardData.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToRealDatabase}
                    disabled={isSavingDb}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white transition shadow-md"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>حفظ في Firestore</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {flashcardData.cards.map((card) => {
                  const isFlipped = !!flippedCards[card.id];
                  return (
                    <div
                      key={card.id}
                      onClick={() =>
                        setFlippedCards((prev) => ({
                          ...prev,
                          [card.id]: !prev[card.id],
                        }))
                      }
                      className="cursor-pointer min-h-[160px] p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between text-right relative group shadow-md"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-2">
                        <span>بطاقة رقم {card.id}</span>
                        <span className="text-cyan-400 font-bold group-hover:underline">
                          {isFlipped ? 'الوجه (السؤال)' : 'اقلب للحل'}
                        </span>
                      </div>

                      <div className="my-3">
                        {!isFlipped ? (
                          <div className="space-y-1">
                            <span className="text-xs text-slate-400 block font-semibold">المفهوم أو السؤال:</span>
                            <p className="text-sm font-bold text-slate-100 leading-snug">{card.front}</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-xs text-emerald-400 block font-semibold">الإجابة النموذجية:</span>
                            <p className="text-xs text-slate-200 leading-relaxed">{card.back}</p>
                          </div>
                        )}
                      </div>

                      {card.hint && !isFlipped && (
                        <div className="text-[10px] text-amber-400/80 flex items-center gap-1 mt-1">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span>تلميح: {card.hint}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz output */}
          {quizData && (
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                    EXAM • {currentGrade?.name} • {quizData.subject}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">{quizData.quizTitle}</h3>
                  <p className="text-xs text-slate-400">الموضوع: {quizData.topic}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ</span>
                  </button>

                  <button
                    onClick={handleSaveToRealDatabase}
                    disabled={isSavingDb}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white transition shadow-md"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>حفظ النتيجة في Firestore</span>
                  </button>

                  <button
                    onClick={handleSaveToDrive}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Drive</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {quizData.questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[q.id] === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition ${
                        quizSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-bold text-sm text-slate-100 leading-snug">
                          <span className="text-cyan-400 ml-1.5">السؤال {idx + 1}:</span>
                          {q.question}
                        </h4>

                        {quizSubmitted && (
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>صحيح</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>خطأ</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedAnswers[q.id] === oIdx;
                          const isActualCorrect = q.correctIndex === oIdx;

                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (isActualCorrect) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isActualCorrect) {
                              btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-200';
                            } else {
                              btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-cyan-600/30 border-cyan-400 text-white font-semibold ring-1 ring-cyan-400';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleSelectQuizOption(q.id, oIdx)}
                              className={`p-3 rounded-xl border text-right text-xs transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span className="flex-1 leading-relaxed">{opt}</span>
                              <span className="text-[10px] font-mono uppercase mr-2 opacity-60">
                                ({String.fromCharCode(65 + oIdx)})
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                          <span className="font-bold text-cyan-300 block">التفسير والشرح الأكاديمي:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                {!quizSubmitted ? (
                  <button
                    onClick={() => {
                      setQuizSubmitted(true);
                      handleSaveToRealDatabase();
                    }}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95"
                  >
                    تصحيح الاختبار وعرض وحفظ النتيجة
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-bold text-slate-200">
                        الدرجة: {calculateScore().correct} من {calculateScore().total}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({Math.round((calculateScore().correct / calculateScore().total) * 100)}%)
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lesson explanation / solution output */}
          {resultText && (
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                    {mode === 'solve_problem'
                      ? 'STEP-BY-STEP SOLUTION'
                      : mode === 'study_plan'
                      ? 'WEEKLY STUDY TIMETABLE'
                      : mode === 'summarize'
                      ? 'ACADEMIC SUMMARY'
                      : 'ACADEMIC LESSON'} • {currentGrade?.name}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">{topic}</h3>
                  <p className="text-xs text-slate-400">الصف: {currentGrade?.name} • المادة: {subject}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateToBroadcast}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-md transition active:scale-95 border border-white/10"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>بث مباشر للدرس</span>
                  </button>

                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ</span>
                  </button>

                  <button
                    onClick={handleSaveToRealDatabase}
                    disabled={isSavingDb}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white transition shadow-md"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>حفظ في Firestore</span>
                  </button>

                  <button
                    onClick={handleSaveToDrive}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>حفظ في Drive</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans p-5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                {resultText}
              </div>
            </div>
          )}

          {/* Real-time Student Comments Section for Current Lesson / Class */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs md:text-sm font-bold text-slate-100">
                  ملاحظات وتعليقات الطلاب على الصف ({currentGrade?.name})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCommentsSection(!showCommentsSection)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  {showCommentsSection ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>إخفاء التعليقات</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>إظهار التعليقات</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearAllMyComments}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs border border-rose-800/40 transition"
                  title="رفع وحذف كافة تعليقاتي المسجلة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>رفع تعليقاتي</span>
                </button>
              </div>
            </div>

            {showCommentsSection && (
              <div className="space-y-3">
                {/* Add new comment form */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                      placeholder="اسمك أو لقبك الدراسي (اختياري)..."
                      className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                    <div className="text-[11px] text-slate-400 flex items-center justify-end px-2">
                      مربوط بقاعدة بيانات Cloud Firestore
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="اكتب استفسارك، ملاحظتك الدراسية، أو سؤالك لرفعه للمنصة وقاعدة البيانات..."
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handlePostComment}
                      disabled={isPostingComment || !newCommentText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-md transition active:scale-95"
                    >
                      {isPostingComment ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري الرفع...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>رفع التعليق إلى المنصة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Comments list */}
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3 bg-slate-950/50 rounded-xl border border-slate-850">
                    لا توجد تعليقات أو ملاحظات منشورة بعد لهذا الصف. كن أول من يرفع تعليقاً دراسياً!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{comm.userName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              {comm.grade}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(comm.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{comm.commentText}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteComment(comm.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition flex-shrink-0"
                          title="رفع / حذف التعليق من المنصة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          )}
        </div>
      </>
    )}
  </>
)}

      {/* EDUCATIONAL CONTENT & LESSONS LIBRARY TAB */}
      {activeSubTab === 'library' && (
        <EducationalLibraryViewer
          onNotify={onNotify}
          onRequestDriveConfirmation={onRequestDriveConfirmation}
          isDriveConnected={isDriveConnected}
          onAskAiAboutTopic={(topicTitle, lessonSubject) => {
            setTopic(topicTitle);
            setSubject(lessonSubject);
            setActiveSubTab('study');
            setMode('explain');
            onNotify(`تم نقل موضوع "${topicTitle}" إلى المساعد الأكاديمي للدراسة والشرح`, 'info');
          }}
        />
      )}

      {/* COMMENTS HUB TAB */}
      {activeSubTab === 'comments' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>منصة التعليقات والملاحظات الطلابية (Cloud Firestore)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                استعراض، كتابة، ورفع أو حذف التعليقات والملاحظات الدراسية المربوطة بالسحابة
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAllMyComments}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>رفع وإزالة كافة تعليقاتي</span>
              </button>

              <button
                onClick={loadComments}
                disabled={loadingComments}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingComments ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">رفع تعليق أو ملاحظة جديدة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newCommentAuthor}
                onChange={(e) => setNewCommentAuthor(e.target.value)}
                placeholder="اسم الطالب أو المعرف..."
                className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-cyan-300 font-semibold truncate">
                الصف: {currentGrade?.name} • المادة: {subject}
              </div>
            </div>

            <textarea
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="اكتب ملاحظتك الأكاديمية أو استفسارك هنا لرفعه لمنصة A.W.H..."
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />

            <div className="flex justify-end">
              <button
                onClick={handlePostComment}
                disabled={isPostingComment || !newCommentText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>رفع التعليق إلى السحابة</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase">
              التعليقات المنشورة على المنصة ({comments.length}):
            </h4>

            {loadingComments ? (
              <div className="py-8 text-center text-xs text-slate-400">جاري تحميل التعليقات...</div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-950 p-6 rounded-2xl border border-slate-850 text-center">
                لا توجد تعليقات محفوظة حالياً.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-bold text-slate-200">{comm.userName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {comm.grade}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{comm.commentText}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[10px] text-slate-500">
                      <span>{new Date(comm.createdAt).toLocaleString('ar-EG')}</span>
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف التعليق</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DATABASE RECORDS TAB */}
      {activeSubTab === 'database' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>سجلاتك المحفوظة في قاعدة بيانات Cloud Firestore الحقيقية</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                جميع الدروس والمسائل، نتائج الاختبارات، وجداول المذاكرة المحفوظة في حسابك
              </p>
            </div>

            <button
              onClick={loadDatabaseRecords}
              disabled={loadingDb}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
              <span>تحديث السجلات</span>
            </button>
          </div>

          {loadingDb ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>جاري استرجاع السجلات من Cloud Firestore...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>نتائج الاختبارات والتقييمات السابقة ({savedScores.length})</span>
                </h4>
                {savedScores.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl border border-slate-850">
                    لا توجد درجات اختبارات محفوظة بعد. قم بحل أي اختبار ثم اضغط حفظ لتظهر نتائجه هنا دائمياً.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedScores.map((score) => (
                      <div key={score.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{score.quizTitle}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                            {score.percentage}%
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          الدرجة: {score.score} من {score.total} • المرحلة: {score.stage}
                        </p>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {new Date(score.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>جداول المذاكرة الأسبوعية المحفوظة ({savedSchedules.length})</span>
                </h4>
                {savedSchedules.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl border border-slate-850">
                    لا توجد جداول مذاكرة محفوظة بعد. أنشئ جدول مذاكرة ثم احفظه في Firestore.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedSchedules.map((sched) => (
                      <div key={sched.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{sched.title}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{sched.hoursPerDay} ساعات/يوم</span>
                        </div>
                        <div className="max-h-24 overflow-y-auto text-slate-400 text-[11px] whitespace-pre-wrap bg-slate-900/60 p-2 rounded">
                          {sched.scheduleData.slice(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>الدروس والمسائل والملخصات المحفوظة ({savedRecords.length})</span>
                </h4>
                {savedRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl border border-slate-850">
                    لا توجد دروس أو ملخصات محفوظة حتى الآن في Firestore.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 text-sm">{rec.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {rec.stage}
                            </span>
                            {rec.grade && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {rec.grade}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">[{rec.subject}]</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(rec.createdAt).toLocaleString('ar-EG')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTopic(rec.title);
                              setResultText(rec.content);
                              setActiveSubTab('study');
                              onNotify('تم تحميل السجل في نافذة العرض', 'info');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                          >
                            عرض ومراجعة
                          </button>
                          <button
                            onClick={() => handleDeleteDbRecord(rec.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                            title="حذف من Firestore"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

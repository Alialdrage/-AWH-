import React from 'react';
import { Search, Sparkles, Cpu, Dna, GraduationCap, Radio, Megaphone, Video, Palette, Trophy, BookOpen, Gamepad2 } from 'lucide-react';

interface MainPageProps {
  onNavigate: (tab: string) => void;
}

export const MainPage: React.FC<MainPageProps> = ({ onNavigate }) => {
  const sections = [
    { id: 'game', title: 'تحدي الفيزياء (ألعاب وألغاز ولوحة المتصدرين 🏆)', icon: Trophy },
    { id: 'private_tutor', title: 'المدرس الخصوصي (بث مباشر فيديو)', icon: Video },
    { id: 'academic', title: 'التعليم الأكاديمي', icon: GraduationCap },
    { id: 'university', title: 'التعليم الجامعي والدراسات العليا', icon: BookOpen },
    { id: 'game_industry', title: 'صناعة الألعاب والمحتوى', icon: Gamepad2 },
    { id: 'lessons_broadcast', title: 'بث الدروس والمحاضرات', icon: Radio },
    { id: 'graphics', title: 'محركات التصميم والجرافيكس (3D & Vector)', icon: Palette },
    { id: 'analysis', title: 'التحليل الذكي', icon: Search },
    { id: 'generation', title: 'توليد المحتوى', icon: Sparkles },
    { id: 'builder', title: 'مختبر البناء', icon: Cpu },
    { id: 'bioscience', title: 'العلوم الحيوية', icon: Dna },
    { id: 'ads', title: 'الإعلانات', icon: Megaphone },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full p-6 md:p-12 gap-8 items-center" dir="rtl">
      {/* Left side: Platform Branding */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-lg">
          awh ريكس كود
        </h1>
        <h2 className="text-2xl md:text-3xl text-slate-300 font-bold">AWH Rex Code AI Platform</h2>
        <p className="text-sm md:text-base text-slate-400 max-w-lg leading-relaxed">
          اختر من القائمة الجانبية أي قسم للبدء في الاستفادة من أدوات الذكاء الاصطناعي، البث الحي للدروس، والتحليل المتقدم.
        </p>
      </div>

      {/* Right side: Vertical list of sections */}
      <div className="w-full lg:w-80 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">أقسام المنصة الرئيسية</h3>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            className="flex items-center gap-3.5 w-full p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all duration-300 group text-right shadow-sm"
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
              <s.icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white">{s.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

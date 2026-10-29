/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Splash Page restored with uploaded user image and section layout for awh ريكس كود
 */

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Cpu, Dna, GraduationCap, Radio, Megaphone, Zap, Video, Palette } from 'lucide-react';

interface SplashPageProps {
  onStart: (initialTab?: string) => void;
}

export const SplashPage: React.FC<SplashPageProps> = ({ onStart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sections = [
    { id: 'private_tutor', title: 'المدرس الخصوصي (بث مباشر)', icon: Video },
    { id: 'academic', title: 'التعليم الأكاديمي', icon: GraduationCap },
    { id: 'lessons_broadcast', title: 'بث الدروس والمحاضرات', icon: Radio },
    { id: 'graphics', title: 'محركات التصميم 3D', icon: Palette },
    { id: 'analysis', title: 'التحليل الذكي', icon: Search },
    { id: 'generation', title: 'توليد المحتوى', icon: Sparkles },
    { id: 'builder', title: 'مختبر البناء', icon: Cpu },
    { id: 'bioscience', title: 'العلوم الحيوية', icon: Dna },
    { id: 'ads', title: 'الإعلانات', icon: Megaphone },
  ];

  useEffect(() => {
    const speak = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("مرحباً بك في منصة awh ريكس كود الذكية");
        utterance.lang = 'ar-SA';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    };
    speak();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-black z-0" />

      {/* Header / Title */}
      <div className="z-10 text-center space-y-3 max-w-3xl mx-auto pt-4">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg">
          awh ريكس كود
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          منصة الذكاء الاصطناعي التفاعلية للتحليل، التوليد، التعليم، والابتكار المتقدم
        </p>
      </div>

      {/* Center Hero Image & Start Button Section */}
      <div className="z-10 max-w-5xl w-full mx-auto my-6 flex flex-col items-center">
        <div className="relative w-full rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-slate-900/80 group">
          <img 
            src="/assets/aistudio/image_b8ddfd95_240f05e7.jpg" 
            alt="awh ريكس كود AI Platform" 
            className="w-full h-[320px] md:h-[420px] object-cover opacity-90 group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col items-center justify-end p-6 md:p-8">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                onStart('main');
              }}
              className="group inline-flex items-center gap-3 px-16 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-2xl shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.9)] hover:scale-105 transition-all duration-300 border border-cyan-400/50 cursor-pointer active:scale-95"
            >
              <Zap className="w-7 h-7 text-cyan-200 group-hover:animate-bounce" />
              <span>ابدا</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sections Grid at Bottom */}
      <div className="z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 max-w-6xl w-full mx-auto pb-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              onClick={() => onStart(s.id)}
              className="flex flex-col items-center gap-2 p-3 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:bg-slate-900/80 cursor-pointer transition-all duration-300 group hover:-translate-y-1 shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 text-center group-hover:text-white">
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

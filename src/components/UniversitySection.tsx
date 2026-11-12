import React, { useState } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { KnowledgeSectionView } from './KnowledgeSectionView';
import { GraduateAssistant } from './GraduateAssistant';
import { universityCurriculum } from '../services/knowledgeSections';

interface UniversitySectionProps {
  onNavigateHome: () => void;
}

type UniversityMode = 'guide' | 'assistant';

const MODES: { id: UniversityMode; label: string; icon: typeof BookOpen }[] = [
  { id: 'guide', label: 'الدليل الجامعي', icon: BookOpen },
  { id: 'assistant', label: 'مساعد طلاب الدراسات العليا', icon: GraduationCap },
];

export const UniversitySection: React.FC<UniversitySectionProps> = ({ onNavigateHome }) => {
  const [mode, setMode] = useState<UniversityMode>('guide');

  return (
    <div className="flex-1 w-full">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 flex flex-wrap gap-2" dir="rtl">
        {MODES.map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              aria-pressed={active}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                active
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {mode === 'guide' ? (
        <KnowledgeSectionView
          storageKey="awh_progress_university"
          curriculum={universityCurriculum}
          accentClass="text-cyan-400"
          onNavigateHome={onNavigateHome}
        />
      ) : (
        <GraduateAssistant />
      )}
    </div>
  );
};

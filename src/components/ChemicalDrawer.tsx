import React, { useEffect, useRef, useState } from 'react';
import SmilesDrawer from 'smiles-drawer';
import { FlaskConical, Copy, Check } from 'lucide-react';

interface ChemicalDrawerProps {
  smiles: string;
  name: string;
  molecularFormula?: string;
  molecularWeight?: string;
}

export const ChemicalDrawer: React.FC<ChemicalDrawerProps> = ({
  smiles,
  name,
  molecularFormula,
  molecularWeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !smiles) return;

    try {
      const options = {
        width: 320,
        height: 280,
        bondThickness: 1.8,
        bondLength: 17,
        shortBondLength: 0.85,
        themes: {
          dark: {
            C: '#f1f5f9',
            O: '#f87171',
            N: '#60a5fa',
            S: '#facc15',
            P: '#fb923c',
            Cl: '#4ade80',
            F: '#34d399',
            Br: '#c084fc',
            I: '#a855f7',
            BACKGROUND: 'transparent',
          },
        },
      };

      const drawer = new SmilesDrawer.Drawer(options);
      SmilesDrawer.parse(
        smiles,
        (tree: any) => {
          if (canvasRef.current) {
            drawer.draw(tree, canvasRef.current, 'dark', false);
            setError(null);
          }
        },
        (err: any) => {
          console.error('Smiles parse error:', err);
          setError('صيغة SMILES غير صالحة للرسم');
        }
      );
    } catch (e: any) {
      setError(e.message || 'تعذر رسم الصيغة الكيميائية');
    }
  }, [smiles]);

  const handleCopySmiles = () => {
    navigator.clipboard.writeText(smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <h4 className="font-semibold text-sm text-slate-100">{name}</h4>
        </div>
        <button
          onClick={handleCopySmiles}
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          title="نسخ صيغة SMILES"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'تم النسخ' : 'نسخ SMILES'}</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center min-h-[280px] bg-slate-900/40 rounded-xl my-3">
        {error ? (
          <div className="text-xs text-rose-400 text-center p-4">{error}</div>
        ) : (
          <canvas ref={canvasRef} width={320} height={280} className="max-w-full" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 font-mono">
        {molecularFormula && (
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">الصيغة الجزيئية:</span>
            <span className="text-emerald-400 font-semibold">{molecularFormula}</span>
          </div>
        )}
        {molecularWeight && (
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">الكتلة المولية:</span>
            <span className="text-cyan-400 font-semibold">{molecularWeight}</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-slate-500 font-mono break-all line-clamp-2" title={smiles}>
        {smiles}
      </div>
    </div>
  );
};

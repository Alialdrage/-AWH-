import React, { useEffect, useRef, useState } from 'react';
import * as $3Dmol from '3dmol';
import { RotateCw, RefreshCw, ZoomIn, ZoomOut, Layers, Eye, Sparkles } from 'lucide-react';

interface MolecularViewerProps {
  cifUrl: string;
  isAlphaFold?: boolean;
  targetName?: string;
  onResidueClick?: (residue: string) => void;
}

export const MolecularViewer: React.FC<MolecularViewerProps> = ({
  cifUrl,
  isAlphaFold = true,
  targetName = 'Structure',
  onResidueClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [styleMode, setStyleMode] = useState<'plddt' | 'cartoon' | 'sticks' | 'surface'>('plddt');
  const [isSpinning, setIsSpinning] = useState(false);
  const [darkBackground, setDarkBackground] = useState(true);

  // Apply visual style
  const updateStyle = (viewer: any, mode: 'plddt' | 'cartoon' | 'sticks' | 'surface') => {
    if (!viewer) return;
    viewer.removeAllSurfaces();

    if (mode === 'plddt' && isAlphaFold) {
      // Canonical AlphaFold pLDDT 4-band color scale
      viewer.setStyle(
        {},
        {
          cartoon: {
            colorfunc: (atom: any) => {
              const b = atom.b;
              if (b > 90) return '#0053D6'; // Very high (>90): Dark Blue
              if (b > 70) return '#65CBF3'; // Confident (70-90): Light Blue
              if (b > 50) return '#FFDB13'; // Low (50-70): Yellow
              return '#FF7D45';             // Very low (<50): Orange
            },
          },
        }
      );
    } else if (mode === 'sticks') {
      viewer.setStyle({}, { stick: { radius: 0.2, colorscheme: 'amino' } });
    } else if (mode === 'surface') {
      viewer.setStyle({}, { cartoon: { color: '#0ea5e9', opacity: 0.8 } });
      viewer.addSurface($3Dmol.SurfaceType.VDW, {
        opacity: 0.65,
        color: '#38bdf8',
      });
    } else {
      // General cartoon spectrum
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    }

    viewer.render();
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const initViewer = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';

      try {
        const viewer = $3Dmol.createViewer(containerRef.current, {
          defaultcolors: ($3Dmol as any).rasmolElementColors || ($3Dmol as any).elementColors,
          backgroundColor: darkBackground ? '#090d16' : '#f8fafc',
        });
        viewerRef.current = viewer;

        // Fetch coordinate file (.cif or .pdb)
        const response = await fetch(cifUrl);
        if (!response.ok) {
          throw new Error(`Failed to load coordinate file (${response.status})`);
        }
        const data = await response.text();

        if (!isMounted) return;

        viewer.clear();
        viewer.addModel(data, 'cif');

        updateStyle(viewer, styleMode);

        viewer.setClickable({}, true, (atom: any) => {
          if (atom && onResidueClick) {
            onResidueClick(`${atom.resn || ''} ${atom.resi || ''} (Chain ${atom.chain || 'A'})`);
          }
        });

        viewer.zoomTo();
        viewer.render();
        setLoading(false);
      } catch (err: any) {
        console.error('Molecular viewer initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Error rendering 3D macromolecule');
          setLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.clear();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [cifUrl, darkBackground]);

  // Handle spin animation
  useEffect(() => {
    if (!viewerRef.current) return;
    if (isSpinning) {
      viewerRef.current.spin('y', 1.0);
    } else {
      viewerRef.current.spin(false);
    }
  }, [isSpinning]);

  const handleResetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.render();
    }
  };

  const handleZoom = (factor: number) => {
    if (viewerRef.current) {
      viewerRef.current.zoom(factor);
      viewerRef.current.render();
    }
  };

  const handleStyleChange = (mode: 'plddt' | 'cartoon' | 'sticks' | 'surface') => {
    setStyleMode(mode);
    if (viewerRef.current) {
      updateStyle(viewerRef.current, mode);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-md">
      {/* Viewer Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">{targetName}</span>
          {isAlphaFold && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              AlphaFold DB (v6)
            </span>
          )}
        </div>

        {/* Style selector */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          {isAlphaFold && (
            <button
              onClick={() => handleStyleChange('plddt')}
              className={`px-2 py-1 rounded transition-colors ${
                styleMode === 'plddt'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="تلوين وفق مؤشر ثقة AlphaFold pLDDT"
            >
              pLDDT
            </button>
          )}
          <button
            onClick={() => handleStyleChange('cartoon')}
            className={`px-2 py-1 rounded transition-colors ${
              styleMode === 'cartoon'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            شريطي (Cartoon)
          </button>
          <button
            onClick={() => handleStyleChange('sticks')}
            className={`px-2 py-1 rounded transition-colors ${
              styleMode === 'sticks'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            أذرع (Sticks)
          </button>
          <button
            onClick={() => handleStyleChange('surface')}
            className={`px-2 py-1 rounded transition-colors ${
              styleMode === 'surface'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            السطح (Surface)
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`p-1.5 rounded hover:bg-slate-800 transition ${isSpinning ? 'text-cyan-400 bg-slate-800' : ''}`}
            title="تدوير تلقائي"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleZoom(1.2)}
            className="p-1.5 rounded hover:bg-slate-800 transition"
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded hover:bg-slate-800 transition"
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded hover:bg-slate-800 transition"
            title="إعادة ضبط المشهد"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDarkBackground(!darkBackground)}
            className="p-1.5 rounded hover:bg-slate-800 transition"
            title="تبديل تباين الخلفية"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="relative flex-1 w-full min-h-[380px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 z-10 backdrop-blur-sm">
            <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="mt-3 text-xs text-slate-400">جاري تحميل إحداثيات الهيكل الجزيئي ثلاثي الأبعاد...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center z-10">
            <span className="text-rose-400 text-sm font-semibold mb-1">تعذر عرض الهيكل الجزيئي</span>
            <span className="text-xs text-slate-400 max-w-sm">{error}</span>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Canonical AlphaFold pLDDT Confidence Legend */}
        {isAlphaFold && (
          <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[11px] backdrop-blur-md shadow-lg pointer-events-auto">
            <div className="font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>مقياس ثقة AlphaFold pLDDT:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0053D6]" />
                <span>عالي جداً (&gt;90)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65CBF3]" />
                <span>موثوق (70-90)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFDB13]" />
                <span>منخفض (50-70)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7D45]" />
                <span>منخفض جداً (&lt;50)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

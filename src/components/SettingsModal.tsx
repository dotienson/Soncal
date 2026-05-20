import React from 'react';
import { Palette, Info, Code2, Cpu, X } from 'lucide-react';

type Theme = 'slate' | 'pink' | 'blue';

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 p-5 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Cpu className="w-5 h-5 text-slate-500" /> System Params
          </h2>
          <button 
             onClick={onClose} 
             className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
             <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Giao diện */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <Palette className="w-4 h-4 text-slate-400" /> Interface Theme
            </h3>
            <div className="grid grid-cols-3 gap-2">
               <button 
                 onClick={() => setTheme('slate')} 
                 className={`py-2 px-2 rounded-lg font-medium text-xs border transition-all ${theme === 'slate' ? 'border-slate-800 bg-slate-800 text-white shadow-sm' : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
               >
                 Monochrome
               </button>
               <button 
                 onClick={() => setTheme('pink')} 
                 className={`py-2 px-2 rounded-lg font-medium text-xs border transition-all ${theme === 'pink' ? 'border-pink-500 bg-pink-500 text-white shadow-sm' : 'border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100'}`}
               >
                 Coral
               </button>
               <button 
                 onClick={() => setTheme('blue')} 
                 className={`py-2 px-2 rounded-lg font-medium text-xs border transition-all ${theme === 'blue' ? 'border-sky-500 bg-sky-500 text-white shadow-sm' : 'border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100'}`}
               >
                 Cyan
               </button>
            </div>
          </div>
          
          {/* Tác giả */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <Info className="w-4 h-4 text-slate-400" /> Developer
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm shadow-inner">
               <p className="font-bold text-slate-800 text-[15px]">ThS. BS. Đỗ Tiến Sơn</p>
               <p className="text-slate-500 mt-1">Lead Developer & UI/UX Designer</p>
            </div>
          </div>

          {/* Thuật toán */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <Code2 className="w-4 h-4 text-slate-400" /> System Architecture
            </h3>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs leading-relaxed space-y-4 font-mono shadow-inner border border-slate-700">
               <p>
                 <strong className="text-sky-400 block mb-1 uppercase text-[10px] tracking-wider">Engine Execution</strong> 
                 Runs directly via native hardware-accelerated JavaScript engines (V8/Nitro). Native compilation at the execution layer yields near-zero latency, circumventing network round-trip overhead.
               </p>
               <p>
                 <strong className="text-sky-400 block mb-1 uppercase text-[10px] tracking-wider">Mathematical Reliability</strong>
                 Strict algebraic precedence parsing (PEMDAS). AST generation handles evaluation with absolute determinism, making it completely reliable for clinical contexts.
               </p>
               <p>
                 <strong className="text-sky-400 block mb-1 uppercase text-[10px] tracking-wider">Floating-point Mitigation</strong>
                 Uses 64-bit precision (IEEE 754). Features a built-in differential noise reduction patch <code>(toPrecision(12))</code> to resolve inherent binary artifacting (e.g., 0.1 + 0.2 rendering anomaly), ensuring perfect decimal scaling for fractional dosing.
               </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

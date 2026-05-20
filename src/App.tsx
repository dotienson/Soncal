/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Delete, Settings2, Calculator as CalcIcon, Menu, Pill } from 'lucide-react';
import { Preset, HistoryItem } from './types';
import { PresetModal } from './components/PresetModal';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_PRESETS: Preset[] = [
  { id: 'aug600', name: 'Aug 600', dosePerKg: 45, concentrationMg: 600, concentrationMl: 5, timesPerDay: 2, unit: 'mL' },
  { id: 'para250', name: 'Para 250', dosePerKg: 15, concentrationMg: 250, concentrationMl: 1, timesPerDay: 4, unit: 'gói' },
  { id: 'tamiflu', name: 'Tamiflu', isSpecial: true },
];

const precision = (num: number) => parseFloat(num.toPrecision(12));
const calculateMath = (a: number, b: number, op: string) => {
  switch (op) {
    case '+': return precision(a + b);
    case '-': return precision(a - b);
    case '*': return precision(a * b);
    case ':': return b === 0 ? NaN : precision(a / b);
    default: return b;
  }
};

const formatResult = (num: number) => {
   if (!isFinite(num)) return String(num);
   if (num % 1 !== 0) {
      const strForm = num.toString();
      if (strForm.includes('e')) {
         return parseFloat(num.toFixed(3)).toString() + '*';
      }
      const decPart = strForm.split('.')[1];
      if (decPart && decPart.length > 3) {
         return parseFloat(num.toFixed(3)).toString() + '*';
      }
   }
   return num.toString();
};

const Btn = ({ onClick, className = "", children }: any) => (
  <button
    onClick={onClick}
    className={`active:scale-95 transition-all flex items-center justify-center font-medium shadow-sm select-none rounded-2xl h-[4rem] md:h-16 text-3xl ${className}`}
  >
    {children}
  </button>
);

export default function App() {
  const [weightStr, setWeightStr] = useState<string>(() => localStorage.getItem('medCalc_weight') || '');
  const [daysStr, setDaysStr] = useState<string>(() => localStorage.getItem('medCalc_days') || '');

  useEffect(() => {
    localStorage.setItem('medCalc_weight', weightStr);
  }, [weightStr]);

  useEffect(() => {
    localStorage.setItem('medCalc_days', daysStr);
  }, [daysStr]);
  
  const [expr, setExpr] = useState('0');
  const [isResult, setIsResult] = useState(false);
  const [showIdleOverlay, setShowIdleOverlay] = useState(false);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    
    const resetIdleTimer = () => {
      setShowIdleOverlay(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setShowIdleOverlay(true);
      }, 50000);
    };

    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    resetIdleTimer();
    return () => {
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.log(`${err.name}, ${err.message}`);
      }
    };
    requestWakeLock();
    const handleVis = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => {
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const tapeRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  type Theme = 'slate' | 'pink' | 'blue';
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('medCalc_theme') as Theme) || 'slate');
  
  useEffect(() => {
     localStorage.setItem('medCalc_theme', theme);
  }, [theme]);

  const t = theme === 'slate' ? {
    wrapper: 'bg-slate-900',
    app: 'bg-slate-50 border-slate-800',
    display: 'text-slate-900',
    keypad: 'bg-slate-100/80',
    btnNum: 'bg-white text-slate-800',
    btnOp: 'bg-white text-blue-600 hover:bg-blue-50',
    btnAction: 'bg-slate-200/50 text-slate-700 hover:bg-slate-300',
    btnEq: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    operatorColor: 'text-blue-500'
  } : theme === 'pink' ? {
    wrapper: 'bg-pink-100',
    app: 'bg-pink-50 border-pink-300',
    display: 'text-pink-900',
    keypad: 'bg-pink-100/60',
    btnNum: 'bg-white text-pink-900',
    btnOp: 'bg-white text-pink-600 hover:bg-pink-100',
    btnAction: 'bg-pink-200/50 text-pink-700 hover:bg-pink-300',
    btnEq: 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm shadow-pink-200',
    operatorColor: 'text-pink-400 opacity-80'
  } : {
    wrapper: 'bg-sky-100',
    app: 'bg-sky-50 border-sky-300',
    display: 'text-sky-900',
    keypad: 'bg-sky-100/60',
    btnNum: 'bg-white text-sky-900',
    btnOp: 'bg-white text-sky-600 hover:bg-sky-100',
    btnAction: 'bg-sky-200/50 text-sky-700 hover:bg-sky-300',
    btnEq: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-200',
    operatorColor: 'text-sky-400 opacity-80'
  };

  const renderColoredExpression = (expression: string) => {
     return expression.split('').map((char, i) => {
        if (['+', '-', '×', ':'].includes(char)) {
            return <span key={i} className={`${t.operatorColor} mx-[1px]`}>{char}</span>;
        }
        if (char === '*') {
            return <span key={i} className="opacity-50 text-[0.7em] align-top relative top-[0.4em] ml-[2px] font-bold">*</span>;
        }
        return <span key={i}>{char}</span>;
     });
  };

  const [presets, setPresets] = useState<Preset[]>(() => {
     try {
       const saved = localStorage.getItem('medCalc_presets_v2');
       if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.find((p: Preset) => p.id === 'tamiflu')) {
             return [...parsed, { id: 'tamiflu', name: 'Tamiflu', isSpecial: true }];
          }
          return parsed;
       }
     } catch(e) {}
     return DEFAULT_PRESETS;
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  useEffect(() => {
     localStorage.setItem('medCalc_presets_v2', JSON.stringify(presets));
  }, [presets]);
  
  // Auto-scroll tape to bottom when history updates
  useEffect(() => {
     if (tapeRef.current) {
        tapeRef.current.scrollTop = tapeRef.current.scrollHeight;
     }
  }, [history]);

  useEffect(() => {
     if (displayRef.current) {
        displayRef.current.scrollLeft = displayRef.current.scrollWidth;
     }
  }, [expr]);

  const addHistory = (item: HistoryItem) => {
     setHistory(prev => [...prev, item]);
  };

  const inputDigit = (digit: string) => {
    if (isResult) {
        setExpr(digit);
        setIsResult(false);
        return;
    }
    setExpr(prev => {
        if (prev === '0' || prev === 'NaN' || prev === 'Infinity' || prev === '-Infinity') return digit;
        if (/[\+\-\×\:]0$/.test(prev)) {
            return prev.slice(0, -1) + digit;
        }
        return prev + digit;
    });
  };

  const performOperation = (op: string) => {
     setIsResult(false);
     setExpr(prev => {
        let p = prev.replace(/\*/g, '');
        if (p === 'NaN' || p === 'Infinity' || p === '-Infinity') return '0' + op;
        if (/[\+\-\×\:]$/.test(p)) {
           return p.slice(0, -1) + op;
        }
        if (p.endsWith('.')) {
           return p.slice(0, -1) + op;
        }
        return p + op;
     });
  };

  const inputDot = () => {
    if (isResult) {
        setExpr('0.');
        setIsResult(false);
        return;
    }
    setExpr(prev => {
       const parts = prev.split(/[\+\-\×\:]/);
       const lastPart = parts[parts.length - 1];
       if (!lastPart.includes('.')) {
          return prev + '.';
       }
       return prev;
    });
  };

  const handleEqual = () => {
      let sanitizeExpr = expr.replace(/\*/g, '');
      let calcExpr = sanitizeExpr.replace(/×/g, '*').replace(/:/g, '/');
      if (/[\+\-\*\/]$/.test(calcExpr)) {
         calcExpr = calcExpr.slice(0, -1);
      }
      try {
         const resultNum = precision(Function(`'use strict'; return (${calcExpr})`)());
         const resultStr = formatResult(resultNum);
         addHistory({
            id: Date.now().toString(),
            type: 'math',
            expression: expr,
            result: resultStr
         });
         setExpr(resultStr);
         setIsResult(true);
      } catch(e) {
         setExpr('NaN');
         setIsResult(true);
      }
  };

  const [weightWarning, setWeightWarning] = useState<{w: number, preset: Preset} | null>(null);
  const [tamifluPrompt, setTamifluPrompt] = useState<{w: number, preset: Preset} | null>(null);

  const clearAll = (clearHist = false) => {
    setExpr('0');
    setIsResult(false);
    setWeightStr('');
    setDaysStr('');
    if (clearHist === true) {
       setHistory([]);
    }
  };

  const handleBackspace = () => {
     if (isResult) {
        setExpr('0');
        setIsResult(false);
        return;
     }
     setExpr(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handlePresetClick = (preset: Preset) => {
     let w = parseFloat(weightStr);
     
     if (isNaN(w) || w <= 0) {
        const screenVal = parseFloat(expr);
        if (!isNaN(screenVal) && screenVal > 0) {
           w = screenVal;
           setWeightStr(screenVal.toString());
        } else {
           alert("Vui lòng nhập cân nặng (kg) trước khi tính toán liều thuốc!");
           return;
        }
     }
     
     if (w > 50 && preset.id !== 'tamiflu') {
        setWeightWarning({ w, preset });
        return;
     }

     if (preset.id === 'tamiflu' && w <= 15) {
        setTamifluPrompt({ w, preset });
        return;
     }

     executePreset(w, preset);
  };

  const executeTamiflu = (w: number, isUnderOne: boolean) => {
     let doseMg = 0;
     let volume = 0;
     let note = '';
     
     if (w <= 15) {
        if (isUnderOne) {
           doseMg = w * 3;
           volume = precision(doseMg / 5);
           note = `3 mg/kg`;
        } else {
           doseMg = 30;
           volume = 6;
           note = `Cố định 30 mg`;
        }
     } else if (w <= 23) {
        doseMg = 45;
        volume = 9;
        note = `Cố định 45 mg`;
     } else if (w <= 40) {
        doseMg = 60;
        volume = 12;
        note = `Cố định 60 mg`;
     } else {
        doseMg = 75;
        volume = 15;
        note = `Cố định 75 mg`;
     }
     
     let resultStr = `${formatResult(volume)} mL (${formatResult(doseMg)} mg) mỗi lần × 2 lần/ngày`;
     let totalVolumeStr = '';
     const dStr = parseFloat(daysStr);
     
     if (!isNaN(dStr) && dStr > 0) {
         const totalVol = precision(volume * 2 * dStr);
         totalVolumeStr = `Tổng ${dStr} ngày: ${formatResult(totalVol)} mL`;
     }
     
     addHistory({
        id: Date.now().toString(),
        type: 'preset',
        title: `Tamiflu (Cân: ${w} kg)`,
        expression: [`• Cách 1 viên (75mg) pha 15 mL nước`, `• Lấy liều: ${note}`],
        result: resultStr,
        totalVolume: totalVolumeStr
     });
     
     setExpr(formatResult(volume));
     setIsResult(true);
  };

  const executePreset = (w: number, preset: Preset) => {
     if (preset.id === 'tamiflu') {
         executeTamiflu(w, false); // For w >= 15, we don't need age so false is fine
         return;
     }

     const totalDose = precision(w * (preset.dosePerKg || 0));
     const cMg = preset.concentrationMg || 1;
     const cMl = preset.concentrationMl || 1;
     const volumeNum = precision((totalDose * cMl) / cMg);
     const volume = formatResult(volumeNum);
     
     const step1Str = `• ${w} kg × ${preset.dosePerKg} mg = ${formatResult(totalDose)} mg`;
     const divStr = cMl !== 1 ? ` × ${cMl}` : '';
     const step2Str = `• ${formatResult(totalDose)} mg : ${cMg}${divStr} = ${volume} ${preset.unit}`;
     
     let resultStr = `${volume} ${preset.unit}`;
     let totalVolumeStr = '';
     const dStr = parseFloat(daysStr);
     
     if (preset.timesPerDay > 0) {
        resultStr += ` (${preset.timesPerDay} lần/ngày)`;
        if (!isNaN(dStr) && dStr > 0) {
            const totalVol = precision(volumeNum * preset.timesPerDay * dStr);
            totalVolumeStr = `Tổng ${dStr} ngày: ${formatResult(totalVol)} ${preset.unit}`;
        }
     }
     
     addHistory({
        id: Date.now().toString(),
        type: 'preset',
        title: `${preset.name} (Cân: ${w} kg)`,
        expression: [step1Str, step2Str],
        result: resultStr,
        totalVolume: totalVolumeStr
     });
     
     setExpr(String(volume));
     setIsResult(true);
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="bg-black h-[100dvh] w-full flex flex-col items-center justify-center font-sans tracking-tight p-0.5 sm:p-2 pt-[max(env(safe-area-inset-top),4px)] pb-[max(env(safe-area-inset-bottom),4px)] overflow-hidden">
      <div className={`${t.app} w-full h-full flex-1 max-h-full sm:max-h-[840px] max-w-md rounded-[2.25rem] sm:rounded-[2.5rem] shadow-[0_0_20px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden relative transition-colors duration-500 border border-[#2a2a2a]`}>
        
        {weightWarning && (
          <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-200 flex flex-col items-center zoom-in-95">
              <h2 className="text-amber-600 text-2xl font-black mb-2 text-center">Cảnh báo</h2>
              <p className="text-slate-600 text-center mb-6 font-medium">
                Cân nặng nhập vào là <strong className="text-slate-900">{weightWarning.w} kg</strong>.<br/>Bạn có chắc chắn muốn tính liều trẻ em cho mức cân nặng này?
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setWeightWarning(null)} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl text-lg shadow-sm transition-colors border-2 border-slate-200 hover:border-slate-300"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => { 
                    executePreset(weightWarning.w, weightWarning.preset); 
                    setWeightWarning(null); 
                  }} 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-lg shadow-md transition-colors border-2 border-amber-500"
                >
                  Tính tiếp
                </button>
              </div>
            </div>
          </div>
        )}

        {tamifluPrompt && (
          <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-200 flex flex-col items-center zoom-in-95">
              <h2 className="text-amber-500 text-2xl font-black mb-2 text-center">Độ tuổi của trẻ</h2>
              <p className="text-slate-600 text-center mb-6 font-medium">
                Trẻ có cân nặng ≤ 15kg.<br/>Vui lòng chọn độ tuổi tương ứng:
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => { 
                    executeTamiflu(tamifluPrompt.w, true); 
                    setTamifluPrompt(null); 
                  }} 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition-colors border-2 border-blue-500"
                >
                  ≤ 1 tuổi
                </button>
                <button 
                  onClick={() => { 
                    executeTamiflu(tamifluPrompt.w, false); 
                    setTamifluPrompt(null); 
                  }} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition-colors border-2 border-emerald-500"
                >
                  &gt; 1 tuổi
                </button>
                <button 
                  onClick={() => setTamifluPrompt(null)} 
                  className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-xl shadow-sm transition-colors"
                >
                  Trở lại
                </button>
              </div>
            </div>
          </div>
        )}

        {showIdleOverlay && (
          <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-200 flex flex-col items-center zoom-in-95">
              <h2 className="text-slate-800 text-2xl font-black mb-6 text-center">Tiếp tục tính toán?</h2>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => { clearAll(true); setShowIdleOverlay(false); }} 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-lg shadow-sm transition-colors border-2 border-red-500"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowIdleOverlay(false)} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-md transition-colors border-2 border-blue-600"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box Overlay */}
        <div className="absolute top-0 inset-x-0 z-30 flex justify-center pointer-events-none">
           <div className="bg-[#fefce8]/95 backdrop-blur-md border-b border-x border-[#fde047] rounded-b-[1.5rem] shadow-[0_2px_10px_rgba(250,204,21,0.2)] pointer-events-auto px-4 py-1.5 flex items-center justify-center gap-1 w-fit animate-[pulse_3s_ease-in-out_infinite]">
              <span className="text-amber-800 font-medium text-[12px] sm:text-[13px] whitespace-nowrap">Đang tính liều cho trẻ</span>
              <input
                 id="weight-input"
                 type="number"
                 inputMode="decimal"
                 value={weightStr}
                 onChange={(e) => setWeightStr(e.target.value)}
                 className="w-7 sm:w-8 bg-transparent text-red-600 text-center font-bold text-[14px] outline-none placeholder:text-red-300 p-0 m-0 leading-none"
                 placeholder="--"
              />
              <span className="text-amber-800 font-medium text-[12px] sm:text-[13px] whitespace-nowrap">kg trong</span>
              <select
                 id="days-input"
                 value={daysStr}
                 onChange={(e) => setDaysStr(e.target.value)}
                 className="bg-transparent text-red-600 font-bold text-[14px] outline-none cursor-pointer appearance-none text-center px-0.5 z-10 m-0 leading-none"
              >
                 <option value="">-</option>
                 <option value="3">3</option>
                 <option value="4">4</option>
                 <option value="5">5</option>
                 <option value="6">6</option>
                 <option value="7">7</option>
              </select>
              <span className="text-amber-800 font-medium text-[12px] sm:text-[13px] whitespace-nowrap">ngày</span>
           </div>
        </div>

        {/* History Tape Area with Top Weight Box */}
        <div 
          ref={tapeRef}
          className="flex-1 min-h-0 overflow-y-auto flex flex-col custom-scrollbar scroll-smooth relative"
        >
           <div className="flex-1 p-4 pt-12 pb-6 space-y-3 flex flex-col">
             {history.length === 0 && (
                <div className="m-auto text-center text-slate-400 p-6">
                   <CalcIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                   <p className="text-[14px] font-bold text-slate-500">Son Calculator 2.0</p>
                   <p className="text-xs mt-1 max-w-[250px] mx-auto leading-relaxed">Máy tính này được thiết kế để phục vụ lâm sàng hàng ngày của Bác sĩ Đỗ Tiến Sơn.</p>
                </div>
             )}
             {history.map(item => (
                item.type === 'preset' ? (
                  <div key={item.id} className="bg-white p-2.5 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] text-right border-l-[4px] border-emerald-500 flex flex-col gap-0.5 animate-in slide-in-from-bottom-2 fade-in duration-200">
                     <div className="text-emerald-700 text-[10px] font-black uppercase tracking-wide opacity-90">{item.title}</div>
                     <div className="text-slate-500 font-mono text-[12px] border-b border-slate-50 pb-1">
                        {Array.isArray(item.expression) ? item.expression.map((line, i) => <div key={i}>{line}</div>) : item.expression}
                     </div>
                     <div className="text-slate-900 font-bold text-[17px] leading-tight pt-1">{item.result}</div>
                     {item.totalVolume && (
                        <div className="text-emerald-600 font-bold text-[13px] pt-0.5 bg-emerald-50/50 mt-1 p-1 rounded-md">
                           {item.totalVolume}
                        </div>
                     )}
                  </div>
                ) : (
                  <div key={item.id} className="bg-white p-2.5 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] text-right flex flex-col gap-0.5 border border-slate-100 animate-in slide-in-from-bottom-2 fade-in duration-200">
                     <div className="text-slate-400 text-[12px] font-mono border-b border-slate-50 pb-1">{Array.isArray(item.expression) ? item.expression.join(' ') : item.expression}</div>
                     <div className="text-slate-800 font-bold text-lg font-mono pt-1 leading-tight">{item.result}</div>
                  </div>
                )
             ))}
           </div>
        </div>

        {/* Dynamic Control Area Bottom */}
        <div className="bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20 flex-shrink-0 relative">
            {/* Calculator Display */}
            <div className="px-4 pb-3 pt-3 flex flex-col items-end">
               <div className="w-full bg-slate-50 border-t-2 border-b border-x border-slate-200/80 border-t-slate-300 rounded-3xl py-2 px-4 shadow-[inset_0_4px_10px_rgba(0,0,0,0.06),0_1px_1px_rgba(255,255,255,1)]">
                   <div 
                     ref={displayRef}
                     className={`text-[3rem] leading-[1.1] font-black ${t.display} text-right tracking-tighter w-full overflow-x-auto hide-scrollbar whitespace-nowrap pt-1`}
                   >
                      {renderColoredExpression(expr)}
                   </div>
               </div>
            </div>

            {/* Controls Wrap */}
            <div className={`transition-all duration-300 flex flex-col w-full`}>
              {/* Presets Bar */}
              <div className={`border-y border-slate-100 bg-slate-50 flex overflow-x-auto hide-scrollbar gap-2 px-4 py-2.5`} style={{ WebkitOverflowScrolling: 'touch' }}>
                 {presets.map(p => {
                    const isTamiflu = p.id === 'tamiflu';
                    const btnBg = isTamiflu ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-white border-slate-200 text-slate-700';
                    const iconColor = isTamiflu ? 'text-amber-400 active:text-amber-600 border-amber-200' : 'text-slate-300 active:text-blue-500 border-slate-200';
                    return (
                    <button 
                       key={p.id} 
                       className={`flex-shrink-0 border font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 ${btnBg} px-3.5 py-2 rounded-xl text-[13px]`}
                    >
                       <span onClick={() => handlePresetClick(p)} className="block pr-1 py-0.5 leading-none">{p.name}</span>
                       {!isTamiflu && (
                         <div 
                           onClick={(e) => { e.stopPropagation(); setEditingPreset(p); setModalOpen(true); }}
                           className={`border-l py-0.5 ${iconColor} pl-2`}
                         >
                           <Settings2 className={'w-[16px] h-[16px]'} />
                         </div>
                       )}
                    </button>
                 )})}
                 <button 
                    className={`flex-shrink-0 bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center shadow-sm p-2.5`}
                    onClick={() => { setEditingPreset(null); setModalOpen(true); }}
                 >
                    <Pill className={'w-5 h-5'} />
                 </button>
                 <div className="flex-1"></div>
                 <button 
                    className={`flex-shrink-0 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl active:scale-95 transition-transform flex items-center justify-center shadow-sm p-2`}
                    onClick={() => setSettingsOpen(true)}
                 >
                    <Settings2 className={'w-5 h-5'} />
                 </button>
              </div>
  
              {/* Keypad */}
              <div className={`${t.keypad} transition-all duration-500 relative p-4 pb-6 md:pb-4`}>
                <div className={`grid grid-cols-4 transition-all duration-300 gap-2.5`}>
                  <Btn onClick={() => clearAll(false)} className={`bg-red-50 text-red-600 font-black hover:bg-red-100 text-2xl col-span-2`}>AC</Btn>
                  <Btn onClick={handleBackspace} className={`${t.btnAction} font-bold`}><Delete className={"w-7 h-7"} /></Btn>
                  <Btn onClick={() => performOperation('+')} className={`${t.btnOp} font-light pb-1 text-4xl`}>+</Btn>
                  
                  <Btn onClick={() => inputDigit('7')} className={`${t.btnNum} `}>7</Btn>
                  <Btn onClick={() => inputDigit('8')} className={`${t.btnNum} `}>8</Btn>
                  <Btn onClick={() => inputDigit('9')} className={`${t.btnNum} `}>9</Btn>
                  <Btn onClick={() => performOperation('-')} className={`${t.btnOp} font-light pb-1 text-4xl`}>−</Btn>
                  
                  <Btn onClick={() => inputDigit('4')} className={`${t.btnNum} `}>4</Btn>
                  <Btn onClick={() => inputDigit('5')} className={`${t.btnNum} `}>5</Btn>
                  <Btn onClick={() => inputDigit('6')} className={`${t.btnNum} `}>6</Btn>
                  <Btn onClick={() => performOperation('×')} className={`bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-md font-bold pt-1 border border-yellow-500 text-5xl`}>×</Btn>
                  
                  <Btn onClick={() => inputDigit('1')} className={`${t.btnNum} `}>1</Btn>
                  <Btn onClick={() => inputDigit('2')} className={`${t.btnNum} `}>2</Btn>
                  <Btn onClick={() => inputDigit('3')} className={`${t.btnNum} `}>3</Btn>
                  <Btn onClick={() => performOperation(':')} className={`${t.btnOp} font-light pb-1 text-4xl`}>:</Btn>
                  
                  <Btn onClick={() => inputDigit('0')} className={`${t.btnNum} `}>0</Btn>
                  <Btn onClick={inputDot} className={`${t.btnNum} pb-3 text-4xl`}>.</Btn>
                  <Btn onClick={handleEqual} className={`${t.btnEq} font-black rounded-2xl col-span-2 shadow-md text-4xl`}>=</Btn>
                </div>
              </div>
            </div>
        </div>
      </div>



      <SettingsModal 
         isOpen={settingsOpen}
         onClose={() => setSettingsOpen(false)}
         theme={theme}
         setTheme={setTheme}
      />

      <PresetModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialData={editingPreset} 
        onSave={(p) => {
           if (editingPreset) {
              setPresets(prev => prev.map(x => x.id === p.id ? p : x));
           } else {
              setPresets(prev => [...prev, p]);
           }
           setModalOpen(false);
        }}
        onDelete={(id) => {
           setPresets(prev => prev.filter(x => x.id !== id));
           setModalOpen(false);
        }}
      />
    </div>
  );
}


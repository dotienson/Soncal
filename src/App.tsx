/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Delete, Settings2, Calculator as CalcIcon, Menu, Pill, Crown, Trash2 } from 'lucide-react';
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
   if (Number.isNaN(num)) return "Sai logic toán";
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

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

function getFractionText(numStr: string, isMl?: boolean): string | null {
  const num = parseFloat(numStr);
  if (isNaN(num) || !isFinite(num)) return null;
  if (Math.abs(Math.round(num) - num) < 0.01) return null; // effectively integer
  if (Math.abs(num) >= 10) return null;
  if (isMl) return null;

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  let intPart = Math.floor(absNum);
  const decimal = absNum - intPart;

  if (decimal < 0.01 || decimal > 0.99) return null; // Too close to integer

  let bestNum = 1;
  let bestDen = 2;
  let minDiff = 1;

  for (let d = 2; d <= 10; d++) {
    for (let n = 1; n < d; n++) {
      const diff = Math.abs(decimal - (n / d));
      if (diff < minDiff - 0.00001) {
        minDiff = diff;
        let g = gcd(n, d);
        bestNum = n / g;
        bestDen = d / g;
      }
    }
  }

  // We should format fraction decimal cleanly
  const fractionVal = intPart + (bestNum / bestDen);
  const fractionValStr = Number.isInteger(fractionVal) ? fractionVal.toString() : +(fractionVal.toFixed(3));
  
  const sign = isNegative ? "-" : "";
  const prefix = intPart === 0 ? "" : `${intPart} + `;
  return `${sign}~ ${prefix}${bestNum}/${bestDen} (${sign}${fractionValStr})`;
}

const BottomTicker = () => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Luôn kiểm tra lại cân nặng với mẹ bé!",
    "Luôn hỏi về dị ứng thuốc, sàng lọc, tiền sử!",
    "Phần mềm của BS. Đỗ Tiến Sơn - Version 2.2"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full text-center mt-1 mb-2 flex-shrink-0 px-2 overflow-hidden h-[24px]">
      <div 
        key={index} 
        className="text-[11px] font-black tracking-wide text-white uppercase animate-in slide-in-from-bottom-2 fade-in duration-500 bg-red-600 rounded-lg mx-auto max-w-[95%] py-0.5"
      >
        ⚠️ {messages[index]}
      </div>
    </div>
  );
};

export default function App() {
  const [weightStr, setWeightStr] = useState<string>(() => localStorage.getItem('medCalc_weight') || '');
  const [daysStr, setDaysStr] = useState<string>(() => {
    const val = localStorage.getItem('medCalc_days');
    return val && ['3', '5', '7'].includes(val) ? val : '7';
  });

  useEffect(() => {
    localStorage.setItem('medCalc_weight', weightStr);
  }, [weightStr]);

  useEffect(() => {
    localStorage.setItem('medCalc_days', daysStr);
  }, [daysStr]);
  
  const [expr, setExpr] = useState('0');
  const [exprIsMl, setExprIsMl] = useState(false);
  const [isResult, setIsResult] = useState(false);
  const [showIdleOverlay, setShowIdleOverlay] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean>(() => localStorage.getItem('medCalc_premium') === 'true');
  const [keepAwake, setKeepAwake] = useState<boolean>(() => localStorage.getItem('medCalc_keepAwake') !== 'false');
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumCode, setPremiumCode] = useState('');
  const [premiumError, setPremiumError] = useState(false);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    
    const resetIdleTimer = () => {
      setShowIdleOverlay(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setShowIdleOverlay(true);
      }, 180000);
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
    let mounted = true;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && keepAwake && mounted && document.visibilityState === 'visible') {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.log(`${err.name}, ${err.message}`);
      }
    };
    
    const releaseWakeLock = async () => {
      if (wakeLock !== null) {
        try {
          await wakeLock.release();
          wakeLock = null;
        } catch (err) {}
      }
    };

    if (keepAwake) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVis = () => {
      if (keepAwake && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => {
      mounted = false;
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [keepAwake]);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const tapeRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  type Theme = 'slate' | 'pink' | 'blue';
  
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('medCalc_theme') as Theme) || 'slate');
  const [opOrder, setOpOrder] = useState<string[]>(() => {
     try {
        const saved = localStorage.getItem('medCalc_opOrderArray');
        if (saved) {
           const parsed = JSON.parse(saved);
           if (Array.isArray(parsed) && parsed.length === 4) return parsed;
        }
     } catch(e) {}
     // migrate old
     const old = localStorage.getItem('medCalc_opOrder');
     if (old === 'apple') return [':', '×', '-', '+'];
     return ['×', ':', '+', '-'];
  });
  
  useEffect(() => {
     localStorage.setItem('medCalc_theme', theme);
  }, [theme]);

  useEffect(() => {
     localStorage.setItem('medCalc_opOrderArray', JSON.stringify(opOrder));
  }, [opOrder]);

  useEffect(() => {
     localStorage.setItem('medCalc_keepAwake', String(keepAwake));
  }, [keepAwake]);

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
            if (i === expression.length - 1) {
                return <span key={i} className="inline-flex items-center justify-center bg-slate-800 text-white shadow-inner text-[0.3em] align-top ml-[4px] mt-[10px] font-black w-[1.3em] h-[1.3em] rounded-[4px] pb-[1px]">{char}</span>;
            }
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
    setExprIsMl(false);
    if (isResult) {
        setExpr(digit);
        setIsResult(false);
        return;
    }
    setExpr(prev => {
        if (prev === '0' || prev === 'Sai logic toán' || prev === 'Infinity' || prev === '-Infinity') return digit;
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
        if (p === 'Sai logic toán' || p === 'Infinity' || p === '-Infinity') return '0' + op;
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
         setExprIsMl(false);
         addHistory({
            id: Date.now().toString(),
            type: 'math',
            expression: expr,
            result: resultStr
         });
         setExpr(resultStr);
         setIsResult(true);
      } catch(e) {
         setExpr('Sai logic toán');
         setExprIsMl(false);
         setIsResult(true);
      }
  };

  const [weightWarning, setWeightWarning] = useState<{w: number, preset: Preset} | null>(null);
  const [tamifluPrompt, setTamifluPrompt] = useState<{w: number, preset: Preset} | null>(null);

  const clearAll = (clearHist = false) => {
    setExpr('0');
    setExprIsMl(false);
    setIsResult(false);
    setWeightStr('');
    setDaysStr('7');
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
        totalVolume: totalVolumeStr,
        volumeNum: volume,
        timesPerDay: 2,
        unit: 'mL'
     });
     
     setExpr(formatResult(volume));
     setExprIsMl(true);
     setIsResult(true);
  };

  const executePreset = (w: number, preset: Preset) => {
     if (preset.id === 'tamiflu') {
         executeTamiflu(w, false); // For w >= 15, we don't need age so false is fine
         return;
     }

     let totalDose = precision(w * (preset.dosePerKg || 0));
     let isMaxDoseLimited = false;
     let maxDoseStr = '';
     
     if (preset.maxDoseMg && totalDose > preset.maxDoseMg) {
        totalDose = preset.maxDoseMg;
        isMaxDoseLimited = true;
        maxDoseStr = `Liều tối đa ${preset.maxDoseMg}mg/lần`;
     }

     const cMg = preset.concentrationMg || 1;
     const cMl = preset.concentrationMl || 1;
     const volumeNum = precision((totalDose * cMl) / cMg);
     const volume = formatResult(volumeNum);
     
     let step1Str = `• ${w} kg × ${preset.dosePerKg} mg = ${formatResult(precision(w * (preset.dosePerKg || 0)))} mg`;
     if (isMaxDoseLimited) {
         step1Str += ` → Giới hạn ${preset.maxDoseMg} mg`;
     }
     
     const divStr = (!preset.isSolid && cMl !== 1) ? ` × ${cMl}` : '';
     const step2Str = `• ${formatResult(totalDose)} mg : ${cMg}${divStr} = ${volume} ${preset.unit}`;
     
     let fractionPart: string | number = volume;
     const fracText = getFractionText(String(volumeNum));
     if (fracText) fractionPart = fracText.split(' (')[0].replace('~ ', '');

     let resultStr = preset.isSolid 
        ? `${formatResult(totalDose)} mg (${fractionPart} ${preset.unit})`
        : `${volume} ${preset.unit}`;
        
     let totalVolumeStr = '';
     const dStr = parseFloat(daysStr);
     
     if (preset.timesPerDay && preset.timesPerDay > 0) {
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
        totalVolume: totalVolumeStr,
        volumeNum: volumeNum,
        timesPerDay: preset.timesPerDay,
        unit: preset.unit,
        isMaxDoseLimited,
        maxDoseStr
     });
     
     setExpr(String(volume));
     setExprIsMl(!preset.isSolid && preset.unit === 'mL');
     setIsResult(true);
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  const renderOpBtn = (op: string) => {
    if (op === '×') {
      return (
        <Btn key={op} onClick={() => performOperation('×')} className={`bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-md font-bold pt-1 border border-yellow-500 text-5xl`}>
          ×
        </Btn>
      );
    }
    const displayOp = op === '-' ? '−' : op;
    return (
      <Btn key={op} onClick={() => performOperation(op)} className={`${t.btnOp} font-light pb-1 text-4xl`}>
        {displayOp}
      </Btn>
    );
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-black flex flex-col items-center justify-center font-sans tracking-tight px-0 sm:px-2 pt-0 sm:pt-4 pb-0 sm:pb-4 overflow-hidden">
      <div className={`${t.app} w-full flex-1 max-h-full sm:max-h-[820px] min-h-0 max-w-md rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-[0_0_20px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden relative transition-colors duration-500 border-0 sm:border border-[#2a2a2a]`}>
        
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
        <div className="absolute top-0 inset-x-0 z-30 flex justify-center pointer-events-none pt-[max(env(safe-area-inset-top),0px)]">
           <div className="bg-[#ffcb05] border-b border-x border-[#eab308] rounded-b-[1.5rem] shadow-sm pointer-events-auto px-4 py-1.5 flex items-center justify-center gap-1 w-fit">
              <span className="text-amber-900 font-bold text-[12px] sm:text-[13px] whitespace-nowrap">Đang tính liều cho trẻ</span>
              <input
                 id="weight-input"
                 type="number"
                 inputMode="decimal"
                 value={weightStr}
                 onChange={(e) => setWeightStr(e.target.value)}
                 className="w-7 sm:w-8 bg-transparent text-[#b91c1c] text-center font-black text-[14px] outline-none placeholder:text-red-800/40 p-0 m-0 leading-none"
                 placeholder="--"
              />
              <span className="text-amber-900 font-bold text-[12px] sm:text-[13px] whitespace-nowrap">kg trong</span>
              <select
                 id="days-input"
                 value={daysStr}
                 onChange={(e) => setDaysStr(e.target.value)}
                 className="bg-transparent text-[#b91c1c] font-black text-[14px] outline-none cursor-pointer appearance-none text-center px-0.5 z-10 m-0 leading-none"
              >
                 <option value="3">3</option>
                 <option value="5">5</option>
                 <option value="7">7</option>
              </select>
              <span className="text-amber-900 font-bold text-[12px] sm:text-[13px] whitespace-nowrap">ngày</span>
           </div>
        </div>

        {/* History Tape Area with Top Weight Box */}
        <div 
          ref={tapeRef}
          className="flex-1 min-h-0 overflow-y-auto flex flex-col custom-scrollbar scroll-smooth relative"
        >
           <div className="flex-1 px-3 sm:px-4 pt-[calc(max(env(safe-area-inset-top),0px)+3.5rem)] pb-3 space-y-3 flex flex-col">
             {history.length === 0 && (
                <div className="m-auto text-center text-slate-400 p-6">
                   <CalcIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                   <p className="text-[14px] font-bold text-slate-500">Son Calculator 2.0</p>
                   <p className="text-[10px] mt-2 max-w-[280px] mx-auto leading-relaxed opacity-60">Máy tính cầm tay này được thiết kế để phục vụ thực hành hàng ngày, không thay thế các quyết định lâm sàng, chỉ sử dụng logic toán học, không sử dụng AI trong tính toán.</p>
                </div>
             )}
             {history.length > 0 && (
                <div className="flex justify-end -mt-2">
                   <button 
                     onClick={() => setHistory([])}
                     className="text-xs font-bold text-slate-400 hover:text-red-500 px-3 py-1.5 bg-white shadow-sm border border-slate-100 hover:border-red-100 rounded-full transition-colors flex items-center gap-1"
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa lịch sử
                   </button>
                </div>
             )}
             {history.map(item => (
                item.type === 'preset' ? (
                  <div key={item.id} className="bg-white p-2.5 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] text-right border-l-[4px] border-emerald-500 flex flex-col gap-0.5 animate-in slide-in-from-bottom-2 fade-in duration-200">
                     <div className="text-emerald-700 text-[10px] font-black uppercase tracking-wide opacity-90">{item.title}</div>
                     <div className="text-slate-500 font-mono text-[12px] border-b border-slate-50 pb-1">
                        {Array.isArray(item.expression) ? item.expression.map((line, i) => <div key={i}>{line}</div>) : item.expression}
                     </div>
                     <div className="text-slate-900 font-bold text-[17px] leading-tight pt-1">
                        {item.result}
                        {item.isMaxDoseLimited && (
                           <span className="inline-flex items-center gap-1 ml-2 text-[12px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 align-text-bottom">
                             <span className="text-[14px] leading-none -mt-[1px]">⚠️</span>
                             {item.maxDoseStr}
                           </span>
                        )}
                        {item.volumeNum !== undefined && getFractionText(String(item.volumeNum)) && !item.result.includes('/') && (
                           <span className="text-slate-500 ml-1 text-sm">{getFractionText(String(item.volumeNum))}</span>
                        )}
                     </div>
                     {(() => {
                        let displayTotal = item.totalVolume;
                        const dStr = parseFloat(daysStr);
                        if (item.volumeNum && item.timesPerDay && !isNaN(dStr) && dStr > 0) {
                           const newTotalVol = precision(item.volumeNum * item.timesPerDay * dStr);
                           displayTotal = `Tổng ${dStr} ngày: ${formatResult(newTotalVol)} ${item.unit || ''}`;
                        }
                        return displayTotal ? (
                           <div className="text-emerald-600 font-bold text-[13px] pt-0.5 bg-emerald-50/50 mt-1 p-1 rounded-md">
                              {displayTotal}
                           </div>
                        ) : null;
                     })()}
                  </div>
                ) : (
                  <div key={item.id} className="bg-white p-2.5 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] text-right flex flex-col gap-0.5 border border-slate-100 animate-in slide-in-from-bottom-2 fade-in duration-200">
                     <div className="text-slate-400 text-[12px] font-mono border-b border-slate-50 pb-1">{Array.isArray(item.expression) ? item.expression.join(' ') : item.expression}</div>
                     <div className="flex flex-col items-end">
                       <span className="text-slate-800 font-bold text-lg font-mono pt-1 leading-tight">{item.result}</span>
                       {getFractionText(item.result) && (
                          <span className="text-slate-500 font-bold text-sm -mt-0.5 pointer-events-none">{getFractionText(item.result)}</span>
                       )}
                     </div>
                  </div>
                )
             ))}
           </div>
        </div>

        {/* Dynamic Control Area Bottom */}
        <div className="bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20 flex-shrink-0 relative">
            {/* Calculator Display */}
            <div className="px-3 sm:px-4 pb-2 pt-3 flex flex-col items-end">
               <div className={`w-full ${isPremium ? 'bg-amber-50/70 border-amber-200/80 border-t-amber-300 shadow-[inset_0_4px_10px_rgba(245,158,11,0.08),0_1px_1px_rgba(255,255,255,1)]' : 'bg-slate-50 border-slate-200/80 border-t-slate-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.06),0_1px_1px_rgba(255,255,255,1)]'} border-t-2 border-b border-x rounded-[1.5rem] py-2 px-3 sm:px-4`}>
                   <div 
                     ref={displayRef}
                     className={`text-[3rem] leading-[1.1] font-black ${t.display} text-right tracking-tighter w-full overflow-x-auto hide-scrollbar whitespace-nowrap pt-1`}
                   >
                      {renderColoredExpression(expr)}
                   </div>
                   {isResult && getFractionText(expr) && (
                      <div className="text-slate-500 font-bold text-[15px] pb-1 text-right mt-0.5">
                         {getFractionText(expr)}
                      </div>
                   )}
               </div>
            </div>

            {/* Controls Wrap */}
            <div className={`transition-all duration-300 flex flex-col w-full`}>
              {/* Presets Bar */}
              <div className={`border-y border-slate-100 bg-slate-50 flex overflow-x-auto hide-scrollbar gap-2 px-4 py-2.5`} style={{ WebkitOverflowScrolling: 'touch' }}>
                 <button 
                    className={`flex-shrink-0 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl active:scale-95 transition-transform flex items-center justify-center shadow-sm p-2`}
                    onClick={() => setSettingsOpen(true)}
                 >
                    <Settings2 className={'w-5 h-5'} />
                 </button>
                 <div className="w-[1px] h-6 bg-slate-200 flex-shrink-0 mx-1 self-center"></div>
                 {presets.map(p => {
                    const isTamiflu = p.id === 'tamiflu';
                    let btnBg = 'bg-white border-slate-200 text-slate-700';
                    let iconColor = 'text-slate-300 active:text-blue-500 border-slate-200';
                    
                    if (isTamiflu) {
                       btnBg = 'bg-amber-100 border-amber-200 text-amber-800';
                       iconColor = 'text-amber-400 active:text-amber-600 border-amber-200';
                    } else if (p.color) {
                       switch(p.color) {
                          case 'red': btnBg = 'bg-red-50 border-red-200 text-red-700'; iconColor = 'text-red-300 active:text-red-500 border-red-200'; break;
                          case 'amber': btnBg = 'bg-amber-50 border-amber-200 text-amber-700'; iconColor = 'text-amber-300 active:text-amber-500 border-amber-200'; break;
                          case 'emerald': btnBg = 'bg-emerald-50 border-emerald-200 text-emerald-700'; iconColor = 'text-emerald-300 active:text-emerald-500 border-emerald-200'; break;
                          case 'sky': btnBg = 'bg-sky-50 border-sky-200 text-sky-700'; iconColor = 'text-sky-300 active:text-sky-500 border-sky-200'; break;
                          case 'purple': btnBg = 'bg-purple-50 border-purple-200 text-purple-700'; iconColor = 'text-purple-300 active:text-purple-500 border-purple-200'; break;
                          case 'pink': btnBg = 'bg-pink-50 border-pink-200 text-pink-700'; iconColor = 'text-pink-300 active:text-pink-500 border-pink-200'; break;
                       }
                    }
                    
                    return (
                    <button 
                       key={p.id} 
                       className={`flex-shrink-0 border font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 ${btnBg} px-3 py-2 rounded-xl text-[13px]`}
                    >
                       <span onClick={() => handlePresetClick(p)} className="block pr-1 py-0.5 leading-none">{p.name}</span>
                       {!isTamiflu && (
                         <div 
                           onClick={(e) => { e.stopPropagation(); setEditingPreset(p); setModalOpen(true); }}
                           className={`border-l py-0.5 ${iconColor} pl-1.5 opacity-60 hover:opacity-100`}
                         >
                           <Settings2 className={'w-3 h-3'} />
                         </div>
                       )}
                    </button>
                 )})}
                 <button 
                    className={`flex-shrink-0 bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center shadow-sm p-2.5 relative`}
                    onClick={() => { 
                       if (isPremium) {
                         setEditingPreset(null); setModalOpen(true); 
                       } else {
                         setPremiumModalOpen(true);
                       }
                    }}
                 >
                    <Pill className={'w-5 h-5'} />
                    {!isPremium && <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" strokeWidth={3} fill="currentColor" />}
                 </button>
              </div>
  
              {/* Keypad */}
              <div className={`${t.keypad} transition-all duration-500 relative px-3 pt-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-4`}>
                <div className={`grid grid-cols-4 transition-all duration-300 gap-[7px] sm:gap-2.5`}>
                  <Btn onClick={() => clearAll(false)} className={`bg-red-50 text-red-600 font-black hover:bg-red-100 text-2xl col-span-2`}>AC</Btn>
                  <Btn onClick={handleBackspace} className={`${t.btnAction} font-bold`}><Delete className={"w-7 h-7"} /></Btn>
                  {renderOpBtn(opOrder[0])}
                  
                  <Btn onClick={() => inputDigit('7')} className={`${t.btnNum} `}>7</Btn>
                  <Btn onClick={() => inputDigit('8')} className={`${t.btnNum} `}>8</Btn>
                  <Btn onClick={() => inputDigit('9')} className={`${t.btnNum} `}>9</Btn>
                  {renderOpBtn(opOrder[1])}
                  
                  <Btn onClick={() => inputDigit('4')} className={`${t.btnNum} `}>4</Btn>
                  <Btn onClick={() => inputDigit('5')} className={`${t.btnNum} `}>5</Btn>
                  <Btn onClick={() => inputDigit('6')} className={`${t.btnNum} `}>6</Btn>
                  {renderOpBtn(opOrder[2])}
                  
                  <Btn onClick={() => inputDigit('1')} className={`${t.btnNum} `}>1</Btn>
                  <Btn onClick={() => inputDigit('2')} className={`${t.btnNum} `}>2</Btn>
                  <Btn onClick={() => inputDigit('3')} className={`${t.btnNum} `}>3</Btn>
                  {renderOpBtn(opOrder[3])}
                  
                  <Btn onClick={() => inputDigit('0')} className={`${t.btnNum} `}>0</Btn>
                  <Btn onClick={inputDot} className={`${t.btnNum} pb-3 text-4xl`}>.</Btn>
                  <Btn onClick={handleEqual} className={`${isPremium ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_15px_rgba(245,158,11,0.5)] border-2 border-amber-300' : t.btnEq} font-black rounded-2xl col-span-2 shadow-md text-4xl flex items-center justify-center`}>
                    =
                  </Btn>
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
         opOrder={opOrder}
         setOpOrder={setOpOrder}
         isPremium={isPremium}
         onRequirePremium={() => setPremiumModalOpen(true)}
      />

      {premiumModalOpen && (
        <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-200 flex flex-col items-center zoom-in-95">
            <Crown className="w-12 h-12 text-amber-500 mb-4" />
            <h2 className="text-slate-800 text-2xl font-black mb-2 text-center">Nâng cấp Premium</h2>
            <p className="text-slate-500 text-sm text-center mb-6 font-medium leading-relaxed">
              Bạn cần nhập mã kích hoạt để thêm <strong className="text-slate-800">thuốc mới</strong> không giới hạn!
            </p>
            <div className="relative w-full">
              <input 
                type="tel"
                value={premiumCode}
                onChange={e => {
                   const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                   setPremiumCode(v);
                   setPremiumError(false);
                }}
                className="absolute inset-0 w-full h-full opacity-0 text-transparent cursor-text z-10"
              />
              <div className={`w-full text-center font-mono text-[22px] border rounded-xl px-4 py-3 transition-colors ${premiumError ? 'border-red-500 bg-red-50 text-red-600' : (premiumCode.length > 0 ? 'border-amber-500 ring-2 ring-amber-500/20 text-slate-800' : 'border-slate-300 bg-slate-50')}`}>
                <div className="flex justify-center items-center tracking-[0.2em] font-black h-7">
                   {premiumCode.length === 0 ? <span className="text-slate-300 tracking-widest font-normal text-xl">XXX-XXX</span> : 
                    (premiumCode.slice(0,3).replace(/./g, '•') + (premiumCode.length > 3 ? '-' + premiumCode.slice(3,6).replace(/./g, '•') : ''))
                   }
                </div>
              </div>
            </div>
            {premiumError && <div className="text-red-500 text-xs font-bold mt-2">Mã kích hoạt không đúng!</div>}
            
            <div className="flex gap-4 w-full mt-6">
              <button 
                onClick={() => { setPremiumModalOpen(false); setPremiumCode(''); setPremiumError(false); }} 
                className="flex-[1] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-lg shadow-sm transition-colors border border-slate-200"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                   const code = premiumCode.trim();
                   if (code.startsWith('2') && code.endsWith('3')) {
                      setIsPremium(true);
                      localStorage.setItem('medCalc_premium', 'true');
                      setPremiumModalOpen(false);
                      setPremiumCode('');
                      setEditingPreset(null);
                      setModalOpen(true);
                   } else {
                      setPremiumError(true);
                   }
                }} 
                className="flex-[1.5] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl text-lg shadow border border-amber-500"
              >
                Kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}

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
      <BottomTicker />
      <div className="w-full max-w-md flex justify-center items-center pb-2 z-10 flex-shrink-0">
        <label className="flex items-center gap-2.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={keepAwake} 
              onChange={(e) => setKeepAwake(e.target.checked)} 
            />
            <div className={`block w-8 h-4 rounded-full transition-colors ${keepAwake ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
            <div className={`absolute left-0.5 top-[2px] bg-white w-3 h-3 rounded-full transition-transform ${keepAwake ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
          <span className="text-[13px] text-slate-400 font-medium tracking-tight">Giữ màn hình luôn sáng</span>
        </label>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Preset } from '../types';

export function PresetModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: Preset) => void;
  onDelete?: (id: string) => void;
  initialData?: Preset | null;
}) {
  const [name, setName] = useState('');
  const [dosePerKg, setDosePerKg] = useState('15');
  const [concentrationMg, setConcentrationMg] = useState('250');
  const [concentrationMl, setConcentrationMl] = useState('5');
  const [timesPerDay, setTimesPerDay] = useState('3');
  const [unit, setUnit] = useState('mL');
  const [isSolid, setIsSolid] = useState(false);
  const [color, setColor] = useState('');
  const [maxDoseMg, setMaxDoseMg] = useState('');
  const [bottleVolume, setBottleVolume] = useState('');

  const PRESET_COLORS = [
    { value: '', label: 'Mặc định (Trắng)', bg: 'bg-white', border: 'border-slate-200' },
    { value: 'red', label: 'Đỏ', bg: 'bg-red-100', border: 'border-red-200' },
    { value: 'amber', label: 'Cam', bg: 'bg-amber-100', border: 'border-amber-200' },
    { value: 'emerald', label: 'Xanh lá', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { value: 'sky', label: 'Xanh biển', bg: 'bg-sky-100', border: 'border-sky-200' },
    { value: 'purple', label: 'Tím', bg: 'bg-purple-100', border: 'border-purple-200' },
    { value: 'pink', label: 'Hồng', bg: 'bg-pink-100', border: 'border-pink-200' },
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDosePerKg(initialData.dosePerKg?.toString() || '15');
      setConcentrationMg(initialData.concentrationMg?.toString() || '250');
      setConcentrationMl(initialData.concentrationMl?.toString() || '5');
      setTimesPerDay(initialData.timesPerDay?.toString() || '3');
      setUnit(initialData.unit || 'mL');
      setIsSolid(initialData.isSolid || false);
      setColor(initialData.color || '');
      setMaxDoseMg(initialData.maxDoseMg?.toString() || '');
      setBottleVolume(initialData.bottleVolume?.toString() || '');
    } else {
      setName('');
      setDosePerKg('15');
      setConcentrationMg('250');
      setConcentrationMl('5');
      setTimesPerDay('3');
      setUnit('mL');
      setIsSolid(false);
      setColor('');
      setMaxDoseMg('');
      setBottleVolume('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên nút gán");
      return;
    }
    const dPkg = parseFloat(dosePerKg);
    const cMg = parseFloat(concentrationMg);
    const cMl = isSolid ? 1 : parseFloat(concentrationMl);
    const tPd = parseFloat(timesPerDay) || 1;
    const maxD = maxDoseMg.trim() === '' ? undefined : parseFloat(maxDoseMg);
    const bVol = bottleVolume.trim() === '' ? undefined : parseFloat(bottleVolume);
    
    if (isNaN(dPkg) || isNaN(cMg) || isNaN(cMl) || cMg === 0) {
      alert("Hệ số tính toán không hợp lệ");
      return;
    }
    if (maxDoseMg.trim() !== '' && (isNaN(maxD as number) || (maxD as number) <= 0)) {
       alert("Liều tối đa không hợp lệ");
       return;
    }
    if (bottleVolume.trim() !== '' && (isNaN(bVol as number) || (bVol as number) <= 0)) {
       alert("Thể tích lọ không hợp lệ");
       return;
    }
    
    onSave({
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      dosePerKg: dPkg,
      concentrationMg: cMg,
      concentrationMl: cMl,
      timesPerDay: tPd,
      bottleVolume: bVol,
      unit: unit.trim() || (isSolid ? 'gói' : 'mL'),
      isSolid,
      color,
      maxDoseMg: maxD
    });
  };

  const previewVal = (10 * (parseFloat(dosePerKg)||0) * (isSolid ? 1 : parseFloat(concentrationMl)||1)) / ((parseFloat(concentrationMg)||1) || 1);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Sửa Nút Gán' : 'Thêm Nút Mới'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
        </div>
        
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên nút (VD: Aug 600)</label>
            <input 
               value={name} 
               onChange={e => setName(e.target.value)} 
               className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium" 
               placeholder="Nhập tên thuốc/nút" 
               autoFocus
            />
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-3">
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Liều (mg/kg/lần)</label>
               <input 
                 type="number" 
                 inputMode="decimal" 
                 value={dosePerKg} 
                 onChange={e => setDosePerKg(e.target.value)} 
                 className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-blue-700 placeholder:text-slate-300" 
                 placeholder="VD: 15 hoặc 45..."
               />
             </div>
             
             <div>
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Số lần dùng/ngày</label>
                 <input 
                   type="number" 
                   inputMode="decimal" 
                   value={timesPerDay} 
                   onChange={e => setTimesPerDay(e.target.value)} 
                   className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-slate-700 placeholder:text-slate-300" 
                   placeholder="VD: 2, 3..."
                 />
             </div>
             
             <div>
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Liều tối đa/lần (mg) <span className="text-slate-400 font-normal normal-case">(Tùy chọn)</span></label>
                 <input 
                   type="number" 
                   inputMode="decimal" 
                   value={maxDoseMg} 
                   onChange={e => setMaxDoseMg(e.target.value)} 
                   className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-slate-700 placeholder:text-slate-300" 
                   placeholder="VD: 500, 1000..."
                 />
             </div>
             
             <div className="pt-2 border-t border-slate-200">
                 <div className="flex justify-between items-center mb-2">
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hàm lượng thuốc</label>
                   <div className="flex bg-slate-200/50 p-1 rounded-lg gap-1">
                     <button
                       onClick={() => { setIsSolid(false); setUnit('mL'); }}
                       className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${!isSolid ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                     >Siro</button>
                     <button
                       onClick={() => { setIsSolid(true); setUnit('gói'); }}
                       className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${isSolid ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                     >Gói/Viên</button>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <input 
                       type="number" 
                       inputMode="decimal" 
                       value={concentrationMg} 
                       onChange={e => setConcentrationMg(e.target.value)} 
                       className={`w-20 border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center font-bold ${isSolid ? 'text-emerald-700' : 'text-blue-700'}`} 
                     />
                     <span className="text-slate-500 font-bold text-sm">mg :</span>
                     {!isSolid && (
                       <input 
                         type="number" 
                         inputMode="decimal" 
                         value={concentrationMl} 
                         onChange={e => setConcentrationMl(e.target.value)} 
                         className="w-16 border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center font-bold text-blue-700" 
                       />
                     )}
                     {isSolid && (
                        <div className="w-16 text-center font-mono font-bold text-slate-400">1</div>
                     )}
                     <input 
                       value={unit}
                       onChange={e => setUnit(e.target.value)}
                       className="w-16 bg-transparent border-b-2 border-slate-300 focus:border-blue-500 outline-none text-center font-bold text-slate-700 text-sm py-1"
                       placeholder={isSolid ? "gói" : "mL"}
                     />
                 </div>
                 <p className="text-xs text-slate-400 mt-2">
                    {isSolid ? "Ví dụ: 250mg : 1 gói" : "Ví dụ: Augmentin 600mg / 5mL"}
                 </p>
             </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Thể tích lọ (mL) <span className="text-slate-400 font-normal normal-case">(Tùy chọn)</span></label>
             <input 
               type="number" 
               inputMode="decimal" 
               value={bottleVolume} 
               onChange={e => setBottleVolume(e.target.value)} 
               className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-slate-700 placeholder:text-slate-300" 
               placeholder="VD: 60, 100..."
             />
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Màu sắc nút</label>
             <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                   <button
                     key={c.value}
                     onClick={() => setColor(c.value)}
                     className={`w-8 h-8 rounded-full border-2 ${c.bg} ${c.border} flex items-center justify-center transition-transform active:scale-95 ${color === c.value ? 'scale-110 ring-2 ring-blue-500 ring-offset-1' : ''}`}
                     title={c.label}
                   />
                ))}
             </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          {initialData && onDelete && (
             <button onClick={() => { if(confirm('Bạn có chắc muốn xóa nút này?')) onDelete(initialData.id); }} className="px-5 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl transition-colors active:scale-95">
               Xóa
             </button>
          )}
          <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95">
            Lưu Thiết Lập
          </button>
        </div>
      </div>
    </div>
  );
}

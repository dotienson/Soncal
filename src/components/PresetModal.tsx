import React, { useState, useEffect } from 'react';
import { Preset } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

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
  const [note, setNote] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg');

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<Preset | null>(null);

  const PRESET_COLORS = [
    { value: '', label: 'Mặc định (Trắng)', bg: 'bg-white', border: 'border-slate-200' },
    { value: 'red', label: 'Đỏ', bg: 'bg-red-100', border: 'border-red-200' },
    { value: 'amber', label: 'Cam', bg: 'bg-amber-100', border: 'border-amber-200' },
    { value: 'emerald', label: 'Xanh lá', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { value: 'sky', label: 'Xanh biển', bg: 'bg-sky-100', border: 'border-sky-200' },
    { value: 'purple', label: 'Tím', bg: 'bg-purple-100', border: 'border-purple-200' },
    { value: 'pink', label: 'Hồng', bg: 'bg-pink-100', border: 'border-pink-200' },
  ];

  const handleNumChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, '.');
    val = val.replace(/[^\d.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    setter(val);
  };

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
      setNote(initialData.note || '');
      setDoseUnit(initialData.doseUnit || 'mg');
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
      setNote('');
      setDoseUnit('mg');
    }
    setShowConfirm(false);
    setPendingSaveData(null);
  }, [initialData, isOpen]);

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
    
    setPendingSaveData({
      id: initialData?.id || Date.now().toString(),
      name: name.trim(),
      dosePerKg: dPkg,
      concentrationMg: cMg,
      concentrationMl: cMl,
      timesPerDay: tPd,
      bottleVolume: bVol,
      unit: unit.trim() || (isSolid ? 'gói' : 'mL'),
      doseUnit: doseUnit,
      isSolid,
      color,
      maxDoseMg: maxD,
      note: note.trim()
    });
    setShowConfirm(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={!showConfirm ? onClose : undefined}
        />
        
        {showConfirm && pendingSaveData ? (
           <motion.div 
             key="confirm"
             initial={{ opacity: 0, scale: 0.9, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 10 }}
             transition={{ type: "spring", stiffness: 350, damping: 25 }}
             className="bg-amber-50 rounded-[1.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative z-20 border border-amber-200"
           >
             <div className="px-5 py-4 bg-amber-100 flex items-center justify-center gap-2 border-b border-amber-200">
               <AlertTriangle className="w-5 h-5 text-amber-600" />
               <h2 className="text-[15px] font-bold text-amber-900 tracking-wide uppercase">Xác nhận kĩ liều lượng</h2>
             </div>
             <div className="p-5 space-y-3">
                <p className="text-amber-800 text-sm font-medium leading-relaxed bg-amber-200/50 p-3 rounded-xl border border-amber-200">
                   Vui lòng kiểm tra lại thật kĩ thông tin thuốc bên dưới để đảm bảo tính toán an toàn cho bệnh nhân:
                </p>
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-2">
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-sm">Tên thuốc:</span>
                      <span className="font-bold text-slate-800 text-sm text-right">{pendingSaveData.name}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-sm">Liều ({doseUnit}/kg/lần):</span>
                      <span className="font-black text-rose-600 text-sm text-right">{pendingSaveData.dosePerKg} {doseUnit}/kg/lần</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-sm">Hàm lượng:</span>
                      <span className="font-bold text-slate-800 text-sm text-right">
                        {pendingSaveData.concentrationMg}{doseUnit} / {pendingSaveData.isSolid ? '1' : pendingSaveData.concentrationMl} {pendingSaveData.unit}
                      </span>
                   </div>
                   {pendingSaveData.maxDoseMg && (
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500 text-sm">Liều Max:</span>
                        <span className="font-bold text-rose-600 text-sm text-right">{pendingSaveData.maxDoseMg} {doseUnit}</span>
                     </div>
                   )}
                   <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Số lần/ngày:</span>
                      <span className="font-bold text-slate-800 text-sm text-right">{pendingSaveData.timesPerDay} lần</span>
                   </div>
                </div>
             </div>
             <div className="px-5 pb-5 pt-1 flex gap-2">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-3 rounded-xl border border-slate-200 transition-all active:scale-95"
                >
                  Kiểm tra lại
                </button>
                <button 
                  onClick={() => { onSave(pendingSaveData); setShowConfirm(false); onClose(); }} 
                  className="flex-[1.5] bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 text-white text-xs font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  Xác nhận đã kiểm tra kĩ
                </button>
             </div>
           </motion.div>
        ) : (
          <motion.div 
            key="editForm"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white rounded-[1.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative z-10"
          >
            <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">{initialData ? 'Sửa thông tin' : 'Thêm thông tin'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
        </div>
        
        <div className="px-5 py-4 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* Tên nút */}
          <div>
            <label className="block text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-1.5">Tên nút (VD: Augmentin)</label>
            <input 
               value={name} 
               onChange={e => setName(e.target.value)} 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-slate-800 text-sm" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 relative">
               <label className="block text-[9.5px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                 <span>Liều ({doseUnit}/kg/lần)</span>
                 <select 
                   value={doseUnit} 
                   onChange={e => setDoseUnit(e.target.value)}
                   className="bg-blue-100/50 text-blue-700 font-bold px-1 py-0.5 rounded outline-none border border-blue-200/50 cursor-pointer"
                 >
                   <option value="mg">mg</option>
                   <option value="mcg">mcg</option>
                 </select>
               </label>
               <input 
                 type="text" 
                 inputMode="decimal" 
                 value={dosePerKg} 
                 onChange={handleNumChange(setDosePerKg)} 
                 className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono font-bold text-blue-700" 
               />
             </div>
             
             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                 <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lần / ngày</label>
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={timesPerDay} 
                   onChange={handleNumChange(setTimesPerDay)} 
                   className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-slate-400/20 outline-none font-mono font-bold text-slate-700" 
                 />
             </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
               <div className="flex justify-between items-center bg-slate-50 pb-1 border-b border-transparent">
                 <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Hàm lượng thuốc</label>
                 <div className="flex bg-slate-200/60 p-0.5 rounded-md gap-1">
                   <button
                     onClick={() => { setIsSolid(false); setUnit('mL'); }}
                     className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${!isSolid ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >Siro</button>
                   <button
                     onClick={() => { setIsSolid(true); setUnit('gói'); }}
                     className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all ${isSolid ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >Viên/Gói</button>
                 </div>
               </div>
               <div className="flex items-center gap-2 pt-1">
                   <input 
                     type="text" 
                     inputMode="decimal" 
                     value={concentrationMg} 
                     onChange={handleNumChange(setConcentrationMg)} 
                     className={`flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-slate-400/20 outline-none font-mono text-center text-sm font-bold ${isSolid ? 'text-emerald-600' : 'text-blue-600'}`} 
                   />
                   <span className="text-slate-400 font-bold text-xs">:</span>
                   {!isSolid && (
                     <input 
                       type="text" 
                       inputMode="decimal" 
                       value={concentrationMl} 
                       onChange={handleNumChange(setConcentrationMl)} 
                       className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-slate-400/20 outline-none font-mono text-center text-sm font-bold text-blue-600" 
                     />
                   )}
                   {isSolid && (
                      <div className="flex-1 min-w-0 text-center font-mono text-sm font-bold text-slate-400 py-1.5 bg-slate-100 rounded-lg border border-slate-200 opacity-50">1</div>
                   )}
                   <input 
                     value={unit}
                     onChange={e => setUnit(e.target.value)}
                     className="w-10 bg-transparent border-b-2 border-slate-300 focus:border-blue-500 outline-none text-center font-bold text-slate-700 text-[12px] py-1"
                   />
               </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
                 <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max liều ({doseUnit}/lần)</label>
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={maxDoseMg} 
                   onChange={handleNumChange(setMaxDoseMg)}
                   placeholder="Tuỳ chọn" 
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold text-slate-700" 
                 />
             </div>
             <div>
               <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thể tích lọ (mL)</label>
               <input 
                 type="text" 
                 inputMode="decimal" 
                 value={bottleVolume} 
                 onChange={handleNumChange(setBottleVolume)}
                 placeholder="Tuỳ chọn" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold text-slate-700" 
                 />
             </div>
          </div>

          <div>
             <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ghi chú (Tùy chọn)</label>
             <input 
               type="text" 
               value={note} 
               onChange={e => setNote(e.target.value)} 
               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-700" 
             />
          </div>

          <div className="pt-1">
             <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-2">Màu sắc</label>
             <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map(c => (
                   <button
                     key={c.value}
                     onClick={() => setColor(c.value)}
                     className={`w-6 h-6 rounded-full border border-slate-200 ${c.bg} flex items-center justify-center transition-transform active:scale-95 ${color === c.value ? 'scale-110 shadow-sm ring-2 ring-blue-500/40 ring-offset-1' : ''}`}
                     title={c.label}
                   />
                ))}
             </div>
          </div>
        </div>
        
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
          {initialData && onDelete && (
             <button onClick={() => { if(confirm('Bạn có chắc muốn xóa nút này?')) { onDelete(initialData.id); onClose(); } }} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2.5 rounded-xl transition-colors active:scale-95 border border-red-100">
               Xóa
             </button>
          )}
          <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl shadow-md shadow-blue-200/50 transition-all active:scale-95">
            Lưu
          </button>
        </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

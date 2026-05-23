import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PinModal({
  isOpen,
  type,
  onClose,
  onSuccess,
  onForgotPin,
  currentPin
}: {
  isOpen: boolean;
  type: 'setup' | 'verify' | 'change';
  onClose: () => void;
  onSuccess: (pin: string) => void;
  onForgotPin?: () => void;
  currentPin?: string;
}) {
  const [pin, setPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [error, setError] = useState(false);
  const [step, setStep] = useState<'old' | 'new'>('old'); // For change type
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setOldPin('');
      setError(false);
      setShowForgotConfirm(false);
      setStep(type === 'change' ? 'old' : 'new');
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'setup') {
      if (pin.length < 4) {
        setError(true);
        return;
      }
      onSuccess(pin);
    } else if (type === 'verify') {
      if (pin === currentPin) {
        onSuccess(pin);
      } else {
        setError(true);
      }
    } else if (type === 'change') {
      if (step === 'old') {
        if (pin === currentPin) {
          setStep('new');
          setPin('');
          setError(false);
        } else {
          setError(true);
        }
      } else {
        if (pin.length < 4) {
          setError(true);
          return;
        }
        onSuccess(pin);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10"
        >
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-2 text-slate-800 font-bold">
               {type === 'setup' || type === 'change' ? <ShieldAlert className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-blue-500" />}
               {type === 'setup' ? 'Bảo vệ thiết lập' : type === 'change' ? 'Đổi mã bảo vệ' : 'Nhập mã bảo vệ'}
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 w-7 h-7 rounded-full flex items-center justify-center">
               <X className="w-4 h-4" />
             </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
             {type === 'setup' && (
               <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 leading-relaxed">
                 Để đảm bảo an toàn, tránh việc vô tình hoặc cố ý làm thay đổi liều tính tự động của các loại thuốc, bạn nên đặt một <strong>Số bí mật (PIN)</strong>.
               </div>
             )}
             
             <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {type === 'setup' ? 'Nhập mã PIN mới (ít nhất 4 số)' : 
                   type === 'verify' ? 'Nhập mã PIN của bạn' :
                   step === 'old' ? 'Nhập mã PIN hiện tại' : 'Nhập mã PIN mới (ít nhất 4 số)'}
                </label>
                <input 
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setError(false);
                  }}
                  className={`w-full text-center tracking-[0.5em] font-mono text-2xl py-3 border rounded-xl outline-none transition-all ${error ? 'border-red-400 focus:ring-red-500/20 text-red-600' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800'}`}
                  placeholder="••••"
                  maxLength={6}
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1 text-center font-medium">
                    {type === 'setup' || (type === 'change' && step === 'new') ? 'Mã PIN phải có ít nhất 4 số' : 'Mã PIN không chính xác'}
                  </p>
                )}
             </div>
             
             <button 
               type="submit"
               className={`w-full font-bold py-3 rounded-xl text-white shadow-md transition-transform active:scale-95 ${type === 'setup' || (type === 'change' && step === 'new') ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
             >
               {type === 'setup' ? 'Lưu mã bí mật' : 
                type === 'verify' ? 'Xác nhận' :
                step === 'old' ? 'Tiếp tục' : 'Lưu mã mới'}
             </button>

             {(type === 'verify' || (type === 'change' && step === 'old')) && currentPin && (
               <div className="mt-3 pt-2 border-t border-slate-100">
                 {!showForgotConfirm ? (
                   <div className="text-center">
                     <button 
                       type="button"
                       onClick={() => setShowForgotConfirm(true)}
                       className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                     >
                       Quên mã PIN?
                     </button>
                   </div>
                 ) : (
                   <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                     <p className="text-xs text-red-600 font-bold mb-3 text-center leading-relaxed">
                       CẢNH BÁO: Quên mã PIN?
                       <br/><br/>
                       Tất cả các nút thiết lập (ngoại trừ Oseltamivir) và mã PIN sẽ bị xoá hoàn toàn. Bạn có chắc chắn?
                     </p>
                     <div className="flex gap-2">
                       <button 
                         type="button" 
                         onClick={() => setShowForgotConfirm(false)} 
                         className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                       >
                         Hủy
                       </button>
                       <button 
                         type="button" 
                         onClick={() => {
                           if (onForgotPin) onForgotPin();
                         }} 
                         className="flex-1 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm"
                       >
                         Đồng ý
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

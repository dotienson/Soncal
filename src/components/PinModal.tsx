import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PinModal({
  isOpen,
  type,
  onClose,
  onSuccess,
  currentPin
}: {
  isOpen: boolean;
  type: 'setup' | 'verify';
  onClose: () => void;
  onSuccess: (pin: string) => void;
  currentPin?: string;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'setup') {
      if (pin.length < 4) {
        setError(true);
        return;
      }
      onSuccess(pin);
    } else {
      if (pin === currentPin) {
        onSuccess(pin);
      } else {
        setError(true);
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
               {type === 'setup' ? <ShieldAlert className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-blue-500" />}
               {type === 'setup' ? 'Bảo vệ thiết lập' : 'Nhập mã bảo vệ'}
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
                  {type === 'setup' ? 'Nhập mã PIN mới (ít nhất 4 số)' : 'Nhập mã PIN của bạn'}
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
                    {type === 'setup' ? 'Mã PIN phải có ít nhất 4 số' : 'Mã PIN không chính xác'}
                  </p>
                )}
             </div>
             
             <button 
               type="submit"
               className={`w-full font-bold py-3 rounded-xl text-white shadow-md transition-transform active:scale-95 ${type === 'setup' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
             >
               {type === 'setup' ? 'Lưu mã bí mật' : 'Xác nhận'}
             </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

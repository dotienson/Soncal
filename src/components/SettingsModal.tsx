import React, { useState } from 'react';
import { Palette, Info, Code2, Cpu, X, Download, Coffee, Crown, LayoutGrid, ChevronUp, ChevronDown, Eye, EyeOff, Copy, Check } from 'lucide-react';

type Theme = 'slate' | 'pink' | 'blue';
export type OpOrder = string[];

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  opOrder,
  setOpOrder,
  isPremium,
  onRequirePremium
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  opOrder: OpOrder;
  setOpOrder: (o: OpOrder) => void;
  isPremium: boolean;
  onRequirePremium: () => void;
}) {
  const [showArch, setShowArch] = useState(false);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("120274848");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 p-5 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Cpu className="w-5 h-5 text-slate-500" /> Cài đặt hệ thống
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
               <Palette className="w-4 h-4 text-slate-400" /> Giao diện hệ thống
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
          
          {/* Bố cục phím tính */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <LayoutGrid className="w-4 h-4 text-slate-400" /> Bố cục phím toán tử
               {!isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 ml-1" fill="currentColor" />}
            </h3>
            <div className="relative">
               {!isPremium && (
                 <div 
                   className="absolute inset-[-4px] z-10 rounded-xl cursor-pointer bg-white/40 backdrop-blur-[1px]"
                   onClick={() => {
                      onClose();
                      onRequirePremium();
                   }}
                 />
               )}
               <div className={`flex flex-row gap-2 ${!isPremium ? 'opacity-60' : ''}`}>
                 {opOrder.map((op, idx) => (
                    <div 
                      key={op}
                      draggable={isPremium}
                      onDragStart={(e) => {
                         e.dataTransfer.setData('text/plain', idx.toString());
                      }}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => {
                         e.preventDefault();
                         const dragData = e.dataTransfer.getData('text/plain');
                         if(dragData === '') return;
                         const draggedIdx = parseInt(dragData, 10);
                         if (draggedIdx !== idx && !isNaN(draggedIdx)) {
                            const newOrder = [...opOrder];
                            const el = newOrder.splice(draggedIdx, 1)[0];
                            newOrder.splice(idx, 0, el);
                            setOpOrder(newOrder);
                         }
                      }}
                      className="flex-1 flex items-center justify-center py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing font-mono font-black text-2xl text-slate-700 shadow-sm transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                    >
                      {op === '-' ? '−' : op}
                    </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Tác giả */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <Info className="w-4 h-4 text-slate-400" /> Tác giả
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm shadow-inner group relative">
               <p className="font-bold text-slate-800 text-[15px]">ThS. BS. Đỗ Tiến Sơn</p>
               <p className="text-slate-500 mt-1">Lead Developer & UI/UX Designer</p>
               <a 
                  href="https://www.linkedin.com/in/dotienson" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex mt-2 text-blue-600 hover:text-blue-700 hover:underline active:text-blue-800 transition-colors"
               >
                 linkedin.com/in/dotienson
               </a>
            </div>
          </div>

          {/* iOS Add to Home Screen */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <Download className="w-4 h-4 text-slate-400" /> App cho iOS (Add to Home Screen)
            </h3>
            <div className="bg-blue-50/50 text-slate-700 p-4 rounded-xl text-[13px] leading-relaxed border border-blue-100 shadow-inner">
               <ul className="list-decimal pl-4 space-y-2">
                 <li>Mở địa chỉ <a href="https://soncal.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">soncal.vercel.app</a> trên trình duyệt <strong>Safari</strong>.</li>
                 <li>Chạm vào biểu tượng <strong>Share</strong> (Chia sẻ) ở thanh công cụ dưới cùng.</li>
                 <li>Cuộn xuống và chọn <strong>Add to Home Screen</strong> (Thêm vào màn hình chính).</li>
                 <li>Bấm <strong>Add</strong> (Thêm) ở góc trên bên phải.</li>
               </ul>
            </div>
          </div>

          {/* Thuật toán */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 text-[14px] flex items-center gap-2 uppercase tracking-wide">
                 <Code2 className="w-4 h-4 text-slate-400" /> Kiến trúc hệ thống
              </h3>
              <button 
                onClick={() => setShowArch(!showArch)}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {showArch ? <><EyeOff className="w-3.5 h-3.5" /> Ẩn</> : <><Eye className="w-3.5 h-3.5" /> Hiện</>}
              </button>
            </div>
            {showArch && (
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs leading-relaxed space-y-4 font-mono shadow-inner border border-slate-700 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
               <p>
                 <strong className="text-sky-400 block mb-1 uppercase text-[10px] tracking-wider">Engine Execution</strong> 
                 Chạy trực tiếp qua native hardware-accelerated JavaScript engines (V8/Nitro). Native compilation ở lớp thực thi (execution layer) mang lại độ trễ gần như bằng 0 (near-zero latency), không bị overhead của network round-trip.
               </p>
               <p>
                 <strong className="text-sky-400 block mb-1 uppercase text-[10px] tracking-wider">Mathematical Reliability</strong>
                 Strict algebraic precedence parsing (PEMDAS). Trình tạo AST (AST generation) xử lý tính toán với độ chính xác tuyệt đối (absolute determinism), hoàn toàn tin cậy cho tính toán lâm sàng.
               </p>
               <p>
                 <strong className="text-sky-400 block mb-1 uppercase text-[10px] tracking-wider">Floating-point Mitigation</strong>
                 Sử dụng 64-bit precision (IEEE 754). Tích hợp sẵn hàm differential noise reduction <code>(toPrecision(12))</code> giúp loại bỏ lỗi nhị phân (binary artifacting - ví dụ: 0.1 + 0.2), đảm bảo scale thập phân hoàn hảo đối với liều chia nhỏ.
               </p>
            </div>
            )}
          </div>

          {/* Donate */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-[14px] flex items-center gap-2 uppercase tracking-wide">
               <Coffee className="w-4 h-4 text-slate-400" /> Buy Me A Coffee
            </h3>
            <div className="bg-amber-50 text-slate-800 p-4 rounded-xl text-sm leading-relaxed border border-amber-100 shadow-inner flex flex-col items-center">
               <p className="mb-3 text-center text-slate-600 font-medium">Nếu bạn thấy công cụ hữu ích, có thể ủng hộ tác giả qua kênh bên dưới:</p>
               <div className="bg-white p-3 rounded-lg border border-amber-200 block w-full text-center shadow-sm relative">
                  <div className="flex items-center justify-center gap-2">
                     <p className="font-bold text-xl text-slate-800 tracking-wider">120274848</p>
                     <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy số tài khoản"
                     >
                        {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                     </button>
                  </div>
                  <p className="text-slate-500 font-medium text-xs mt-1">VPBank <span className="mx-1">•</span> Do Tien Son</p>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

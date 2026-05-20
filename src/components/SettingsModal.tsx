import React from 'react';

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 p-5 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md">
          <h2 className="text-xl font-black text-slate-800">Cài đặt & Thông tin</h2>
          <button 
             onClick={onClose} 
             className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
             ✕
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Giao diện */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-[15px] flex items-center gap-2">
               <span className="text-xl">🎨</span> Giao diện
            </h3>
            <div className="grid grid-cols-3 gap-2">
               <button 
                 onClick={() => setTheme('slate')} 
                 className={`py-3 px-2 rounded-xl font-bold text-[13px] border-2 transition-all ${theme === 'slate' ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
               >
                 Tối giản
               </button>
               <button 
                 onClick={() => setTheme('pink')} 
                 className={`py-3 px-2 rounded-xl font-bold text-[13px] border-2 transition-all ${theme === 'pink' ? 'border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-200' : 'border-pink-100 text-pink-700 bg-pink-50 hover:bg-pink-100'}`}
               >
                 Hồng Pastel
               </button>
               <button 
                 onClick={() => setTheme('blue')} 
                 className={`py-3 px-2 rounded-xl font-bold text-[13px] border-2 transition-all ${theme === 'blue' ? 'border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-200' : 'border-sky-100 text-sky-700 bg-sky-50 hover:bg-sky-100'}`}
               >
                 Xanh Pastel
               </button>
            </div>
          </div>
          
          {/* Tác giả */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-[15px] flex items-center gap-2">
               <span className="text-xl">👨‍⚕️</span> Về tác giả
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <p className="font-black text-slate-800 text-lg">ThS. BS. Đỗ Tiến Sơn</p>
               <p className="text-sm text-slate-500 mt-1 font-medium">Phát triển phần mềm & Thiết kế giao diện</p>
            </div>
          </div>

          {/* Thuật toán */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-[15px] flex items-center gap-2">
               <span className="text-xl">⚙️</span> Về độ chính xác và thuật toán
            </h3>
            <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-[13px] leading-relaxed space-y-3 border border-amber-200/60 shadow-inner">
               <p>
                 <strong className="text-amber-800 block mb-1">Engine xử lý:</strong> 
                 Máy tính này hoạt động ngay trên trình duyệt điện thoại/máy tính của bạn bằng Engine JavaScript gốc (như V8 đối với Chrome/Android hay Nitro đối với Safari/iOS). Các engine này được tối ưu hoá trực tiếp ở cấp độ phần cứng nên tốc độ phản hồi là tức thời (độ trễ gần như bằng 0). Thực chất, nó sử dụng chính vi xử lý của thiết bị bạn đang dùng.
               </p>
               <p>
                 <strong className="text-amber-800 block mb-1">Thuật toán và Độ tin cậy:</strong>
                 Máy tính này hoàn toàn có thể tin cậy được trong thao tác y khoa. Thứ tự ưu tiên đại số (nhân chia trước, cộng trừ sau) được bảo đảm xử lý chính xác 100%.
               </p>
               <p>
                 Máy tính sử dụng số chấm động 64-bit (chuẩn IEEE 754). Do máy tính thiết bị đôi khi gặp giới hạn về hiển thị nhị phân (Ví dụ kinh điển: 0.1 + 0.2 máy sẽ nhầm tưởng là 0.30000000000000004), tôi đã chèn vào lõi tính toán của ứng dụng này một thuật toán khử nhiễu sai phân với mức độ chính xác là 12 chữ số thập phân <code>(toPrecision(12))</code>. Kết quả thu được sẽ luôn luôn ở mức làm tròn tự nhiên nhất, tránh mọi lỗi sai số dôi dư không mong muốn khi nhân chia liều thuốc lẻ.
               </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

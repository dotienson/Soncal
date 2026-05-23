import React, { useState, useEffect, useMemo } from "react";
import { Lock, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function PinModal({
  isOpen,
  type,
  onClose,
  onSuccess,
  onForgotPin,
  currentPin,
}: {
  isOpen: boolean;
  type: "setup" | "verify" | "change";
  onClose: () => void;
  onSuccess: (pin: string) => void;
  onForgotPin?: () => void;
  currentPin?: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [step, setStep] = useState<"old" | "new" | "force_reset">("old");
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  // Generate random choices for verification
  const [choices, setChoices] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
      setShowForgotConfirm(false);

      let initialStep: typeof step = "new";
      if (type === "change") initialStep = "old";

      // Legacy PIN transition logic
      if (currentPin && currentPin.length > 1) {
        if (type === "verify" || type === "change") {
          initialStep = "force_reset";
        }
      }

      setStep(initialStep);

      if (
        (type === "verify" && initialStep !== "force_reset") ||
        (type === "change" && initialStep === "old")
      ) {
        generateChoices(currentPin || "0");
      }
    }
  }, [isOpen, type, currentPin]);

  const generateChoices = (correct: string) => {
    const allDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const others = allDigits.filter((d) => d !== correct);
    // Pick 2 random wrong choices
    const wrong1 = others.splice(
      Math.floor(Math.random() * others.length),
      1,
    )[0];
    const wrong2 = others.splice(
      Math.floor(Math.random() * others.length),
      1,
    )[0];
    const arr = [correct, wrong1, wrong2];
    // Shuffle array
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setChoices(arr);
  };

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      type === "setup" ||
      step === "force_reset" ||
      (type === "change" && step === "new")
    ) {
      if (pin.length !== 1) {
        setError(true);
        return;
      }
      onSuccess(pin);
    } else if (type === "verify") {
      if (pin === currentPin) {
        onSuccess(pin);
      } else {
        setError(true);
      }
    } else if (type === "change" && step === "old") {
      if (pin === currentPin) {
        setStep("new");
        setPin("");
        setError(false);
      } else {
        setError(true);
      }
    }
  };

  const handleChoiceClick = (choice: string) => {
    if (choice === currentPin) {
      if (type === "verify") {
        onSuccess(choice);
      } else if (type === "change" && step === "old") {
        setStep("new");
        setPin("");
        setError(false);
      }
    } else {
      setError(true);
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
          onClick={() => {
            onClose();
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-[280px] overflow-hidden shadow-2xl relative z-10"
        >
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              {type === "setup" ||
              type === "change" ||
              step === "force_reset" ? (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              ) : (
                <Lock className="w-4 h-4 text-blue-500" />
              )}
              {type === "setup" || step === "force_reset"
                ? "Bảo vệ thiết lập"
                : type === "change" && step === "old"
                  ? "Đổi mã bảo vệ"
                  : type === "change" && step === "new"
                    ? "Mã bảo vệ mới"
                    : "Nhập mã bảo vệ"}
            </div>
            <button
              onClick={() => {
                onClose();
              }}
              className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 w-6 h-6 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {step === "force_reset" && (
              <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 leading-relaxed">
                Hệ thống nay đã cập nhật dùng <strong>Mã PIN 1 số</strong> cho
                nhanh gọn. Mã 4 số của bạn đã bị xoá, vui lòng tạo lại mã 1 số.
              </div>
            )}

            {type === "setup" && (
              <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 leading-relaxed">
                Để đảm bảo an toàn, tránh việc vô tình hoặc cố ý làm thay đổi
                liều tính tự động của các loại thuốc, bạn nên đặt một{" "}
                <strong>Mã PIN (1 số)</strong>.
              </div>
            )}

            {(type === "verify" && step !== "force_reset") ||
            (type === "change" && step === "old") ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 text-center">
                  Chọn mã PIN của bạn
                </label>
                <div className="flex justify-center gap-4 py-2">
                  {choices.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChoiceClick(c)}
                      className="w-16 h-16 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-700 font-bold text-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all active:scale-90"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-2 text-center font-medium">
                    Mã PIN không chính xác
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nhập mã PIN mới (1 số từ 0-9)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 1));
                    setError(false);
                  }}
                  className={`w-full text-center font-mono text-2xl py-2.5 border rounded-xl outline-none transition-all ${error ? "border-red-400 focus:ring-red-500/20 text-red-600" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800"}`}
                  placeholder="•"
                  maxLength={1}
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1 text-center font-medium">
                    Mã PIN phải là 1 số
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-3 font-bold py-2.5 rounded-xl text-white shadow-md transition-transform active:scale-95 bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                >
                  Lưu mã mới
                </button>
              </div>
            )}

            {(type === "verify" || (type === "change" && step === "old")) &&
              currentPin && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  {!showForgotConfirm ? (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotConfirm(true);
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Quên mã PIN?
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                      <p className="text-xs text-red-600 font-bold mb-3 text-center leading-relaxed">
                        CẢNH BÁO: Quên mã PIN?
                        <br />
                        <br />
                        Tất cả các nút thiết lập (ngoại trừ Oseltamivir) và mã
                        PIN sẽ bị xoá hoàn toàn. Bạn có chắc chắn?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotConfirm(false);
                          }}
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

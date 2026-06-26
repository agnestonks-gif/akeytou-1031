import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { api } from "../lib/api";

interface PaymentModalProps {
  showId: number;
  quantity: number;
  totalAmount: number;
  onClose: () => void;
}

type Step = "email" | "qr" | "success";

export function PaymentModal({ showId, quantity, totalAmount, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmitEmail = async () => {
    if (!validateEmail(email)) {
      setEmailError("Введите корректный email");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      const res = await api.orders.$post({ json: { showId, email, quantity } });
      const data = await res.json();
      if ("order" in data && "payment" in data) {
        setOrderId(data.order.id);
        setQrUrl(data.payment.sbpQrUrl);
        setStep("qr");
        startPolling(data.order.id);
      }
    } catch {
      setEmailError("Ошибка сервера. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id: number) => {
    pollRef.current = setInterval(async () => {
      setPollCount((c) => c + 1);
      try {
        const res = await api.orders[":id"].status.$get({ param: { id: String(id) } });
        const data = await res.json();
        if ("status" in data && data.status === "paid") {
          clearInterval(pollRef.current!);
          setStep("success");
        }
      } catch {
        // ignore
      }
    }, 3000);
  };

  const handleDemoConfirm = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      // Use fetch directly since this is a POST with dynamic param
      const res = await fetch(`/api/orders/${orderId}/confirm-demo`, { method: "POST" });
      const data = await res.json();
      if (data.status === "paid") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep("success");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = `Оплата по СБП: ${totalAmount} ₽ — ТУПРОВ АКЕЙ, ${quantity} билет(а)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Оплата билетов">
      <div className="bg-white text-black max-w-md w-full sticker relative" style={{ transform: "rotate(-1deg)" }}>
        {/* Header */}
        <div className="bg-black text-white p-4 flex items-center justify-between">
          <span className="font-mono-custom text-sm uppercase tracking-widest">Оплата СБП</span>
          <button onClick={onClose} aria-label="Закрыть" className="hover:text-yellow-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Sum display */}
          <div className="text-center mb-6">
            <div className="font-anton text-5xl" style={{ color: "var(--pink)", fontFamily: "Anton, sans-serif" }}>
              {totalAmount.toLocaleString("ru-RU")} ₽
            </div>
            <p className="font-mono-custom text-xs text-gray-500 mt-1">
              {quantity} {quantity === 1 ? "билет" : quantity < 5 ? "билета" : "билетов"} · ТУПРОВ АКЕЙ
            </p>
          </div>

          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="pay-email" className="font-mono-custom text-xs uppercase tracking-wider text-gray-600 block mb-2">
                  Ваш email для билета
                </label>
                <input
                  id="pay-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitEmail()}
                  placeholder="you@example.com"
                  className="w-full border-2 border-black p-3 font-mono-custom text-sm focus:outline-none focus-visible:ring-0"
                  style={{ outline: email ? "none" : undefined }}
                  autoFocus
                />
                {emailError && <p className="text-red-500 text-xs mt-1 font-mono-custom">{emailError}</p>}
              </div>
              <button
                onClick={handleSubmitEmail}
                disabled={loading}
                className="w-full font-anton uppercase text-lg py-4 flex items-center justify-center gap-2"
                style={{
                  background: "var(--pink)",
                  color: "white",
                  border: "2px solid black",
                  boxShadow: "4px 4px 0 black",
                  fontFamily: "Anton, sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Перейти к оплате →"}
              </button>
            </div>
          )}

          {step === "qr" && (
            <div className="space-y-5">
              <div className="border-2 border-black p-4 bg-gray-50 text-center">
                <p className="font-mono-custom text-xs text-gray-500 mb-3 uppercase tracking-wide">
                  Отсканируйте QR камерой телефона
                </p>
                <div className="flex justify-center">
                  <img
                    src={qrUrl}
                    alt="QR-код для оплаты по СБП"
                    width={180}
                    height={180}
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="flex items-center justify-center gap-1 mt-3">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                  <span className="font-mono-custom text-xs text-gray-400">
                    Ожидаем оплату{pollCount > 0 ? ` (${pollCount})` : ""}...
                  </span>
                </div>
              </div>

              <button onClick={handleCopy} className="w-full py-3 flex items-center justify-center gap-2 font-mono-custom text-sm border-2 border-black hover:bg-gray-100 transition-colors">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Скопировано!" : "Скопировать реквизиты"}
              </button>

              {/* DEMO button */}
              <div className="border-t-2 border-dashed border-gray-200 pt-4">
                <p className="font-mono-custom text-xs text-gray-400 text-center mb-2">⚡ DEMO MODE</p>
                <button
                  onClick={handleDemoConfirm}
                  disabled={loading}
                  className="w-full py-3 font-mono-custom text-sm border-2 border-dashed border-gray-400 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  {loading ? "..." : "Симулировать успешную оплату"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 size={64} style={{ color: "var(--pink)" }} />
              </div>
              <h3 className="font-anton text-3xl" style={{ fontFamily: "Anton, sans-serif" }}>
                ОПЛАЧЕНО!
              </h3>
              <p className="font-mono-custom text-sm text-gray-600">
                Билет отправлен на <strong>{email}</strong>
              </p>
              <p className="font-mono-custom text-xs text-gray-400">
                {quantity} {quantity === 1 ? "билет" : "билета"} · 28 июня 2026 · 20:00
              </p>
              <div className="bg-yellow-50 border-2 border-black p-3 text-sm font-mono-custom text-gray-700" style={{ transform: "rotate(1deg)" }}>
                Ждём вас в бар-театре «Подвал».<br />
                Приходите рассмешиться!
              </div>
              <button
                onClick={onClose}
                className="w-full font-anton uppercase py-4 text-lg"
                style={{
                  background: "var(--black)",
                  color: "white",
                  fontFamily: "Anton, sans-serif",
                  border: "2px solid black",
                  boxShadow: "4px 4px 0 var(--pink)",
                  cursor: "pointer",
                }}
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Star, Youtube, Send } from "lucide-react";
import { api } from "../lib/api";
import { useCountdown } from "../hooks/useCountdown";
import { Marquee } from "../components/Marquee";
import { SlotMachine } from "../components/SlotMachine";
import { PaymentModal } from "../components/PaymentModal";
import { Nav } from "../components/Nav";

// ---------------------------------------------------------------------------
// Zigzag SVG divider
// ---------------------------------------------------------------------------
function ZigzagDivider({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div style={{ background: toColor, lineHeight: 0, overflow: "hidden" }}>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "40px" }}>
        <polyline
          points={Array.from({ length: 61 }, (_, i) => `${(i / 60) * 1200},${i % 2 === 0 ? 0 : 40}`).join(" ")}
          fill={fromColor}
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bubble background
// ---------------------------------------------------------------------------
function Bubbles({ color1, color2 }: { color1: string; color2: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div className="bubble bubble-float" style={{ width: 280, height: 280, background: color1, top: "10%", left: "-5%" }} />
      <div className="bubble bubble-float-slow" style={{ width: 200, height: 200, background: color2, bottom: "5%", right: "-3%" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Countdown
// ---------------------------------------------------------------------------
function Countdown({ date, dark = false }: { date: string; dark?: boolean }) {
  const t = useCountdown(date);
  const blocks = [
    { label: "ДНЕЙ", value: t.days },
    { label: "ЧАСОВ", value: t.hours },
    { label: "МИНУТ", value: t.minutes },
    { label: "СЕКУНД", value: t.seconds },
  ];
  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Обратный отсчёт до шоу">
      {blocks.map((b) => (
        <div
          key={b.label}
          className="p-2 sm:p-3 text-center min-w-[56px]"
          style={{
            fontFamily: "Oswald, sans-serif",
            background: dark ? "var(--black)" : "var(--black)",
            border: `2px solid ${dark ? "var(--yellow)" : "var(--black)"}`,
            boxShadow: `3px 3px 0 ${dark ? "var(--yellow)" : "var(--black)"}`,
          }}
        >
          <div
            className="font-anton text-2xl sm:text-3xl leading-none"
            style={{ color: "var(--yellow)", fontFamily: "Oswald, sans-serif" }}
          >
            {String(b.value).padStart(2, "0")}
          </div>
          <div className="font-mono-custom text-xs mt-1" style={{ color: "rgba(255,230,0,0.6)" }}>
            {b.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAQ accordion
// ---------------------------------------------------------------------------
const FAQ_ITEMS = [
  { q: "Меня вытащат на сцену?", a: "Нет. Участие — только по желанию. Иногда мы берём слово или фразу из зала, но выходить и играть никого не заставляем. Можно весь вечер просто смеяться из кресла." },
  { q: "Я ничего не понимаю в импровизации", a: "И прекрасно. Это не стендап и не театр, где надо что-то знать заранее. Просто живая сцена, которая рождается при вас. Новичкам обычно даже веселее." },
  { q: "Можно прийти одному?", a: "Конечно. К концу вечера весь зал смеётся как одна компания. Многие приходят одни и уходят с новыми знакомыми." },
  { q: "А если не смешно — вернёте деньги?", a: "Возврат билета возможен до 24 часов до начала шоу. Но за щёки, сведённые от смеха, ответственности не несём." },
  { q: "Есть возрастное ограничение?", a: "16+. Без пошлости, но темы взрослые — про семью, родителей и жизнь." },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{ border: "2px solid rgba(255,255,255,0.2)" }}
        >
          <button
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span
              className="font-mono-custom text-sm sm:text-base font-bold pr-4"
              style={{ color: open === i ? "var(--pink)" : "white" }}
            >
              {item.q}
            </span>
            <span
              className="font-mono-custom text-xl flex-shrink-0 transition-colors"
              style={{ color: open === i ? "var(--pink)" : "white" }}
              aria-hidden="true"
            >
              {open === i ? "×" : "+"}
            </span>
          </button>
          <div className={`faq-content ${open === i ? "open" : ""}`}>
            <p className="font-mono-custom text-sm text-gray-300 px-4 sm:px-5 pb-4 leading-relaxed">
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function IndexPage() {
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [slotUsed, setSlotUsed] = useState(false);
  const showSection = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["current-show"],
    queryFn: async () => {
      const res = await api.shows.current.$get();
      return res.json();
    },
  });

  const show = "show" in (data ?? {}) ? (data as { show: { id: number; date: string; venue: string; city: string; theme: string; description: string; price: number } }).show : null;
  const showDate = show?.date ?? "2026-07-08T20:00:00";
  const showPrice = show?.price ?? 900;
  const totalAmount = showPrice * quantity;

  const scrollToShow = () => {
    showSection.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main style={{ background: "var(--black)" }}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <Nav onBuyClick={scrollToShow} />

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--white)",
          position: "relative",
          paddingTop: "56px",
          backgroundImage: `radial-gradient(circle, rgba(37,64,255,0.12) 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
        aria-label="Главный экран"
      >
        {/* Marquee strip */}
        <Marquee />

        {/* Two-column Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            minHeight: "85vh",
          }}
        >
          {/* Left: text */}
          <div
            style={{
              flex: "0 0 50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignSelf: "center",
              padding: "clamp(48px, 6vw, 80px) clamp(32px, 5vw, 72px) clamp(56px, 6vw, 80px)",
            }}
          >
            {/* Superlabel */}
            <div style={{ marginBottom: "24px" }}>
              <span
                className="font-mono-custom text-xs uppercase tracking-[0.2em] px-3 py-1.5"
                style={{
                  background: "var(--blue)",
                  color: "white",
                  display: "inline-block",
                  border: "2px solid var(--black)",
                  boxShadow: "3px 3px 0 var(--black)",
                }}
              >
                импров-дуэт · вживую
              </span>
            </div>

            {/* Main heading */}
            <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, lineHeight: 1, margin: 0, marginBottom: "28px" }}>
              <span style={{ display: "block", fontSize: "clamp(80px, 12vw, 160px)", color: "var(--pink)", letterSpacing: "-0.02em", lineHeight: 0.86 }}>
                АКЕЙ
              </span>
              <span style={{ display: "block", fontSize: "clamp(52px, 8vw, 110px)", color: "var(--black)", letterSpacing: "0em", lineHeight: 0.92 }}>
                ТУПРОВ
              </span>
            </h1>

            {/* Tagline */}
            <p className="font-mono-custom leading-relaxed" style={{ fontSize: "15px", color: "#333", marginBottom: "28px", maxWidth: "340px" }}>
              Импровизация без шансов соскучиться.<br />
              Каждое шоу — из ваших историй.
            </p>

            {/* CTA */}
            <div style={{ marginBottom: "32px" }}>
              <button
                onClick={scrollToShow}
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontWeight: 700,
                  fontSize: "20px",
                  letterSpacing: "0.06em",
                  background: "var(--pink)",
                  color: "white",
                  border: "3px solid var(--black)",
                  boxShadow: "5px 5px 0 var(--black)",
                  padding: "14px 32px",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s, transform 0.15s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "2px 2px 0 var(--black)"; e.currentTarget.style.transform = "translate(3px,3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "5px 5px 0 var(--black)"; e.currentTarget.style.transform = ""; }}
              >
                ЗАРЕГИСТРИРОВАТЬСЯ →
              </button>
            </div>

            {/* Countdown */}
            <div className="font-mono-custom text-xs uppercase tracking-widest mb-2" style={{ color: "#888" }}>
              до ближайшего шоу
            </div>
            <Countdown date="2026-07-03T20:00:00+03:00" />
          </div>

          {/* Right: illustration */}
          <div
            className="hidden md:flex"
            style={{
              flex: "0 0 50%",
              alignSelf: "flex-end",
              alignItems: "flex-end",
              justifyContent: "center",
              overflow: "visible",
            }}
            aria-hidden="true"
          >
            <img
              src="/duo-comic-v2.png?v=6"
              alt="ТУПРОВ АКЕЙ"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                mixBlendMode: "multiply",
                transform: "scale(1.3)",
                transformOrigin: "bottom right",
              }}
            />
          </div>
        </div>

      </section>

      {/* Зигзаг между Hero и Show */}
      <ZigzagDivider fromColor="var(--white)" toColor="var(--blue)" />

      {/* ── 2. SHOW ───────────────────────────────────────────────────────── */}
      <section
        ref={showSection}
        id="buy"
        style={{ background: "var(--blue)", position: "relative", overflow: "hidden" }}
        aria-label="Ближайшее шоу"
      >
        <Bubbles color1="white" color2="var(--pink)" />

        <div
          className="max-w-3xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: "80px", paddingBottom: "80px", position: "relative", zIndex: 1 }}
        >
          <p className="font-mono-custom text-sm uppercase tracking-[0.25em] text-white mb-2 opacity-70">
            Ближайший спектакль
          </p>
          <h2
            className="font-anton uppercase leading-none mb-8"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(36px, 8vw, 80px)",
              color: "white",
              transform: "rotate(-1deg)",
            }}
          >
            Один вечер.<br />Один раз.
          </h2>

          {/* Ticket card */}
          <div
            style={{
              background: "white",
              border: "3px solid var(--black)",
              boxShadow: "8px 8px 0 var(--black)",
              position: "relative",
            }}
          >
            {/* Perforated edge */}
            <div
              style={{
                height: "12px",
                backgroundImage: "radial-gradient(circle, var(--blue) 5px, transparent 5px)",
                backgroundSize: "20px 12px",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "center",
                borderBottom: "2px dashed var(--black)",
              }}
              aria-hidden="true"
            />

            <div className="p-5 sm:p-8 grid md:grid-cols-2 gap-6">
              {/* Left: info */}
              <div className="space-y-4">
                {/* Theme badge */}
                <div
                  className="inline-block font-mono-custom text-xs font-bold px-3 py-2"
                  style={{
                    background: "var(--yellow)",
                    border: "2px solid var(--black)",
                    boxShadow: "3px 3px 0 var(--black)",
                    transform: "rotate(-2deg)",
                    color: "var(--black)",
                    maxWidth: "100%",
                  }}
                >
                  Тема вечера: Девочка, девушка, женщина
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono-custom text-xs text-gray-400 uppercase w-16 flex-shrink-0 mt-0.5">ДАТА</span>
                    <span className="font-anton text-black text-xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                      8 ИЮЛЯ 2025, 20:00
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono-custom text-xs text-gray-400 uppercase w-16 flex-shrink-0 mt-0.5">МЕСТО</span>
                    <div>
                      <a
                        href="https://yandex.ru/maps/org/medovarus/239540009932/?ll=30.322399%2C59.930016&z=17"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-custom text-black text-sm font-bold block hover:underline"
                      >
                        Art Lab Медоварус, Санкт-Петербург
                      </a>
                      <span className="font-mono-custom text-gray-500 text-xs">Мучной пер., 5</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono-custom text-xs text-gray-400 uppercase w-16 flex-shrink-0 mt-0.5">ВХОД</span>
                    <span className="font-anton text-black text-xl" style={{ fontFamily: "Oswald, sans-serif", color: "var(--pink)" }}>
                      Донейшн
                    </span>
                  </div>
                </div>

                <p className="font-mono-custom text-sm text-gray-600 leading-relaxed">
                  Дуэт А'КЕЙ представляет спектакль о силе, нежности, смелости, чуткости, стремлении и эмоциональности — таком уникальном, но таком универсальном опыте — женщине.
                </p>
              </div>

              {/* Right: CTA */}
              <div className="flex flex-col justify-center gap-6">
                <div
                  className="p-5"
                  style={{
                    background: "var(--yellow)",
                    border: "3px solid var(--black)",
                    boxShadow: "6px 6px 0 var(--black)",
                    transform: "rotate(1deg)",
                  }}
                >
                  <p className="font-mono-custom text-black text-sm leading-relaxed">
                    <strong>Вход по донейшн</strong> — платишь столько, сколько считаешь нужным, после шоу. Регистрация обязательна: места ограничены.
                  </p>
                </div>

                <a
                  href="https://timepad.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-anton uppercase text-xl py-5 w-full text-center block"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    background: "var(--pink)",
                    color: "white",
                    border: "3px solid var(--black)",
                    boxShadow: "6px 6px 0 var(--black)",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s, transform 0.15s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "2px 2px 0 var(--black)";
                    e.currentTarget.style.transform = "translate(4px,4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "6px 6px 0 var(--black)";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  Зарегистрироваться →
                </a>
              </div>
            </div>

            {/* Bottom perforated edge */}
            <div
              style={{
                height: "12px",
                backgroundImage: "radial-gradient(circle, var(--blue) 5px, transparent 5px)",
                backgroundSize: "20px 12px",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "center",
                borderTop: "2px dashed var(--black)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* Second show */}
          <div style={{ marginTop: "48px" }}>
            <p className="font-mono-custom text-sm uppercase tracking-[0.25em] text-white mb-2 opacity-70">
              Также играем
            </p>
            <div
              style={{
                background: "white",
                border: "3px solid var(--black)",
                boxShadow: "8px 8px 0 var(--black)",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "12px",
                  backgroundImage: "radial-gradient(circle, var(--blue) 5px, transparent 5px)",
                  backgroundSize: "20px 12px",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "center",
                  borderBottom: "2px dashed var(--black)",
                }}
                aria-hidden="true"
              />
              <div className="p-5 sm:p-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className="inline-block font-mono-custom text-xs font-bold px-3 py-2"
                    style={{
                      background: "var(--yellow)",
                      border: "2px solid var(--black)",
                      boxShadow: "3px 3px 0 var(--black)",
                      transform: "rotate(-2deg)",
                      color: "var(--black)",
                    }}
                  >
                    Импро (в) поле
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-mono-custom text-xs text-gray-400 uppercase w-16 flex-shrink-0 mt-0.5">ДАТА</span>
                      <span className="font-anton text-black text-xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                        3 ИЮЛЯ 2026, 20:00
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono-custom text-xs text-gray-400 uppercase w-16 flex-shrink-0 mt-0.5">МЕСТО</span>
                      <div>
                        <span className="font-mono-custom text-black text-sm font-bold block">
                          Театралка, Санкт-Петербург
                        </span>
                        <span className="font-mono-custom text-gray-500 text-xs block mb-1">Галерная ул., 52В</span>
                        <a
                          href="https://yandex.ru/maps/org/1240302554?si=uee82a4wna722q0a4gc3wa4224"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono-custom text-sm font-bold underline"
                          style={{ color: "var(--blue)" }}
                        >
                          Смотреть на карте →
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono-custom text-xs text-gray-400 uppercase w-16 flex-shrink-0 mt-0.5">ВХОД</span>
                      <span className="font-anton text-xl" style={{ fontFamily: "Oswald, sans-serif", color: "var(--pink)" }}>
                        Бесплатно
                      </span>
                    </div>
                  </div>
                  <p className="font-mono-custom text-sm text-gray-600 leading-relaxed">
                    Ищи нас на дерзком и камерном фестивале.<br />
                    Играем <strong>импров без предполагаемых обстоятельств</strong>. Вдохновляемся только состоянием зала, мыслями, не произнесёнными вслух. Приходи думать громко!
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-6">
                  <div
                    className="p-5"
                    style={{
                      background: "var(--yellow)",
                      border: "3px solid var(--black)",
                      boxShadow: "6px 6px 0 var(--black)",
                      transform: "rotate(1deg)",
                    }}
                  >
                    <p className="font-mono-custom text-black text-sm leading-relaxed">
                      <strong>Вход абсолютно бесплатный</strong> по предварительной регистрации.
                    </p>
                  </div>
                  <a
                    href="https://timepad.ru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-anton uppercase text-xl py-5 w-full text-center block"
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      background: "var(--pink)",
                      color: "white",
                      border: "3px solid var(--black)",
                      boxShadow: "6px 6px 0 var(--black)",
                      cursor: "pointer",
                      transition: "box-shadow 0.15s, transform 0.15s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "2px 2px 0 var(--black)";
                      e.currentTarget.style.transform = "translate(4px,4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "6px 6px 0 var(--black)";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    Зарегистрироваться →
                  </a>
                </div>
              </div>
              <div
                style={{
                  height: "12px",
                  backgroundImage: "radial-gradient(circle, var(--blue) 5px, transparent 5px)",
                  backgroundSize: "20px 12px",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "center",
                  borderTop: "2px dashed var(--black)",
                }}
                aria-hidden="true"
              />
            </div>
          </div>

        </div>
      </section>

      <ZigzagDivider fromColor="var(--blue)" toColor="var(--black)" />

      {/* ── 3. ABOUT ──────────────────────────────────────────────────────── */}
      <section
        id="about"
        style={{ background: "var(--black)", position: "relative", overflow: "hidden" }}
        aria-label="О коллективе"
      >
        <Bubbles color1="var(--blue)" color2="var(--pink)" />

        <div
          className="max-w-4xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: "80px", paddingBottom: "80px", position: "relative", zIndex: 1 }}
        >
          <h2
            className="font-anton uppercase leading-none mb-8"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(36px, 8vw, 80px)",
              color: "white",
              transform: "rotate(-1.5deg)",
            }}
          >
            Кто мы?
          </h2>

          <div className="max-w-2xl">
            <p className="font-mono-custom text-gray-300 text-base leading-relaxed mb-4">
              Тупров Акей — импров-дуэт, который делает шоу из ничего. Точнее — из вас. Мы берём слово, ситуацию или историю из зала и тут же разыгрываем её так, как не придумаешь заранее.
            </p>
            <p className="font-mono-custom text-gray-300 text-base leading-relaxed mb-6">
              Говорим о детях, родителях, стереотипах и обо всём, что обычно неловко обсуждать вслух — но через смех это становится легко. Без пошлости и без «обязательно участвуй».
            </p>
            <p
              className="font-mono-custom text-base italic leading-relaxed"
              style={{
                borderBottom: "4px solid var(--yellow)",
                display: "inline",
                color: "var(--yellow)",
              }}
            >
              «Не знаешь, что такое импровизация? Отлично.<br />
              Значит, удивишься сильнее всех.»
            </p>
          </div>
        </div>
      </section>

      <ZigzagDivider fromColor="var(--black)" toColor="var(--pink)" />

      {/* ── 4. SLOT MACHINE ───────────────────────────────────────────────── */}
      <section
        style={{ background: "var(--pink)", position: "relative", overflow: "hidden" }}
        aria-label="Генератор абсурда"
      >
        <div
          className="halftone-dark"
          style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.5, pointerEvents: "none" }}
          aria-hidden="true"
        />

        <div
          className="max-w-4xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: "80px", paddingBottom: "80px", position: "relative", zIndex: 1 }}
        >
          <p className="font-mono-custom text-xs uppercase tracking-[0.3em] text-black mb-2 opacity-60">
            Интерактив
          </p>
          <h2
            className="font-anton uppercase leading-none mb-4"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(36px, 8vw, 80px)",
              color: "var(--black)",
              transform: "rotate(-1deg)",
            }}
          >
            Генератор<br />абсурда
          </h2>
          <p className="font-mono-custom text-black text-sm sm:text-base mb-8 max-w-xl leading-relaxed opacity-80">
            Так работает наше шоу: случайная подсказка → сцена. Крути барабаны и собери сцену, которую мы могли бы разыграть вживую.
          </p>

          <SlotMachine onResult={() => setSlotUsed(true)} />

          {slotUsed && (
            <div className="mt-8 text-center">
              <button
                onClick={scrollToShow}
                className="font-anton uppercase text-xl px-8 py-4"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  background: "var(--black)",
                  color: "var(--yellow)",
                  border: "3px solid var(--black)",
                  boxShadow: "6px 6px 0 var(--black)",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "2px 2px 0 var(--black)";
                  e.currentTarget.style.transform = "translate(4px,4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "6px 6px 0 var(--black)";
                  e.currentTarget.style.transform = "";
                }}
              >
                Хочу увидеть вживую → Бери билет
              </button>
            </div>
          )}
        </div>
      </section>

      <ZigzagDivider fromColor="var(--pink)" toColor="var(--black)" />

      {/* ── 6. FAQ ────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{ background: "var(--black)", position: "relative" }}
        aria-label="Часто задаваемые вопросы"
      >
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <h2
            className="font-anton uppercase leading-none mb-8 text-white"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(36px, 8vw, 80px)",
              transform: "rotate(-1deg)",
            }}
          >
            Вопросы
          </h2>
          <FAQAccordion />
        </div>
      </section>

      <ZigzagDivider fromColor="var(--black)" toColor="var(--yellow)" />

      {/* ── 7. FINAL CTA ──────────────────────────────────────────────────── */}
      <section
        style={{ background: "var(--yellow)", position: "relative", overflow: "hidden" }}
        aria-label="Финальный призыв"
      >
        <div
          className="halftone-dark"
          style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: "none" }}
          aria-hidden="true"
        />

        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
          style={{ paddingTop: "80px", paddingBottom: "80px", position: "relative", zIndex: 1 }}
        >
          <h2
            className="font-anton uppercase leading-none mb-6 text-black"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(48px, 12vw, 120px)",
              transform: "rotate(-1.5deg)",
            }}
          >
            Всё ещё<br />думаешь?
          </h2>
          <p className="font-mono-custom text-black text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed opacity-80">
            Сериал подождёт. А это шоу — нет: оно случится один раз и никогда не повторится. Бери билет и приводи того, кого давно хотел рассмешить.
          </p>
          <a
            href="https://timepad.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="font-anton uppercase text-2xl px-12 py-5"
            style={{
              fontFamily: "Oswald, sans-serif",
              background: "var(--black)",
              color: "white",
              border: "3px solid var(--black)",
              boxShadow: "8px 8px 0 var(--pink)",
              cursor: "pointer",
              transition: "box-shadow 0.15s, transform 0.15s",
              display: "inline-block",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "3px 3px 0 var(--pink)";
              e.currentTarget.style.transform = "translate(5px,5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "8px 8px 0 var(--pink)";
              e.currentTarget.style.transform = "";
            }}
          >
            Зарегистрироваться →
          </a>
        </div>
      </section>

      {/* ── 8. FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        style={{ background: "var(--black)", borderTop: "3px solid rgba(255,255,255,0.1)" }}
        aria-label="Футер"
      >
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 py-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Logo */}
            <div>
              <div
                className="font-anton text-2xl uppercase"
                style={{ fontFamily: "Oswald, sans-serif", color: "var(--pink)", letterSpacing: "0.05em" }}
              >
                ТУПРОВ АКЕЙ
              </div>
              <div className="font-mono-custom text-xs text-gray-500 mt-1">TWOPROV A'KEY</div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://t.me/akeytou"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 flex items-center justify-center transition-all"
                style={{
                  background: "var(--black)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  boxShadow: "3px 3px 0 rgba(255,255,255,0.2)",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--pink)";
                  e.currentTarget.style.color = "var(--pink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "white";
                }}
              >
                <Send size={16} />
              </a>
              <a
                href="https://www.youtube.com/@akeytou"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 flex items-center justify-center transition-all"
                style={{
                  background: "var(--black)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  boxShadow: "3px 3px 0 rgba(255,255,255,0.2)",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--pink)";
                  e.currentTarget.style.color = "var(--pink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "white";
                }}
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="font-mono-custom text-xs text-gray-700 mt-1">
              © 2026 ТУПРОВ АКЕЙ. 16+
            </p>
          </div>
        </div>
      </footer>

      {/* Payment modal — disabled */}
    </main>
  );
}

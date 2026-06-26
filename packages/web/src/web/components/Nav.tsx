import { useEffect, useState } from "react";

interface NavProps {
  onBuyClick: () => void;
}

export function Nav({ onBuyClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`sticky-nav ${scrolled ? "sticky-nav-scrolled" : ""}`} aria-label="Навигация">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Links — left */}
        <div className="flex items-center gap-8">
          {[
            { label: "ШОУ", id: "buy" },
            { label: "О НАС", id: "about" },
            { label: "ВОПРОСЫ", id: "faq" },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="font-mono-custom text-xs uppercase tracking-widest hover:opacity-50 transition-opacity"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--black)", fontWeight: 700 }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* logo right */}
        <a
          href="https://t.me/akeytou"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono-custom text-xs uppercase tracking-widest font-bold"
          style={{ color: "var(--pink)", textDecoration: "none" }}
        >
          ТУПРОВ АКЕЙ
        </a>
      </div>
    </nav>
  );
}

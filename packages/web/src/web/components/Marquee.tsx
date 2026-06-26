export function Marquee() {
  const text = "A'KEY ★ TWOPROV ★ ИМПРОВИЗАЦИЯ БЕЗ СЦЕНАРИЯ ★ ";
  const repeated = text.repeat(10);

  return (
    <div className="marquee-wrapper font-mono-custom text-sm font-bold tracking-widest uppercase z-50 relative">
      <div className="marquee-track" aria-hidden="true">
        <span className="px-4">{repeated}</span>
        <span className="px-4">{repeated}</span>
      </div>
    </div>
  );
}

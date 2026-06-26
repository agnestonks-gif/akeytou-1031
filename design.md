# Design System — ТУПРОВ АКЕЙ (TWOPROV A'KEY)

## Concept
Необрутализм + зин/афиша. Дерзкий, молодёжный, как обложка панк-зина или уличная афиша.
Mobile-first. Цель страницы — продать билет.

## Color Palette (60-30-10)
```
--black:  #0A0A0A   → основной фон, текст, обводки (60%)
--pink:   #FF2E93   → главный акцент, CTA, marquee (30%)
--blue:   #2540FF   → контр-акцент, чередующиеся секции (30%)
--yellow: #FFE600   → вспышки: таймер, плашки, hover (10%) — НЕ заливать большие площади
--white:  #FFFFFF   → воздух, текстовые блоки, карточки
```

## Typography
- **Anton** — гигантские заголовки, ВЕРХНИЙ РЕГИСТР, tracking tight, наклон -2…-3deg
- **Space Grotesk** — основной текст, описания
- **Space Mono** — подписи, надзаголовки, ярлыки, юрданные

```html
<!-- Google Fonts CDN -->
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

## Signature Techniques
1. **Жёсткая тень-наклейка**: `box-shadow: 4px 4px 0 #0A0A0A` (мобиль) / `8px 8px 0 #0A0A0A` (десктоп), без blur. Hover → тень уезжает, элемент вдавливается (translate 4px 4px).
2. **Диагональные SVG-разделители** между секциями (зигзаг/молния).
3. **Плавающие пузыри** — крупные круги с float-анимацией на фоне. Отключаются при prefers-reduced-motion.
4. **Бегущая строка** (marquee) — `A'KEY ★ TWOPROV ★ ИМПРОВИЗАЦИЯ БЕЗ СЦЕНАРИЯ ★`. CSS animation.
5. **Лёгкий наклон** элементов -2…3deg (rotate).
6. **Халфтон-точки** — SVG pattern для зин-фактуры.

## Section Backgrounds (ритм)
1. Hero → #0A0A0A (чёрный)
2. Ближайшее шоу → #2540FF (синий)
3. О коллективе → #0A0A0A (чёрный)
4. Генератор абсурда → #FF2E93 (розовый)
5. Отзывы и видео → #FFFFFF (белый)
6. FAQ → #0A0A0A (чёрный)
7. Финальный призыв → #FFE600 (жёлтый)
8. Футер → #0A0A0A (чёрный)

## Components

### Button (primary CTA)
- Background: #FF2E93, text: #FFFFFF или #0A0A0A
- border: 2px solid #0A0A0A
- box-shadow: 6px 6px 0 #0A0A0A
- hover: transform: translate(3px,3px); box-shadow: 3px 3px 0 #0A0A0A
- font: Anton, uppercase, large

### Button (secondary)
- Background: #0A0A0A, text: #FFFFFF
- border: 2px solid #FFFFFF
- box-shadow: 6px 6px 0 #FFFFFF

### Card / Sticker
- border: 2px solid #0A0A0A
- box-shadow: 6px 6px 0 #0A0A0A
- slight rotate (-2deg or 2deg)
- background: white or accent color

### Timer Block
- border: 2px solid #FFE600
- background: transparent
- text: #FFE600 (Anton, giant)

## Spacing
- Section padding: 80px vertical (mobile: 60px)
- Content max-width: 1200px, centered

## Motion
- Marquee: CSS `animation: marquee 20s linear infinite`
- Bubbles: `animation: float 6s ease-in-out infinite`
- Slot machine: JS with ease-out deceleration
- `@media (prefers-reduced-motion: reduce)` → disable all animations

## Accessibility
- Visible focus: `outline: 3px solid #FFE600; outline-offset: 3px`
- Full keyboard support: слоты, аккордеон, селектор
- Color contrast check: жёлтый текст только на чёрном/синем фоне

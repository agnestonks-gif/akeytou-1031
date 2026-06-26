import { useState, useRef, useEffect, useCallback } from "react";
import { Share2 } from "lucide-react";

// Готовые сцены: каждая — [где, кто, что]
const SCENES: Record<1 | 2 | 3, [string, string, string][]> = {
  1: [
    ["в лифте", "соседи", "застряли и молчат"],
    ["на родительском собрании", "учительница и отец", "спорят, кто виноват"],
    ["в очереди в Пятёрочке", "тёща и зять", "делают вид, что незнакомы"],
    ["на даче", "дед и внучка", "ищут, кто съел варенье"],
    ["в МФЦ", "многодетная мать", "объясняет, почему документы неправильные"],
    ["на кухне", "муж и жена", "выясняют, кто не выбросил мусор"],
    ["в парке", "дворник и бабка", "не могут поделить скамейку"],
    ["на свадьбе", "тамада и пьяный дядя", "конкурируют за внимание зала"],
    ["у врача", "пациент и хирург", "оба боятся"],
    ["на школьной линейке", "директор и ученик", "говорят одновременно"],
    ["в автобусе", "бабушка", "объясняет незнакомцу, как правильно жить"],
    ["на рынке", "продавец арбузов", "не может продать последний"],
    ["в примерочной", "мама и дочка", "не могут договориться про размер"],
    ["в поликлинике", "врач и пациент", "забыли, зачем пришли"],
    ["на даче", "сосед и сосед", "спорят из-за забора пять лет"],
    ["в маршрутке", "пассажир", "не может найти деньги"],
    ["на детской площадке", "папа", "боится горки больше ребёнка"],
    ["в магазине", "кассир и покупатель", "карта не проходит"],
    ["на кухне", "бабушка", "готовит и комментирует всё вокруг"],
    ["в школьном коридоре", "учительница и родитель", "случайно встретились на каникулах"],
    ["на вокзале", "дед с чемоданом", "едет не туда"],
    ["в аптеке", "фармацевт и пенсионер", "не могут найти нужное слово"],
    ["на огороде", "тёща", "объясняет, как правильно сажать помидоры"],
    ["в лифте", "сосед-качок", "несёт чихуахуа в сумочке"],
    ["в очереди в банк", "два пенсионера", "спорят, кто занял первым"],
    ["за столом", "родственники", "делят наследство бабушки: сервиз"],
    ["на работе", "начальник и подчинённый", "оба не хотят начинать разговор"],
    ["в такси", "водитель", "рассказывает всю жизнь пассажиру без остановки"],
    ["в гардеробе театра", "гардеробщица", "не может найти пальто"],
    ["на рыбалке", "отец и сын", "три часа молчат и называют это отдыхом"],
  ],
  2: [
    ["в маршрутке №13", "подросток-гот и доярка", "едут на одно мероприятие"],
    ["на детском утреннике", "два деда мороза", "выясняют, кто настоящий"],
    ["в бане", "священник и блогер-миллионник", "случайно встретились"],
    ["на свидании", "психолог, которому самому надо", "говорит только о своих проблемах"],
    ["в чате родителей класса", "папа в декрете", "объявляет войну прививкам"],
    ["на кухне в 3 часа ночи", "токсичная свекровь и няня", "едят и не разговаривают"],
    ["на похоронах хомячка", "мальчик-заика и мясник", "произносят прощальную речь"],
    ["в кабинете директора", "ребёнок-вундеркинд", "проводит педсовет"],
    ["на свидании вслепую", "доярка и блогер-миллионник", "снимают друг друга на сторис"],
    ["в женской консультации", "дед с баяном", "пришёл за компанию и заиграл"],
    ["на корпоративе", "HR и уволенный сотрудник", "встретились у шведского стола"],
    ["в йога-студии", "тренер по единоборствам", "ошибся дверью и остался"],
    ["на кулинарном мастер-классе", "шеф-повар и вегетарианец", "готовят шашлык"],
    ["в очереди на исповедь", "священник без рясы", "стоит вместе со всеми"],
    ["на родительском собрании", "учитель физкультуры", "объясняет теорему Пифагора"],
    ["на концерте классической музыки", "фанат металла", "случайно зашёл и сидит"],
    ["в спортзале", "диетолог", "ест бургер между подходами"],
    ["на юбилее", "именинник", "забыл, сколько ему лет"],
    ["в лифте", "экстрасенс и скептик", "едут на один этаж"],
    ["на собеседовании", "кандидат", "пришёл с мамой"],
    ["в кино", "пара", "смотрит разные фильмы в одном кресле"],
    ["на митинге садоводов", "мичуринец", "требует выдать лунный календарь"],
    ["в спа-салоне", "суровый мужик", "пришёл за маникюром и ему нравится"],
    ["на дне рождения ребёнка", "аниматор", "сам боится клоунов"],
    ["в химчистке", "клиент", "сдаёт что-то необъяснимое"],
    ["на рынке", "рыбак", "продаёт улов и представляет каждую рыбу лично"],
    ["в пробке", "таксист и пассажир", "слушают одну песню пятый раз"],
    ["в библиотеке", "один человек", "ест чипсы в читальном зале"],
    ["на мастер-классе по танцам", "инструктор", "не умеет танцевать"],
    ["в гостинице", "портье", "заселяет гостя в несуществующий номер"],
  ],
  3: [
    ["в очереди в рай", "коуч и экзорцист", "спорят, у кого больше прав"],
    ["на корпоративе для трёх человек", "эксперт в области всего", "произносит тост на 40 минут"],
    ["в подвале у экстрасенса", "кот, который говорит, и человек-невидимка", "не могут найти друг друга"],
    ["в зале ожидания без рейсов", "тот, кто всегда опаздывает", "пришёл первым"],
    ["на фестивале, о котором никто не знает", "человек, который пришёл не на ту встречу", "открывает его"],
    ["на собеседовании в цирк", "бывший, который стал коучем", "рассказывает о сильных сторонах"],
    ["в магазине, где всё по 666 рублей", "экзорцист", "торгуется"],
    ["в чужом сне про работу", "кот, который говорит", "проводит совещание"],
    ["на крыше девятиэтажки", "босс мафии", "прячется от мамы"],
    ["в очереди в рай", "тот, кто всегда опаздывает", "выясняет, можно ли перенести"],
    ["на конференции по квантовой физике", "шаман", "делает доклад"],
    ["на групповой терапии", "все пришли не к своему психологу", "и никто не уходит"],
    ["в музее восковых фигур", "охранник", "разговаривает с Наполеоном третий час"],
    ["на заседании ООН", "переводчик", "переводит с русского на русский"],
    ["в антикварном магазине", "покупатель", "хочет вернуть проклятое зеркало"],
    ["на курсах выживания", "инструктор", "заблудился на второй день"],
    ["на тренинге по доверию", "участники", "не доверяют друг другу в темноте"],
    ["на открытии выставки", "художник", "пришёл посмотреть на чужие работы"],
    ["в ночном эфире", "радиоведущий", "понял, что его никто не слушает"],
    ["на конкурсе двойников", "сам оригинал", "занял второе место"],
    ["в плацкарте", "философ и проводник", "спорят о смысле пути"],
    ["на уроке актёрского мастерства", "все играют одного персонажа", "и это один человек"],
    ["в приёмной у президента", "секретарь", "не помнит, к кому записала"],
    ["на дегустации вин", "сомелье", "всё время говорит о молоке"],
    ["в 3 часа ночи на кухне", "призрак", "не может включить чайник"],
    ["на съёмках реалити-шоу", "участник", "вышел из образа и не может вернуться"],
    ["в монастыре", "турист", "попал на экскурсию и остался на послушание"],
    ["на конкурсе чтецов", "участник", "забыл текст но продолжает"],
    ["в музее современного искусства", "уборщица", "случайно выбросила экспонат"],
    ["на переговорах о мире", "переговорщики", "спорят из-за рассадки"],
  ],
};

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ReelProps {
  items: string[];
  label: string;
  spinning: boolean;
  result: string;
  delay: number;
}

function Reel({ items, label, spinning, result, delay }: ReelProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (!stripRef.current || prefersReduced.current) return;
    if (spinning) {
      const animation = stripRef.current.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-200%)" }],
        { duration: 400 + delay * 300, iterations: Infinity, easing: "linear" }
      );
      return () => animation.cancel();
    }
  }, [spinning, delay]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="font-mono-custom text-xs uppercase tracking-[0.2em] px-3 py-1"
        style={{
          background: "var(--black)",
          color: "var(--yellow)",
          border: "2px solid var(--yellow)",
        }}
      >
        {label}
      </span>
      <div
        className="slot-reel w-full"
        style={{
          height: "72px",
          border: "3px solid var(--black)",
          background: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(255,46,147,0.15) 0%, transparent 30%, transparent 70%, rgba(255,46,147,0.15) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          ref={stripRef}
          className="flex items-center justify-center h-full px-3"
          style={{ position: "relative", zIndex: 1 }}
        >
          <span
            className="text-center font-mono-custom text-sm font-bold text-black"
            style={{
              display: "block",
              transition: spinning ? "none" : "opacity 0.3s",
              opacity: spinning ? 0.4 : 1,
            }}
          >
            {spinning ? items[Math.floor(Math.random() * items.length)] : result}
          </span>
        </div>
      </div>
    </div>
  );
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Бытовой",
  2: "Странноватый",
  3: "Абсурдный",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "var(--blue)",
  2: "#7B5CF5",
  3: "var(--pink)",
};

interface SlotMachineProps {
  onResult?: () => void;
}

export function SlotMachine({ onResult }: SlotMachineProps) {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState({ place: "", hero: "", situation: "" });
  const [showCTA, setShowCTA] = useState(false);
  const [copied, setCopied] = useState(false);
  const [absurdLevel, setAbsurdLevel] = useState(2);

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const spin = useCallback(() => {
    if (spinning) return;
    const pool = SCENES[absurdLevel as 1 | 2 | 3];
    const scene = random(pool);
    const newResults = { place: scene[0], hero: scene[1], situation: scene[2] };

    if (prefersReduced) {
      setResults(newResults);
      setShowCTA(true);
      return;
    }

    setSpinning(true);
    setShowCTA(false);

    setTimeout(() => setResults((r) => ({ ...r, place: newResults.place })), 900);
    setTimeout(() => setResults((r) => ({ ...r, hero: newResults.hero })), 1200);
    setTimeout(() => {
      setResults((r) => ({ ...r, situation: newResults.situation }));
      setSpinning(false);
      setShowCTA(true);
      onResult?.();
    }, 1600);
  }, [spinning, prefersReduced, onResult, absurdLevel]);

  const handleShare = () => {
    const text = `${results.place} · ${results.hero} · ${results.situation} — разыграй вживую с ТУПРОВ АКЕЙ! twoprov-akey.ru`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Для анимации барабанов — показываем варианты только своего уровня
  const allItems = SCENES[absurdLevel as 1 | 2 | 3];
  const reels = [
    { key: "place" as const, label: "ГДЕ", items: allItems.map((s) => s[0]), delay: 0 },
    { key: "hero" as const, label: "КТО", items: allItems.map((s) => s[1]), delay: 1 },
    { key: "situation" as const, label: "ЧТО", items: allItems.map((s) => s[2]), delay: 2 },
  ];

  const levelColor = LEVEL_COLORS[absurdLevel];

  return (
    <div className="space-y-6">

      {/* Absurdity scale — slider */}
      <div
        className="p-4"
        style={{
          border: "3px solid var(--black)",
          background: "white",
          boxShadow: "4px 4px 0 var(--black)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono-custom text-xs uppercase tracking-widest text-black font-bold">
            Шкала абсурдности
          </span>
          <span
            className="font-mono-custom text-xs font-bold px-2 py-1 transition-all"
            style={{
              background: levelColor,
              color: "white",
              border: "2px solid var(--black)",
              transition: "background 0.2s",
            }}
          >
            {LEVEL_LABELS[absurdLevel]}
          </span>
        </div>

        {/* Track */}
        <div className="relative" style={{ paddingBottom: "6px" }}>
          {/* Tick labels */}
          <div className="flex justify-between mb-2">
            {(["Бытовой", "Странноватый", "Абсурдный"] as const).map((label, i) => (
              <span
                key={label}
                className="font-mono-custom text-xs"
                style={{
                  color: absurdLevel === i + 1 ? levelColor : "#999",
                  fontWeight: absurdLevel === i + 1 ? "700" : "400",
                  transition: "color 0.2s",
                  width: "33%",
                  textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Slider input */}
          <div className="relative" style={{ height: "28px", display: "flex", alignItems: "center" }}>
            {/* Filled track */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "100%",
                height: "6px",
                background: "var(--black)",
                border: "2px solid var(--black)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: `${((absurdLevel - 1) / 2) * 100}%`,
                height: "6px",
                background: levelColor,
                transition: "width 0.2s, background 0.2s",
              }}
            />
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={absurdLevel}
              onChange={(e) => setAbsurdLevel(Number(e.target.value))}
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                appearance: "none",
                background: "transparent",
                cursor: "pointer",
                margin: 0,
              }}
            />
          </div>
        </div>

        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 28px;
            height: 28px;
            background: white;
            border: 3px solid var(--black);
            box-shadow: 3px 3px 0 var(--black);
            cursor: pointer;
            transition: background 0.15s, box-shadow 0.15s;
          }
          input[type=range]::-webkit-slider-thumb:hover {
            background: ${levelColor};
          }
          input[type=range]::-moz-range-thumb {
            width: 28px;
            height: 28px;
            background: white;
            border: 3px solid var(--black);
            box-shadow: 3px 3px 0 var(--black);
            cursor: pointer;
            border-radius: 0;
          }
          input[type=range]:focus {
            outline: none;
          }
        `}</style>
      </div>

      {/* Reels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reels.map((reel) => (
          <Reel
            key={reel.key}
            items={reel.items}
            label={reel.label}
            spinning={spinning}
            result={results[reel.key]}
            delay={reel.delay}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={spin}
          disabled={spinning}
          className="font-anton uppercase text-xl px-10 py-4"
          style={{
            fontFamily: "Anton, sans-serif",
            background: "var(--blue)",
            color: "white",
            border: "3px solid var(--black)",
            boxShadow: "6px 6px 0 var(--black)",
            cursor: spinning ? "not-allowed" : "pointer",
            opacity: spinning ? 0.7 : 1,
            transition: "box-shadow 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!spinning) {
              e.currentTarget.style.boxShadow = "2px 2px 0 var(--black)";
              e.currentTarget.style.transform = "translate(4px,4px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "6px 6px 0 var(--black)";
            e.currentTarget.style.transform = "";
          }}
          aria-label="Крутить барабаны"
        >
          {spinning ? "Крутится..." : "Крутить"}
        </button>

        {showCTA && results.place && (
          <button
            onClick={handleShare}
            className="font-mono-custom text-sm px-6 py-4 flex items-center justify-center gap-2"
            style={{
              background: "var(--black)",
              color: "white",
              border: "3px solid var(--black)",
              boxShadow: "6px 6px 0 var(--black)",
              cursor: "pointer",
            }}
          >
            <Share2 size={16} />
            {copied ? "Скопировано!" : "Поделиться"}
          </button>
        )}
      </div>

      {/* Result phrase */}
      {showCTA && results.place && (
        <div
          className="p-5 text-center space-y-3"
          style={{
            background: "var(--yellow)",
            border: "3px solid var(--black)",
            boxShadow: "8px 8px 0 var(--black)",
            transform: "rotate(-1deg)",
          }}
        >
          <p className="font-mono-custom text-black text-sm font-bold uppercase tracking-wide">
            Сцена готова:
          </p>
          <p className="font-anton text-black text-xl md:text-2xl leading-tight" style={{ fontFamily: "Oswald, sans-serif" }}>
            «{results.hero} — {results.place} — {results.situation}»
          </p>
          <p className="font-mono-custom text-black text-sm">
            Хочешь увидеть, как мы разыграем ЭТО вживую?
          </p>
        </div>
      )}
    </div>
  );
}

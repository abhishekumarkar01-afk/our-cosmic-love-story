import { useEffect, useState } from "react";

interface Props {
  name: string;
  active: boolean;
}

/**
 * Personalized opening: types her name letter by letter as if the
 * universe itself is whispering it, before the famous opening lines.
 */
export function NameWhisper({ name, active }: Props) {
  const [chars, setChars] = useState(0);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);

  useEffect(() => {
    if (!active) return;
    setChars(0);
    setShowLine1(false);
    setShowLine2(false);

    const typing = setInterval(() => {
      setChars((c) => {
        if (c >= name.length) {
          clearInterval(typing);
          return c;
        }
        return c + 1;
      });
    }, 320);

    const t1 = setTimeout(() => setShowLine1(true), name.length * 320 + 1200);
    const t2 = setTimeout(() => setShowLine2(true), name.length * 320 + 4200);

    return () => {
      clearInterval(typing);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, name]);

  return (
    <div className="text-center max-w-3xl px-6">
      <div className="mb-12 min-h-[5rem]">
        <span
          className="font-script text-cosmic-gold glow-text"
          style={{ fontSize: "clamp(3rem, 12vw, 6rem)", letterSpacing: "0.04em" }}
        >
          {name.slice(0, chars)}
          <span
            className="inline-block w-[2px] h-[0.8em] align-middle ml-1 bg-cosmic-gold"
            style={{
              animation: "blink 1s steps(2) infinite",
              opacity: chars < name.length ? 1 : 0,
            }}
          />
        </span>
      </div>
      <p
        className="font-serif italic text-xl md:text-3xl text-foreground/90 glow-text-cool leading-relaxed mb-8 transition-all duration-[1500ms]"
        style={{
          opacity: showLine1 ? 1 : 0,
          transform: showLine1 ? "translateY(0)" : "translateY(12px)",
        }}
      >
        In an endless universe of billions of stars...
      </p>
      <p
        className="font-serif italic text-2xl md:text-4xl text-cosmic-gold glow-text leading-relaxed transition-all duration-[1500ms]"
        style={{
          opacity: showLine2 ? 1 : 0,
          transform: showLine2 ? "translateY(0)" : "translateY(12px)",
        }}
      >
        my heart still found only you.
      </p>
      <style>{`@keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }`}</style>
    </div>
  );
}

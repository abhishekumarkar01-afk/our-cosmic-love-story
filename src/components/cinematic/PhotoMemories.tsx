import { useEffect, useRef, useState } from "react";
import p1 from "@/assets/photo-1.jpg";
import p2 from "@/assets/photo-2.jpg";
import p3 from "@/assets/photo-3.jpg";
import p4 from "@/assets/photo-4.jpg";
import p5 from "@/assets/photo-5.jpg";
import p6 from "@/assets/photo-6.jpg";
import p7 from "@/assets/photo-7.jpg";
import p8 from "@/assets/photo-8.jpg";

const photos = [
  { src: p1, caption: "Your smile changed everything." },
  { src: p2, caption: "You became my favorite place." },
  { src: p5, caption: "Some people feel like home." },
  { src: p8, caption: "Every moment became softer." },
  { src: p4, caption: "In your eyes I found my reason." },
  { src: p3, caption: "The world quiets when I see you." },
  { src: p7, caption: "A thousand stars, only one you." },
  { src: p6, caption: "And here, time learned to wait." },
];

const transitions = ["fade-blur", "zoom", "rotate", "slide", "particle", "tilt"] as const;

export function PhotoMemories({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      setIndex((i) => (i + 1) % photos.length);
      timerRef.current = window.setTimeout(tick, 4200);
    };
    timerRef.current = window.setTimeout(tick, 4200);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active]);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] md:aspect-[4/5]">
      {photos.map((p, i) => {
        const isActive = i === index;
        const trans = transitions[i % transitions.length];
        return (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive
                ? "scale(1) translateY(0) rotateY(0deg)"
                : trans === "zoom"
                  ? "scale(1.15)"
                  : trans === "rotate"
                    ? "rotateY(25deg) scale(0.92)"
                    : trans === "slide"
                      ? "translateX(60px) scale(0.95)"
                      : trans === "tilt"
                        ? "rotate(-3deg) scale(0.9)"
                        : "scale(0.95)",
              filter: isActive ? "blur(0)" : "blur(14px)",
              transition: "opacity 1.6s ease, transform 1.8s cubic-bezier(.2,.8,.2,1), filter 1.6s ease",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <div
              className="relative w-full h-[78%] rounded-3xl overflow-hidden glass-card animate-float"
              style={{ boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8), 0 0 60px oklch(0.7 0.18 15 / 0.25)" }}
            >
              <img
                src={p.src}
                alt={p.caption}
                className="w-full h-full object-cover"
                loading={i < 2 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 40%, oklch(1 0 0 / 0.08) 50%, transparent 60%)",
                }}
              />
            </div>
            <p className="mt-8 font-serif italic text-2xl md:text-3xl text-cosmic-gold glow-text text-center px-4">
              {p.caption}
            </p>
          </div>
        );
      })}

      {/* progress dots */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((_, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full transition-all duration-700"
            style={{
              width: i === index ? 32 : 12,
              background: i === index ? "oklch(0.85 0.14 80)" : "oklch(1 0 0 / 0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

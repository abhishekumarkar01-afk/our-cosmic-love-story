import { useState } from "react";

export function ProposalScene({ active }: { active: boolean }) {
  const [chosen, setChosen] = useState(false);

  if (!active) return null;

  return (
    <div className="text-center relative">
      {!chosen ? (
        <button
          onClick={() => setChosen(true)}
          className="group relative px-12 py-6 rounded-full glass-card animate-pulse-glow font-serif text-2xl md:text-3xl text-cosmic-gold glow-text tracking-wider hover:scale-110 transition-transform duration-700"
        >
          <span className="relative z-10">Will You Stay Forever?</span>
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "radial-gradient(circle, oklch(0.85 0.14 80 / 0.3), transparent 70%)" }} />
        </button>
      ) : (
        <div className="animate-fade-glow">
          {/* burst overlay */}
          <div className="fixed inset-0 pointer-events-none z-40">
            {Array.from({ length: 80 }).map((_, i) => {
              const angle = (i / 80) * Math.PI * 2;
              const dist = 200 + Math.random() * 400;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full"
                  style={{
                    background: i % 3 === 0 ? "oklch(0.85 0.14 80)" : i % 3 === 1 ? "oklch(0.78 0.16 15)" : "#fff",
                    boxShadow: "0 0 12px currentColor",
                    animation: `burst-${i} 2.5s ease-out forwards`,
                    color: i % 3 === 0 ? "oklch(0.85 0.14 80)" : i % 3 === 1 ? "oklch(0.78 0.16 15)" : "#fff",
                    "--dx": `${Math.cos(angle) * dist}px`,
                    "--dy": `${Math.sin(angle) * dist}px`,
                  } as React.CSSProperties}
                />
              );
            })}
            <style>{`
              @keyframes burst-0 { to { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
              ${Array.from({ length: 80 }, (_, i) => `@keyframes burst-${i} { to { transform: translate(var(--dx), var(--dy)) scale(2); opacity: 0; } }`).join("\n")}
            `}</style>
          </div>

          {/* heart constellation */}
          <div className="relative mx-auto mb-12" style={{ width: 220, height: 200 }}>
            {Array.from({ length: 60 }).map((_, i) => {
              const t = (i / 60) * Math.PI * 2;
              const x = 16 * Math.pow(Math.sin(t), 3);
              const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
              return (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-cosmic-gold"
                  style={{
                    left: `calc(50% + ${x * 6}px)`,
                    top: `calc(50% + ${y * 6}px)`,
                    boxShadow: "0 0 12px oklch(0.85 0.14 80), 0 0 24px oklch(0.78 0.16 15 / 0.6)",
                    animationDelay: `${i * 30}ms`,
                  }}
                />
              );
            })}
          </div>

          <p className="font-serif italic text-3xl md:text-5xl text-foreground glow-text-cool leading-tight">
            In every lifetime,
            <br />
            every universe,
            <br />
            <span className="font-script text-cosmic-gold glow-text">I choose only you.</span>
          </p>
        </div>
      )}
    </div>
  );
}

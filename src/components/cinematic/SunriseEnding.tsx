import p1 from "@/assets/photo-1.jpg";

export function SunriseEnding({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="text-center animate-fade-glow">
      <div
        className="relative mx-auto mb-12 rounded-full overflow-hidden"
        style={{
          width: "min(70vw, 320px)",
          height: "min(70vw, 320px)",
          boxShadow:
            "0 0 80px oklch(0.85 0.14 80 / 0.6), 0 0 160px oklch(0.78 0.16 15 / 0.3), 0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <img src={p1} alt="My everything" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 100%, oklch(0.85 0.14 80 / 0.4), transparent 60%)",
          }}
        />
      </div>
      <p className="font-serif italic text-3xl md:text-5xl text-foreground glow-text leading-tight">
        Out of all the stars,
        <br />
        <span className="font-script text-cosmic-gold">I still found home in you.</span>
      </p>
    </div>
  );
}

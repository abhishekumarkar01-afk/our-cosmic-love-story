import { useEffect, useRef, useState } from "react";

interface Props {
  active: boolean;
  name: string;
}

/**
 * Final interactive moment: a single glowing star floats at center.
 * When she taps it, her name bursts outward in a shower of golden
 * petals and rose-light, and a final whispered line appears.
 */
export function StarReveal({ active, name }: Props) {
  const [released, setReleased] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!released) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: string;
      kind: "petal" | "spark" | "name";
      char?: string;
      angle?: number;
      spin?: number;
    };

    const particles: Particle[] = [];

    // golden sparks
    for (let i = 0; i < 220; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0,
        maxLife: 80 + Math.random() * 80,
        size: 1 + Math.random() * 2.2,
        hue:
          Math.random() < 0.55
            ? "rgba(255,220,150,"
            : Math.random() < 0.5
              ? "rgba(255,180,200,"
              : "rgba(255,255,255,",
        kind: "spark",
      });
    }

    // floating petals
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 2;
      particles.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 0.5,
        life: 0,
        maxLife: 200 + Math.random() * 120,
        size: 6 + Math.random() * 8,
        hue: "rgba(255,160,180,",
        kind: "petal",
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.06,
      });
    }

    // name letters orbiting
    const letters = name.split("");
    letters.forEach((ch, i) => {
      const a = (i / letters.length) * Math.PI * 2;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * 3.5,
        vy: Math.sin(a) * 3.5,
        life: 0,
        maxLife: 360,
        size: 0,
        hue: "rgba(255,225,170,",
        kind: "name",
        char: ch,
        angle: a,
      });
    });

    let raf = 0;
    let frame = 0;
    const draw = () => {
      frame++;
      ctx.fillStyle = "rgba(0,0,0,0.12)"; // motion trail
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.life++;
        const t = p.life / p.maxLife;
        if (p.kind === "spark") {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.vy += 0.02;
          const alpha = Math.max(0, 1 - t);
          ctx.fillStyle = p.hue + alpha * 0.95 + ")";
          ctx.shadowColor = p.hue + "1)";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "petal") {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.025;
          p.angle! += p.spin!;
          const alpha = Math.max(0, 1 - t * 0.9);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle!);
          ctx.fillStyle = p.hue + alpha * 0.7 + ")";
          ctx.shadowColor = "rgba(255,200,210,0.8)";
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.kind === "name") {
          // letters spiral outward then settle in a circle
          const settle = Math.min(1, p.life / 90);
          const radius = settle * Math.min(w, h) * 0.32;
          const orbit = p.angle! + frame * 0.004;
          p.x = cx + Math.cos(orbit) * radius;
          p.y = cy + Math.sin(orbit) * radius;
          const alpha = Math.max(0, Math.min(1, settle));
          ctx.save();
          ctx.font = `${28 + settle * 12}px "Cormorant Garamond", serif`;
          ctx.fillStyle = p.hue + alpha + ")";
          ctx.shadowColor = "rgba(255,210,140,0.9)";
          ctx.shadowBlur = 24;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.translate(p.x, p.y);
          ctx.rotate(orbit + Math.PI / 2);
          ctx.fillText(p.char!, 0, 0);
          ctx.restore();
        }
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [released, name]);

  if (!active) return null;

  return (
    <div className="text-center w-full px-4">
      {!released ? (
        <div className="animate-fade-glow">
          <p className="font-serif italic text-xl md:text-2xl text-foreground/70 mb-12 tracking-widest">
            One last star is waiting for you...
          </p>
          <button
            onClick={() => setReleased(true)}
            aria-label="Touch the star"
            className="group relative mx-auto block"
            style={{ width: 120, height: 120 }}
          >
            <div
              className="absolute inset-0 rounded-full animate-pulse-glow"
              style={{
                background:
                  "radial-gradient(circle, oklch(1 0 0) 0%, oklch(0.9 0.15 80) 30%, oklch(0.7 0.18 15 / 0.5) 60%, transparent 80%)",
              }}
            />
            <div
              className="absolute inset-1/4 rounded-full"
              style={{
                background: "radial-gradient(circle, #fff 0%, oklch(0.95 0.1 80) 60%, transparent 100%)",
                boxShadow: "0 0 60px oklch(0.85 0.14 80), 0 0 120px oklch(0.78 0.16 15 / 0.5)",
              }}
            />
          </button>
          <p className="mt-10 font-serif italic text-base text-foreground/50 tracking-wider">
            tap it
          </p>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 30 }}
          />
          <div
            className="relative animate-fade-glow"
            style={{ animationDelay: "1.4s", animationFillMode: "both", opacity: 0 }}
          >
            <p className="font-serif italic text-2xl md:text-4xl text-foreground glow-text-cool leading-snug">
              You are not just a star,
              <br />
              <span className="font-script text-cosmic-gold glow-text text-3xl md:text-6xl">
                you are my whole sky.
              </span>
            </p>
            <p className="mt-12 font-script text-2xl md:text-3xl text-cosmic-rose">— for {name}, always.</p>
          </div>
        </div>
      )}
    </div>
  );
}

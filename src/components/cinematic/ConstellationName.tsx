import { useEffect, useRef } from "react";

interface Props {
  name: string;
  active: boolean;
}

/** Generates fixed constellation points spelling the name, draws connecting lines */
export function ConstellationName({ name, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // sample text into points
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const oc = off.getContext("2d")!;
    const fontSize = Math.min(w / (name.length * 0.7), h * 0.55);
    oc.fillStyle = "#fff";
    oc.font = `${fontSize}px "Cormorant Garamond", serif`;
    oc.textAlign = "center";
    oc.textBaseline = "middle";
    oc.fillText(name, w / 2, h / 2);
    const data = oc.getImageData(0, 0, w, h).data;

    const points: { x: number; y: number; tx: number; ty: number; delay: number }[] = [];
    const step = Math.max(8, Math.floor(fontSize / 14));
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4 + 3;
        if (data[idx] > 128) {
          points.push({
            x: Math.random() * w,
            y: Math.random() * h,
            tx: x + (Math.random() - 0.5) * 2,
            ty: y + (Math.random() - 0.5) * 2,
            delay: Math.random() * 800,
          });
        }
      }
    }

    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);

      // connecting lines (subtle)
      if (t > 1500) {
        ctx.strokeStyle = "rgba(255, 220, 160, 0.18)";
        ctx.lineWidth = 0.6;
        for (let i = 0; i < points.length - 1; i += 4) {
          const a = points[i];
          const b = points[i + 4];
          if (!b) continue;
          const dx = a.tx - b.tx, dy = a.ty - b.ty;
          if (Math.hypot(dx, dy) < 60) {
            ctx.beginPath();
            ctx.moveTo(a.tx, a.ty);
            ctx.lineTo(b.tx, b.ty);
            ctx.stroke();
          }
        }
      }

      points.forEach((p) => {
        const k = Math.max(0, Math.min(1, (t - p.delay) / 1800));
        const eased = 1 - Math.pow(1 - k, 3);
        p.x = p.x + (p.tx - p.x) * eased * 0.05 + (p.tx - p.x) * 0.02;
        p.y = p.y + (p.ty - p.y) * eased * 0.05 + (p.ty - p.y) * 0.02;
        const r = 1.2 + Math.sin(now * 0.003 + p.tx) * 0.4;
        ctx.fillStyle = `rgba(255, 230, 170, ${0.6 + Math.sin(now * 0.002 + p.tx * 0.1) * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        // halo
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
        g.addColorStop(0, "rgba(255, 220, 160, 0.4)");
        g.addColorStop(1, "rgba(255, 220, 160, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, name]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-3xl"
      style={{ height: "min(40vh, 320px)" }}
    />
  );
}

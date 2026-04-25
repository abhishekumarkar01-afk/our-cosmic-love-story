import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  text: string;
}

/**
 * SVG signature that draws itself in golden ink, like a real
 * handwritten note appearing live on the page.
 */
export function HandwrittenSignature({ active, text }: Props) {
  const pathRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (!active) return;
  }, [active]);

  return (
    <div className="text-center w-full max-w-2xl mx-auto px-4">
      <p className="font-serif italic text-foreground/60 mb-6 tracking-widest text-sm uppercase">
        sealed with
      </p>
      <svg
        viewBox="0 0 600 180"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 0 18px oklch(0.85 0.14 80 / 0.5))" }}
      >
        <defs>
          <linearGradient id="inkGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.9 0.16 80)" />
            <stop offset="50%" stopColor="oklch(0.78 0.16 15)" />
            <stop offset="100%" stopColor="oklch(0.85 0.14 80)" />
          </linearGradient>
        </defs>
        <text
          ref={pathRef}
          x="50%"
          y="62%"
          textAnchor="middle"
          fill="none"
          stroke="url(#inkGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: 78,
            strokeDasharray: 2000,
            strokeDashoffset: active ? 0 : 2000,
            transition: "stroke-dashoffset 4.5s ease-in-out",
          }}
        >
          {text}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          fill="oklch(0.9 0.14 70)"
          opacity={active ? 0.85 : 0}
          style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: 78,
            transition: "opacity 1.4s ease 4s",
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

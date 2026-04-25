import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

interface AudioManagerProps {
  /** which track should be active: 0 = none, 1 = cosmic, 2 = romantic */
  activeTrack: 0 | 1 | 2;
  cosmicSrc: string;
  romanticSrc: string;
  onReplay?: () => void;
}

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export function AudioManager({ activeTrack, cosmicSrc, romanticSrc, onReplay }: AudioManagerProps) {
  const cosmicRef = useRef<HTMLAudioElement>(null);
  const romanticRef = useRef<HTMLAudioElement>(null);
  const fadeRafRef = useRef<{ cosmic?: number; romantic?: number }>({});
  const [muted, setMuted] = useState(false);
  const [masterVol, setMasterVol] = useState(0.7);
  const [started, setStarted] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  // verify files are reachable
  useEffect(() => {
    Promise.all([
      fetch(cosmicSrc, { method: "HEAD" }).then((r) => (r.ok ? null : "cosmic")).catch(() => "cosmic"),
      fetch(romanticSrc, { method: "HEAD" }).then((r) => (r.ok ? null : "romantic")).catch(() => "romantic"),
    ]).then((res) => setMissing(res.filter(Boolean) as string[]));
  }, [cosmicSrc, romanticSrc]);

  const fadeTo = (which: "cosmic" | "romantic", target: number, durationMs = 2200) => {
    const el = which === "cosmic" ? cosmicRef.current : romanticRef.current;
    if (!el) return;
    const safeTarget = clamp(target);
    const from = clamp(el.volume);
    const start = performance.now();

    if (fadeRafRef.current[which]) cancelAnimationFrame(fadeRafRef.current[which]!);

    const step = (now: number) => {
      const k = Math.min(1, (now - start) / durationMs);
      const v = clamp(from + (safeTarget - from) * k);
      try {
        el.volume = v;
      } catch {
        /* ignore */
      }
      if (k < 1) {
        fadeRafRef.current[which] = requestAnimationFrame(step);
      } else if (safeTarget === 0) {
        el.pause();
      }
    };
    fadeRafRef.current[which] = requestAnimationFrame(step);
  };

  // crossfade on track change
  useEffect(() => {
    if (!started) return;
    const cosmic = cosmicRef.current;
    const romantic = romanticRef.current;
    if (!cosmic || !romantic) return;

    const effectiveVol = muted ? 0 : clamp(masterVol);

    if (activeTrack === 1) {
      cosmic.play().catch(() => {});
      fadeTo("cosmic", effectiveVol * 0.85);
      fadeTo("romantic", 0);
    } else if (activeTrack === 2) {
      romantic.play().catch(() => {});
      fadeTo("romantic", effectiveVol * 0.95);
      fadeTo("cosmic", 0);
    } else {
      fadeTo("cosmic", 0);
      fadeTo("romantic", 0);
    }
  }, [activeTrack, started]);

  // master volume / mute changes — adjust live without killing playback
  useEffect(() => {
    if (!started) return;
    const cosmic = cosmicRef.current;
    const romantic = romanticRef.current;
    if (!cosmic || !romantic) return;
    const effectiveVol = muted ? 0 : clamp(masterVol);
    if (activeTrack === 1) {
      try {
        cosmic.volume = effectiveVol * 0.85;
      } catch {}
    } else if (activeTrack === 2) {
      try {
        romantic.volume = effectiveVol * 0.95;
      } catch {}
    }
  }, [masterVol, muted, started, activeTrack]);

  const handleStart = () => {
    // Always start at the very top so the cosmic track is the first thing heard.
    window.scrollTo({ top: 0, behavior: "auto" });
    onReplay?.();
    requestAnimationFrame(() => {
      setStarted(true);
      const c = cosmicRef.current;
      const r = romanticRef.current;
      if (r) {
        try { r.pause(); r.currentTime = 0; r.volume = 0; } catch {}
      }
      if (c) {
        try { c.currentTime = 0; c.volume = 0; } catch {}
        c.play().catch(() => {});
        fadeTo("cosmic", clamp(masterVol) * 0.85, 3000);
      }
    });
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onReplay?.();
    const c = cosmicRef.current;
    const r = romanticRef.current;
    if (r) { try { r.pause(); r.currentTime = 0; r.volume = 0; } catch {} }
    if (c) {
      try { c.currentTime = 0; c.volume = 0; } catch {}
      c.play().catch(() => {});
      fadeTo("cosmic", clamp(masterVol) * 0.85, 2000);
    }
  };

  return (
    <>
      <audio ref={cosmicRef} src={cosmicSrc} loop preload="auto" />
      <audio ref={romanticRef} src={romanticSrc} loop preload="auto" />

      {!started && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cosmic-deep/95 backdrop-blur-xl cursor-pointer"
          onClick={handleStart}
        >
          <div className="text-center px-8 animate-fade-glow">
            <div className="mb-8 text-cosmic-gold/80 font-serif italic text-sm tracking-[0.4em] uppercase">
              A cinematic memory
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-foreground glow-text-cool mb-8 leading-tight">
              For You,
              <br />
              <span className="font-script text-cosmic-gold glow-text">My Universe</span>
            </h1>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              className="mt-6 px-10 py-4 rounded-full glass-card text-cosmic-gold font-serif text-lg tracking-widest uppercase animate-pulse-glow hover:scale-105 transition-transform"
            >
              Begin
            </button>
            <p className="mt-8 text-xs text-foreground/50 tracking-widest">
              Best with sound · scroll slowly · headphones recommended
            </p>
            {missing.length > 0 && (
              <p className="mt-4 text-xs text-cosmic-rose/80 italic">
                Note: {missing.join(", ")} track missing — visuals will still play.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating audio controls */}
      {started && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
          <div className="glass-card rounded-full pl-3 pr-4 py-2 flex items-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-cosmic-gold hover:scale-110 transition"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={masterVol}
              onChange={(e) => setMasterVol(clamp(parseFloat(e.target.value)))}
              className="w-20 md:w-28 accent-[oklch(0.85_0.14_80)] cursor-pointer"
              aria-label="Volume"
            />
          </div>
          <button
            onClick={handleReplay}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-cosmic-gold hover:scale-110 transition"
            aria-label="Replay"
            title="Replay from start"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}
    </>
  );
}

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
  const cosmicRef = useRef<HTMLAudioElement | null>(null);
  const romanticRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<{ cosmic?: number; romantic?: number }>({});
  const [muted, setMuted] = useState(false);
  const [masterVol, setMasterVol] = useState(0.7);
  const [started, setStarted] = useState(false);

  // Create the audio elements ONCE, lazily, so we control them imperatively.
  // Mobile browsers (iOS Safari especially) require .load() + .play() to be
  // invoked synchronously inside the user-gesture handler.
  const ensureAudioElements = () => {
    if (!cosmicRef.current) {
      const a = new Audio();
      a.src = cosmicSrc;
      a.loop = true;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");
      a.volume = 0;
      cosmicRef.current = a;
    }
    if (!romanticRef.current) {
      const a = new Audio();
      a.src = romanticSrc;
      a.loop = true;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      a.setAttribute("playsinline", "");
      a.setAttribute("webkit-playsinline", "");
      a.volume = 0;
      romanticRef.current = a;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      [cosmicRef.current, romanticRef.current].forEach((el) => {
        if (el) {
          try {
            el.pause();
            el.src = "";
            el.load();
          } catch {
            /* ignore */
          }
        }
      });
      if (fadeRafRef.current.cosmic) cancelAnimationFrame(fadeRafRef.current.cosmic);
      if (fadeRafRef.current.romantic) cancelAnimationFrame(fadeRafRef.current.romantic);
    };
  }, []);

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
        try {
          el.pause();
        } catch {
          /* ignore */
        }
      }
    };
    fadeRafRef.current[which] = requestAnimationFrame(step);
  };

  // crossfade on track change (only after user has started)
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

  // master volume / mute changes
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

  // CRITICAL: must be invoked synchronously from a real user gesture.
  // No awaits, no rAF before .play() — mobile autoplay policies require it.
  const handleStart = () => {
    ensureAudioElements();

    const c = cosmicRef.current!;
    const r = romanticRef.current!;

    // Prime BOTH elements inside the gesture so a later silent-switch to the
    // romantic track also works on iOS (each <audio> needs at least one
    // user-initiated play() to be unlocked).
    try {
      r.muted = true;
      r.volume = 0;
      const rPlay = r.play();
      if (rPlay && typeof rPlay.then === "function") {
        rPlay
          .then(() => {
            try {
              r.pause();
              r.currentTime = 0;
              r.muted = false;
            } catch {}
          })
          .catch(() => {
            try {
              r.muted = false;
            } catch {}
          });
      }
    } catch {
      /* ignore */
    }

    try {
      c.currentTime = 0;
      c.volume = 0;
      c.muted = false;
      c.play().catch(() => {});
    } catch {
      /* ignore */
    }

    setStarted(true);
    onReplay?.();
    // Scroll to top after state flip — safe outside the gesture
    window.scrollTo({ top: 0, behavior: "auto" });
    fadeTo("cosmic", clamp(masterVol) * 0.85, 3000);
  };

  const handleReplay = () => {
    ensureAudioElements();
    const c = cosmicRef.current!;
    const r = romanticRef.current!;
    try {
      r.pause();
      r.currentTime = 0;
      r.volume = 0;
    } catch {}
    try {
      c.currentTime = 0;
      c.volume = 0;
      c.play().catch(() => {});
    } catch {}
    onReplay?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
    fadeTo("cosmic", clamp(masterVol) * 0.85, 2000);
  };

  return (
    <>
      {!started && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cosmic-deep/95 backdrop-blur-xl cursor-pointer"
          onClick={handleStart}
          onTouchEnd={(e) => {
            // Ensure mobile taps trigger inside the gesture window
            e.preventDefault();
            handleStart();
          }}
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleStart();
              }}
              className="mt-6 px-10 py-4 rounded-full glass-card text-cosmic-gold font-serif text-lg tracking-widest uppercase animate-pulse-glow hover:scale-105 transition-transform"
            >
              Begin
            </button>
            <p className="mt-8 text-xs text-foreground/50 tracking-widest">
              Best with sound · scroll slowly · headphones recommended
            </p>
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

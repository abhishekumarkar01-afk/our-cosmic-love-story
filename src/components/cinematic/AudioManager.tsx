import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioManagerProps {
  /** which track should be active: 0 = none, 1 = cosmic, 2 = romantic */
  activeTrack: 0 | 1 | 2;
  cosmicSrc: string;
  romanticSrc: string;
}

export function AudioManager({ activeTrack, cosmicSrc, romanticSrc }: AudioManagerProps) {
  const cosmicRef = useRef<HTMLAudioElement>(null);
  const romanticRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // crossfade
  useEffect(() => {
    const cosmic = cosmicRef.current;
    const romantic = romanticRef.current;
    if (!cosmic || !romantic) return;

    const FADE_MS = 2200;
    const fade = (el: HTMLAudioElement, to: number) => {
      const from = el.volume;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / FADE_MS);
        el.volume = from + (to - from) * k;
        if (k < 1) requestAnimationFrame(step);
        else if (to === 0) el.pause();
      };
      requestAnimationFrame(step);
    };

    if (muted) {
      fade(cosmic, 0);
      fade(romantic, 0);
      return;
    }

    if (activeTrack === 1) {
      cosmic.play().catch(() => {});
      fade(cosmic, 0.55);
      fade(romantic, 0);
    } else if (activeTrack === 2) {
      romantic.play().catch(() => {});
      fade(romantic, 0.6);
      fade(cosmic, 0);
    } else {
      fade(cosmic, 0);
      fade(romantic, 0);
    }
  }, [activeTrack, muted, started]);

  const handleStart = () => {
    setStarted(true);
    cosmicRef.current?.play().catch(() => {});
  };

  return (
    <>
      <audio ref={cosmicRef} src={cosmicSrc} loop preload="auto" />
      <audio ref={romanticRef} src={romanticSrc} loop preload="auto" />

      {!started && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cosmic-deep/95 backdrop-blur-xl"
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
              onClick={handleStart}
              className="mt-6 px-10 py-4 rounded-full glass-card text-cosmic-gold font-serif text-lg tracking-widest uppercase animate-pulse-glow hover:scale-105 transition-transform"
            >
              Begin
            </button>
            <p className="mt-8 text-xs text-foreground/50 tracking-widest">
              Best with sound · headphones recommended
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setMuted((m) => !m)}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full glass-card flex items-center justify-center text-cosmic-gold hover:scale-110 transition"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </>
  );
}

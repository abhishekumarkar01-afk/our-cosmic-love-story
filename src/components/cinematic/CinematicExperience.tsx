import { useEffect, useRef, useState } from "react";
import { GalaxyScene } from "@/components/cinematic/GalaxyScene";
import { AudioManager } from "@/components/cinematic/AudioManager";
import { PhotoMemories } from "@/components/cinematic/PhotoMemories";
import { ConstellationName } from "@/components/cinematic/ConstellationName";
import { LoveLetter } from "@/components/cinematic/LoveLetter";
import { ProposalScene } from "@/components/cinematic/ProposalScene";
import { SunriseEnding } from "@/components/cinematic/SunriseEnding";

/**
 * Scenes in order:
 * 0  Universe opening
 * 1  Galaxy journey
 * 2  Earth zoom
 * 3  Reach her world
 * 4  Photo memories
 * 5  Constellation name
 * 6  Love letter
 * 7  Proposal
 * 8  Sunrise ending
 */

interface SceneSection {
  id: number;
  height: string;
  /** galaxy phase 0..2 */
  phase: number;
  /** 0 none, 1 cosmic, 2 romantic */
  track: 0 | 1 | 2;
  render: (active: boolean) => React.ReactNode;
}

export function CinematicExperience({ name = "Priya" }: { name?: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scenes: SceneSection[] = [
    {
      id: 0,
      height: "180vh",
      phase: 0,
      track: 1,
      render: (a) => (
        <div className={`text-center max-w-3xl px-6 transition-opacity duration-1000 ${a ? "opacity-100" : "opacity-0"}`}>
          <p className="font-serif italic text-2xl md:text-4xl text-foreground/90 glow-text-cool leading-relaxed mb-12 animate-fade-glow">
            In an endless universe of billions of stars...
          </p>
          <p
            className="font-serif italic text-3xl md:text-5xl text-cosmic-gold glow-text leading-relaxed animate-fade-glow"
            style={{ animationDelay: "2.5s", animationFillMode: "both", opacity: 0 }}
          >
            My heart still found only one.
          </p>
        </div>
      ),
    },
    {
      id: 1,
      height: "120vh",
      phase: 0.2,
      track: 1,
      render: (a) => (
        <div className={`text-center transition-opacity duration-1000 ${a ? "opacity-60" : "opacity-0"}`}>
          <p className="font-serif italic text-xl md:text-2xl text-foreground/60 tracking-widest uppercase">
            travelling through the cosmos
          </p>
        </div>
      ),
    },
    {
      id: 2,
      height: "140vh",
      phase: 0.7,
      track: 1,
      render: (a) => (
        <div className={`text-center transition-opacity duration-1000 ${a ? "opacity-100" : "opacity-0"}`}>
          <p className="font-serif italic text-2xl md:text-4xl text-foreground/90 glow-text-cool">
            past planets, past time...
            <br />
            <span className="text-cosmic-gold glow-text">towards a small blue world.</span>
          </p>
        </div>
      ),
    },
    {
      id: 3,
      height: "100vh",
      phase: 1.2,
      track: 2,
      render: (a) => (
        <div className={`text-center transition-opacity duration-1000 ${a ? "opacity-100" : "opacity-0"}`}>
          <div className="w-3 h-3 mx-auto mb-8 rounded-full bg-cosmic-gold animate-pulse-glow" />
          <p className="font-serif italic text-2xl md:text-4xl text-cosmic-gold glow-text">
            And here... I found you.
          </p>
        </div>
      ),
    },
    {
      id: 4,
      height: "260vh",
      phase: 1.3,
      track: 2,
      render: (a) => (
        <div className="w-full px-4">
          <PhotoMemories active={a} />
        </div>
      ),
    },
    {
      id: 5,
      height: "120vh",
      phase: 1.1,
      track: 2,
      render: (a) => (
        <div className={`text-center w-full transition-opacity duration-1000 ${a ? "opacity-100" : "opacity-0"}`}>
          <p className="font-serif italic text-lg md:text-xl text-foreground/70 mb-8 tracking-widest uppercase">
            the stars wrote your name
          </p>
          <ConstellationName name={name} active={a} />
        </div>
      ),
    },
    {
      id: 6,
      height: "200vh",
      phase: 1.2,
      track: 2,
      render: (a) => (
        <div className="w-full px-4">
          <LoveLetter active={a} />
        </div>
      ),
    },
    {
      id: 7,
      height: "140vh",
      phase: 1.4,
      track: 2,
      render: (a) => <ProposalScene active={a} />,
    },
    {
      id: 8,
      height: "150vh",
      phase: 2,
      track: 2,
      render: (a) => (
        <div className="w-full px-4">
          <SunriseEnding active={a} />
        </div>
      ),
    },
  ];

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const c = containerRef.current;
        if (!c) {
          ticking = false;
          return;
        }
        const total = c.scrollHeight - window.innerHeight;
        const y = window.scrollY;
        const p = Math.max(0, Math.min(1, y / total));
        setScrollProgress(p);

        // determine active scene
        const sections = c.querySelectorAll<HTMLElement>("[data-scene]");
        const mid = y + window.innerHeight / 2;
        let current = 0;
        sections.forEach((el) => {
          const top = el.offsetTop;
          const bot = top + el.offsetHeight;
          if (mid >= top && mid < bot) current = Number(el.dataset.scene);
        });
        setActiveScene(current);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // interpolate galaxy phase based on active scene
  const currentPhase = scenes[activeScene]?.phase ?? 0;
  const currentTrack = scenes[activeScene]?.track ?? 1;

  return (
    <>
      <GalaxyScene phase={currentPhase} />

      {/* warm overlay that builds up in later scenes */}
      <div
        className="fixed inset-0 -z-[5] pointer-events-none transition-opacity duration-[2000ms]"
        style={{
          background:
            activeScene >= 8
              ? "linear-gradient(to top, oklch(0.75 0.18 60 / 0.5), oklch(0.5 0.15 30 / 0.2) 40%, transparent 70%)"
              : activeScene >= 3
                ? "radial-gradient(ellipse at center, oklch(0.4 0.12 30 / 0.15), transparent 70%)"
                : "transparent",
        }}
      />

      <AudioManager activeTrack={currentTrack} cosmicSrc="/audio/cosmic.mp3" romanticSrc="/audio/romantic.mp3" />

      {/* progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-40">
        <div
          className="h-full bg-cosmic-gold"
          style={{ width: `${scrollProgress * 100}%`, boxShadow: "0 0 10px oklch(0.85 0.14 80)" }}
        />
      </div>

      <div ref={containerRef} className="relative">
        {scenes.map((s) => (
          <section
            key={s.id}
            data-scene={s.id}
            className="relative flex items-center justify-center"
            style={{ minHeight: s.height }}
          >
            <div className="sticky top-0 h-screen w-full flex items-center justify-center">
              {s.render(activeScene === s.id)}
            </div>
          </section>
        ))}

        {/* scroll hint */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-foreground/40 text-xs tracking-widest uppercase animate-pulse"
          style={{ opacity: scrollProgress < 0.02 ? 1 : 0, transition: "opacity 1s" }}>
          scroll to begin ↓
        </div>
      </div>
    </>
  );
}

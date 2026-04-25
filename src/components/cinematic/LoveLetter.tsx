import { useEffect, useState } from "react";

const POEM = [
  "Agar waqt mere haathon ka raaz hota,",
  "toh har subah aapko phir se chunta.",
  "Har galti ko mita deta chupke se,",
  "par aapki muskaan ko kabhi na badalta.",
  "",
  "Main laut kar jaata un lamhon mein,",
  "jahaan pehli baar aapka naam dil ne suna tha,",
  "jahaan aapki aankhon ne bina kahe hi,",
  "meri tanha duniya ko ghar kaha tha.",
  "",
  "Par ab samjha hoon,",
  "waqt ko jeetna mohabbat nahi hoti.",
  "Aapko paana bhi jeet nahi,",
  "aapko har roz naye dil se chaahna hi sachchi preet hoti.",
  "",
  "Isliye ab na kal maangta hoon,",
  "na beetey palon ka sahara.",
  "Bas aaj ka yeh saans bhara din,",
  "aur aapka haath mere haath mein dobara.",
  "",
  "Agar zindagi ek baar mile,",
  "toh bhi main aapko hazaar baar chunta.",
  "Chahe samay ruk jaaye ya behta rahe,",
  "mera dil har janam aap hi tak pahuncha.",
  "",
  "Aap meri ghadi ka waqt nahi,",
  "aap meri rooh ka geet hain.",
  "Baaki sab din guzar jaayenge,",
  "par aap... meri har dua ki jeet hain.",
];

export function LoveLetter({ active }: { active: boolean }) {
  const [opened, setOpened] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setOpened(true), 800);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!opened) return;
    const interval = setInterval(() => {
      setVisibleLines((n) => {
        if (n >= POEM.length) {
          clearInterval(interval);
          return n;
        }
        return n + 1;
      });
    }, 380);
    return () => clearInterval(interval);
  }, [opened]);

  return (
    <div className="w-full max-w-2xl mx-auto perspective-[1200px]">
      {!opened ? (
        <div className="relative w-full aspect-[3/2] mx-auto animate-float">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #c8956d 0%, #a06d44 100%)",
              boxShadow: "0 30px 80px -10px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.2)",
            }}
          />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              clipPath: "polygon(0 0, 50% 55%, 100% 0)",
              background: "linear-gradient(180deg, #d4a47b 0%, #b07d52 100%)",
              borderBottom: "1px solid rgba(0,0,0,0.2)",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cosmic-rose flex items-center justify-center animate-pulse-glow font-serif text-foreground text-xl">
            ♥
          </div>
        </div>
      ) : (
        <div
          className="paper-texture rounded-lg p-8 md:p-14 animate-fade-glow animate-float"
          style={{ animationDuration: "2s, 8s" }}
        >
          <div className="font-script text-3xl text-center mb-6" style={{ color: "#6b4423" }}>
            For You, my love
          </div>
          {POEM.map((line, i) => (
            <p
              key={i}
              className="font-serif italic text-lg md:text-xl leading-relaxed text-center transition-all duration-1000"
              style={{
                color: "#3a2615",
                opacity: i < visibleLines ? 1 : 0,
                transform: i < visibleLines ? "translateY(0)" : "translateY(8px)",
                minHeight: line === "" ? "0.8em" : undefined,
                marginBottom: line === "" ? "0.5em" : "0.15em",
              }}
            >
              {line || "\u00A0"}
            </p>
          ))}
          <div className="font-script text-2xl text-right mt-8" style={{ color: "#6b4423" }}>
            — Forever yours
          </div>
        </div>
      )}
    </div>
  );
}

import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import { useState } from "react";
import Image from "next/image";
import { journeys } from "@/data/journeys";
import { ArrowRight, BookOpen, Crown, Lock, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { fetchJourneyState, type ClientJourney } from "@/lib/journeys/client";
import { useEffect } from "react";

const CARD_COLORS = [
  "bg-brand-primary/5",
  "bg-brand-sand/10",
  "bg-brand-growth/10",
  "bg-brand-primary/8",
  "bg-brand-sand/8",
  "bg-brand-growth/8",
  "bg-brand-primary/6",
  "bg-brand-sand/12",
  "bg-brand-growth/12",
  "bg-brand-primary/10",
  "bg-brand-sand/6",
  "bg-brand-growth/6",
  "bg-brand-primary/12",
  "bg-brand-sand/5",
];

const CATEGORIES = ["All", "Foundation", "Growth", "Intimacy", "Advanced"];

const STAGE_NAMES: Record<string, string> = { roots: "Roots", growth: "Growth", bloom: "Bloom" };

/** "Roots · Day 3" for staged journeys, "Day 3 of 10" for daily ones. */
function whereYouAre(journey: ClientJourney): string {
  const day = Math.min(journey.journey_day, journey.days);
  if (journey.shape === "staged") {
    const stage = journey.stage ? STAGE_NAMES[journey.stage] : null;
    return stage ? `${stage} · Day ${day} of ${journey.days}` : `Day ${day}`;
  }
  return `Day ${day} of ${journey.days}`;
}

export default function Journeys() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  // The active journey, from the user's account (any device).
  const [activeJourney, setActiveJourney] = useState<ClientJourney | null>(null);

  useEffect(() => {
    let alive = true;
    fetchJourneyState().then((state) => {
      if (alive) setActiveJourney(state?.active ?? null);
    });
    return () => { alive = false; };
  }, []);

  const filtered = journeys.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || j.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Daily journeys continue in the Daily Loop; staged ones on their own page.
  const continueHref = activeJourney
    ? activeJourney.shape === "daily" ? "/daily-growth" : `/journeys/${activeJourney.journey_id}`
    : null;

  return (
    <div className="emotion-page min-h-dvh bg-brand-linen pb-28 relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl border-b px-4 py-4 shadow-[0_4px_30px_hsl(var(--shadow)/0.02)] transition-all"
        style={{
          background: "hsl(var(--background)/0.85)",
          borderColor: "hsl(var(--primary)/0.08)",
        }}
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-serif font-bold text-brand-taupe mb-4 tracking-tight">Journeys</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <div className="relative mb-4 overflow-hidden px-5 py-2">
          <SceneAccent kind="bloom" className="h-24 w-full" />
        </div>
        {activeJourney && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="emotion-paper mb-4 rounded-3xl border border-brand-primary/10 bg-brand-parchment p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">
                  current practice
                </p>
                <h2 className="mt-2 text-xl font-semibold text-brand-taupe">
                  {activeJourney.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
                  Stay with one lane at a time. This is where your active journey lives while Home keeps today&apos;s next step lighter.
                </p>
                <p className="mt-3 text-sm font-medium text-brand-text-secondary">
                  {whereYouAre(activeJourney)}
                </p>
                <Link
                  href={continueHref ?? "/journeys"}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-hover hover:text-brand-espresso"
                >
                  Continue {activeJourney.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search journeys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-input bg-popover/70 py-3 pl-10 pr-4 text-sm text-brand-taupe placeholder-zinc-400 shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 relative z-10 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
                activeCategory === cat
                  ? "text-white"
                  : "bg-popover/60 backdrop-blur-sm text-muted-foreground border border-brand-primary/10 hover:bg-popover"
              }`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeJourneyCategory"
                  className="absolute inset-0 bg-brand-primary rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Journey grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {filtered.map((journey, idx) => {
            const bgColor = CARD_COLORS[idx % CARD_COLORS.length];
            const isPremium = !journey.free && idx > 1;

            return (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
              >
                <Link href={`/journeys/${journey.id}`}>
                  <div className="group rounded-[1.5rem] overflow-hidden border border-brand-primary/10 bg-popover shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative z-10">
                    {/* Card image */}
                    <div className={`relative ${bgColor} h-36 overflow-hidden`}>
                      {journey.image && (
                        <Image
                          src={journey.image}
                          alt={journey.title}
                          fill
                          unoptimized
                          className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[800ms] ease-out"
                        />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-semibold bg-popover/90 backdrop-blur-sm text-brand-taupe px-2.5 py-0.5 rounded-full">
                          Journey
                        </span>
                      </div>
                      {isPremium && (
                        <>
                          <div className="absolute top-2 right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-inverse/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Card text */}
                    <div className="p-4 bg-popover relative z-20">
                      <p className="text-[10px] font-bold text-brand-hover uppercase tracking-[0.2em] mb-1.5">
                        {journey.category}
                      </p>
                      <h3 className="font-bold text-brand-taupe text-base leading-tight line-clamp-2 mix-blend-hard-light">
                        {journey.title}
                      </h3>
                      <p className="text-xs text-brand-text-secondary mt-2.5 font-medium flex items-center gap-1.5 opacity-80">
                        <span>{journey.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{journey.phases?.length ?? 4} phases</span>
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-serif text-brand-taupe">No journeys found</p>
            <p className="text-sm mt-1 text-brand-text-secondary">Try a different search or category</p>
          </div>
        )}
      </main>
    </div>
  );
}

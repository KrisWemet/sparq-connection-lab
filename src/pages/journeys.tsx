import { useState } from "react";
import Image from "next/image";
import { journeys } from "@/data/journeys";
import { ArrowRight, BookOpen, Crown, Lock, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { getJourneyVelocityStatus } from "@/services/journeyContentService";
import { toast } from "sonner";
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

const JOURNEY_PROGRESS_STORAGE_KEY = "sparq_journey_progress";

function parseJourneyDurationInDays(duration: string) {
  const [value, unit] = duration.toLowerCase().split(" ");
  const amount = Number.parseInt(value, 10);

  if (!Number.isFinite(amount)) return 14;
  if (unit.startsWith("week")) return amount * 7;
  return amount;
}

function getActiveJourneyNextDay(journeyId: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(JOURNEY_PROGRESS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<
      string,
      Array<{ journey_id?: string; day?: number; completed?: boolean }>
    >;

    const completedEntries = Object.entries(parsed)
      .filter(([storageKey]) => storageKey === journeyId || storageKey.startsWith(`${journeyId}_`))
      .flatMap(([, entries]) => entries || [])
      .filter((entry) => entry.completed && typeof entry.day === "number");

    if (!completedEntries.length) return null;

    const highestCompletedDay = completedEntries.reduce(
      (max, entry) => Math.max(max, entry.day ?? 0),
      0,
    );

    return highestCompletedDay + 1;
  } catch {
    return null;
  }
}

export default function Journeys() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [activeJourneyNextDay, setActiveJourneyNextDay] = useState<number | null>(null);

  useEffect(() => {
    async function loadVelocityStatus() {
      const status = await getJourneyVelocityStatus();
      setActiveJourneyId(status.activeJourneyId);
      setActiveJourneyNextDay(status.activeJourneyId ? getActiveJourneyNextDay(status.activeJourneyId) : null);
    }
    loadVelocityStatus();
  }, []);

  const handleJourneyClick = (e: React.MouseEvent, journeyId: string) => {
    if (activeJourneyId && activeJourneyId !== journeyId) {
      e.preventDefault();
      toast("One Journey at a Time", {
        description: "You already have an active journey. Finish it if it still fits. If it does not fit, open it and leave it early, then start a different one.",
        icon: "✨",
      });
    }
  };

  const filtered = journeys.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || j.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const activeJourney = activeJourneyId
    ? journeys.find((journey) => journey.id === activeJourneyId) ?? null
    : null;
  const activeJourneyTotalDays = activeJourney
    ? parseJourneyDurationInDays(activeJourney.duration)
    : null;
  const resumeDay = activeJourney && activeJourneyNextDay
    ? Math.min(activeJourneyNextDay, activeJourneyTotalDays ?? activeJourneyNextDay)
    : null;

  return (
    <div className="min-h-screen bg-brand-linen pb-28 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 mix-blend-multiply" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-sand/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 mix-blend-multiply" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl border-b px-4 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all"
        style={{
          background: "rgba(250,246,241,0.85)",
          borderColor: "rgba(192,97,74,0.08)",
        }}
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-serif font-bold text-brand-taupe mb-4 tracking-tight">Journeys</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {activeJourney && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mb-4 rounded-3xl border border-brand-primary/10 bg-[#EDE9FE] p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
                  current practice
                </p>
                <h2 className="mt-2 text-xl font-semibold text-brand-taupe">
                  {activeJourney.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
                  Stay with one lane at a time. This is where your active journey lives while Home keeps today&apos;s next step lighter.
                </p>
                {resumeDay && activeJourneyTotalDays && (
                  <p className="mt-3 text-sm font-medium text-[#5B4A86]">
                    Resume Day {resumeDay} of {activeJourneyTotalDays}
                  </p>
                )}
                <Link
                  href={`/journeys/${activeJourney.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-hover"
                >
                  Continue {activeJourney.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search journeys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-brand-primary/10 bg-white/70 py-3 pl-10 pr-4 text-sm text-brand-taupe placeholder-zinc-400 shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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
                  : "bg-white/60 backdrop-blur-sm text-zinc-600 border border-brand-primary/10 hover:bg-white"
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
                <Link href={`/journeys/${journey.id}`} onClick={(e) => handleJourneyClick(e, journey.id)}>
                  <div className="group rounded-[1.5rem] overflow-hidden border border-brand-primary/10 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative z-10">
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
                        <span className="text-xs font-semibold bg-white/90 backdrop-blur-sm text-brand-taupe px-2.5 py-0.5 rounded-full">
                          Journey
                        </span>
                      </div>
                      {isPremium && (
                        <>
                          <div className="absolute top-2 right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Card text */}
                    <div className="p-4 bg-white relative z-20">
                      <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-1.5">
                        {journey.category}
                      </p>
                      <h3 className="font-bold text-brand-taupe text-base leading-tight line-clamp-2 mix-blend-hard-light">
                        {journey.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2.5 font-medium flex items-center gap-1.5 opacity-80">
                        <span>{journey.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
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
            <p className="text-sm mt-1 text-zinc-500">Try a different search or category</p>
          </div>
        )}
      </main>
    </div>
  );
}

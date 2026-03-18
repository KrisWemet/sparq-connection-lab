import { useState } from "react";
import Image from "next/image";
import { journeys } from "@/data/journeys";
import { Crown, Search, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

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

export default function Journeys() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = journeys.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || j.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brand-linen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b px-4 py-4"
        style={{
          background: "rgba(250,246,241,0.92)",
          borderColor: "rgba(192,97,74,0.1)",
        }}
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-brand-taupe mb-3">Journeys</h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search journeys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/80 border border-brand-primary/10 text-sm text-brand-taupe placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-brand-primary text-white"
                  : "bg-white/80 text-zinc-600 border border-brand-primary/10 hover:bg-white"
              }`}
            >
              {cat}
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
                  <div className="rounded-3xl overflow-hidden border border-brand-primary/10 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {/* Card image */}
                    <div className={`relative ${bgColor} h-32`}>
                      {journey.image && (
                        <Image
                          src={journey.image}
                          alt={journey.title}
                          fill
                          unoptimized
                          className="object-cover opacity-80"
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
                    <div className="p-3">
                      <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-1">
                        {journey.category}
                      </p>
                      <h3 className="font-bold text-brand-taupe text-sm leading-tight line-clamp-2">
                        {journey.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2">
                        {journey.duration} · {journey.phases?.length ?? 4} phases
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

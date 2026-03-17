import { useState } from "react";
import Image from "next/image";
import { journeys } from "@/data/journeys";
import { BottomNav } from "@/components/bottom-nav";
import { Crown, Search, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const CARD_COLORS = [
  "bg-rose-50",
  "bg-violet-50",
  "bg-emerald-50",
  "bg-amber-50",
  "bg-sky-50",
  "bg-pink-50",
  "bg-teal-50",
  "bg-indigo-50",
  "bg-orange-50",
  "bg-lime-50",
  "bg-cyan-50",
  "bg-fuchsia-50",
  "bg-red-50",
  "bg-purple-50",
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
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Journeys</h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search journeys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
                        <span className="text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-0.5 rounded-full">
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
                    <div className="bg-white p-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        {journey.category}
                      </p>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                        {journey.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">
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
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No journeys found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

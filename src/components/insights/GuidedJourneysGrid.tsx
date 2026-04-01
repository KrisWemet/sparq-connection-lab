import Link from "next/link";
import { journeys } from "@/data/journeys";
import { motion } from "framer-motion";

export function GuidedJourneysGrid() {
  const featured = journeys.slice(0, 4);

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
        Guided Journeys
      </p>
      <div className="grid grid-cols-2 gap-3">
        {featured.map((journey, idx) => {
          const Icon = journey.icon;
          return (
            <motion.div
              key={journey.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              <Link href={`/journeys/${journey.id}`}>
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-amethyst-100 flex items-center justify-center mb-2">
                    <Icon size={18} className="text-amethyst-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {journey.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{journey.duration}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

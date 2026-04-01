import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

const TROPHIES = [
  { title: "Deep Listening" },
  { title: "Morning Rituals" },
  { title: "Gratitude Challenge" },
];

export function HallOfFame() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
        Hall of Fame
      </p>
      <p className="text-base font-semibold text-gray-700 mb-3">Conquered Together</p>
      <div className="space-y-2">
        {TROPHIES.map((t) => (
          <div
            key={t.title}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"
          >
            <div className="bg-amber-100 rounded-full p-2.5 flex-shrink-0">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t.title}</p>
            </div>
            <span className="text-xs text-amethyst-500 font-semibold uppercase tracking-widest">
              Completed
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

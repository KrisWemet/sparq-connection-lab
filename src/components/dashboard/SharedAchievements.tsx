import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  {
    title: "First Day Together",
    subtitle: "You both showed up on Day 1",
    when: "1 week ago",
  },
  {
    title: "7 Day Streak",
    subtitle: "A week of consistent practice",
    when: "Growing",
  },
  {
    title: "First Reflection Shared",
    subtitle: "You opened up to each other",
    when: "2 weeks ago",
  },
];

export function SharedAchievements() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
        Shared Achievements
      </p>
      <div className="space-y-2">
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-amethyst-100 flex items-center justify-center flex-shrink-0">
              <Trophy size={18} className="text-amethyst-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{a.subtitle}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{a.when}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

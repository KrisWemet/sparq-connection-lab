import { CheckCircle, Lock, Star } from "lucide-react";
import { motion } from "framer-motion";

const CHALLENGES = [
  { label: "Deep Listening", status: "completed" },
  { label: "Gratitude Week", status: "completed" },
  { label: "Morning Rituals", status: "completed" },
  { label: "Reflection Week", status: "current" },
  { label: "Love Notes", status: "upcoming" },
  { label: "Mindful Touch", status: "upcoming" },
  { label: "Shared Vision", status: "upcoming" },
  { label: "Date Night", status: "upcoming" },
  { label: "Future Letter", status: "upcoming" },
];

export function QuestMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-gray-900">Quest Map</p>
        <button className="text-amethyst-500 text-sm">View All</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CHALLENGES.map((c, idx) => {
          const isCompleted = c.status === "completed";
          const isCurrent = c.status === "current";
          const isUpcoming = c.status === "upcoming";

          return (
            <div
              key={idx}
              className={[
                "rounded-xl p-3 flex flex-col items-center text-center",
                isCompleted
                  ? "bg-amethyst-100"
                  : isCurrent
                    ? "bg-amethyst-600 ring-2 ring-amethyst-400 ring-offset-2"
                    : "bg-gray-100",
              ].join(" ")}
            >
              {isCompleted ? (
                <CheckCircle size={20} className="text-amethyst-600 mb-1" />
              ) : isCurrent ? (
                <Star size={20} className="text-white mb-1" fill="currentColor" />
              ) : (
                <Lock size={20} className="text-gray-300 mb-1" />
              )}
              <p
                className={[
                  "text-[10px] leading-tight font-medium",
                  isCompleted
                    ? "text-amethyst-600"
                    : isCurrent
                      ? "text-white font-bold"
                      : "text-gray-400",
                ].join(" ")}
              >
                {c.label}
              </p>
              {isCompleted && (
                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-widest">
                  Done
                </p>
              )}
              {isCurrent && (
                <p className="text-[9px] text-amethyst-200 mt-0.5 uppercase tracking-widest">
                  Active
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

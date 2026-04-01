import { motion } from "framer-motion";

interface Props {
  streakCount: number;
}

export function ActiveChallengeCard({ streakCount }: Props) {
  if (streakCount < 3) return null;

  const filled = 4;
  const total = 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-gradient-to-br from-amethyst-600 to-amethyst-700 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">
          New {filled}/{total}
        </span>
      </div>
      <h3 className="text-white font-bold text-xl mb-1">7 Days of Gratitude</h3>
      <p className="text-amethyst-200 text-sm mb-4">Building appreciation habits</p>

      {/* Avatars */}
      <div className="flex -space-x-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center ring-2 ring-amethyst-600 z-10">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-amethyst-600">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={[
              "w-2.5 h-2.5 rounded-full",
              i < filled ? "bg-gold-400" : "bg-white/20",
            ].join(" ")}
          />
        ))}
      </div>
    </motion.div>
  );
}

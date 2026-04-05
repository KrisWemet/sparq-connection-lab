import { motion } from "framer-motion";

interface Props {
  streakCount: number;
}

export function ActiveChallengeCard({ streakCount }: Props) {
  const filled = 4;
  const total = 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl p-5"
      style={{ background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FCD34D" }}>
          Active Challenge
        </span>
        <span
          className="text-xs font-bold rounded-full px-2.5 py-0.5"
          style={{ background: "rgba(255,255,255,0.15)", color: "#FCD34D" }}
        >
          {filled}/{total} days
        </span>
      </div>

      <h3 className="text-white font-bold text-xl mb-1">7 Days of Gratitude</h3>
      <p className="text-sm mb-4" style={{ color: "#C4B5FD" }}>Building appreciation habits together</p>

      <div className="flex -space-x-2 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.25)", outline: "2px solid rgba(255,255,255,0.3)" }}
        >
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.18)", outline: "2px solid rgba(255,255,255,0.3)" }}
        >
          <span className="text-white text-xs font-bold">S</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ background: i < filled ? "#FCD34D" : "rgba(255,255,255,0.2)" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

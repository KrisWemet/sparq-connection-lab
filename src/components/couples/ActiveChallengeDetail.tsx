import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export function ActiveChallengeDetail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Active Challenge
        </span>
        <span className="bg-gold-100 text-gold-500 text-xs font-bold rounded-full px-2.5 py-0.5">
          NEW 4/7
        </span>
      </div>

      <h2 className="text-gray-900 font-bold text-xl">7 Days of Gratitude</h2>

      <div className="flex items-center gap-3 mt-3">
        <div className="w-10 h-10 rounded-full bg-amethyst-100 flex items-center justify-center flex-shrink-0">
          <Heart size={18} className="text-amethyst-600" />
        </div>
        <div>
          <p className="text-gray-700 font-medium text-sm">Today&apos;s Step: Written Notes</p>
          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
            Write a short note of genuine appreciation for your partner and leave it somewhere
            they&apos;ll find it today.
          </p>
        </div>
      </div>

      <button className="mt-5 w-full bg-amethyst-600 hover:bg-amethyst-700 text-white rounded-2xl py-3 font-semibold text-sm transition-colors">
        Complete Today&apos;s Task
      </button>
    </motion.div>
  );
}

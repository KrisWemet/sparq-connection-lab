import { motion } from "framer-motion";

const QUOTE =
  "The quality of your connection grows in the small moments you choose to be present.";

export function NurtureGrowthCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-amethyst-600 rounded-2xl p-5"
    >
      <span className="inline-block bg-gold-100 text-gold-500 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
        Alignment Goal
      </span>
      <p className="font-serif italic text-white text-base leading-relaxed">{QUOTE}</p>
    </motion.div>
  );
}

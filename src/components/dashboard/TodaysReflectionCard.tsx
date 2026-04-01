import { motion } from "framer-motion";

interface Props {
  question?: string;
  onPress: () => void;
}

const DEFAULT_QUESTION =
  "What is one thing your partner did recently that made you feel truly seen?";

export function TodaysReflectionCard({ question = DEFAULT_QUESTION, onPress }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl p-5"
      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)" }}
    >
      <span
        className="inline-block text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4"
        style={{ background: "#FEF3C7", color: "#D97706" }}
      >
        Today&apos;s Reflection
      </span>
      <p className="font-serif italic text-white text-lg leading-snug mb-5">{question}</p>
      <button
        onClick={onPress}
        className="w-full font-semibold rounded-xl py-3 text-sm transition-colors"
        style={{ background: "rgba(255,255,255,0.95)", color: "#7C3AED" }}
      >
        Share your thought →
      </button>
    </motion.div>
  );
}

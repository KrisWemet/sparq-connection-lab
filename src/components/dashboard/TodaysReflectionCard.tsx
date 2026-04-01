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
      className="bg-amethyst-600 rounded-2xl p-5"
    >
      <span className="inline-block bg-gold-100 text-gold-500 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
        Today&apos;s Reflection
      </span>
      <p className="font-serif italic text-white text-lg leading-snug mb-5">{question}</p>
      <button
        onClick={onPress}
        className="w-full bg-white text-amethyst-600 font-semibold rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
      >
        Share your thought →
      </button>
    </motion.div>
  );
}

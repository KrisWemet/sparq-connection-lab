import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MOODS = ["😔", "😕", "😐", "😊", "😁"];
const STORAGE_KEY = "sparq_daily_mood";

export function DailyPulseBar() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setSelected(parseInt(stored, 10));
  }, []);

  function handleSelect(idx: number) {
    setSelected(idx);
    localStorage.setItem(STORAGE_KEY, String(idx));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
        Daily Pulse
      </p>
      <div className="flex justify-between">
        {MOODS.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={[
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all",
              selected === idx
                ? "bg-amethyst-100 ring-2 ring-amethyst-300 scale-110"
                : "hover:bg-gray-100",
            ].join(" ")}
            aria-label={`Mood ${idx + 1}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MOODS = [
  { emoji: "😔", label: "Rough" },
  { emoji: "😕", label: "Meh" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😊", label: "Good" },
  { emoji: "😁", label: "Great" },
];
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
      className="bg-white rounded-2xl p-4"
      style={{ border: "1px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#9CA3AF" }}>
        How are you feeling today?
      </p>
      <div className="flex justify-between gap-1">
        {MOODS.map((mood, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all"
            style={
              selected === idx
                ? { background: "#EDE9FE", outline: "2px solid #A78BFA" }
                : { background: "transparent" }
            }
            aria-label={mood.label}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span
              className="text-[10px] font-medium"
              style={{ color: selected === idx ? "#7C3AED" : "#9CA3AF" }}
            >
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

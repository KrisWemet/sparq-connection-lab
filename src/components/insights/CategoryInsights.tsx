import { motion } from "framer-motion";

const CATEGORIES = [
  { label: "Communication", pct: 78 },
  { label: "Intimacy", pct: 65 },
  { label: "Harmony", pct: 82 },
  { label: "Growth", pct: 71 },
];

export function CategoryInsights() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-900">Category Insights</p>
        <button className="text-amethyst-500 text-sm">View Report →</button>
      </div>
      <div className="space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                {cat.label}
              </span>
              <span className="text-sm font-semibold text-gray-700">{cat.pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                className="bg-amethyst-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${cat.pct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

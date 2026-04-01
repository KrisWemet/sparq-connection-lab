import { Trophy, Flame, Heart } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  { title: "First Day Together", subtitle: "You both showed up on Day 1", when: "1 week ago", icon: Heart, bg: "#FEF3C7", color: "#D97706" },
  { title: "7 Day Streak", subtitle: "A week of consistent practice", when: "Growing 🔥", icon: Flame, bg: "#EDE9FE", color: "#7C3AED" },
  { title: "First Reflection Shared", subtitle: "You opened up to each other", when: "2 weeks ago", icon: Trophy, bg: "#D1FAE5", color: "#059669" },
];

export function SharedAchievements() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#9CA3AF" }}>
        Shared Achievements
      </p>
      <div className="space-y-2">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.title}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "#fff", border: "1px solid #F3F4F6", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
                <Icon size={18} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#111827" }}>{a.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>{a.subtitle}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: "#9CA3AF" }}>{a.when}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

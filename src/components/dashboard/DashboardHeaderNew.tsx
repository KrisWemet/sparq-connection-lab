import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  firstName: string;
  partnerName?: string;
  streakCount: number;
}

export function DashboardHeaderNew({ firstName, partnerName, streakCount }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-between"
    >
      <div>
        <p className="text-sm" style={{ color: "#6B7280" }}>{greeting}</p>
        <p className="font-bold text-2xl tracking-tight" style={{ color: "#111827" }}>
          {firstName}
          {partnerName && (
            <> &amp; <span style={{ color: "#7C3AED" }}>{partnerName}</span></>
          )}
        </p>
      </div>
      {streakCount > 0 && (
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "#EDE9FE", color: "#6D28D9" }}
        >
          <Flame size={14} style={{ color: "#F59E0B" }} />
          <span className="text-xs font-bold">{streakCount} Day Streak</span>
        </div>
      )}
    </motion.div>
  );
}

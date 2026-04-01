import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  firstName: string;
  partnerName?: string;
  streakCount: number;
}

export function DashboardHeaderNew({ firstName, partnerName, streakCount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-between"
    >
      <div>
        <p className="text-gray-500 text-sm">Good morning,</p>
        <p className="text-gray-900 font-bold text-2xl tracking-tight">
          {firstName}
          {partnerName && (
            <> &amp; <span className="text-amethyst-600">{partnerName}</span></>
          )}
        </p>
      </div>
      {streakCount > 0 && (
        <div className="flex items-center gap-1.5 bg-amethyst-100 text-amethyst-600 rounded-full px-3 py-1.5">
          <Flame size={14} className="text-amber-500" />
          <span className="text-xs font-bold">{streakCount} Day Streak</span>
        </div>
      )}
    </motion.div>
  );
}

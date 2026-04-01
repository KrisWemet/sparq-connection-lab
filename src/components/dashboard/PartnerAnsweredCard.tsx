import { motion } from "framer-motion";

interface Props {
  partnerName: string;
  onPress: () => void;
}

export function PartnerAnsweredCard({ partnerName, onPress }: Props) {
  const initials = partnerName[0]?.toUpperCase() ?? "?";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <button
        onClick={onPress}
        className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
        style={{
          background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
          border: "1px solid #DDD6FE",
          boxShadow: "0 1px 3px rgba(124,58,237,0.08)",
        }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: "#7C3AED", color: "#fff" }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: "#111827" }}>
            {partnerName} has answered ✨
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#7C3AED" }}>
            Tap to see their response →
          </p>
        </div>
      </button>
    </motion.div>
  );
}

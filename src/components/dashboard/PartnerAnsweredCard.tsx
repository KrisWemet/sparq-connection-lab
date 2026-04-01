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
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
      >
        <div className="w-10 h-10 rounded-full bg-amethyst-100 text-amethyst-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-gray-700 font-medium text-sm">{partnerName} has answered</p>
          <p className="text-amethyst-500 text-sm mt-0.5">Tap to see their response →</p>
        </div>
      </button>
    </motion.div>
  );
}

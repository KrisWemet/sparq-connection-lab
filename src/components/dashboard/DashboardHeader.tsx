
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

const getGreeting = () => {
  const hour = new Date().getHours();
  const emojis = ["✨", "🌟", "💫", "💖", "🌈", "🚀", "😊", "🎉"];
  const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
  
  if (hour < 12) return `Good morning ${randomEmoji()}`;
  if (hour < 17) return `Good afternoon ${randomEmoji()}`;
  return `Good evening ${randomEmoji()}`;
};

// Fun emoji pairs for partner references
const partnerEmojis = ["💕", "💘", "💞", "💓", "💗", "💖", "❤️", "🧡", "💛", "💚", "💙", "💜"];
const getPartnerEmoji = () => partnerEmojis[Math.floor(Math.random() * partnerEmojis.length)];

export function DashboardHeader() {
  const { user, profile } = useAuth();
  const greeting = getGreeting();
  const partnerEmoji = getPartnerEmoji();
  
  return (
    <header className="bg-gradient-to-r from-primary-100 via-white to-primary-100 border-b bg-[length:200%_100%] animate-gradient-x">
      <motion.div 
        className="container max-w-lg mx-auto px-4 py-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-2xl font-bold text-gray-900 mb-1"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {greeting}
        </motion.h1>
        <motion.p 
          className="text-gray-600 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <span className="font-medium">{profile?.fullName || user?.email?.split('@')[0] || 'Partner'}</span>
          {profile?.partnerName && (
            <span className="flex items-center">
              <motion.span 
                className="mx-1 text-red-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10, 
                  delay: 0.6 
                }}
              >
                {partnerEmoji}
              </motion.span>
              <span className="text-gray-600">{profile.partnerName}</span>
            </span>
          )}
        </motion.p>
      </motion.div>
    </header>
  );
}

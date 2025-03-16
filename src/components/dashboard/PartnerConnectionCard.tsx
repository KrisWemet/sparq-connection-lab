
import { motion } from "framer-motion";
import { Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function PartnerConnectionCard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const partnerEmojis = ["💕", "💘", "💞", "💓", "💗", "💖", "❤️", "🧡", "💛", "💚", "💙", "💜"];
  const getPartnerEmoji = () => partnerEmojis[Math.floor(Math.random() * partnerEmojis.length)];
  const partnerEmoji = getPartnerEmoji();
  
  if (!profile?.partnerName) {
    return (
      <div className="bg-gradient-to-r from-white to-pink-50 rounded-lg p-5 border shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="bg-pink-100 p-3 rounded-full">
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Connect with your partner</h3>
            <p className="text-sm text-gray-500">Invite them to join you on this exciting journey!</p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => navigate("/partner-invite")}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-sm"
          >
            <Gift className="mr-2 h-4 w-4" />
            Invite Partner
          </Button>
        </motion.div>
        
        {/* Decorative background elements */}
        <motion.div 
          className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-pink-100 opacity-40 z-0"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute right-10 -top-6 h-16 w-16 rounded-full bg-purple-100 opacity-30 z-0"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -10, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-5 border shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="bg-purple-100 p-3 rounded-full">
          <Heart className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h3 className="font-medium text-gray-800">
            Connected with {profile.partnerName} {partnerEmoji}
          </h3>
          <p className="text-sm text-gray-500">Check out your partner's profile</p>
        </div>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={() => navigate("/partner-profile")}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"
        >
          View Partner
        </Button>
      </motion.div>
      
      {/* Decorative background elements */}
      <motion.div 
        className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-purple-100 opacity-40 z-0"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute right-10 -top-6 h-16 w-16 rounded-full bg-indigo-100 opacity-30 z-0"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
    </div>
  );
}

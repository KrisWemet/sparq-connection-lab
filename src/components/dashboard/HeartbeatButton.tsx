import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export function HeartbeatButton() {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleHeartbeat = () => {
    if (isPulsing) return;

    setIsPulsing(true);
    
    // Haptic feedback if supported
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 100, 50]);
    }

    toast.success("Thinking of you sent.", {
      description: "A gentle nudge was delivered to your partner.",
      icon: <Heart className="text-brand-primary" fill="currentColor" size={16} />
    });

    setTimeout(() => {
      setIsPulsing(false);
    }, 1000);
  };

  return (
    <motion.button
      onClick={handleHeartbeat}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="w-full bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-brand-primary/10 rounded-3xl border border-brand-primary/20 shadow-sm p-5 flex items-center justify-center gap-3 relative overflow-hidden group"
    >
      {isPulsing && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 bg-brand-primary/20 rounded-full"
        />
      )}
      <motion.div
        animate={isPulsing ? { scale: [1, 1.2, 1, 1.2, 1] } : {}}
        transition={{ duration: 0.6 }}
      >
        <Heart 
          size={24} 
          className={`transition-colors ${isPulsing ? 'text-brand-primary fill-brand-primary' : 'text-brand-primary group-hover:fill-brand-primary/20'}`} 
        />
      </motion.div>
      <span className="font-serif text-lg font-medium text-brand-primary tracking-wide">
        Thinking of you
      </span>
    </motion.button>
  );
}

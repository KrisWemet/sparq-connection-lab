
import { motion } from "framer-motion";
import { emotionColors } from "@/lib/colorThemes";

const confettiVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02
    }
  }
};

const confettiPieceVariants = {
  hidden: { opacity: 0, y: 0, x: 0 },
  visible: (i: number) => ({
    opacity: [1, 0],
    y: [0, -100 - Math.random() * 100],
    x: [0, (Math.random() - 0.5) * 200],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 1 + Math.random(),
      ease: "easeOut",
      type: "keyframes"
    }
  })
};

interface ConfettiAnimationProps {
  show: boolean;
}

export function ConfettiAnimation({ show }: ConfettiAnimationProps) {
  if (!show) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-50"
      variants={confettiVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: "40%",
            left: "50%",
            backgroundColor: 
              i % 5 === 0 ? emotionColors.joy :
              i % 5 === 1 ? emotionColors.love :
              i % 5 === 2 ? emotionColors.calm :
              i % 5 === 3 ? emotionColors.growth :
              emotionColors.passion
          }}
          variants={confettiPieceVariants}
          custom={i}
        />
      ))}
    </motion.div>
  );
}

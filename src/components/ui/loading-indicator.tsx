
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LoadingIndicatorSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  className?: string;
  label?: string;
  color?: string;
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export function LoadingIndicator({ 
  size = 'md', 
  className, 
  label,
  color = 'currentColor'
}: LoadingIndicatorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        <motion.div
          className={cn("rounded-full border-2 border-t-transparent", sizeMap[size])}
          style={{ borderColor: `${color}40`, borderTopColor: 'transparent' }}
          animate={{ rotate: [0, 360] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear",
            type: "keyframes"
          }}
        />
        <motion.div
          className={cn("rounded-full border-2 border-l-transparent absolute inset-0", sizeMap[size])}
          style={{ borderColor: color, borderLeftColor: 'transparent', opacity: 0.8 }}
          animate={{ rotate: [0, -360] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear",
            type: "keyframes"
          }}
        />
      </div>
      {label && (
        <p className="mt-2 text-sm text-gray-500">{label}</p>
      )}
    </div>
  );
}

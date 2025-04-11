import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'fadeIn' | 'slideUp' | 'scale';
}

const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ children, className, variant = 'fadeIn', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[variant]}
        transition={{ duration: 0.2 }}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';

export function AnimatedList({
  children,
  variant = "fadeIn",
  staggerDelay = 0.1,
  duration = 0.5,
  className,
  ...props
}: Omit<AnimatedContainerProps, "delay"> & { staggerDelay?: number }) {
  return (
    <motion.div
      className={cn(className)}
      initial="initial"
      animate="animate"
      exit="initial"
      {...props}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={variants[variant]}
              transition={{ duration, delay: i * staggerDelay }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
} 
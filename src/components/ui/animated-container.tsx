import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const animatedContainerVariants = cva("", {
  variants: {
    variant: {
      fadeIn: "animate-fade-in",
      slideUp: "animate-slide-up",
      slideDown: "animate-slide-down",
      slideLeft: "animate-slide-left",
      slideRight: "animate-slide-right",
      pulse: "animate-pulse",
      bounce: "animate-bounce",
      spin: "animate-spin",
    },
    duration: {
      fast: "duration-200",
      normal: "duration-300",
      slow: "duration-500",
      slower: "duration-700",
    },
    delay: {
      none: "delay-0",
      short: "delay-100",
      medium: "delay-300",
      long: "delay-500",
    },
  },
  defaultVariants: {
    variant: "fadeIn",
    duration: "normal",
    delay: "none",
  },
})

export interface AnimatedContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedContainerVariants> {}

export const AnimatedContainer = React.forwardRef<
  HTMLDivElement,
  AnimatedContainerProps
>(({ className, variant, duration, delay, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(animatedContainerVariants({ variant, duration, delay }), className)}
    {...props}
  />
))

AnimatedContainer.displayName = "AnimatedContainer"

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
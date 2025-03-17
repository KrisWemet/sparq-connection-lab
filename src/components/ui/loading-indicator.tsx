
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingIndicator({ 
  size = "md", 
  label = "Loading...", 
  className 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", // Reduced from w-6 h-6 for lighter feel
    lg: "w-8 h-8"  // Reduced from w-10 h-10 for lighter feel
  };

  const inspirationalMessages = [
    "Building your connection...",
    "Almost there...",
    "Just a moment...",
    "Preparing your experience...",
    "Loading your journey..."
  ];

  // Choose a random inspirational message
  const randomMessage = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {label && <p className="text-sm text-gray-700 font-medium mt-1">{label}</p>} {/* Reduced mt-2 to mt-1 */}
      <p className="text-xs text-gray-500 mt-1 max-w-xs text-center">{randomMessage}</p> {/* Kept short */}
    </div>
  );
}

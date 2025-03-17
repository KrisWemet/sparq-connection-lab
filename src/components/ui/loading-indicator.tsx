
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
    sm: "w-4 h-4",
    md: "w-6 h-6", // Reduced from w-8 h-8 for lighter feel
    lg: "w-10 h-10" // Reduced from w-12 h-12 for lighter feel
  };

  const inspirationalMessages = [
    "Great relationships are built with patience and care.",
    "Taking time for your relationship shows how much you value it.",
    "The time you invest now will strengthen your connection.",
    "Building something meaningful takes time.",
    "Every moment spent here is an investment in your relationship."
  ];

  // Choose a random inspirational message
  const randomMessage = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {label && <p className="text-sm text-gray-700 font-medium mt-2">{label}</p>} {/* Reduced mt-3 to mt-2 */}
      <p className="text-xs text-gray-500 mt-1 max-w-xs text-center">{randomMessage}</p> {/* Reduced mt-2 to mt-1 */}
    </div>
  );
}


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
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  // Simplified to just one message, no random selection (faster)
  const message = "Just a moment...";

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {label && <p className="text-sm text-gray-700 font-medium mt-1">{label}</p>}
      {size !== "sm" && <p className="text-xs text-gray-500 mt-0.5">{message}</p>}
    </div>
  );
}

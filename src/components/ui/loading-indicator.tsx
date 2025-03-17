
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingIndicator({ 
  size = "md", 
  label, 
  className 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], "mx-auto mb-2")} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

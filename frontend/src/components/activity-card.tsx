
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Award, MessageCircle, HeartPulse } from "lucide-react";

interface ActivityCardProps {
  title: string;
  type: "quiz" | "question" | "game";
  description: string;
  progress?: number;
  locked?: boolean;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
  children?: React.ReactNode;
}

export function ActivityCard({ 
  title, 
  type, 
  description,
  progress,
  locked = false,
  className,
  onAction,
  actionLabel,
  children 
}: ActivityCardProps) {
  const getIcon = () => {
    switch (type) {
      case "quiz":
        return <Award className="h-5 w-5" />;
      case "question":
        return <MessageCircle className="h-5 w-5" />;
      case "game":
        return <HeartPulse className="h-5 w-5" />;
    }
  };

  return (
    <div 
      className={cn(
        "w-full rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
        type === "quiz" && "bg-secondary",
        type === "question" && "bg-primary-100",
        type === "game" && "bg-[#F0FFF4]",
        locked && "opacity-75",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white/80 text-primary">
          {getIcon()}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        {progress !== undefined && (
          <div className="bg-white/50 rounded-full h-2 w-16">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {children}
      
      {onAction && (
        <Button 
          variant={type === "quiz" ? "secondary" : "outline"} 
          className="w-full"
          onClick={onAction}
          disabled={locked}
        >
          {actionLabel || "Start Now"}
        </Button>
      )}
      
      {locked && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
          <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-primary shadow-sm">
            Coming Soon
          </span>
        </div>
      )}
    </div>
  );
}

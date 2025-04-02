import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PromoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  buttonText: string;
  buttonAction: () => void;
  badgeText?: string;
  themeClasses?: string; // For additional styling like background gradients if needed
  children?: React.ReactNode; // For custom content inside the card body
}

export const PromoCard: React.FC<PromoCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonAction,
  badgeText,
  themeClasses,
  children,
}) => {
  return (
    <Card className={cn("flex flex-col relative", themeClasses)}> {/* Added relative for badge positioning */}
      <CardHeader className="pb-4 flex-grow">
        {badgeText && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            {badgeText}
          </Badge>
        )}
        <div className="flex items-center gap-3 mb-1 pr-10"> {/* Added padding-right to avoid overlap with badge */}
          <span className="flex-shrink-0">{icon}</span> {/* Ensure icon doesn't shrink */}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      {children && <CardContent className="pt-0">{children}</CardContent>} {/* Render children if present, remove top padding */}
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={buttonAction}>
          {buttonText}
          <ArrowRight className="ml-auto h-4 w-4" /> {/* Use ml-auto to push arrow right */}
        </Button>
      </CardFooter>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function QuizLoadingState() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2"> {/* Reduced padding */}
        <CardTitle className="text-center">
          <Heart className="inline-block text-primary w-5 h-5 mr-2" /> {/* Reduced from w-6 h-6 */}
          Processing Your Results
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center pt-2"> {/* Reduced padding */}
        <LoadingIndicator size="sm" label="Analyzing your relationship..." />
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function QuizLoadingState() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          <Heart className="inline-block text-primary w-6 h-6 mr-2" />
          Processing Your Results
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <LoadingIndicator size="lg" label="Analyzing your relationship health..." />
      </CardContent>
    </Card>
  );
}

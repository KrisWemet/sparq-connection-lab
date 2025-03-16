
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuizResultsLoading() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          <Heart className="inline-block text-primary w-6 h-6 mr-2" />
          Processing Your Results
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Analyzing your relationship health...</p>
      </CardContent>
    </Card>
  );
}

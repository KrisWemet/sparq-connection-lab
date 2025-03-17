
import { Card, CardContent } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function QuizLoadingState() {
  return (
    <Card className="w-full">
      <CardContent className="text-center p-4"> {/* Simplified structure */}
        <LoadingIndicator size="sm" label="Analyzing results..." />
      </CardContent>
    </Card>
  );
}

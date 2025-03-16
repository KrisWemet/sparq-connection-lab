
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthScoreViewProps {
  relationshipScore: number | null;
  loadingScore: boolean;
  onStartHealthQuiz: () => void;
}

export function HealthScoreView({
  relationshipScore,
  loadingScore,
  onStartHealthQuiz
}: HealthScoreViewProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-medium">Relationship Health</h3>
      </div>
      
      {loadingScore ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {relationshipScore !== null ? (
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Your score</span>
                <span className="text-sm font-medium">{relationshipScore}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${relationshipScore}%` }}
                ></div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Take the relationship health quiz again to see if your relationship has improved!
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Take our scientifically-backed quiz to establish a baseline measurement of your relationship health.
              </p>
            </div>
          )}
          
          <Button 
            onClick={onStartHealthQuiz}
            className="w-full"
          >
            {relationshipScore !== null ? 'Retake Health Quiz' : 'Take Relationship Health Quiz'}
          </Button>
        </>
      )}
    </div>
  );
}

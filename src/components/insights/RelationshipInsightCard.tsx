
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RelationshipScoreProps {
  score?: number | null;
  label: string;
  color: string;
}

function RelationshipScore({ score, label, color }: RelationshipScoreProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        {score !== undefined && score !== null ? (
          <span className="text-xs font-medium">{score}%</span>
        ) : (
          <span className="text-xs font-medium">--</span>
        )}
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        {score !== undefined && score !== null ? (
          <div 
            className={`h-full rounded-full ${color}`} 
            style={{ width: `${score}%` }}
          ></div>
        ) : (
          <div className="h-full w-0"></div>
        )}
      </div>
    </div>
  );
}

export function RelationshipInsightCard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState({
    communication: null as number | null,
    intimacy: null as number | null,
    trust: null as number | null,
    conflict: null as number | null,
    overall: null as number | null
  });

  const handleClick = () => {
    navigate("/quiz");
  };

  return (
    <Card className="cursor-pointer" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Relationship Insights</h3>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {scores.overall !== null ? (
            <>
              <RelationshipScore score={scores.overall} label="Overall Health" color="bg-primary" />
              <div className="grid grid-cols-2 gap-2">
                <RelationshipScore score={scores.communication} label="Communication" color="bg-blue-400" />
                <RelationshipScore score={scores.intimacy} label="Intimacy" color="bg-pink-400" />
                <RelationshipScore score={scores.trust} label="Trust" color="bg-green-400" />
                <RelationshipScore score={scores.conflict} label="Conflict" color="bg-orange-400" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-2">
              <Heart className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                Take our relationship health quiz to discover your compatibility and areas for growth
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

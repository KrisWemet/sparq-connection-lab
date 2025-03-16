
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Heart, Trophy } from "lucide-react";

interface RelationshipProgressProps {
  level: "Bronze" | "Silver" | "Gold" | "Diamond";
  pointsEarned: number;
  pointsNeeded: number;
}

export function RelationshipProgress({ level, pointsEarned, pointsNeeded }: RelationshipProgressProps) {
  const progress = Math.min(Math.round((pointsEarned / pointsNeeded) * 100), 100);
  
  const levelColors = {
    Bronze: "from-amber-300 to-amber-500",
    Silver: "from-slate-300 to-slate-400",
    Gold: "from-yellow-300 to-amber-400",
    Diamond: "from-blue-300 to-indigo-500"
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg p-4 border shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full bg-gradient-to-r ${levelColors[level]} text-white`}>
            <Trophy className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-sm">Relationship Level: <span className="font-bold">{level}</span></h3>
        </div>
        <div className="text-xs text-gray-500">
          {pointsEarned}/{pointsNeeded} points
        </div>
      </div>
      
      <Progress value={progress} className="h-2 bg-gray-100" />
      
      <div className="mt-3 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {pointsNeeded - pointsEarned} more points until next level
        </p>
        <div className="flex items-center gap-1 text-xs font-medium text-primary">
          <Heart className="h-3 w-3" />
          <span>{progress}% Complete</span>
        </div>
      </div>
    </motion.div>
  );
}

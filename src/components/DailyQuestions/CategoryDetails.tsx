import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, Lightbulb, Target, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/lib/subscription-provider";
import questionCategories from "@/data/questionCategories";

interface CategoryDetailsProps {
  selectedCategory: string | null;
  handleStartCategory: () => void;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ selectedCategory, handleStartCategory }) => {
  const navigate = useNavigate();
  const { subscription, remainingMorningQuestions, remainingEveningQuestions } = useSubscription();

  // Get the selected category object
  const selectedCategoryObj = questionCategories.find(c => c.id === selectedCategory);

  if (!selectedCategoryObj) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-${selectedCategoryObj.color.split(' ')[0].replace('bg-', '')} to-muted rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-full ${selectedCategoryObj.color}`}>
          <selectedCategoryObj.icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold">
          {selectedCategoryObj.name}
        </h2>
      </div>

      <div className="space-y-4">
        <p className="text-foreground">
          {selectedCategoryObj.description}
        </p>

        <div className="bg-background/80 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Goal
            </h4>
            <p className="text-sm text-muted-foreground">{selectedCategoryObj.goal}</p>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Benefits
            </h4>
            <p className="text-sm text-muted-foreground">{selectedCategoryObj.benefits}</p>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              Based on
            </h4>
            <p className="text-sm text-muted-foreground">{selectedCategoryObj.theory}</p>
          </div>
        </div>

        {!selectedCategoryObj.isPremium && subscription.tier === "free" && (
          <div className="bg-background/80 rounded-lg p-4">
            <h4 className="font-medium mb-2">Available Questions</h4>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Morning:</span>
                </div>
                <Badge variant={remainingMorningQuestions > 0 ? "secondary" : "outline"}>
                  {remainingMorningQuestions}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Evening:</span>
                </div>
                <Badge variant={remainingEveningQuestions > 0 ? "secondary" : "outline"}>
                  {remainingEveningQuestions}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetails;
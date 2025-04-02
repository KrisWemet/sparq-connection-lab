import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription-provider";
import { Clock, Moon, Sun, Zap } from "lucide-react";
import questionCategories from "@/data/questionCategories";

interface CategoryListProps {
  selectedCategory: string | null;
  handleCategorySelect: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ selectedCategory, handleCategorySelect }) => {
  const navigate = useNavigate();
  const { subscription, remainingMorningQuestions, remainingEveningQuestions } = useSubscription();

  // Get the free categories (first 5)
  const freeCategories = questionCategories.filter(c => !c.isPremium);
  const premiumCategories = questionCategories.filter(c => c.isPremium);

  return (
    <>
      {subscription.tier === "free" && (
        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Today's Questions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Morning</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available:</span>
                <Badge variant={remainingMorningQuestions > 0 ? "secondary" : "outline"}>
                  {remainingMorningQuestions} left
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">Evening</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available:</span>
                <Badge variant={remainingEveningQuestions > 0 ? "secondary" : "outline"}>
                  {remainingEveningQuestions} left
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Free users get questions twice daily (morning & evening) to prevent overwhelm and encourage meaningful conversations.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/subscription")}
            className="w-full"
          >
            Upgrade for Unlimited Access
          </Button>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-medium mb-3">Free Categories</h3>
        <div className="grid grid-cols-1 gap-3">
          {freeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="flex items-center p-4 bg-background rounded-lg border hover:border-primary transition-colors text-left"
            >
              <div className={`p-2 rounded-full mr-3 ${category.color}`}>
                <category.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Premium Categories</h3>
          <Badge variant="outline" className="bg-muted">
            <Lock className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {premiumCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="flex items-center p-4 bg-background rounded-lg border opacity-75 hover:opacity-100 transition-opacity text-left"
            >
              <div className={`p-2 rounded-full mr-3 ${category.color}`}>
                <category.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{category.name}</h4>
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryList;

import { Award } from "lucide-react";

export function NoQuestionView() {
  return (
    <div className="bg-popover rounded-2xl p-6 shadow-sm text-center mb-6">
      <Award className="w-12 h-12 text-primary mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No Question Available
      </h2>
      <p className="text-muted-foreground">
        Check back later for your next relationship question!
      </p>
    </div>
  );
}

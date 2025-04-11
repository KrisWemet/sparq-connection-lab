
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletionViewProps {
  onViewResults: () => void;
}

export function CompletionView({ onViewResults }: CompletionViewProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-4">
      <Award className="w-12 h-12 text-primary mx-auto" />
      <h2 className="text-2xl font-semibold text-gray-900">
        Thanks for sharing!
      </h2>
      <p className="text-gray-600">
        We'll notify you when your partner responds.
      </p>
      <Button className="w-full" onClick={onViewResults}>
        See Results
      </Button>
    </div>
  );
}

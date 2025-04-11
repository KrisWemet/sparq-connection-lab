import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast'; // Assuming use-toast is correctly set up

interface AnswerInputProps {
  onSubmit: (answer: string) => Promise<void>; // Expecting an async submit function
  isLoading: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, isLoading }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission if wrapped in a form
    if (!answer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please share your thoughts before submitting.",
        variant: "destructive",
      });
      return;
    }

    // No need to set loading state here, parent component controls it via isLoading prop
    try {
      await onSubmit(answer);
      setAnswer(''); // Clear input on successful submission
      // Success toast is handled by the hook after submitAnswer resolves
    } catch (error) {
      // Error toast is handled by the hook if submitAnswer rejects
      console.error("Submission failed in AnswerInput:", error);
      // Optionally show a generic error here if the hook doesn't cover it
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <Textarea
        placeholder="Share your thoughts here... Be open and honest."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        className="mb-4 shadow-sm focus-visible:ring-primary focus-visible:ring-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Answer
          </>
        )}
      </Button>
    </form>
  );
};

export default AnswerInput;
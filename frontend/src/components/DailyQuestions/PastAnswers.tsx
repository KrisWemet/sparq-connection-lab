import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { ClipboardCopy, HistoryIcon, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Answer {
  questionId: string;
  questionText: string;
  answerText: string;
  answeredAt: string;
}

interface PastAnswersProps {
  answers: Answer[];
  isLoading: boolean;
  onFetchAnswers: () => void;
}

const PastAnswers: React.FC<PastAnswersProps> = ({ 
  answers, 
  isLoading,
  onFetchAnswers 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpen = () => {
    onFetchAnswers();
    setIsOpen(true);
  };

  const copyToClipboard = (question: string, answer: string) => {
    const textToCopy = `Question: ${question}\nMy Answer: ${answer}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Copied to clipboard", description: "You can now share your answer" }))
      .catch(() => toast({ title: "Failed to copy", description: "Please try again", variant: "destructive" }));
  };

  const shareAnswer = async (question: string, answer: string) => {
    const shareText = `Question: ${question}\nMy Answer: ${answer}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Daily Question Answer',
          text: shareText,
        });
        toast({ title: "Shared successfully" });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast({ title: "Couldn't share", description: "Please try copying instead", variant: "destructive" });
        }
      }
    } else {
      copyToClipboard(question, answer);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleOpen}
        >
          <HistoryIcon className="h-4 w-4" />
          <span>Past Answers</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Past Answers</DialogTitle>
          <DialogDescription>
            Review answers you've shared for daily questions.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] mt-4 rounded-md border p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse">Loading your answers...</div>
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>You haven't answered any questions yet.</p>
              <p className="text-sm mt-2">Your answers will appear here after you submit them.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div 
                  key={`${answer.questionId}-${index}`} 
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div>
                    <h3 className="font-medium">Question:</h3>
                    <p className="text-sm">{answer.questionText}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Your Answer:</h3>
                    <p className="text-sm whitespace-pre-wrap">{answer.answerText}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      {answer.answeredAt && formatDistanceToNow(new Date(answer.answeredAt), { addSuffix: true })}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(answer.questionText, answer.answerText)}
                        title="Copy to clipboard"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => shareAnswer(answer.questionText, answer.answerText)}
                        title="Share this answer"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PastAnswers; 
import React, { useState } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom';
// Removed duplicate import: import { useDailyQuestion } from '@/hooks/useDailyQuestion';
// Keep placeholder imports for now, they will be replaced by actual components
import QuestionDisplay from './QuestionDisplay';
import AnswerInput from './AnswerInput';
// import ReflectionView from './ReflectionView'; // Removed as per previous step
import ProgressIndicator from './ProgressIndicator';
import CategoryProgress from './CategoryProgress';
import CelebrationFeedback from './CelebrationFeedback';
import MiniChallengePrompt from './MiniChallengePrompt';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-provider'; // Import useAuth
import { Loader2, PauseCircle, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { useDailyQuestion } from '@/hooks/useDailyQuestion'; // Keep this one

// --- Placeholder Components (Defined outside DailyQuestionView) ---
// These will be replaced by actual component imports later
const PlaceholderComponent: React.FC<{ name: string; props?: any }> = ({ name, props }) => (
    <div className="border border-dashed border-muted-foreground p-4 my-2 rounded-md text-muted-foreground">
      Placeholder for: <strong>{name}</strong>
      {props && <pre className="text-xs mt-2 bg-muted p-2 rounded">{JSON.stringify(props, null, 2)}</pre>}
    </div>
  );

// Replace actual component imports with these placeholders for now
// Removed placeholder for QuestionDisplay as it's now imported
// --- End Placeholder Components ---

interface DailyQuestionViewProps {
  question: {
    id: string;
    text: string;
    level: string;
    miniChallenge?: string;
  };
  onSubmit: (answer: string) => void;
  onPause: () => void;
  isLoading?: boolean;
}

const DailyQuestionView: React.FC<DailyQuestionViewProps> = ({
  question,
  onSubmit,
  onPause,
  isLoading = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false); // State to track submission
  const { profile } = useAuth(); // Get profile for tier/partner status (placeholder)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !isLoading) {
      try {
        await onSubmit(answer.trim()); // Assuming onSubmit might be async
        setAnswer('');
        setSubmitted(true); // Set submitted to true on success
      } catch (error) {
        console.error("Error submitting answer:", error);
        // Optionally show an error toast to the user
      }
    }
  };

  // Placeholder logic for share button state
  const isPremiumTier = profile?.subscriptionTier === 'premium' || profile?.subscriptionTier === 'ultimate';
  const hasPartner = profile?.partnerId; // Assuming partnerId exists on profile
  const canShare = isPremiumTier && hasPartner;

  const handleShare = () => {
    // Placeholder action
    console.log("Sharing answer...");
    alert("Sharing functionality not yet implemented.");
  };

  const navigate = useNavigate();

  const handleDone = () => {
    setSubmitted(false);
    console.log("Done button clicked - redirecting to dashboard");
    navigate('/dashboard');
  };

  return (
    <AnimatedContainer>
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{question.text}</h2>
          {question.miniChallenge && (
            <p className="text-sm text-muted-foreground">{question.miniChallenge}</p>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full min-h-[150px] p-3 rounded-md border"
              disabled={isLoading}
            />
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPause} disabled={isLoading}>
                <PauseCircle className="mr-2 h-4 w-4" /> Pause
              </Button>
              <Button type="submit" disabled={!answer.trim() || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Answer
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <p className="font-semibold">Answer Submitted!</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="secondary"
                onClick={handleShare}
                disabled={!canShare || isLoading} // Disable based on tier/partner status
                title={!canShare ? "Sharing requires Premium/Ultimate tier and a connected partner" : "Share with partner"}
              >
                Share with Partner {!canShare && '(🔒)'}
              </Button>
              <Button onClick={handleDone} disabled={isLoading}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default DailyQuestionView;
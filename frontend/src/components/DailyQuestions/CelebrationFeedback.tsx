import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PartyPopper, Trophy, Star } from 'lucide-react'; // Icons for celebration
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti'; // Assuming react-confetti is installed
import { useWindowSize } from 'react-use'; // To get window dimensions for confetti

type Level = 'Light' | 'Medium' | 'Deep';

interface CelebrationFeedbackProps {
  type: 'level' | 'category';
  level?: Level; // Required if type is 'level'
  categoryName?: string; // Required if type is 'category'
  onDismiss: () => void; // Callback to hide the celebration
}

const CelebrationFeedback: React.FC<CelebrationFeedbackProps> = ({
  type,
  level,
  categoryName,
  onDismiss,
}) => {
  const { width, height } = useWindowSize(); // For confetti effect

  const title = type === 'level' ? `Level Complete: ${level}!` : `Category Complete: ${categoryName}!`;
  const message = type === 'level'
    ? `Great job finishing the ${level} questions! Ready for the next step?`
    : `Amazing! You've explored all the questions in the ${categoryName} category. What an achievement!`;
  const Icon = type === 'level' ? Star : Trophy;

  // Automatically dismiss after a few seconds? Or require button click? Let's require click.
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onDismiss();
  //   }, 5000); // Auto-dismiss after 5 seconds
  //   return () => clearTimeout(timer);
  // }, [onDismiss]);

  return (
    <>
      <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
      <Card className="mb-6 border-green-500 border-2 shadow-lg bg-gradient-to-br from-green-50 via-background to-background relative overflow-hidden">
        <CardContent className="p-6 text-center">
          <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-2xl font-bold text-green-700 mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={onDismiss} variant="default" size="lg">
             Continue
          </Button>
        </CardContent>
        {/* Optional decorative elements */}
        <Icon className="absolute -bottom-4 -right-4 w-16 h-16 text-green-500/20 transform rotate-12" />
        <Star className="absolute -top-3 -left-3 w-10 h-10 text-yellow-400/30 transform -rotate-12" />
      </Card>
    </>
  );
};

export default CelebrationFeedback;
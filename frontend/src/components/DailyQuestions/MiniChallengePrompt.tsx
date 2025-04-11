import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, X } from 'lucide-react'; // Icons for challenge and skip

interface MiniChallengePromptProps {
  challengeText: string;
  onAccept: () => void; // Placeholder for accepting the challenge
  onSkip: () => void; // Placeholder for skipping/dismissing
}

const MiniChallengePrompt: React.FC<MiniChallengePromptProps> = ({
  challengeText,
  onAccept,
  onSkip,
}) => {
  return (
    <Card className="mb-6 border-amber-500 border-2 shadow-lg bg-gradient-to-br from-amber-50 via-background to-background">
      <CardHeader className="flex flex-row items-center space-x-3 pb-3">
        <Zap className="w-6 h-6 text-amber-600" />
        <CardTitle className="text-amber-800">Mini-Challenge!</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-foreground">
          {challengeText}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-end space-x-3">
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground hover:text-foreground">
          <X className="mr-1 h-4 w-4" />
          Maybe Later
        </Button>
        <Button variant="default" size="sm" onClick={onAccept} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Zap className="mr-1 h-4 w-4" />
          Accept Challenge
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MiniChallengePrompt;
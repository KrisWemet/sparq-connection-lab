import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, HelpCircle, Brain } from 'lucide-react';
import { confidenceLabel } from '@/lib/product';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Trait {
  trait_key: string;
  inferred_value: string;
  confidence: number;
  effective_weight: number;
  user_feedback: string | null;
}

interface TraitCardProps {
  traits: Trait[];
  accessToken: string;
  onUpdated?: () => void;
}

const TRAIT_LABELS: Record<string, string> = {
  attachment_style: 'How you connect',
  love_language: 'What makes you feel loved',
  conflict_style: 'How you handle disagreements',
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  attachment_style: {
    anxious: 'You seek reassurance and closeness',
    avoidant: 'You value space to process',
    disorganized: 'You feel pulled in different directions',
    secure: 'You feel comfortable with closeness',
  },
  love_language: {
    words: 'Words of appreciation',
    acts: 'Thoughtful actions',
    gifts: 'Meaningful gestures',
    time: 'Quality time together',
    touch: 'Physical closeness',
  },
  conflict_style: {
    avoidant: 'You step back when things heat up',
    volatile: 'You express feelings intensely',
    validating: 'You make sure both sides are heard',
  },
};

export function TraitCard({ traits, accessToken, onUpdated }: TraitCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!traits || traits.length === 0) {
    return (
      <Card className="dark:bg-card dark:border-border">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 mx-auto text-brand-text-secondary mb-2" />
          <p className="text-sm text-brand-text-secondary dark:text-muted-foreground">
            Peter is still getting to know you. Complete a few daily sessions and your insights will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleFeedback = async (traitKey: string, feedback: 'yes' | 'not_really' | 'unsure') => {
    setLoading(traitKey);
    try {
      const res = await fetch('/api/profile/traits', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ trait_key: traitKey, feedback }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Thanks for the feedback!');
      onUpdated?.();
    } catch {
      toast.error('Could not save feedback');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="section-title">
        What Peter has learned about you
      </h3>
      {traits.map((trait) => {
        const label = TRAIT_LABELS[trait.trait_key] || trait.trait_key;
        const valueLabel =
          VALUE_LABELS[trait.trait_key]?.[trait.inferred_value] || trait.inferred_value;
        const confidence = confidenceLabel(trait.confidence);

        return (
          <motion.div
            key={trait.trait_key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="dark:bg-card dark:border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-white">{label}</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">{valueLabel}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      confidence === 'Likely'
                        ? 'text-success-emphasis border-success'
                        : confidence === 'Possible'
                        ? 'text-warning-emphasis border-warning'
                        : 'text-brand-text-secondary border-border'
                    }
                  >
                    {confidence}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-brand-text-secondary dark:text-muted-foreground mr-1">
                    Does this sound right?
                  </span>
                  <Button
                    size="sm"
                    variant={trait.user_feedback === 'yes' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    disabled={loading === trait.trait_key}
                    onClick={() => handleFeedback(trait.trait_key, 'yes')}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={trait.user_feedback === 'not_really' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    disabled={loading === trait.trait_key}
                    onClick={() => handleFeedback(trait.trait_key, 'not_really')}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Not really
                  </Button>
                  <Button
                    size="sm"
                    variant={trait.user_feedback === 'unsure' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    disabled={loading === trait.trait_key}
                    onClick={() => handleFeedback(trait.trait_key, 'unsure')}
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Unsure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

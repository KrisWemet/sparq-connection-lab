import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitPrimaryPathFeedback } from '@/lib/beta/primaryPath';

interface BetaFeedbackDialogProps {
  stage: string;
  context?: Record<string, unknown>;
  triggerClassName?: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

export function BetaFeedbackDialog({
  stage,
  context = {},
  triggerClassName,
  title = 'Send beta feedback',
  description = 'Tell us what felt clear, confusing, or broken on this step.',
  placeholder = 'What worked, what felt confusing, or what broke?',
}: BetaFeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!message.trim() || isSaving) return;
    setIsSaving(true);
    setError('');

    try {
      await submitPrimaryPathFeedback({
        stage,
        message: message.trim(),
        sentiment,
        context,
      });
      setSubmitted(true);
      setMessage('');
      setSentiment(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send feedback');
    } finally {
      setIsSaving(false);
    }
  }

  function resetDialog(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitted(false);
      setError('');
      setMessage('');
      setSentiment(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogTrigger asChild>
        <button
          className={triggerClassName || 'inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-hover'}
        >
          <MessageSquare size={16} />
          Beta feedback
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white border border-brand-primary/10">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="rounded-2xl bg-brand-linen border border-brand-primary/10 p-4 text-sm text-brand-espresso">
            Thanks. Your feedback was saved for the beta review.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-espresso">How did this step feel?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSentiment(value)}
                    className={`h-9 w-9 rounded-full border text-sm font-semibold transition-colors ${
                      sentiment === value
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={placeholder}
              className="min-h-[120px]"
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        )}

        <DialogFooter>
          {submitted ? (
            <Button type="button" onClick={() => resetDialog(false)}>
              Done
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSaving || !message.trim()}>
              <Send size={16} className="mr-2" />
              {isSaving ? 'Sending...' : 'Send feedback'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

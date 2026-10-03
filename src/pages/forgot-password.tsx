import { useState } from 'react';
import Link from 'next/link';
import { Loader, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthCardLayout } from '@/components/auth/AuthCardLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please type the email you use for Sparq.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Rate limits are the only error worth showing. Anything else gets the
      // same "check your email" note, so this page never reveals who has an account.
      if (resetError && resetError.status === 429) {
        setError('Too many tries in a row. Please wait a minute, then try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('We couldn’t reach Sparq just now. Please try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <AuthCardLayout
        title="Check your email"
        heading="Check your email"
        intro={`If there’s a Sparq account for ${email.trim()}, a link to make a new password is on its way. It can take a minute or two. Check your spam folder too.`}
      >
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="press text-sm font-semibold text-brand-hover hover:text-brand-espresso w-fit"
          >
            Use a different email
          </button>
          <Link href="/login" className="text-sm font-semibold text-brand-hover hover:text-brand-espresso w-fit">
            Back to sign in
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      title="Forgot your password"
      heading="Forgot your password?"
      intro="It happens. Type your email and we’ll send you a link to make a new one."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="p-3 bg-destructive-subtle border border-destructive rounded-md text-destructive-emphasis text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <div className="relative">
            <input
              type="email"
              id="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-ring focus:border-ring bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
              placeholder="Enter your email"
            />
            <div className="absolute left-3 top-2.5 text-brand-text-secondary">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="press w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition duration-200 flex items-center justify-center font-bold disabled:opacity-70"
        >
          {sending ? <Loader className="h-5 w-5 animate-spin" /> : 'Send me a link'}
        </button>
        <Link href="/login" className="block text-sm font-semibold text-brand-hover hover:text-brand-espresso w-fit">
          Back to sign in
        </Link>
      </form>
    </AuthCardLayout>
  );
}

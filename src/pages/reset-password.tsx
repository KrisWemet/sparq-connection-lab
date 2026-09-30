import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Loader, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthCardLayout } from '@/components/auth/AuthCardLayout';

type Stage = 'checking' | 'ready' | 'invalid' | 'done';

const MIN_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // The email link signs the user in with a short-lived recovery session.
  // supabase-js reads it from the URL on load and fires PASSWORD_RECOVERY.
  useEffect(() => {
    let settled = false;
    const markReady = () => { settled = true; setStage('ready'); };

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    if (/error=|error_code=/.test(hash + search)) {
      setStage('invalid');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        markReady();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    // If no session shows up, the link was old, used, or opened on another device.
    const timer = setTimeout(() => {
      if (!settled) setStage('invalid');
    }, 4000);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(`Your new password needs at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords don’t match yet.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(
          /different from the old/i.test(updateError.message)
            ? 'Please pick a password you haven’t used here before.'
            : 'That didn’t save. Please try again, or ask for a new link.',
        );
        return;
      }
      setStage('done');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      setError('We couldn’t reach Sparq just now. Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  if (stage === 'checking') {
    return (
      <AuthCardLayout title="New password" heading="One moment…" intro="Checking your link.">
        <div className="flex justify-center py-2">
          <Loader className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
      </AuthCardLayout>
    );
  }

  if (stage === 'invalid') {
    return (
      <AuthCardLayout
        title="Link expired"
        heading="This link has run out"
        intro="Reset links only work once, and only for a little while. No problem — you can get a fresh one."
      >
        <div className="flex flex-col gap-3">
          <Link
            href="/forgot-password"
            className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-hover transition duration-200 flex items-center justify-center font-bold"
          >
            Send me a new link
          </Link>
          <Link href="/login" className="text-sm font-semibold text-brand-hover hover:text-brand-espresso w-fit">
            Back to sign in
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  if (stage === 'done') {
    return (
      <AuthCardLayout
        title="Password saved"
        heading="You’re all set"
        intro="Your new password is saved. Taking you back in now…"
      >
        <div className="flex justify-center py-2">
          <Loader className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      title="New password"
      heading="Make a new password"
      intro="Pick something you’ll remember. You’ll use it the next time you sign in."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="new-password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-10 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
              placeholder="At least 8 characters"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Type it again</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirm-password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
              placeholder="Same password again"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition duration-200 flex items-center justify-center font-bold disabled:opacity-70"
        >
          {saving ? <Loader className="h-5 w-5 animate-spin" /> : 'Save my new password'}
        </button>
      </form>
    </AuthCardLayout>
  );
}

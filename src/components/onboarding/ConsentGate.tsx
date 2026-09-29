// src/components/onboarding/ConsentGate.tsx
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

interface ConsentGateProps {
  onAgree: () => void;
  onReviewTrust: () => void;
  isSaving: boolean;
  error: string;
}

export function ConsentGate({ onAgree, onReviewTrust, isSaving, error }: ConsentGateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 bg-brand-linen">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-[28px] p-7"
        style={{ backgroundColor: '#EFE7DC' }}
      >
        <div className="flex justify-center mb-4">
          <PeterAvatar mood="morning" size={72} />
        </div>

        <h1 className="text-center text-brand-text-primary text-2xl font-serif italic mb-3">
          Before we begin
        </h1>
        <p className="text-center text-brand-text-secondary text-sm leading-6 mb-5">
          Sparq uses AI to shape your daily practice from what you share, so you can grow first and bring that growth home.
        </p>

        <div
          className="rounded-2xl p-4 mb-5 text-sm space-y-2.5"
          style={{ backgroundColor: 'rgba(197,107,77,0.06)' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover">
            What you&apos;re agreeing to
          </p>
          <p className="text-brand-text-secondary leading-6">
            Peter uses what you share to make your daily support fit you better.
          </p>
          <p className="text-brand-text-secondary leading-6">
            What you share stays private unless you later choose a shared feature. Peter does not show your partner your exact words.
          </p>
          <p className="text-brand-text-secondary leading-6">
            You can turn this off or change memory settings in Trust Center.
          </p>
          <p className="text-brand-text-secondary leading-6">
            Sparq is coaching, not therapy or crisis care. Safety resources come first when needed.
          </p>
        </div>

        {error && (
          <p className="text-sm text-rose-600 mb-3 text-center">{error}</p>
        )}

        <button
          onClick={onAgree}
          disabled={isSaving}
          className="w-full rounded-2xl py-3.5 text-base font-semibold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#C56B4D' }}
        >
          {isSaving ? 'Saving...' : "I agree, let's start"}
        </button>
        <button
          onClick={onReviewTrust}
          className="mt-3 w-full rounded-2xl border-2 border-brand-primary/20 py-3 text-sm font-medium text-brand-text-secondary transition-colors hover:bg-brand-primary/5"
        >
          Review trust settings first
        </button>
      </motion.div>
    </div>
  );
}

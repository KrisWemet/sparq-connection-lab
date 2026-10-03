import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

/** Shared layout for the public Privacy and Terms pages. */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';
export const LEGAL_UPDATED = 'October 3, 2026';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 space-y-3">
      <h2 className="font-serif text-xl text-brand-espresso">{title}</h2>
      <div className="space-y-3 text-sm text-brand-espresso leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

export function ContactLine() {
  // Set NEXT_PUBLIC_SUPPORT_EMAIL before launch (docs/LAUNCH_CHECKLIST).
  if (!SUPPORT_EMAIL) return null;
  return (
    <p>
      Questions? Write to <a className="font-semibold text-brand-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
    </p>
  );
}

export function LegalPage({ eyebrow, title, intro, children }: {
  eyebrow: string; title: string; intro: ReactNode; children: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="min-h-dvh bg-brand-linen pb-16">
      <header className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} aria-label="Go back"
            className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center hover:bg-brand-primary/5 active:bg-brand-primary/10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-hover">{eyebrow}</span>
          <div className="w-10 h-10" aria-hidden="true" />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 space-y-5">
        <section className="space-y-2 px-1">
          <h1 className="font-serif text-3xl text-brand-espresso">{title}</h1>
          <p className="text-xs text-brand-text-secondary">Last updated {LEGAL_UPDATED}</p>
          <div className="text-sm text-brand-espresso leading-relaxed">{intro}</div>
        </section>
        {children}
        <p className="text-center text-xs text-brand-text-secondary pt-2">
          <Link href="/privacy" className="underline">Privacy</Link>
          {' · '}
          <Link href="/terms" className="underline">Terms</Link>
          {' · '}
          <Link href="/how-sparq-works" className="underline">How Sparq works</Link>
        </p>
      </main>
    </div>
  );
}

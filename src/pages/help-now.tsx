// "Need help now?" — region-aware crisis resources (Master PRD §4.2/§7).
// Locked decision: manual link only. THIS PAGE is the crisis strategy —
// always reachable, no auth, no scanning, no logging, calm tone.
// Region resolved server-side from the x-vercel-ip-country header.

import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getCrisisResources } from '@/lib/safety';

type Resource = {
  label: string;
  phone?: string;
  text?: string;
  website?: string;
};

interface HelpNowProps {
  resources: Resource[];
}

export const getServerSideProps: GetServerSideProps<HelpNowProps> = async ({ req }) => {
  const header = req.headers['x-vercel-ip-country'];
  const countryCode =
    typeof header === 'string' && header.length === 2 ? header.toUpperCase() : 'US';
  return { props: { resources: getCrisisResources(countryCode) } };
};

export default function HelpNowPage({ resources }: HelpNowProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-brand-linen">
      <main className="mx-auto max-w-lg px-5 py-10">
        <h1 className="font-serif text-2xl leading-snug text-brand-espresso mb-3">
          You deserve real support right now.
        </h1>
        <p className="text-sm leading-relaxed text-brand-taupe mb-7">
          Sparq is a place to practice, not a crisis service. If things feel heavy or
          unsafe, the people below are trained for exactly this — and reaching out is a
          strong move, not a weak one.
        </p>

        <div className="space-y-3 mb-8">
          {resources.map((r) => (
            <div
              key={r.label}
              className="rounded-2xl border border-brand-primary/10 bg-brand-parchment p-4"
            >
              <p className="text-sm font-semibold text-brand-espresso">{r.label}</p>
              <div className="mt-1.5 space-y-1 text-sm text-brand-taupe">
                {r.phone && (
                  <p>
                    Call{' '}
                    <a
                      className="font-medium text-brand-espresso underline"
                      href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}
                    >
                      {r.phone}
                    </a>
                  </p>
                )}
                {r.text && <p>{r.text}</p>}
                {r.website && (
                  <p>
                    <a
                      className="font-medium text-brand-espresso underline"
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.website.replace(/^https?:\/\//, '')}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-brand-taupe/80 mb-8">
          If there is immediate danger, contact your local emergency services first.
          For urgent safety, please talk to a person — not an app.
        </p>

        <button
          onClick={() => router.back()}
          className="w-full rounded-2xl border border-brand-primary/20 py-3 text-sm font-medium text-brand-espresso transition-colors hover:bg-brand-primary/10"
        >
          Go back
        </button>
      </main>
    </div>
  );
}

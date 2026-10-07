import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

/**
 * "How Sparq is designed to help you" — the plain-language disclosure the
 * constitution requires for design-level influence (v1.2 §5A Transparency,
 * §5C). Nothing Sparq does should depend on you not knowing it. Public page:
 * no account data is read here.
 */
const card = 'bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 space-y-3';
// Reading page: sections are separated by space and a hairline, not boxed in cards.
const section = 'space-y-3 border-t border-brand-primary/10 pt-8';
const item = 'text-sm text-brand-espresso leading-relaxed';

const DESIGNED: Array<[string, string]> = [
  ['Stories', 'Short stories show an idea instead of telling you what to do. You are free to decide a story isn’t you.'],
  ['Warm pictures and colours', 'Soft light and calm colours are there to help you slow down. Gold shows up when you grow; quieter colours when things are hard.'],
  ['Small steps', 'We make the next step small on purpose, so it is easy to try in real life.'],
  ['"When X happens, I’ll try Y"', 'Tying a step to a moment makes it easier to remember. You pick the moment.'],
  ['Your own words', 'We show you your own words back — who you want to become, and why it matters to you — at the moments they might help.'],
  ['Check-ins', 'A few days after you plan something, we ask how it went. If it didn’t happen, that’s information, not failure.'],
  ['One idea at a time', 'Sometimes we offer one idea for something to try. It is always tied to something you said matters, and you can change it or say not now.'],
  ['Next steps', 'When something gets easy for you, we may offer a next step. You can always stay where you are.'],
  ['Stories that fit you', 'Sometimes stories vary so Peter can learn what fits you. Anything he guesses about you is a guess you can see and correct on your Insight Profile.'],
  ['Honest questions', 'Peter may sometimes point out when what you did and what you said matters to you pulled apart. Once, kindly — and “that doesn’t fit me anymore” is always a good answer.'],
];

const NEVER: string[] = [
  'Choose where you are going. Who you want to become, and big choices like staying, leaving or forgiving, are always yours.',
  'Use made-up numbers, fake reviews, or "other couples" to push you.',
  'Use countdowns, fear of missing out, or "don’t lose your streak".',
  'Make you feel you owe Sparq or Peter anything.',
  'Pretend Peter has human feelings, like missing you.',
  'Show your partner anything you didn’t choose to share.',
  'Use hidden tricks. If something would only work because you didn’t know about it, we don’t do it.',
];

const SAY_NO: Array<[string, string]> = [
  ['"Not now"', 'on any idea or question.'],
  ['"Not why anymore"', 'on any reason you gave.'],
  ['"Let it go"', 'on anything you planned to try.'],
  ['"Not really"', 'on any guess Peter makes about you.'],
  ['Your settings', 'on your Insight Profile: how Peter talks with you, what happens on hard days, and whether you get ideas at all.'],
  ['Delete', 'everything in the Trust Center, any time.'],
];

export default function HowSparqWorksPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-brand-linen pb-28">
      <header className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} aria-label="Go back"
            className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center hover:bg-brand-primary/5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="bar-title">How Sparq works</span>
          <div className="w-10 h-10" aria-hidden="true" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-8">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-3">
            <PeterAvatar mood="afternoon" size={36} />
            <h1 className="font-serif text-2xl text-brand-espresso">How Sparq is designed to help you</h1>
          </div>
          <p className={item}>
            Sparq helps you find out who you want to become, why it matters to you, and how to practice being that
            person in your real life.
          </p>
          <p className={item}>
            <span className="font-semibold">You choose where you are going. Sparq helps with the way.</span> We
            design the app on purpose to make that easier. Here is how, in plain words.
          </p>
        </motion.section>

        <section className={section}>
          <h2 className="section-title">What we design on purpose</h2>
          <ul className="space-y-3">
            {DESIGNED.map(([title, body]) => (
              <li key={title}>
                <p className="text-sm font-semibold text-brand-espresso">{title}</p>
                <p className="text-sm text-brand-text-secondary leading-relaxed">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={section}>
          <h2 className="section-title">What Sparq never does</h2>
          <ul className="space-y-2 list-disc pl-5">
            {NEVER.map(line => <li key={line} className={item}>{line}</li>)}
          </ul>
        </section>

        <section className={section}>
          <h2 className="section-title">How to say no</h2>
          <ul className="space-y-2">
            {SAY_NO.map(([what, where]) => (
              <li key={what} className={item}><span className="font-semibold">{what}</span> {where}</li>
            ))}
          </ul>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            You can also ask Peter &ldquo;Why did you say that?&rdquo; any time. He will tell you honestly, including
            his guess and how unsure he is.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/insight-profile" className="rounded-full border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5">
              Your Insight Profile
            </Link>
            <Link href="/trust-center" className="rounded-full border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5">
              Trust Center
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

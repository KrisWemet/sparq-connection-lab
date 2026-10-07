import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  HeartHandshake,
  Languages,
  MessageCircleMore,
  PersonStanding,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function ConnectRow({
  href,
  title,
  purpose,
  moment,
  icon: Icon,
  delay,
}: {
  href: string;
  title: string;
  purpose: string;
  moment: string;
  icon: typeof MessageCircleMore;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <Link
        href={href}
        className="emotion-paper block bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5 transition-transform hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-connection-subtle text-connection-emphasis flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-brand-text-primary">{title}</h2>
              <ArrowRight className="w-4 h-4 text-brand-primary flex-shrink-0" />
            </div>
            <p className="text-sm text-brand-espresso leading-relaxed mt-2">{purpose}</p>
            <p className="text-xs text-brand-text-secondary leading-relaxed mt-2">{moment}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ConnectPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="emotion-page min-h-dvh bg-brand-linen pb-28">
        <header className="max-w-lg mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center transition-colors hover:bg-brand-primary/5"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="bar-title">Connect</span>
            <div className="w-10 h-10" aria-hidden="true" />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="emotion-opening relative overflow-hidden bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6"
          >
            <SceneAccent kind="bridge" className="-mt-3 mb-1 h-24 w-full" />
            <h1 className="font-serif italic text-2xl leading-snug text-brand-text-primary">
              Open the tool that fits the real moment you are about to have.
            </h1>
            <p className="text-sm text-brand-text-secondary leading-relaxed mt-3">
              Start solo if you need to. Add shared tools later. This page keeps the practical connection work together without turning it into another dashboard feed.
            </p>
          </motion.section>

          <ConnectRow
            href="/messages"
            title="Messages"
            icon={MessageCircleMore}
            purpose="Practice a calmer opener before you say it out loud."
            moment="Use this when you want help finding the next true sentence."
            delay={0.04}
          />
          <ConnectRow
            href="/go-connect"
            title="Go connect"
            icon={PersonStanding}
            purpose="Leave the app with one small real-world mission."
            moment="Use this when the right next move is to put the phone down and show up."
            delay={0.08}
          />
          <ConnectRow
            href="/translator"
            title="Translator"
            icon={Languages}
            purpose="Soften a tense draft before it lands harder than you mean."
            moment="Use this when you need a kinder version of what you want to say."
            delay={0.12}
          />
          <ConnectRow
            href="/join-partner"
            title="Join partner"
            icon={HeartHandshake}
            purpose="Add shared prompts later without losing your solo practice."
            moment="Use this when you want to bring a partner into the same space."
            delay={0.16}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}

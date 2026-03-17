import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { MetaphorAnimation } from '../components/MetaphorAnimation';
import { useState } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showMetaphor, setShowMetaphor] = useState(false);

  // Redirect logged-in users straight to dashboard
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);
  const [currentMetaphor, setCurrentMetaphor] = useState<'bridge' | 'flower' | 'river'>('bridge');

  const handleShowMetaphor = (type: 'bridge' | 'flower' | 'river') => {
    setCurrentMetaphor(type);
    setShowMetaphor(true);
  };

  return (
    <div className="min-h-screen bg-brand-linen font-sans selection:bg-brand-primary/30">
      {showMetaphor && (
        <MetaphorAnimation
          title={currentMetaphor === 'bridge' ? 'Building Connection' : currentMetaphor === 'flower' ? 'Nurturing Growth' : 'Flowing Together'}
          description={currentMetaphor === 'bridge' ? 'Watch your communication bridge grow stronger' : currentMetaphor === 'flower' ? 'See your intimacy bloom' : 'Navigate challenges like water'}
          metaphorType={currentMetaphor}
          onComplete={() => setShowMetaphor(false)}
        />
      )}

      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-primary" />
            Sparq
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <span className="text-sm font-medium text-zinc-600 hover:text-black transition-colors cursor-pointer px-2">
                Sign In
              </span>
            </Link>
            <Link href="/signup">
              <span className="px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-hover transition-colors cursor-pointer text-sm shadow-sm">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28">
        {/* Hero Section */}
        <section className="relative pb-40 pt-32 px-4 overflow-hidden">
          {/* Background Texture & Orbs */}
          <div className="absolute inset-0 texture-bg mix-blend-multiply opacity-50 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-sand/60 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-serif text-zinc-900 mb-6 tracking-tight leading-tight">
              Finally, a <span className="text-brand-primary italic">shared language</span> for your relationship.
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Move past surface-level arguments and quiet disconnects. Sparq gently guides you both toward true understanding, using proven psychology that feels like a shared daily ritual, not a chore.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <span className="px-8 py-4 bg-zinc-900 text-white rounded-full hover:bg-black transition-colors font-medium shadow-xl shadow-zinc-900/20 text-base cursor-pointer inline-block">
                  Start Your Journey
                </span>
              </Link>
              <button
                onClick={() => handleShowMetaphor('bridge')}
                className="px-8 py-4 bg-white/60 backdrop-blur-md text-zinc-800 border border-zinc-200/50 rounded-full hover:bg-white/80 transition-colors shadow-sm text-base font-medium inline-block"
              >
                Experience a Demo
              </button>
            </div>
            <p className="mt-8 text-sm text-zinc-400 font-medium tracking-wide uppercase">
              No judgment. No pressure. Just you and your partner.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-serif text-black mb-4 tracking-tight">How Sparq Guides You</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                Our science-backed approach blends clinical psychology with an elegant methodology to create lasting, identity-level shifts in your relationship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className="bg-brand-linen p-8 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                onClick={() => handleShowMetaphor('bridge')}
              >
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <span className="text-brand-primary font-bold text-lg">1</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 tracking-tight">
                  Break the loop
                </h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Stop having the same argument. Learn to truly hear your partner and express your own needs without triggering defensiveness.
                </p>
                <p className="font-semibold text-brand-primary group-hover:text-brand-hover transition-colors">
                  Experience Bridge <span aria-hidden="true">&rarr;</span>
                </p>
              </div>

              <div
                className="bg-brand-linen p-8 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                onClick={() => handleShowMetaphor('flower')}
              >
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <span className="text-brand-primary font-bold text-lg">2</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 tracking-tight">
                  Reignite the spark, gently
                </h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Intimacy isn&apos;t built in grand gestures, but in consistent, safe micro-moments. Discover how to nurture closeness at your own pace.
                </p>
                <p className="font-semibold text-brand-primary group-hover:text-brand-hover transition-colors">
                  Experience Bloom <span aria-hidden="true">&rarr;</span>
                </p>
              </div>

              <div
                className="bg-brand-linen p-8 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                onClick={() => handleShowMetaphor('river')}
              >
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <span className="text-brand-primary font-bold text-lg">3</span>
                </div>
                <h3 className="text-xl font-bold text-black mb-3 tracking-tight">
                  Navigate conflict together
                </h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Disagreements are natural. Learn to use tension as a tool for deeper understanding rather than a reason to pull away.
                </p>
                <p className="font-semibold text-brand-primary group-hover:text-brand-hover transition-colors">
                  Experience Flow <span aria-hidden="true">&rarr;</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-brand-linen">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-black mb-4 tracking-tight">What Couples Say</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                Results from those who have engaged with the Sparq methodology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 border-t-4 border-t-brand-primary/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold mr-4">J&M</div>
                  <div>
                    <h3 className="font-semibold text-black leading-tight">John & Maria</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Together 5 years</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  &quot;Before Sparq, we were talking but not communicating. Now we truly understand each other, and our connection is deeper than ever before.&quot;
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 border-t-4 border-t-brand-primary/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold mr-4">S&K</div>
                  <div>
                    <h3 className="font-semibold text-black leading-tight">Sarah & Kevin</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Together 3 years</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  &quot;The objective mirroring of our blind spots completely changed how we view our relationship. We now have a shared language for tension.&quot;
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 border-t-4 border-t-brand-primary/40">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold mr-4">L&D</div>
                  <div>
                    <h3 className="font-semibold text-black leading-tight">Lisa & David</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Together 10 years</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  &quot;After years of feeling stuck, the structural pacing helped us regulate. We&apos;re finally addressing the core patterns instead of the surface symptoms.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white border-y border-zinc-100">
          <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-black mb-6 tracking-tight">Begin Your Experience</h2>
            <p className="text-lg text-zinc-500 mb-10 max-w-lg mx-auto leading-relaxed">
              Step into a structured environment designed for deep communication and meaningful insight.
            </p>
            <Link href="/login">
              <span className="px-10 py-4 bg-brand-primary text-white rounded-full hover:bg-brand-hover transition-colors font-medium shadow-xl shadow-brand-primary/20 text-base inline-block cursor-pointer">
                Create Account
              </span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white text-zinc-500 border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold text-black mb-1 tracking-tight">Sparq</h2>
              <p className="text-sm">Identity-level change through clinical design.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-500">
              <Link href="/about">
                <span className="hover:text-black transition-colors cursor-pointer">About</span>
              </Link>
              <Link href="/privacy">
                <span className="hover:text-black transition-colors cursor-pointer">Privacy</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-black transition-colors cursor-pointer">Terms</span>
              </Link>
            </div>
          </div>
          <div className="mt-12 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Sparq Connection Lab
          </div>
        </div>
      </footer>
    </div>
  );
}

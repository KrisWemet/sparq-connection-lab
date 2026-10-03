import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { SparqLogo } from '@/components/brand/SparqMark';
import { MetaphorAnimation } from '@/components/MetaphorAnimation';
import { MetaphorJourney } from '@/components/emotion/MetaphorJourney';
import { MetaphorVisual, type MetaphorKind } from '@/components/emotion/MetaphorVisual';
import { AmbientScene } from '@/components/emotion/EmotionalEnvironment';
import { emotionStyle } from '@/lib/visual-emotion';
import styles from '@/components/emotion/welcome.module.css';

export default function Home() {
  const [preview, setPreview] = useState<MetaphorKind | null>(null);
  // Keep the existing explicit sign-in choice for shared devices.
  return <div className={styles.welcome} style={emotionStyle('onboarding')}>
    <Head><title>Sparq — A little closer, every day</title><meta name="description" content="A private space for small daily practices, honest reflection, and a little more connection." /></Head>
    {preview && <MetaphorAnimation
      title={preview === 'bridge' ? 'Change the part you control' : preview === 'bloom' ? 'Practice closeness in small moments' : 'Bring a calmer self into conflict'}
      description={preview === 'bridge' ? 'Connection is built, one moment at a time.' : preview === 'bloom' ? 'What receives care can become something more.' : 'Different currents. Room to reconnect.'}
      metaphorType={preview === 'bloom' ? 'flower' : preview === 'flow' ? 'river' : 'bridge'}
      onComplete={() => setPreview(null)} />}
    <header className={styles.header}>
      <Link href="/" aria-label="Sparq home"><SparqLogo /></Link>
      <nav aria-label="Welcome navigation"><Link href="/login" className={styles.signIn}>Sign In</Link><Link href="/signup" className={styles.smallButton}>Get Started <ArrowUpRight size={14} aria-hidden="true" /></Link></nav>
    </header>
    <main>
      <section className={styles.hero}>
        <AmbientScene />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A private space to grow</p>
          <h1>Become a <em>steadier partner,</em> one small day at a time.</h1>
          <p className={styles.description}>Sparq starts with you. A little room to reflect. A calmer way to talk. Small moments that bring you closer to the person you want to be.</p>
          <div className={styles.actions}><Link href="/login" className={styles.primary}>Start Your Journey <ArrowUpRight size={17} aria-hidden="true" /></Link><a href="#the-sparq-world" className={styles.secondary}>Explore Sparq <ArrowDown size={16} aria-hidden="true" /></a></div>
          <p className={styles.reassurance}>At your pace. On your own, or together.</p>
        </div>
        <div className={styles.heroArt}><MetaphorVisual kind="bridge" /><p>A little space. A new connection.</p></div>
        <a href="#the-sparq-world" className={styles.scrollNote}><span aria-hidden="true" />There is room to begin here<ArrowDown size={13} aria-hidden="true" /></a>
      </section>
      <MetaphorJourney onExplore={setPreview} />
      <section className={styles.invitation}>
        <div className={styles.invitationArt}><MetaphorVisual kind="bloom" quiet paused /></div>
        <p className={styles.eyebrow}>Your next small step</p>
        <h2>You do not have to have<br /><em>it all figured out.</em></h2>
        <p>Start with your own daily practice. Invite your partner later if it helps.</p>
        <Link href="/signup" className={styles.primary}>Create Account <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </section>
    </main>
    <footer className={styles.footer}><div><SparqLogo /><p>A little closer to yourself. A little closer to each other.</p></div><nav aria-label="Footer"><a href="#the-sparq-world">How Sparq helps</a><Link href="/login">Sign In</Link><Link href="/signup">Create Account</Link></nav><small>© {new Date().getFullYear()} Sparq Connection</small></footer>
  </div>;
}

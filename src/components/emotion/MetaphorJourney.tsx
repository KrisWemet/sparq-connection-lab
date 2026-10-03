import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MetaphorVisual, type MetaphorKind } from './MetaphorVisual';
import { AmbientScene } from './EmotionalEnvironment';
import { emotionStyle } from '@/lib/visual-emotion';
import styles from './metaphor-journey.module.css';

const chapters: { kind: MetaphorKind; name: string; role: string; title: string; body: string; note: string }[] = [
  { kind: 'bridge', name: 'Bridge', role: 'Connection begins with you', title: 'Change the part you control',
    body: 'A little more listening. A more honest sentence. A pause before the same old reply. Small choices can open a new way toward each other.', note: 'Connection is built, one moment at a time.' },
  { kind: 'bloom', name: 'Bloom', role: 'Small moments, deeper roots', title: 'Practice closeness in small moments',
    body: 'A thank you. A question you have never asked. A moment of care with no need to fix anything. Give closeness a little room to grow.', note: 'What receives care can become something more.' },
  { kind: 'flow', name: 'Flow', role: 'Find your way back', title: 'Bring a calmer self into conflict',
    body: 'Fights happen. You can learn to pause, find your words, and try again. The aim is not a life without conflict. It is a way through it, together.', note: 'Different currents. Room to reconnect.' },
];

/** Native document scrolling: one atmosphere, three expressions, no scroll lock.
 * Intersection changes only at chapter boundaries, not on every scroll frame. */
export function MetaphorJourney({ onExplore }: { onExplore?: (kind: MetaphorKind) => void }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<MetaphorKind>('bridge');
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.getAttribute('data-chapter') as MetaphorKind);
      });
    }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });
    root.current.querySelectorAll('[data-chapter]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <section ref={root} id="the-sparq-world" className={styles.journey} data-active={active} style={emotionStyle('onboarding')} aria-label="Bridge, Bloom and Flow">
    <AmbientScene />
    <div className={styles.intro}>
      <p className={styles.eyebrow}>A little practice. A different kind of closeness.</p>
      <h2>Three ways to <em>come closer.</em></h2>
      <p>To yourself. To each other. To the life you want to build.</p>
    </div>
    <div className={styles.layout}>
      <div className={styles.chapters}>
        {chapters.map(chapter => <article key={chapter.kind} id={chapter.kind} data-chapter={chapter.kind} className={styles.chapter}>
          <div className={styles.mobileVisual}><MetaphorVisual kind={chapter.kind} /></div>
          <div className={styles.copy}>
            <p className={styles.eyebrow}><span className={styles.seed} />{chapter.name} <span className={styles.role}> / {chapter.role}</span></p>
            <h3>{chapter.title}</h3>
            <p className={styles.body}>{chapter.body}</p>
            <p className={styles.note}>{chapter.note}</p>
            {onExplore && <button type="button" onClick={() => onExplore(chapter.kind)} className={styles.explore}>Experience {chapter.name}<ArrowUpRight size={16} aria-hidden="true" /></button>}
          </div>
        </article>)}
      </div>
      <div aria-hidden="true" className={styles.stage}>
        {chapters.map(chapter => <div key={chapter.kind} className={styles.material} data-visible={active === chapter.kind}>
          <MetaphorVisual kind={chapter.kind} paused={active !== chapter.kind} />
        </div>)}
        <div className={styles.stageCaption}>{chapters.find(chapter => chapter.kind === active)?.note}</div>
      </div>
    </div>
    <div className={styles.tail} aria-hidden="true" />
  </section>;
}

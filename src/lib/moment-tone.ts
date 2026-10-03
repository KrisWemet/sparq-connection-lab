// moment-tone.ts — colour that follows the emotional moment (sparq-ui §3).
//   understand = plum (everyday: questions, learning, most screens)
//   connect    = coral (partner reveals, shared space, invites)
//   grow       = gold (insights, own discoveries, milestones, journey done)
//   repair     = quiet mauve (conflict first aid, hard moments — less colour)
// Contrast: text on every card tint ≥ 5:1; coral/gold buttons use dark-plum
// text (white on coral fails).

export type MomentTone = 'understand' | 'connect' | 'grow' | 'repair';

type ToneClasses = {
  /** Card surface + border (add your own radius/padding). */
  card: string;
  /** Small uppercase label / eyebrow text. */
  eyebrow: string;
  /** Icons and small accents. */
  icon: string;
  /** Filled button (add your own size/radius). */
  button: string;
  /** Quiet outline button. */
  outline: string;
  /** Inner panel inside a tone card. */
  inset: string;
};

export const TONE: Record<MomentTone, ToneClasses> = {
  understand: {
    card: 'bg-brand-parchment border border-brand-primary/10',
    eyebrow: 'text-brand-primary',
    icon: 'text-brand-primary',
    button: 'press bg-brand-primary text-white font-bold hover:bg-brand-hover',
    outline: 'border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5',
    inset: 'bg-brand-linen border border-brand-primary/10',
  },
  connect: {
    card: 'bg-brand-coral-soft border border-brand-coral/30',
    eyebrow: 'text-brand-coral-deep',
    icon: 'text-brand-coral-deep',
    button: 'press bg-brand-coral text-connection-foreground font-bold hover:brightness-95',
    outline: 'border border-brand-coral/50 text-brand-coral-deep hover:bg-brand-coral/10',
    inset: 'bg-popover/70 border border-brand-coral/20',
  },
  grow: {
    card: 'bg-brand-gold-soft border border-brand-gold/40',
    eyebrow: 'text-brand-gold-deep',
    icon: 'text-brand-gold-deep',
    button: 'press bg-brand-gold text-growth-foreground font-bold hover:brightness-95',
    outline: 'border border-brand-gold/60 text-brand-gold-deep hover:bg-brand-gold/10',
    inset: 'bg-popover/70 border border-brand-gold/30',
  },
  repair: {
    card: 'bg-brand-quiet border border-brand-border',
    eyebrow: 'text-brand-text-secondary',
    icon: 'text-brand-text-secondary',
    button: 'press bg-brand-mauve text-white font-bold hover:bg-brand-espresso',
    outline: 'border border-brand-border text-brand-espresso hover:bg-popover/60',
    inset: 'bg-popover/60 border border-brand-border',
  },
};

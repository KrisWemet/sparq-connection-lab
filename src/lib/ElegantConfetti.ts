import confetti from 'canvas-confetti';

export function fireElegantConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#C86A58', '#F4EFEB', '#8C827A']; // Brand colors: primary, sand, taupe

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 100,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      disableForReducedMotion: true,
      zIndex: 100,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// A single subtle burst
export function fireSubtleBurst() {
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#C86A58', '#FDF8F6', '#8C827A'],
    disableForReducedMotion: true,
    zIndex: 100,
  });
}

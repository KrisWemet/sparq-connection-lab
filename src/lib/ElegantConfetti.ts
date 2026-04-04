import confetti from 'canvas-confetti';

export function fireElegantConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#8B5CF6', '#F5F3FF', '#F9C74F']; // Brand colors: soft violet, lavender, butter gold

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
    colors: ['#8B5CF6', '#F5F3FF', '#F9C74F'],
    disableForReducedMotion: true,
    zIndex: 100,
  });
}

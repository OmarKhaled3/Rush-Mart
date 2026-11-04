'use client';

/**
 * Tiny synthesized chimes (no audio files to download). Browsers only allow audio after a user
 * gesture, so call `primeAlertSound()` from a tap (Place order, Start shift) before `playChime()`.
 */
let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
}

export function primeAlertSound(): void {
  const c = context();
  if (c && c.state === 'suspended') void c.resume();
}

export function isAlertSoundReady(): boolean {
  return ctx?.state === 'running';
}

const CHIMES = {
  ready: [659.25, 783.99, 1046.5], // E5 G5 C6, bright "ding ding ding"
  newOrder: [880, 1174.66], // A5 D6
  outside: [523.25, 523.25, 783.99], // C5 C5 G5, distinct from new order
} as const;

export function playChime(kind: keyof typeof CHIMES = 'ready'): void {
  const c = context();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  const start = c.currentTime + 0.02;
  CHIMES[kind].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t0 = start + i * 0.18;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.55);
  });
}

import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

// Tiny Web Audio API sound synthesizer — no external files needed
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  private beep(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  correct() {
    this.beep(523, 0.1);
    setTimeout(() => this.beep(659, 0.1), 100);
    setTimeout(() => this.beep(784, 0.2), 200);
  }

  wrong() {
    this.beep(200, 0.3, 'sawtooth', 0.2);
  }

  click() {
    this.beep(440, 0.05, 'sine', 0.15);
  }

  levelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this.beep(n, 0.15), i * 120));
  }

  coinDrop() {
    this.beep(880, 0.05, 'sine', 0.2);
    setTimeout(() => this.beep(1100, 0.08, 'sine', 0.15), 60);
  }

  timerTick() {
    this.beep(660, 0.03, 'square', 0.05);
  }

  /** Tier 2: card/session complete — brief cheerful chord */
  sessionComplete(isPerfect = false) {
    if (isPerfect) {
      // Perfect score — ascending fanfare
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((n, i) => setTimeout(() => this.beep(n, 0.18, 'sine', 0.25), i * 90));
    } else {
      // Normal completion — warm two-note chime
      this.beep(523, 0.12, 'sine', 0.22);
      setTimeout(() => this.beep(659, 0.18, 'sine', 0.2), 120);
    }
  }

  /** Tier 3: zone/category mastered — triumphant four-note fanfare */
  zoneMastered() {
    const notes = [392, 523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this.beep(n, 0.22, 'sine', 0.28), i * 100));
    // Gold shimmer tail
    setTimeout(() => this.beep(1568, 0.3, 'sine', 0.15), 550);
  }

  /** Tier 4: track milestone — epic multi-layer flourish */
  milestone() {
    // Rising bass octave
    this.beep(196, 0.15, 'triangle', 0.3);
    setTimeout(() => this.beep(392, 0.12, 'triangle', 0.25), 120);
    // Chord hit
    setTimeout(() => {
      this.beep(523, 0.3, 'sine', 0.3);
      this.beep(659, 0.3, 'sine', 0.25);
      this.beep(784, 0.3, 'sine', 0.2);
    }, 250);
    // Ascending sparkle run
    [1047, 1175, 1319, 1568].forEach((n, i) =>
      setTimeout(() => this.beep(n, 0.18, 'sine', 0.18), 580 + i * 80),
    );
    // Final triumphant note
    setTimeout(() => this.beep(2093, 0.5, 'sine', 0.15), 1000);
  }
}

export const sound = new SoundEngine();

export default function SoundController() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const initialized = useRef(false);

  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const unlock = () => {
        sound.click();
        document.removeEventListener('click', unlock);
      };
      document.addEventListener('click', unlock);
    }
  }, []);

  return null;
}

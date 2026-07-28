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

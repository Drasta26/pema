// Soft background hum for sessions. Every change in level is a smooth fade, so it never clicks or pops;
// pure sine tones through a gentle low-pass filter, so there is no hiss.
const FADE_IN = 2.5;   // seconds
const FADE_OUT = 1.2;  // seconds
const STEP = 1.5;      // seconds for breath-led swells

export class MeditationAudioEngine {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private volume: number = 0.12; // Safe default volume

  // Fades from the current level to a target, starting from where the sound is now (no jumps)
  private rampTo(target: number, seconds: number) {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const g = this.gainNode.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(Math.max(0, target), now + seconds);
  }

  public start() {
    try {
      if (this.ctx) {
        this.stopNow();
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      const now = this.ctx.currentTime;

      // Gentle low-pass keeps the tone warm and removes any edge
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(0.5, now);
      filter.connect(this.ctx.destination);

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.connect(filter);

      // Low foundational hum at 110Hz
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(110, now);
      this.osc1.connect(this.gainNode);

      // Quiet harmonic at 165Hz (a perfect fifth)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(165, now);
      const harmonicGain = this.ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.05, now);
      this.osc2.connect(harmonicGain);
      harmonicGain.connect(this.gainNode);

      this.osc1.start(now);
      this.osc2.start(now);
      this.rampTo(this.volume, FADE_IN);
    } catch (e) {
      console.warn("AudioContext not supported or blocked by security policies", e);
    }
  }

  public setBreathingVolume(phase: 'inhale' | 'hold' | 'exhale' | 'rest') {
    const level = { inhale: 1.4, hold: 1.15, exhale: 0.75, rest: 0.5 }[phase];
    this.rampTo(this.volume * level, STEP);
  }

  // Fades out, then releases the audio device
  public stop() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.rampTo(0, FADE_OUT);
    const osc1 = this.osc1, osc2 = this.osc2;
    this.osc1 = null;
    this.osc2 = null;
    this.gainNode = null;
    this.ctx = null;
    setTimeout(() => {
      try {
        osc1?.stop();
        osc2?.stop();
        if (ctx.state !== 'closed') ctx.close();
      } catch (e) {
        console.error(e);
      }
    }, FADE_OUT * 1000 + 100);
  }

  // Immediate release, used only before restarting
  private stopNow() {
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      if (this.ctx && this.ctx.state !== 'closed') this.ctx.close();
    } catch (e) {
      console.error(e);
    } finally {
      this.osc1 = null;
      this.osc2 = null;
      this.gainNode = null;
      this.ctx = null;
    }
  }

  public setVolume(level: number) {
    this.volume = Math.max(0, Math.min(0.5, level));
    this.rampTo(this.volume, 0.5);
  }
}

export class MeditationAudioEngine {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private volume: number = 0.15; // Safe default volume

  public start() {
    try {
      if (this.ctx) {
        this.stop();
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Low foundational hum at 110Hz (representing calm grounding)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.osc1.connect(this.gainNode);

      // Subtle harmonic drone at 165Hz (perfect fifth, representing open tranquility)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(165, this.ctx.currentTime);
      // Faded secondary wave
      const harmonicGain = this.ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      this.osc2.connect(harmonicGain);
      harmonicGain.connect(this.gainNode);

      this.osc1.start();
      this.osc2.start();
    } catch (e) {
      console.warn("AudioContext not supported or blocked by security policies", e);
    }
  }

  public setBreathingVolume(phase: 'inhale' | 'hold' | 'exhale' | 'rest') {
    if (!this.ctx || !this.gainNode) return;
    
    const now = this.ctx.currentTime;
    let targetVolume = this.volume;

    if (phase === 'inhale') {
      targetVolume = this.volume * 1.5; // Slight rising swell on inhale
    } else if (phase === 'exhale') {
      targetVolume = this.volume * 0.7;  // Soft soothing fading exhale
    } else if (phase === 'hold') {
      targetVolume = this.volume * 1.2;  // Centered peak tone
    } else {
      targetVolume = this.volume * 0.4;  // Whispering restful tone
    }

    // Smooth transition over 1.5 seconds to prevent crackling
    this.gainNode.gain.linearRampToValueAtTime(targetVolume, now + 1.5);
  }

  public stop() {
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
      }
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
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
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}

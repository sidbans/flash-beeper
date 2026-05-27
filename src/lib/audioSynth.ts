import type { SoundProfile } from './types';

/**
 * Web Audio API synthesizer.
 * Generates all sounds procedurally — no audio files required.
 */
export class AudioSynth {
  private _ctx: AudioContext | null = null;

  /** Lazily create AudioContext and resume if suspended (browser autoplay policy). */
  getCtx(): AudioContext {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      void this._ctx.resume();
    }
    return this._ctx;
  }

  /** Play a cue sound with the given profile. */
  playBeep(profile: SoundProfile = 'beep'): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    switch (profile) {
      case 'beep':  this._digitalBeep(ctx, now); break;
      case 'ping':  this._radarPing(ctx, now);   break;
      case 'synth': this._synthPop(ctx, now);    break;
      case 'click': this._sharpClick(ctx, now);  break;
    }
  }

  /** Play the finish arpeggio chord (C5-E5-G5-C6). */
  playFinish(): void {
    const ctx = this.getCtx();
    this._finishChord(ctx, ctx.currentTime);
  }

  // ── Sound profiles ───────────────────────────────────────────

  /** Sine sweep 880→1320→880 Hz, 0.18s */
  private _digitalBeep(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Sonar ping: 1500→600 Hz with delay/reverb tail */
  private _radarPing(ctx: AudioContext, now: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const rev = this._makeDelay(ctx, 0.14, 0.4);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.6);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(rev.input);
    rev.output.connect(ctx.destination);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  /** Two detuned sawtooth oscillators + lowpass filter sweep */
  private _synthPop(ctx: AudioContext, now: number): void {
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    filter.Q.setValueAtTime(6, now);

    [440, 443.5].forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 0.06);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(g);
      g.connect(filter);
      osc.start(now);
      osc.stop(now + 0.35);
    });

    masterGain.gain.setValueAtTime(0.7, now);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
  }

  /** White noise burst with bandpass filter at 3500 Hz */
  private _sharpClick(ctx: AudioContext, now: number): void {
    const bufSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.Q.setValueAtTime(0.8, now);

    source.buffer = buffer;
    gain.gain.setValueAtTime(1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  /** Rising arpeggio C5-E5-G5-C6 with vibrato and feedback delay */
  private _finishChord(ctx: AudioContext, now: number): void {
    const notes = [523.25, 659.25, 784.0, 1046.5]; // C5 E5 G5 C6
    const delay = this._makeDelay(ctx, 0.22, 0.35);
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.45, now);
    delay.output.connect(master);
    master.connect(ctx.destination);

    notes.forEach((freq, i) => {
      const t = now + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
      gain.gain.setValueAtTime(0.5, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

      // Vibrato via LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, t);
      lfoGain.gain.setValueAtTime(3, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(delay.input);
      gain.connect(master);

      lfo.start(t);
      osc.start(t);
      osc.stop(t + 1.6);
      lfo.stop(t + 1.6);
    });
  }

  /** Feedback delay helper — returns {input, output} nodes. */
  private _makeDelay(
    ctx: AudioContext,
    time: number,
    feedback: number,
  ): { input: GainNode; output: GainNode } {
    const delay = ctx.createDelay(2.0);
    const fb = ctx.createGain();
    const inputGain = ctx.createGain();
    const outputGain = ctx.createGain();

    delay.delayTime.setValueAtTime(time, ctx.currentTime);
    fb.gain.setValueAtTime(feedback, ctx.currentTime);
    inputGain.gain.setValueAtTime(0.5, ctx.currentTime);
    outputGain.gain.setValueAtTime(0.5, ctx.currentTime);

    inputGain.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(outputGain);

    return { input: inputGain, output: outputGain };
  }
}

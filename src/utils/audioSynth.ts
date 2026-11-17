/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound generator - Zero external audio file dependencies
class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: { stop: () => void; setVolume: (v: number) => void } | null = null;
  private currentTrack: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play subtle interface clicks / haptic audio feedback
  playUiSound(type: 'click' | 'open' | 'close' | 'minimize' | 'snap' | 'ding') {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'open') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
        gain.gain.setValueAtTime(0.05 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'close') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.07);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'minimize') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
        gain.gain.setValueAtTime(0.03 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'snap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.03);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'ding') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.05); // A5
        gain.gain.setValueAtTime(0.06 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext policy suppression gracefully handled
    }
  }

  // Procedural boot chime chord: rich harmonic progression
  playStartupChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Ambient chord notes: C4 (261.63), G4 (392.00), C5 (523.25), E5 (659.25), B5 (987.77)
      const chord = [
        { freq: 261.63, delay: 0.0, dur: 1.8, gain: 0.05 },
        { freq: 392.00, delay: 0.12, dur: 1.7, gain: 0.05 },
        { freq: 523.25, delay: 0.24, dur: 1.9, gain: 0.06 },
        { freq: 659.25, delay: 0.38, dur: 2.0, gain: 0.06 },
        { freq: 987.77, delay: 0.52, dur: 2.2, gain: 0.04 },
      ];

      chord.forEach(({ freq, delay, dur, gain: noteGain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gainNode.gain.setValueAtTime(0.0001, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(noteGain * this.volume, now + delay + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.05);
      });
    } catch {
      // AudioContext policy suppression gracefully handled
    }
  }

  // Procedural continuous ambient generator (Rain, Drone, White Noise)
  startAmbient(type: 'rain' | 'drone' | 'whitenoise' | 'lofi') {
    this.stopAmbient();
    const ctx = this.initCtx();
    if (!ctx) return;

    this.currentTrack = type;

    if (type === 'whitenoise' || type === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink/Brownian filter for gentle ambient noise
        if (type === 'rain') {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          output[i] = white * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 850 : 1200;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08 * this.volume, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      whiteNoise.start();

      this.ambientSource = {
        stop: () => {
          try {
            whiteNoise.stop();
            whiteNoise.disconnect();
          } catch {}
        },
        setVolume: (v: number) => {
          if (!this.isMuted) {
            masterGain.gain.setValueAtTime(0.08 * v, ctx.currentTime);
          }
        },
      };
    } else if (type === 'drone' || type === 'lofi') {
      // Harmonic deep chord drone
      const freqs = type === 'drone' ? [65.41, 98.0, 130.81, 196.0] : [110, 164.81, 220, 329.63];
      const oscs: OscillatorNode[] = [];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06 * this.volume, ctx.currentTime);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Slow subtle LFO detune
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + idx * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.05 / freqs.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc, lfo);
      });

      masterGain.connect(ctx.destination);

      this.ambientSource = {
        stop: () => {
          oscs.forEach((o) => {
            try {
              o.stop();
              o.disconnect();
            } catch {}
          });
        },
        setVolume: (v: number) => {
          if (!this.isMuted) {
            masterGain.gain.setValueAtTime(0.06 * v, ctx.currentTime);
          }
        },
      };
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource = null;
    }
    this.currentTrack = null;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientSource) {
      this.ambientSource.setVolume(this.volume);
    }
  }

  getVolume() {
    return this.volume;
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientSource) {
      this.ambientSource.setVolume(this.isMuted ? 0 : this.volume);
    }
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientSource) {
      this.ambientSource.setVolume(this.isMuted ? 0 : this.volume);
    }
    return this.isMuted;
  }

  getIsMuted() {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();

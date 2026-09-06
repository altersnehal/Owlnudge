/**
 * Owlnudge Web Audio Synthesizer
 * 1. Procedural Brown & Pink Noise generator.
 * 2. Procedural Mechanical "Tik-Tik" Clock / Metronome Sound Synthesizer.
 * Zero external audio downloads, 100% offline & client-side.
 */

class AudioService {
  constructor() {
    this.ctx = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isTickingEnabled = true;
    this.currentType = 'brown';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  generateNoiseBuffer(type = 'brown') {
    if (!this.ctx) this.init();
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds looping buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    return buffer;
  }

  start(type = 'brown', volume = 0.2) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.currentType = type;
    const buffer = this.generateNoiseBuffer(type);

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

    this.noiseNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    this.noiseNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  /**
   * Procedural Mechanical Tik-Tik Sound
   * Plays a crisp, subtle mechanical clock click every second.
   */
  playTick(isOdd = false, volume = 0.08) {
    if (!this.isTickingEnabled) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Alternate between high "tik" (1400Hz) and low "tok" (1000Hz)
      const freq = isOdd ? 1000 : 1400;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.025);

      // Low pass filter to remove harshness
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);

      // Fast, snappy decay envelope (25ms total duration)
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      // Ignore if user hasn't interacted yet
    }
  }

  setTickingEnabled(enabled) {
    this.isTickingEnabled = enabled;
  }
}

export const audioService = new AudioService();

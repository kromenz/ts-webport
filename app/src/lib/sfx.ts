/** Procedural sounds. No audio files: everything is generated with WebAudio. */

/** 25 ms noise burst through a bandpass (2200-3800 Hz, 1400 Hz when soft). */
export function makeClick(ctx: AudioContext, soft: boolean): void {
  const duration = 0.025;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = soft ? 1400 : 2200 + Math.random() * 1600;
  const gain = ctx.createGain();
  gain.gain.value = soft ? 0.12 : 0.2;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

/** Square-wave beep: 880 Hz for 90 ms, or 220 Hz for 220 ms on error. */
export function makeBeep(ctx: AudioContext, error: boolean): void {
  const duration = error ? 0.22 : 0.09;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = error ? 220 : 880;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Procedural Web Audio API sound synthesizer for cafe service chimes.
 * Works seamlessly in modern browsers without needing external audio files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant two-tone artisanal cafe service chime (crystal bell harmonic)
 */
export function playCafeOrderChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Helper to play a chime tone
    const playTone = (freq: number, startTime: number, duration: number, gainValue: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Add a subtle second harmonic for richer bell warmth
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(freq * 2, startTime);
      harmonicGain.gain.setValueAtTime(gainValue * 0.25, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      // Bell envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      harmonic.connect(harmonicGain);
      gain.connect(ctx.destination);
      harmonicGain.connect(ctx.destination);

      osc.start(startTime);
      harmonic.start(startTime);
      osc.stop(startTime + duration);
      harmonic.stop(startTime + duration);
    };

    // First bell: E5 (659.25 Hz)
    playTone(659.25, now, 0.8, 0.28);
    // Second bell: B5 (987.77 Hz) - 180ms later
    playTone(987.77, now + 0.18, 1.2, 0.22);
  } catch (err) {
    console.warn('Could not play cafe chime:', err);
  }
}

/**
 * Plays a bright upbeat ready chime when ticket is marked ready
 */
export function playOrderReadyChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(523.25, now, 0.4); // C5
    playTone(659.25, now + 0.12, 0.4); // E5
    playTone(783.99, now + 0.24, 0.7); // G5
  } catch (err) {
    console.warn('Could not play ready chime:', err);
  }
}

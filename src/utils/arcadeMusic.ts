import { isSoundEnabled } from './soundSettings';

type AudioContextConstructor = new () => AudioContext;

type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: AudioContextConstructor;
  };

type MusicNote = {
  frequency: number;
  offsetSeconds: number;
  durationSeconds: number;
  type: OscillatorType;
};

export type ResultsTune = 'winner' | 'tie';

type OneShotSoundController = {
  stop: () => void;
};

const LOOP_DURATION_SECONDS = 1.6;
const MUSIC_VOLUME = 0.035;
const MUSIC_NOTES: MusicNote[] = [
  {
    frequency: 523.25,
    offsetSeconds: 0,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 659.25,
    offsetSeconds: 0.2,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 783.99,
    offsetSeconds: 0.4,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 659.25,
    offsetSeconds: 0.6,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 587.33,
    offsetSeconds: 0.8,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 698.46,
    offsetSeconds: 1,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 783.99,
    offsetSeconds: 1.2,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 1046.5,
    offsetSeconds: 1.4,
    durationSeconds: 0.14,
    type: 'square',
  },
  {
    frequency: 130.81,
    offsetSeconds: 0,
    durationSeconds: 0.3,
    type: 'triangle',
  },
  {
    frequency: 174.61,
    offsetSeconds: 0.4,
    durationSeconds: 0.3,
    type: 'triangle',
  },
  {
    frequency: 146.83,
    offsetSeconds: 0.8,
    durationSeconds: 0.3,
    type: 'triangle',
  },
  {
    frequency: 196,
    offsetSeconds: 1.2,
    durationSeconds: 0.3,
    type: 'triangle',
  },
];
const RESULTS_TUNE_NOTES: Record<ResultsTune, MusicNote[]> = {
  winner: [
    {
      frequency: 523.25,
      offsetSeconds: 0,
      durationSeconds: 0.16,
      type: 'square',
    },
    {
      frequency: 659.25,
      offsetSeconds: 0.14,
      durationSeconds: 0.16,
      type: 'square',
    },
    {
      frequency: 783.99,
      offsetSeconds: 0.28,
      durationSeconds: 0.16,
      type: 'square',
    },
    {
      frequency: 1046.5,
      offsetSeconds: 0.46,
      durationSeconds: 0.38,
      type: 'square',
    },
    {
      frequency: 523.25,
      offsetSeconds: 0.46,
      durationSeconds: 0.38,
      type: 'triangle',
    },
    {
      frequency: 659.25,
      offsetSeconds: 0.46,
      durationSeconds: 0.38,
      type: 'triangle',
    },
  ],
  tie: [
    {
      frequency: 523.25,
      offsetSeconds: 0,
      durationSeconds: 0.2,
      type: 'triangle',
    },
    {
      frequency: 587.33,
      offsetSeconds: 0.18,
      durationSeconds: 0.2,
      type: 'triangle',
    },
    {
      frequency: 659.25,
      offsetSeconds: 0.36,
      durationSeconds: 0.2,
      type: 'triangle',
    },
    {
      frequency: 523.25,
      offsetSeconds: 0.62,
      durationSeconds: 0.34,
      type: 'triangle',
    },
    {
      frequency: 659.25,
      offsetSeconds: 0.62,
      durationSeconds: 0.34,
      type: 'triangle',
    },
  ],
};
const activeAudioStops = new Set<() => void>();
const musicStartRequests = new Set<() => void>();

export type ArcadeMusicController = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export function getAudioContextConstructor():
  AudioContextConstructor | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
}

export function registerGameAudioStop(stop: () => void): () => void {
  activeAudioStops.add(stop);

  return () => {
    activeAudioStops.delete(stop);
  };
}

export function stopAllGameAudio(): void {
  Array.from(activeAudioStops).forEach((stop) => stop());
}

export function registerArcadeMusicStarter(start: () => void): () => void {
  musicStartRequests.add(start);

  return () => {
    musicStartRequests.delete(start);
  };
}

export function requestArcadeMusicStart(): void {
  Array.from(musicStartRequests).forEach((start) => start());
}

class WebAudioArcadeMusic implements ArcadeMusicController {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private loopTimeoutId: number | null = null;
  private paused = false;
  private stopped = false;
  private unregisterAudioStop: (() => void) | null = null;
  private readonly voices = new Set<OscillatorNode>();

  start() {
    if (this.stopped || !isSoundEnabled()) {
      return;
    }

    if (!this.context) {
      this.createContext();
    }

    this.resume();
  }

  pause() {
    if (!this.context || this.paused || this.stopped) {
      return;
    }

    this.paused = true;
    this.clearLoopTimeout();
    this.stopVoices();
    void this.context.suspend().catch(() => undefined);
  }

  resume() {
    if (!this.context || this.stopped || !isSoundEnabled()) {
      return;
    }

    this.paused = false;
    void this.context
      .resume()
      .then(() => {
        if (!this.paused && !this.stopped && this.loopTimeoutId === null) {
          this.scheduleLoop();
        }
      })
      .catch(() => undefined);
  }

  stop() {
    if (this.stopped) {
      return;
    }

    this.stopped = true;
    this.clearLoopTimeout();
    this.stopVoices();
    this.unregisterAudioStop?.();
    this.unregisterAudioStop = null;

    if (this.output) {
      try {
        this.output.disconnect();
      } catch {
        // A browser may already have disconnected this node during teardown.
      }
      this.output = null;
    }

    if (this.context) {
      void this.context.close().catch(() => undefined);
      this.context = null;
    }
  }

  private createContext() {
    try {
      const AudioContextCtor = getAudioContextConstructor();

      if (!AudioContextCtor) {
        this.stopped = true;
        return;
      }

      const context = new AudioContextCtor();
      const output = context.createGain();
      output.gain.value = MUSIC_VOLUME;
      output.connect(context.destination);

      this.context = context;
      this.output = output;
      this.unregisterAudioStop = registerGameAudioStop(() => this.stop());
    } catch {
      // Audio is optional; a failed setup must not interrupt the round.
      this.stopped = true;
    }
  }

  private scheduleLoop() {
    if (!this.context || !this.output || this.paused || this.stopped) {
      return;
    }

    this.clearLoopTimeout();
    const startTime = this.context.currentTime + 0.04;

    MUSIC_NOTES.forEach((note) => {
      this.scheduleNote(note, startTime + note.offsetSeconds);
    });

    this.loopTimeoutId = window.setTimeout(() => {
      this.loopTimeoutId = null;
      this.scheduleLoop();
    }, LOOP_DURATION_SECONDS * 1000);
  }

  private scheduleNote(note: MusicNote, startTime: number) {
    if (!this.context || !this.output || this.stopped) {
      return;
    }

    try {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const endTime = startTime + note.durationSeconds;
      const noteVolume = note.type === 'square' ? 0.72 : 0.34;

      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(noteVolume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gain);
      gain.connect(this.output);
      this.voices.add(oscillator);
      oscillator.onended = () => {
        this.voices.delete(oscillator);
        try {
          oscillator.disconnect();
          gain.disconnect();
        } catch {
          // Nodes can already be disconnected when a round ends mid-note.
        }
      };

      oscillator.start(startTime);
      oscillator.stop(endTime + 0.02);
    } catch {
      // Individual notes can fail harmlessly when a browser tears audio down.
    }
  }

  private clearLoopTimeout() {
    if (this.loopTimeoutId !== null) {
      window.clearTimeout(this.loopTimeoutId);
      this.loopTimeoutId = null;
    }
  }

  private stopVoices() {
    this.voices.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // Oscillators that have already ended cannot be stopped again.
      }
    });
    this.voices.clear();
  }
}

export function createArcadeMusic(): ArcadeMusicController {
  return new WebAudioArcadeMusic();
}

export function playResultsTune(
  tune: ResultsTune,
): OneShotSoundController | null {
  if (typeof window === 'undefined' || !isSoundEnabled()) {
    return null;
  }

  let audioContext: AudioContext | null = null;

  try {
    const AudioContextCtor = getAudioContextConstructor();

    if (!AudioContextCtor) {
      return null;
    }

    const context = new AudioContextCtor();
    audioContext = context;
    const output = context.createGain();
    const voices = new Set<OscillatorNode>();
    let finished = false;
    let cleanupTimeoutId: number | null = null;
    let unregisterAudioStop: () => void = () => undefined;
    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      unregisterAudioStop();
      if (cleanupTimeoutId !== null) {
        window.clearTimeout(cleanupTimeoutId);
      }
      voices.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // Oscillators may have already reached their scheduled end.
        }
      });
      voices.clear();

      try {
        output.disconnect();
      } catch {
        // The output can already be disconnected during browser teardown.
      }
      void context.close().catch(() => undefined);
    };

    unregisterAudioStop = registerGameAudioStop(finish);
    output.gain.value = 0.085;
    output.connect(context.destination);
    const startTime = context.currentTime + 0.04;

    try {
      RESULTS_TUNE_NOTES[tune].forEach((note) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const endTime = startTime + note.offsetSeconds + note.durationSeconds;
        const noteVolume = note.type === 'square' ? 0.65 : 0.42;

        oscillator.type = note.type;
        oscillator.frequency.setValueAtTime(
          note.frequency,
          startTime + note.offsetSeconds,
        );
        gain.gain.setValueAtTime(0.0001, startTime + note.offsetSeconds);
        gain.gain.exponentialRampToValueAtTime(
          noteVolume,
          startTime + note.offsetSeconds + 0.015,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        oscillator.connect(gain);
        gain.connect(output);
        voices.add(oscillator);
        oscillator.onended = () => {
          voices.delete(oscillator);
          try {
            oscillator.disconnect();
            gain.disconnect();
          } catch {
            // The result screen may have unmounted while the tune was playing.
          }

          if (voices.size === 0) {
            finish();
          }
        };
        oscillator.start(startTime + note.offsetSeconds);
        oscillator.stop(endTime + 0.02);
      });

      cleanupTimeoutId = window.setTimeout(finish, 1_500);
      void context.resume().catch(finish);

      return { stop: finish };
    } catch {
      finish();
      return null;
    }
  } catch {
    // Result sounds are optional and must never interrupt the final screen.
    void audioContext?.close().catch(() => undefined);
    return null;
  }
}

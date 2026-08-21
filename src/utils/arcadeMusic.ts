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

class WebAudioArcadeMusic implements ArcadeMusicController {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private loopTimeoutId: number | null = null;
  private paused = false;
  private stopped = false;
  private readonly voices = new Set<OscillatorNode>();

  start() {
    if (this.stopped) {
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
    if (!this.context || this.stopped) {
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

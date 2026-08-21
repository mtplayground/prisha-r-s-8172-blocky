import {
  getAudioContextConstructor,
  registerGameAudioStop,
} from './arcadeMusic';
import { isSoundEnabled } from './soundSettings';

export function playGameOverSound(): void {
  if (typeof window === 'undefined' || !isSoundEnabled()) {
    return;
  }

  try {
    const AudioContextCtor = getAudioContextConstructor();

    if (!AudioContextCtor) {
      return;
    }

    const audioContext = new AudioContextCtor();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    let stopped = false;
    let unregisterAudioStop: () => void = () => undefined;
    const stopSound = () => {
      if (stopped) {
        return;
      }

      stopped = true;
      unregisterAudioStop();
      try {
        oscillator.stop();
      } catch {
        // The short tone may have already reached its scheduled end.
      }
      void audioContext.close().catch(() => undefined);
    };

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.24);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.onended = () => {
      stopSound();
    };
    unregisterAudioStop = registerGameAudioStop(stopSound);

    void audioContext.resume().catch(() => undefined);
    oscillator.start(now);
    oscillator.stop(now + 0.32);
  } catch {
    // Browsers may block audio until user interaction; the visual effect still runs.
  }
}

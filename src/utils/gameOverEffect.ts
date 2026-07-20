type AudioContextConstructor = new () => AudioContext;
type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: AudioContextConstructor;
  };

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  return window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
}

export function playGameOverSound(): void {
  if (typeof window === 'undefined') {
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

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.24);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.onended = () => {
      void audioContext.close().catch(() => undefined);
    };

    void audioContext.resume().catch(() => undefined);
    oscillator.start(now);
    oscillator.stop(now + 0.32);
  } catch {
    // Browsers may block audio until user interaction; the visual effect still runs.
  }
}

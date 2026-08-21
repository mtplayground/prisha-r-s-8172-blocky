const SOUND_ENABLED_STORAGE_KEY = 'blocky.sound-enabled';

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    return window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    // Sound remains available for the current session if storage is unavailable.
  }
}

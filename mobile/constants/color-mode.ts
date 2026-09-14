import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const NIGHT_MODE_KEY = 'nomy_night_mode_enabled';

let nightModeEnabled = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emitNightModeChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeNightMode(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNightModeEnabled() {
  return nightModeEnabled;
}

export async function hydrateNightModePreference() {
  if (hydrated) {
    return nightModeEnabled;
  }

  hydrated = true;
  try {
    nightModeEnabled = (await AsyncStorage.getItem(NIGHT_MODE_KEY)) === 'true';
  } catch {
    nightModeEnabled = false;
  }

  emitNightModeChange();
  return nightModeEnabled;
}

export async function setNightModeEnabled(enabled: boolean) {
  nightModeEnabled = enabled;
  emitNightModeChange();

  try {
    await AsyncStorage.setItem(NIGHT_MODE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Theme preference should never block the app.
  }
}

export function useNightModeEnabled() {
  return useSyncExternalStore(subscribeNightMode, getNightModeEnabled, getNightModeEnabled);
}

export function useNomyColorScheme() {
  const isNightMode = useNightModeEnabled();
  return isNightMode ? 'dark' : 'light';
}

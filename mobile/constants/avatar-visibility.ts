import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_AT_HOME_KEY = 'nomy_avatar_at_home';

let avatarVisibleAfterDemo = false;
let avatarAtHome = false;
const listeners = new Set<() => void>();

function notifyAvatarVisibilityListeners() {
  listeners.forEach((listener) => listener());
}

export function setAvatarVisibleAfterDemo(value: boolean) {
  if (avatarVisibleAfterDemo === value) {
    return;
  }

  avatarVisibleAfterDemo = value;
  notifyAvatarVisibilityListeners();
}

export function getAvatarVisibleAfterDemo() {
  return avatarVisibleAfterDemo && !avatarAtHome;
}

export function getAvatarAtHome() {
  return avatarAtHome;
}

export async function hydrateAvatarHomePreference() {
  try {
    avatarAtHome = (await AsyncStorage.getItem(AVATAR_AT_HOME_KEY)) === 'true';
  } catch {
    avatarAtHome = false;
  }

  notifyAvatarVisibilityListeners();
}

export async function sendAvatarHome() {
  avatarAtHome = true;
  notifyAvatarVisibilityListeners();

  try {
    await AsyncStorage.setItem(AVATAR_AT_HOME_KEY, 'true');
  } catch {
    // Avatar preference should never block the app.
  }
}

export async function bringAvatarBack() {
  avatarAtHome = false;
  notifyAvatarVisibilityListeners();

  try {
    await AsyncStorage.setItem(AVATAR_AT_HOME_KEY, 'false');
  } catch {
    // Avatar preference should never block the app.
  }
}

export function subscribeAvatarVisibleAfterDemo(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

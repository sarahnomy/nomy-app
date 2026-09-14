import AsyncStorage from '@react-native-async-storage/async-storage';

export const INTRO_STORAGE_KEY = 'nomy_intro_seen';
export const DEMO_STORAGE_KEY = 'nomy_demo_seen';

type OnboardingState = {
  introSeen: boolean | null;
  demoSeen: boolean | null;
};

let onboardingState: OnboardingState = {
  introSeen: null,
  demoSeen: null,
};

const listeners = new Set<() => void>();

function notifyOnboardingListeners() {
  listeners.forEach((listener) => listener());
}

export function getOnboardingState() {
  return onboardingState;
}

export function subscribeOnboardingState(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function loadOnboardingState() {
  const [introSeen, demoSeen] = await Promise.all([
    AsyncStorage.getItem(INTRO_STORAGE_KEY).then((value) => value === 'true').catch(() => false),
    AsyncStorage.getItem(DEMO_STORAGE_KEY).then((value) => value === 'true').catch(() => false),
  ]);

  onboardingState = { introSeen, demoSeen };
  notifyOnboardingListeners();
  return onboardingState;
}

export async function setIntroSeenValue() {
  onboardingState = { ...onboardingState, introSeen: true };
  notifyOnboardingListeners();
  await AsyncStorage.setItem(INTRO_STORAGE_KEY, 'true').catch(() => null);
}

export async function setDemoSeenValue() {
  onboardingState = { ...onboardingState, demoSeen: true };
  notifyOnboardingListeners();
  await AsyncStorage.setItem(DEMO_STORAGE_KEY, 'true').catch(() => null);
}

export async function completeOnboarding() {
  onboardingState = { introSeen: true, demoSeen: true };
  notifyOnboardingListeners();
  await Promise.all([
    AsyncStorage.setItem(INTRO_STORAGE_KEY, 'true').catch(() => null),
    AsyncStorage.setItem(DEMO_STORAGE_KEY, 'true').catch(() => null),
  ]);
}

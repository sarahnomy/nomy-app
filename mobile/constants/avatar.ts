import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_ACTIVITY_KEY = 'nomy_avatar_activities';
const MAX_ACTIVITIES = 40;
let avatarActivityVersion = 0;
let memoryAvatarActivities: AvatarActivity[] = [];
const avatarActivityListeners = new Set<() => void>();

export type AvatarActivity = {
  type: string;
  feature?: string;
  label?: string;
  at: string;
};

export async function recordAvatarActivity(activity: Omit<AvatarActivity, 'at'>) {
  const existing = await getAvatarActivities();
  const next: AvatarActivity[] = [
    ...existing,
    {
      ...activity,
      at: new Date().toISOString(),
    },
  ].slice(-MAX_ACTIVITIES);

  memoryAvatarActivities = next;
  notifyAvatarActivityListeners();

  try {
    await AsyncStorage.setItem(AVATAR_ACTIVITY_KEY, JSON.stringify(next));
  } catch {
    // Avatar memory should never block the app.
  }
}

export async function getAvatarActivities() {
  try {
    const raw = await AsyncStorage.getItem(AVATAR_ACTIVITY_KEY);
    if (!raw) {
      return memoryAvatarActivities;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return memoryAvatarActivities;
    }

    const entries = parsed.filter((item): item is AvatarActivity => Boolean(item && typeof item.type === 'string'));
    memoryAvatarActivities = entries;
    return entries;
  } catch {
    return memoryAvatarActivities;
  }
}

function notifyAvatarActivityListeners() {
  avatarActivityVersion += 1;
  avatarActivityListeners.forEach((listener) => listener());
}

export function getAvatarActivityVersion() {
  return avatarActivityVersion;
}

export function subscribeAvatarActivities(listener: () => void) {
  avatarActivityListeners.add(listener);

  return () => {
    avatarActivityListeners.delete(listener);
  };
}

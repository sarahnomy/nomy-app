import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCES_KEY = 'nomy_notification_preferences';

export type NotificationPreferences = {
  checkIns: boolean;
  reflections: boolean;
  appUpdates: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  checkIns: false,
  reflections: false,
  appUpdates: false,
};

export async function getNotificationPreferences() {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (!stored) {
      return defaultNotificationPreferences;
    }

    return { ...defaultNotificationPreferences, ...JSON.parse(stored) } as NotificationPreferences;
  } catch {
    return defaultNotificationPreferences;
  }
}

export async function setNotificationPreferences(preferences: NotificationPreferences) {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Notification preference storage should never block the app.
  }
}

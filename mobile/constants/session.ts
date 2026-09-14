import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiUrl } from '@/constants/api';

const SESSION_STORAGE_KEY = 'nomy_session_user';

export type SessionUser = {
  id: number;
  username: string;
  email: string;
};

export async function getSessionUser() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.username !== 'string') {
      return null;
    }

    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionUser(user: SessionUser) {
  try {
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Session state should never block the app.
  }
}

export async function clearSessionUser() {
  try {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Session state should never block the app.
  }
}

export async function logoutSessionUser() {
  try {
    await fetch(apiUrl('/api/mobile/logout/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    // Local logout should still work if the server is not reachable.
  } finally {
    await clearSessionUser();
  }
}

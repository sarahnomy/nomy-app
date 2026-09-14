import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiUrl } from '@/constants/api';
import { getSessionUser } from '@/constants/session';

const EMOTION_REFLECTIONS_KEY = 'nomy_emotion_reflections';
const CHECK_IN_REFLECTIONS_KEY = 'nomy_check_in_reflections';
const EXPRESS_REFLECTIONS_KEY = 'nomy_express_reflections';

let memoryEmotionReflections: EmotionReflectionEntry[] = [];
let memoryCheckInReflections: CheckInReflectionEntry[] = [];
let memoryExpressReflections: ExpressReflectionEntry[] = [];

export type EmotionReflectionEntry = {
  id: string;
  date: string;
  emotion: string;
  category?: string;
  categoryColor?: string;
  reflection: string;
  synced?: boolean;
};

export type CheckInReflectionEntry = {
  id: string;
  date: string;
  period: 'morning' | 'evening';
  reflection: string;
};

export type ExpressReflectionEntry = {
  id: string;
  date: string;
  style: 'direct' | 'relational';
  mode: 'text' | 'voice';
  scenario: string;
  suggestedResponse: string;
  reflection: string;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEntry(value: unknown): EmotionReflectionEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as Partial<EmotionReflectionEntry>;
  if (typeof entry.emotion !== 'string' || typeof entry.reflection !== 'string') {
    return null;
  }

  return {
    id: typeof entry.id === 'string' ? entry.id : `${Date.now()}`,
    date: typeof entry.date === 'string' ? entry.date : todayIsoDate(),
    emotion: entry.emotion,
    category: typeof entry.category === 'string' ? entry.category : undefined,
    categoryColor: typeof entry.categoryColor === 'string' ? entry.categoryColor : undefined,
    reflection: entry.reflection,
    synced: Boolean(entry.synced),
  };
}

function normalizeCheckInEntry(value: unknown): CheckInReflectionEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as Partial<CheckInReflectionEntry>;
  if (typeof entry.reflection !== 'string') {
    return null;
  }

  return {
    id: typeof entry.id === 'string' ? entry.id : `check-in-${Date.now()}`,
    date: typeof entry.date === 'string' ? entry.date : todayIsoDate(),
    period: entry.period === 'morning' || entry.period === 'evening' ? entry.period : 'evening',
    reflection: entry.reflection,
  };
}

function normalizeExpressEntry(value: unknown): ExpressReflectionEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as Partial<ExpressReflectionEntry>;
  if (typeof entry.reflection !== 'string' || typeof entry.scenario !== 'string') {
    return null;
  }

  return {
    id: typeof entry.id === 'string' ? entry.id : `express-${Date.now()}`,
    date: typeof entry.date === 'string' ? entry.date : todayIsoDate(),
    style: entry.style === 'relational' ? 'relational' : 'direct',
    mode: entry.mode === 'voice' ? 'voice' : 'text',
    scenario: entry.scenario,
    suggestedResponse: typeof entry.suggestedResponse === 'string' ? entry.suggestedResponse : '',
    reflection: entry.reflection,
  };
}

export async function getLocalEmotionReflections() {
  try {
    const raw = await AsyncStorage.getItem(EMOTION_REFLECTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : memoryEmotionReflections;
    if (!Array.isArray(parsed)) {
      return memoryEmotionReflections;
    }

    const entries = parsed
      .map(normalizeEntry)
      .filter((entry): entry is EmotionReflectionEntry => Boolean(entry))
      .sort((a, b) => b.date.localeCompare(a.date));
    memoryEmotionReflections = entries;
    return entries;
  } catch {
    return memoryEmotionReflections;
  }
}

export async function getLocalCheckInReflections() {
  try {
    const raw = await AsyncStorage.getItem(CHECK_IN_REFLECTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : memoryCheckInReflections;
    if (!Array.isArray(parsed)) {
      return memoryCheckInReflections;
    }

    const entries = parsed
      .map(normalizeCheckInEntry)
      .filter((entry): entry is CheckInReflectionEntry => Boolean(entry))
      .sort((a, b) => b.date.localeCompare(a.date));
    memoryCheckInReflections = entries;
    return entries;
  } catch {
    return memoryCheckInReflections;
  }
}

export async function getLocalExpressReflections() {
  try {
    const raw = await AsyncStorage.getItem(EXPRESS_REFLECTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : memoryExpressReflections;
    if (!Array.isArray(parsed)) {
      return memoryExpressReflections;
    }

    const entries = parsed
      .map(normalizeExpressEntry)
      .filter((entry): entry is ExpressReflectionEntry => Boolean(entry))
      .sort((a, b) => b.date.localeCompare(a.date));
    memoryExpressReflections = entries;
    return entries;
  } catch {
    return memoryExpressReflections;
  }
}

async function setLocalEmotionReflections(entries: EmotionReflectionEntry[]) {
  memoryEmotionReflections = entries;
  try {
    await AsyncStorage.setItem(EMOTION_REFLECTIONS_KEY, JSON.stringify(entries));
  } catch {
    // Expo Go can occasionally refuse native storage; keep this session's save visible.
  }
}

async function setLocalCheckInReflections(entries: CheckInReflectionEntry[]) {
  memoryCheckInReflections = entries;
  try {
    await AsyncStorage.setItem(CHECK_IN_REFLECTIONS_KEY, JSON.stringify(entries));
  } catch {
    // Expo Go can occasionally refuse native storage; keep this session's save visible.
  }
}

async function setLocalExpressReflections(entries: ExpressReflectionEntry[]) {
  memoryExpressReflections = entries;
  try {
    await AsyncStorage.setItem(EXPRESS_REFLECTIONS_KEY, JSON.stringify(entries));
  } catch {
    // Expo Go can occasionally refuse native storage; keep this session's save visible.
  }
}

export async function saveEmotionReflectionLocally(entry: Omit<EmotionReflectionEntry, 'id' | 'date' | 'synced'>) {
  const nextEntry: EmotionReflectionEntry = {
    ...entry,
    id: `local-${Date.now()}`,
    date: todayIsoDate(),
    synced: false,
  };
  const existing = await getLocalEmotionReflections();
  await setLocalEmotionReflections([nextEntry, ...existing]);
  return nextEntry;
}

export async function saveCheckInReflection(entry: Omit<CheckInReflectionEntry, 'id' | 'date'>) {
  const nextEntry: CheckInReflectionEntry = {
    ...entry,
    id: `check-in-${Date.now()}`,
    date: todayIsoDate(),
  };
  const existing = await getLocalCheckInReflections();
  await setLocalCheckInReflections([nextEntry, ...existing]);
  return nextEntry;
}

export async function saveExpressReflection(entry: Omit<ExpressReflectionEntry, 'id' | 'date'>) {
  const nextEntry: ExpressReflectionEntry = {
    ...entry,
    id: `express-${Date.now()}`,
    date: todayIsoDate(),
  };
  const existing = await getLocalExpressReflections();
  await setLocalExpressReflections([nextEntry, ...existing]);
  return nextEntry;
}

export async function saveEmotionReflection(entry: Omit<EmotionReflectionEntry, 'id' | 'date' | 'synced'>) {
  const localEntry = await saveEmotionReflectionLocally(entry);
  const session = await getSessionUser();

  if (!session) {
    return { entry: localEntry, synced: false };
  }

  try {
    const response = await fetch(apiUrl('/reflections/mobile/save/emotion/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.id,
        emotion: entry.emotion,
        text: entry.reflection,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      return { entry: localEntry, synced: false };
    }

    const syncedEntry: EmotionReflectionEntry = {
      ...localEntry,
      id: `remote-${data.reflection.id}`,
      date: data.reflection.date || localEntry.date,
      synced: true,
    };
    const existing = await getLocalEmotionReflections();
    await setLocalEmotionReflections(existing.map((item) => (item.id === localEntry.id ? syncedEntry : item)));
    return { entry: syncedEntry, synced: true };
  } catch {
    return { entry: localEntry, synced: false };
  }
}

export async function syncEmotionReflectionsFromServer() {
  const session = await getSessionUser();
  if (!session) {
    return getLocalEmotionReflections();
  }

  try {
    const response = await fetch(apiUrl(`/reflections/mobile/get/emotion/?user_id=${session.id}`));
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok || !Array.isArray(data.reflections)) {
      return getLocalEmotionReflections();
    }

    const remoteEntries: EmotionReflectionEntry[] = data.reflections
      .map((item: { id?: number; date?: string; emotion?: string; reflection?: string }) =>
        normalizeEntry({
          id: item.id ? `remote-${item.id}` : undefined,
          date: item.date,
          emotion: item.emotion,
          reflection: item.reflection,
          synced: true,
        }),
      )
      .filter((entry: EmotionReflectionEntry | null): entry is EmotionReflectionEntry => Boolean(entry));

    const localEntries = await getLocalEmotionReflections();
    const remoteIds = new Set(remoteEntries.map((entry) => entry.id));
    const unsyncedLocalEntries = localEntries.filter((entry) => !entry.synced && !remoteIds.has(entry.id));
    const merged = [...unsyncedLocalEntries, ...remoteEntries].sort((a, b) => b.date.localeCompare(a.date));
    await setLocalEmotionReflections(merged);
    return merged;
  } catch {
    return getLocalEmotionReflections();
  }
}

import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { hydrateNightModePreference, setNightModeEnabled, useNightModeEnabled } from '@/constants/color-mode';
import {
  defaultNotificationPreferences,
  getNotificationPreferences,
  setNotificationPreferences,
  type NotificationPreferences,
} from '@/constants/notification-preferences';
import { clearSessionUser, getSessionUser } from '@/constants/session';
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

export default function SettingsScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationPreferences, setLocalNotificationPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const nightModeEnabled = useNightModeEnabled();
  const activeNightMode = nightModeEnabled;
  const palette = activeNightMode ? nightPalette : lightPalette;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSettingsState() {
        const [session, notifications] = await Promise.all([
          getSessionUser(),
          getNotificationPreferences(),
          hydrateNightModePreference(),
        ]);
        if (active) {
          setIsLoggedIn(Boolean(session));
          setLocalNotificationPreferences(notifications);
        }
      }

      loadSettingsState();

      return () => {
        active = false;
      };
    }, []),
  );

  async function logout() {
    await setNightModeEnabled(false);
    await clearSessionUser();
    router.replace('/');
  }

  async function toggleNightMode(enabled: boolean) {
    await setNightModeEnabled(enabled);
  }

  async function toggleNotificationPreference(key: keyof NotificationPreferences, enabled: boolean) {
    const nextPreferences = { ...notificationPreferences, [key]: enabled };
    setLocalNotificationPreferences(nextPreferences);
    await setNotificationPreferences(nextPreferences);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.screen }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <BackControl label="Profile" onPress={() => router.back()} />

        <View style={styles.header}>
          <Text style={[styles.kicker, { color: palette.groupTitle }]}>Preferences</Text>
          <Text style={[styles.title, { color: palette.title }]}>Settings</Text>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>Display</Text>
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.row, styles.lastRow, { borderBottomColor: palette.divider }]}>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowText, { color: palette.title }]}>Night mode</Text>
                <Text style={[styles.rowHint, { color: palette.muted }]}>
                  Use a darker, lower-glare version of nomy.
                </Text>
              </View>
              <Switch
                onValueChange={toggleNightMode}
                value={nightModeEnabled}
                trackColor={{ false: palette.switchOff, true: '#8f7cf6' }}
                thumbColor={nightModeEnabled ? '#ffffff' : '#f4f0fb'}
              />
            </View>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.row, { borderBottomColor: palette.divider }]}>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowText, { color: palette.title }]}>Check-in reminders</Text>
                <Text style={[styles.rowHint, { color: palette.muted }]}>For gentle morning or evening check-in prompts.</Text>
              </View>
              <Switch
                onValueChange={(enabled) => toggleNotificationPreference('checkIns', enabled)}
                value={notificationPreferences.checkIns}
                trackColor={{ false: palette.switchOff, true: '#8f7cf6' }}
                thumbColor={notificationPreferences.checkIns ? '#ffffff' : '#f4f0fb'}
              />
            </View>
            <View style={[styles.row, { borderBottomColor: palette.divider }]}>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowText, { color: palette.title }]}>Reflection prompts</Text>
                <Text style={[styles.rowHint, { color: palette.muted }]}>For reminders to save or return to reflections.</Text>
              </View>
              <Switch
                onValueChange={(enabled) => toggleNotificationPreference('reflections', enabled)}
                value={notificationPreferences.reflections}
                trackColor={{ false: palette.switchOff, true: '#8f7cf6' }}
                thumbColor={notificationPreferences.reflections ? '#ffffff' : '#f4f0fb'}
              />
            </View>
            <View style={[styles.row, styles.lastRow, { borderBottomColor: palette.divider }]}>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowText, { color: palette.title }]}>App updates</Text>
                <Text style={[styles.rowHint, { color: palette.muted }]}>For important changes, privacy updates, or new support tools.</Text>
              </View>
              <Switch
                onValueChange={(enabled) => toggleNotificationPreference('appUpdates', enabled)}
                value={notificationPreferences.appUpdates}
                trackColor={{ false: palette.switchOff, true: '#8f7cf6' }}
                thumbColor={notificationPreferences.appUpdates ? '#ffffff' : '#f4f0fb'}
              />
            </View>
          </View>
          <Text style={[styles.groupNote, { color: palette.muted }]}>These choices are saved now. Push delivery can be connected when notifications are enabled for launch.</Text>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>Legal and access</Text>
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Pressable
              onPress={() => router.push('/terms')}
              style={({ pressed }) => [styles.row, { borderBottomColor: palette.divider }, pressed && styles.rowPressed]}>
              <Text style={[styles.rowText, { color: palette.title }]}>Terms and conditions</Text>
              <Text style={[styles.rowArrow, { color: palette.muted }]}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('https://nomy-app-fq92.onrender.com/privacy/')}
              style={({ pressed }) => [styles.row, { borderBottomColor: palette.divider }, pressed && styles.rowPressed]}>
              <Text style={[styles.rowText, { color: palette.title }]}>Privacy policy</Text>
              <Text style={[styles.rowArrow, { color: palette.muted }]}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/accessibility')}
              style={({ pressed }) => [styles.row, styles.lastRow, { borderBottomColor: palette.divider }, pressed && styles.rowPressed]}>
              <Text style={[styles.rowText, { color: palette.title }]}>Accessibility</Text>
              <Text style={[styles.rowArrow, { color: palette.muted }]}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>Help</Text>
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Pressable
              onPress={() => router.push('/faqs')}
              style={({ pressed }) => [styles.row, { borderBottomColor: palette.divider }, pressed && styles.rowPressed]}>
              <Text style={[styles.rowText, { color: palette.title }]}>FAQs</Text>
              <Text style={[styles.rowArrow, { color: palette.muted }]}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('mailto:hello@nomy.app')}
              style={({ pressed }) => [styles.row, styles.lastRow, { borderBottomColor: palette.divider }, pressed && styles.rowPressed]}>
              <Text style={[styles.rowText, { color: palette.title }]}>Contact support</Text>
              <Text style={[styles.rowArrow, { color: palette.muted }]}>›</Text>
            </Pressable>
          </View>
        </View>

        {isLoggedIn ? (
          <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, { backgroundColor: palette.logoutBg, borderColor: palette.border }, pressed && styles.backButtonPressed]}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: space.screenX, paddingTop: space.sm, paddingBottom: 120, gap: space.lg },
  backButtonPressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  header: { alignItems: 'center', gap: space.xs },
  kicker: {
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { color: '#1f003d', textAlign: 'center', fontSize: typeScale.pageTitle, fontWeight: '700', lineHeight: lineScale.pageTitle },
  group: { gap: space.sm },
  groupTitle: { color: '#5e4f79', fontSize: typeScale.helper, fontWeight: '500' },
  groupNote: { fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '500', paddingHorizontal: space.xs },
  card: {
    borderRadius: radius.lg,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8e0f4',
    overflow: 'hidden',
  },
  row: {
    minHeight: controlSize.large,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0ebf8',
  },
  rowPressed: { opacity: 0.72 },
  lastRow: { borderBottomWidth: 0 },
  rowCopy: { flex: 1, gap: 4, paddingRight: 12 },
  rowText: { color: '#1f003d', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600' },
  rowHint: { fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '500' },
  rowArrow: { color: '#7a7291', fontSize: 22, lineHeight: 22 },
  logoutButton: {
    minHeight: controlSize.regular,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e6dceb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7fb',
  },
  logoutButtonText: { color: '#7a1738', fontSize: typeScale.body, fontWeight: '700' },
});

const lightPalette = {
  screen: '#ffffff',
  wave: '#eaeaf5',
  title: '#1f003d',
  body: '#4f4268',
  muted: '#5e4f79',
  groupTitle: '#5e4f79',
  card: '#ffffff',
  cardSoft: '#f8f5ff',
  input: '#ffffff',
  border: '#e6dff4',
  divider: '#f0ebf8',
  placeholder: '#7a7291',
  switchOff: '#d8d0e8',
  logoutBg: '#fff7fb',
};

const nightPalette = {
  screen: '#171120',
  wave: '#241a34',
  title: '#f7f1ff',
  body: '#d8cde8',
  muted: '#b9accd',
  groupTitle: '#cfc3e3',
  card: '#21172f',
  cardSoft: '#261b36',
  input: '#21172f',
  border: '#3a2b50',
  divider: '#332641',
  placeholder: '#a99cbb',
  switchOff: '#4b3a62',
  logoutBg: '#2a1826',
};

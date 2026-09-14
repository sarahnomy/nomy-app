import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabSwipe } from '@/components/tab-swipe';
import { Text } from '@/components/nomy-type';
import { getAvatarActivities, type AvatarActivity } from '@/constants/avatar';
import {
  type CheckInReflectionEntry,
  type EmotionReflectionEntry,
  type ExpressReflectionEntry,
  getLocalCheckInReflections,
  getLocalExpressReflections,
  syncEmotionReflectionsFromServer,
} from '@/constants/reflections';
import { getSessionUser, logoutSessionUser, type SessionUser } from '@/constants/session';

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProfileScreen() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [checkInReflections, setCheckInReflections] = useState<CheckInReflectionEntry[]>([]);
  const [emotionReflections, setEmotionReflections] = useState<EmotionReflectionEntry[]>([]);
  const [expressReflections, setExpressReflections] = useState<ExpressReflectionEntry[]>([]);
  const [activities, setActivities] = useState<AvatarActivity[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProfile() {
        const user = await getSessionUser();
        if (active) {
          setSessionUser(user);
        }

        if (!user) {
          if (active) {
            setCheckInReflections([]);
            setEmotionReflections([]);
            setExpressReflections([]);
            setActivities([]);
          }
          return;
        }

        const [checkInItems, emotionItems, expressItems, activityItems] = await Promise.all([
          getLocalCheckInReflections(),
          syncEmotionReflectionsFromServer(),
          getLocalExpressReflections(),
          getAvatarActivities(),
        ]);

        if (active) {
          setCheckInReflections(checkInItems);
          setEmotionReflections(emotionItems);
          setExpressReflections(expressItems);
          setActivities(activityItems);
        }
      }

      loadProfile();

      return () => {
        active = false;
      };
    }, []),
  );

  const totalSaved = checkInReflections.length + emotionReflections.length + expressReflections.length;
  const currentMonthLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, []);
  const featureStats = useMemo(() => {
    const countUses = (featureNames: string[]) => activities.filter((activity) => (
      activity.feature ? featureNames.includes(activity.feature) : false
    )).length;

    return [
      {
        name: 'Emotionize',
        color: '#f4f8f3',
        used: countUses(['emotionize']),
        reflected: emotionReflections.length,
        detail: 'stories and reflections',
      },
      {
        name: 'Check-in',
        color: '#fffaeb',
        used: countUses(['dailies']),
        reflected: checkInReflections.length,
        detail: 'daily prompts saved',
      },
      {
        name: 'Express',
        color: '#e9f0fa',
        used: countUses(['express']),
        reflected: expressReflections.length,
        detail: 'words saved',
      },
      {
        name: 'Toolkit',
        color: '#fde6cf',
        used: countUses(['toolkit', 'breathing']),
        reflected: activities.filter((activity) => activity.type === 'breathing_completed').length,
        detail: 'tools and breathing rounds',
      },
    ];
  }, [activities, checkInReflections.length, emotionReflections.length, expressReflections.length]);

  async function logout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logoutSessionUser();
    setSessionUser(null);
    setIsLoggingOut(false);
  }

  return (
    <TabSwipe current="/profile">
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Profile</Text>
            <Text style={styles.title}>{sessionUser ? sessionUser.username : 'Your nomy space'}</Text>
            <Text style={styles.subtitle}>Account, saved reflections, and gentle patterns live here.</Text>
          </View>

          <View style={styles.accountCard}>
            {sessionUser ? (
              <>
                <View style={styles.accountCopy}>
                  <Text style={styles.accountLabel}>Account</Text>
                  <Text style={styles.accountTitle}>Logged in as {sessionUser.username}</Text>
                  <Text style={styles.accountText}>{sessionUser.email || 'Your account is connected on this phone.'}</Text>
                </View>
                <Pressable
                  disabled={isLoggingOut}
                  onPress={logout}
                  style={({ pressed }) => [styles.logoutButton, (pressed || isLoggingOut) && styles.pressed]}>
                  <Text style={styles.logoutButtonText}>{isLoggingOut ? 'Logging out…' : 'Log out'}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.accountCopy}>
                  <Text style={styles.accountLabel}>Account</Text>
                  <Text style={styles.accountText}>Use an account when you want your saved space connected to you.</Text>
                </View>
                <View style={styles.accountActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/login')}
                    style={({ pressed }) => [styles.authCtaButton, pressed && styles.pressed]}>
                    <Text style={styles.authCtaButtonText}>Log in or create account</Text>
                    <Text style={styles.authCtaChevron}>›</Text>
                  </Pressable>
                </View>
                <Text style={styles.accountFootnote}>You can still use the app without logging in.</Text>
              </>
            )}
          </View>

          <View style={styles.profileActions}>
            <Pressable onPress={() => router.push('/settings')} style={({ pressed }) => [styles.rowButton, pressed && styles.rowPressed]}>
              <Text style={styles.rowText}>Settings and FAQs</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          {sessionUser ? (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{totalSaved}</Text>
                  <Text style={styles.statLabel}>saved reflections</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{activities.length}</Text>
                  <Text style={styles.statLabel}>support actions</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Feature stats</Text>
                <View style={styles.featureStatsGrid}>
                  {featureStats.map((item) => (
                    <View key={item.name} style={[styles.featureStatCard, { backgroundColor: item.color }]}>
                      <Text style={styles.featureStatName}>{item.name}</Text>
                      <View style={styles.featureStatNumbers}>
                        <View style={styles.featureStatNumberBlock}>
                          <Text style={styles.featureStatNumber}>{item.used}</Text>
                          <Text style={styles.featureStatLabel}>used</Text>
                        </View>
                        <View style={styles.featureStatNumberBlock}>
                          <Text style={styles.featureStatNumber}>{item.reflected}</Text>
                          <Text style={styles.featureStatLabel}>{item.name === 'Toolkit' ? 'completed' : 'saved'}</Text>
                        </View>
                      </View>
                      <Text style={styles.featureStatDetail}>{item.detail}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.recapCard}>
                <View style={styles.recapHeader}>
                  <Text style={styles.sectionTitle}>Monthly recap</Text>
                  <Text style={styles.recapMonth}>{currentMonthLabel}</Text>
                </View>
                <Text style={styles.recapText}>
                  Your recap will summarise patterns from saved check-ins, Emotionize reflections, and Express entries.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saved reflections</Text>
                {totalSaved ? (
                  <>
                    {checkInReflections.length ? (
                      <View style={styles.group}>
                        <Text style={styles.groupLabel}>Check-in</Text>
                        {checkInReflections.map((item) => (
                          <View key={item.id} style={styles.reflectionRow}>
                            <View style={styles.rowHeader}>
                              <View style={styles.checkInPill}>
                                <Text style={styles.checkInPillText}>{item.period === 'evening' ? 'Evening' : 'Morning'}</Text>
                              </View>
                              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                            </View>
                            <Text style={styles.reflectionText}>{item.reflection}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {emotionReflections.length ? (
                      <View style={styles.group}>
                        <Text style={styles.groupLabel}>Emotionize</Text>
                        {emotionReflections.map((item) => (
                          <View key={item.id} style={styles.reflectionRow}>
                            <View style={styles.rowHeader}>
                              <View style={[styles.emotionPill, { backgroundColor: item.categoryColor || '#ebe7ff' }]}>
                                <Text style={styles.emotionPillText}>{item.emotion}</Text>
                              </View>
                              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                            </View>
                            <Text style={styles.reflectionText}>{item.reflection}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {expressReflections.length ? (
                      <View style={styles.group}>
                        <Text style={styles.groupLabel}>Express</Text>
                        {expressReflections.map((item) => (
                          <View key={item.id} style={styles.reflectionRow}>
                            <View style={styles.rowHeader}>
                              <View style={styles.expressPill}>
                                <Text style={styles.expressPillText}>
                                  {item.style === 'relational' ? 'Relational' : 'Direct'} · {item.mode === 'voice' ? 'Voice' : 'Text'}
                                </Text>
                              </View>
                              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                            </View>
                            <Text style={styles.contextText}>{item.scenario}</Text>
                            <Text style={styles.reflectionText}>{item.reflection}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Nothing saved yet</Text>
                    <Text style={styles.emptyText}>Saved check-ins, Emotionize reflections, and Express entries will appear here.</Text>
                  </View>
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fffaf2' },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 126, gap: 18 },
  header: { gap: 8, alignItems: 'center', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 },
  kicker: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.45 },
  subtitle: { color: '#70677f', textAlign: 'center', fontSize: 16, lineHeight: 23, maxWidth: 330 },
  accountCard: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    shadowColor: '#110c28',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  accountCopy: { gap: 5 },
  accountLabel: {
    color: '#817690',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  accountTitle: { color: '#1f1635', fontSize: 21, lineHeight: 26, fontWeight: '900', letterSpacing: -0.3 },
  accountText: { color: '#5e4f79', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  accountFootnote: { color: '#817690', fontSize: 13, lineHeight: 19, fontWeight: '600', textAlign: 'center' },
  accountActions: { gap: 10 },
  authCtaButton: {
    alignSelf: 'stretch',
    minHeight: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#1f003d',
    borderWidth: 2,
    borderColor: '#1f003d',
    paddingHorizontal: 18,
    shadowColor: '#1f003d',
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  authCtaButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: -0.1 },
  authCtaChevron: { color: '#ffffff', fontSize: 28, lineHeight: 28, fontWeight: '600', marginTop: -2 },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf2',
    borderWidth: 1,
    borderColor: '#ded7ec',
  },
  secondaryButtonText: { color: '#1f1635', fontSize: 16, fontWeight: '800' },
  logoutButton: {
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff4f6',
    borderWidth: 1,
    borderColor: '#f1ccd5',
  },
  logoutButtonText: { color: '#8a2440', fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    minHeight: 102,
    borderRadius: 24,
    backgroundColor: '#e9f0fa',
    padding: 16,
    justifyContent: 'center',
    gap: 6,
  },
  statNumber: { color: '#1f1635', fontSize: 32, lineHeight: 36, fontWeight: '900' },
  statLabel: { color: '#5e4f79', fontSize: 14, lineHeight: 19, fontWeight: '700' },
  featureStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureStatCard: {
    width: '48%',
    minHeight: 138,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 15,
    gap: 10,
    justifyContent: 'space-between',
  },
  featureStatName: { color: '#1f1635', fontSize: 18, lineHeight: 22, fontWeight: '900', letterSpacing: -0.25 },
  featureStatNumbers: { flexDirection: 'row', gap: 10 },
  featureStatNumberBlock: { flex: 1, gap: 2 },
  featureStatNumber: { color: '#1f1635', fontSize: 25, lineHeight: 29, fontWeight: '900' },
  featureStatLabel: { color: '#5e4f79', fontSize: 12, lineHeight: 16, fontWeight: '800', textTransform: 'uppercase' },
  featureStatDetail: { color: '#70677f', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  recapCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  recapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  recapMonth: { color: '#70677f', fontSize: 14, fontWeight: '800' },
  recapText: { color: '#5e4f79', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  profileActions: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  rowButton: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowPressed: { backgroundColor: '#faf8ff' },
  rowText: { flex: 1, color: '#1f1635', fontSize: 17, fontWeight: '800' },
  chevron: { color: '#8f87a0', fontSize: 26, lineHeight: 28, fontWeight: '400' },
  section: { gap: 10 },
  sectionTitle: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  group: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  groupLabel: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  reflectionRow: {
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e8e3f0',
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  checkInPill: { borderRadius: 999, backgroundColor: '#fffaeb', paddingHorizontal: 10, paddingVertical: 6 },
  checkInPillText: { color: '#6d5a22', fontSize: 13, fontWeight: '800' },
  emotionPill: { borderRadius: 999, backgroundColor: '#f4f8f3', paddingHorizontal: 10, paddingVertical: 6 },
  emotionPillText: { color: '#435944', fontSize: 13, fontWeight: '800' },
  expressPill: { borderRadius: 999, backgroundColor: '#e9f0fa', paddingHorizontal: 10, paddingVertical: 6 },
  expressPillText: { color: '#31506f', fontSize: 13, fontWeight: '800' },
  dateText: { color: '#8b829d', fontSize: 13, fontWeight: '600' },
  contextText: { color: '#70677f', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  reflectionText: { color: '#241b3b', fontSize: 16, lineHeight: 24 },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  emptyTitle: { color: '#1f1635', fontSize: 20, fontWeight: '800' },
  emptyText: { color: '#70677f', fontSize: 16, lineHeight: 23, textAlign: 'center' },
});

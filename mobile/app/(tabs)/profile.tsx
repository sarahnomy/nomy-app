import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabSwipe } from '@/components/tab-swipe';
import { Text } from '@/components/nomy-type';
import { useAppTheme } from '@/constants/app-theme';
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
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

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

const PROFILE_AVATAR_KEY = 'nomy_profile_avatar';

const avatarOptions = [
  { id: 'sage', label: 'Sage', backgroundColor: '#dfafe9', color: '#314d34' },
  { id: 'sky', label: 'Sky', backgroundColor: '#dce9f8', color: '#294866' },
  { id: 'lavender', label: 'Lavender', backgroundColor: '#e8def8', color: '#453460' },
  { id: 'peach', label: 'Peach', backgroundColor: '#fde6cf', color: '#6b4328' },
] as const;

type AvatarId = (typeof avatarOptions)[number]['id'];
type ProfileTab = 'overview' | 'saved' | 'recap';

const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'saved', label: 'Saved' },
  { id: 'recap', label: 'Recap' },
];

const SIDE_MENU_WIDTH = 284;

export default function ProfileScreen() {
  const theme = useAppTheme();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [checkInReflections, setCheckInReflections] = useState<CheckInReflectionEntry[]>([]);
  const [emotionReflections, setEmotionReflections] = useState<EmotionReflectionEntry[]>([]);
  const [expressReflections, setExpressReflections] = useState<ExpressReflectionEntry[]>([]);
  const [activities, setActivities] = useState<AvatarActivity[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId>('sage');
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [menuTranslateX] = useState(() => new Animated.Value(SIDE_MENU_WIDTH));

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    menuTranslateX.setValue(SIDE_MENU_WIDTH);
    Animated.timing(menuTranslateX, {
      toValue: 0,
      duration: 230,
      useNativeDriver: true,
    }).start();
  }, [accountMenuOpen, menuTranslateX]);

  function closeAccountMenu() {
    Animated.timing(menuTranslateX, {
      toValue: SIDE_MENU_WIDTH,
      duration: 210,
      useNativeDriver: true,
    }).start(() => setAccountMenuOpen(false));
  }

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

        const [checkInItems, emotionItems, expressItems, activityItems, savedAvatarId] = await Promise.all([
          getLocalCheckInReflections(),
          syncEmotionReflectionsFromServer(),
          getLocalExpressReflections(),
          getAvatarActivities(),
          AsyncStorage.getItem(PROFILE_AVATAR_KEY).catch(() => null),
        ]);

        if (active) {
          setCheckInReflections(checkInItems);
          setEmotionReflections(emotionItems);
          setExpressReflections(expressItems);
          setActivities(activityItems);
          if (avatarOptions.some((option) => option.id === savedAvatarId)) {
            setAvatarId(savedAvatarId as AvatarId);
          }
        }
      }

      loadProfile();

      return () => {
        active = false;
      };
    }, []),
  );

  const totalSaved = checkInReflections.length + emotionReflections.length + expressReflections.length;
  const activeAvatar = avatarOptions.find((option) => option.id === avatarId) || avatarOptions[0];
  const profileInitial = (sessionUser?.username || 'N').trim().charAt(0).toUpperCase() || 'N';
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
        color: '#e1dcf9',
        used: countUses(['emotionize']),
        reflected: emotionReflections.length,
        detail: 'stories and reflections',
      },
      {
        name: 'Check-in',
        color: '#d5f1f0',
        used: countUses(['dailies']),
        reflected: checkInReflections.length,
        detail: 'daily prompts saved',
      },
      {
        name: 'Express',
        color: '#c2dcff',
        used: countUses(['express']),
        reflected: expressReflections.length,
        detail: 'words saved',
      },
      {
        name: 'Toolkit',
        color: '#e9c3f1',
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
    setAccountMenuOpen(false);
    setAvatarEditorOpen(false);
    await logoutSessionUser();
    setSessionUser(null);
    setIsLoggingOut(false);
  }

  async function selectAvatar(nextAvatarId: AvatarId) {
    setAvatarId(nextAvatarId);
    setAvatarEditorOpen(false);
    try {
      await AsyncStorage.setItem(PROFILE_AVATAR_KEY, nextAvatarId);
    } catch {
      // Profile customisation should never block the app.
    }
  }

  return (
    <TabSwipe current="/profile">
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View />
              {sessionUser ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open profile menu"
                  onPress={() => setAccountMenuOpen(true)}
                  style={({ pressed }) => [styles.hamburgerButton, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.pressed]}>
                  <Text style={[styles.hamburgerLine, { color: theme.text }]}>☰</Text>
                </Pressable>
              ) : null}
            </View>
            {!sessionUser ? <Text style={[styles.title, { color: theme.text }]}>Your nomy space</Text> : null}
          </View>

          <View style={[styles.accountCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {sessionUser ? (
              <>
                <View style={styles.profileHero}>
                  <View style={styles.profileAvatarWrap}>
                    <View style={[styles.profileAvatar, { backgroundColor: activeAvatar.backgroundColor }]}>
                      <Text style={[styles.profileAvatarText, { color: activeAvatar.color }]}>{profileInitial}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Edit profile avatar"
                      onPress={() => setAvatarEditorOpen((current) => !current)}
                      style={({ pressed }) => [styles.avatarEditButton, pressed && styles.pressed]}>
                      <Text style={styles.avatarEditText}>Edit</Text>
                    </Pressable>
                  </View>
                  <View style={styles.profileHeroCopy}>
                    <Text style={styles.accountTitle}>{sessionUser.username}</Text>
                    <Text style={styles.accountText}>{sessionUser.email || 'Your account is connected on this phone.'}</Text>
                  </View>
                </View>

                {avatarEditorOpen ? (
                  <View style={styles.avatarPicker}>
                    <Text style={styles.accountLabel}>Choose a profile colour</Text>
                    <View style={styles.avatarOptions}>
                      {avatarOptions.map((option) => {
                        const selected = option.id === avatarId;
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={selected ? { selected: true } : {}}
                            accessibilityLabel={`Use ${option.label} profile colour`}
                            key={option.id}
                            onPress={() => selectAvatar(option.id)}
                            style={({ pressed }) => [
                              styles.avatarOption,
                              { backgroundColor: option.backgroundColor },
                              selected && styles.avatarOptionSelected,
                              pressed && styles.pressed,
                            ]}>
                            <Text style={[styles.avatarOptionText, { color: option.color }]}>{profileInitial}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <View style={styles.accountCopy}>
                  <Text style={[styles.accountLabel, { color: theme.subtle }]}>Account</Text>
                  <Text style={[styles.accountText, { color: theme.muted }]}>Use an account when you want your saved space connected to you.</Text>
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
                <Text style={[styles.accountFootnote, { color: theme.subtle }]}>You can still use the app without logging in.</Text>
              </>
            )}
          </View>

          {!sessionUser ? (
            <View style={styles.profileActions}>
              <Pressable onPress={() => router.push('/settings')} style={({ pressed }) => [styles.rowButton, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.rowPressed]}>
                <Text style={[styles.rowText, { color: theme.text }]}>Settings</Text>
                <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/faqs')} style={({ pressed }) => [styles.rowButton, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.rowPressed]}>
                <Text style={[styles.rowText, { color: theme.text }]}>FAQs</Text>
                <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
              </Pressable>
            </View>
          ) : null}

          {sessionUser ? (
            <>
              <View style={[styles.profileTabs, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {profileTabs.map((tab) => {
                  const selected = activeTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={({ pressed }) => [styles.profileTab, selected && styles.profileTabActive, pressed && styles.rowPressed]}>
                      <Text style={[styles.profileTabText, selected && styles.profileTabTextActive]}>{tab.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {activeTab === 'overview' ? (
                <>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{totalSaved}</Text>
                      <Text style={styles.statLabel}>saved reflections</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{activities.length}</Text>
                      <Text style={styles.statLabel}>support tools used</Text>
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
                              <Text style={styles.featureStatLabel}>{item.name === 'Toolkit' ? 'done' : 'saved'}</Text>
                            </View>
                          </View>
                          <Text style={styles.featureStatDetail}>{item.detail}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : null}

              {activeTab === 'recap' ? (
                <View style={styles.recapCard}>
                  <View style={styles.recapHeader}>
                    <Text style={styles.sectionTitle}>Monthly recap</Text>
                    <Text style={styles.recapMonth}>{currentMonthLabel}</Text>
                  </View>
                  <Text style={styles.recapText}>
                    Your recap will summarise patterns from saved check-ins, Emotionize reflections, and Express entries.
                  </Text>
                </View>
              ) : null}

              {activeTab === 'saved' ? (
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
                              <View style={[styles.emotionPill, { backgroundColor: item.categoryColor || '#e1dcf9' }]}>
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
              ) : null}
            </>
          ) : null}
        </ScrollView>
        {sessionUser && accountMenuOpen ? (
          <View style={styles.floatingAccountMenuLayer} pointerEvents="box-none">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close profile menu"
              onPress={closeAccountMenu}
              style={styles.floatingAccountMenuScrim}
            />
            <Animated.View style={[styles.floatingAccountMenu, { transform: [{ translateX: menuTranslateX }] }]}>
              <Pressable
                onPress={() => {
                  closeAccountMenu();
                  router.push('/settings');
                }}
                style={({ pressed }) => [styles.accountMenuRow, pressed && styles.rowPressed]}>
                <Text style={styles.accountMenuText}>Settings</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  closeAccountMenu();
                  router.push('/faqs');
                }}
                style={({ pressed }) => [styles.accountMenuRow, pressed && styles.rowPressed]}>
                <Text style={styles.accountMenuText}>FAQs</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              <Pressable
                disabled={isLoggingOut}
                onPress={logout}
                style={({ pressed }) => [styles.accountMenuRow, pressed && styles.rowPressed]}>
                <Text style={[styles.accountMenuText, styles.accountMenuDangerText]}>
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : null}
      </SafeAreaView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: space.screenX, paddingTop: space.sm, paddingBottom: 122, gap: space.lg },
  header: { gap: space.xs, paddingHorizontal: space.sm, paddingTop: space.sm, paddingBottom: 4 },
  headerTopRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  hamburgerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5dff0',
  },
  hamburgerLine: { color: '#1f1635', fontSize: 22, lineHeight: 24, fontWeight: '700' },
  title: { color: '#1f1635', textAlign: 'center', fontSize: typeScale.pageTitle, fontWeight: '700', lineHeight: lineScale.pageTitle, letterSpacing: -0.25 },
  subtitle: { color: '#70677f', textAlign: 'center', fontSize: typeScale.body, lineHeight: lineScale.body, maxWidth: 330 },
  accountCard: {
    borderRadius: radius.xl,
    backgroundColor: '#ffffff',
    padding: space.lg,
    gap: space.md,
    position: 'relative',
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
    fontSize: typeScale.eyebrow,
    fontWeight: '900',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  accountTitle: { color: '#1f1635', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '700', letterSpacing: -0.2 },
  accountText: { color: '#5e4f79', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600' },
  accountFootnote: { color: '#817690', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600', textAlign: 'center' },
  accountActions: { gap: space.sm },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  floatingAccountMenuLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    elevation: 50,
  },
  floatingAccountMenuScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 22, 53, 0.18)',
  },
  floatingAccountMenu: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDE_MENU_WIDTH,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5dff0',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    paddingTop: 88,
  },
  accountMenuRow: {
    minHeight: controlSize.large,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee8f6',
  },
  accountMenuText: { flex: 1, color: '#1f1635', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '700' },
  accountMenuDangerText: { color: '#8a2440' },
  profileAvatarWrap: {
    position: 'relative',
  },
  profileAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  profileAvatarText: { fontSize: 30, lineHeight: 34, fontWeight: '900' },
  profileHeroCopy: { flex: 1, gap: 4 },
  avatarEditButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#1f1635',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarEditText: { color: '#ffffff', fontSize: 12, lineHeight: 14, fontWeight: '800' },
  avatarPicker: {
    gap: 10,
    borderRadius: 20,
    backgroundColor: '#fbf9ff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5dff0',
    padding: 12,
  },
  avatarOptions: { flexDirection: 'row', gap: 10 },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  avatarOptionSelected: {
    borderColor: '#1f1635',
    borderWidth: 2,
  },
  avatarOptionText: { fontSize: 17, lineHeight: 20, fontWeight: '900' },
  authCtaButton: {
    alignSelf: 'stretch',
    minHeight: controlSize.large,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#1f003d',
    borderWidth: 0,
    borderColor: '#1f003d',
    paddingHorizontal: 18,
  },
  authCtaButtonText: { color: '#ffffff', fontSize: typeScale.bodyLarge, fontWeight: '800', letterSpacing: -0.1 },
  authCtaChevron: { color: '#ffffff', fontSize: 24, lineHeight: 24, fontWeight: '600', marginTop: -2 },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ded7ec',
  },
  secondaryButtonText: { color: '#1f1635', fontSize: typeScale.bodyLarge, fontWeight: '800' },
  logoutButton: {
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff4f6',
    borderWidth: 1,
    borderColor: '#f1ccd5',
  },
  logoutButtonText: { color: '#8a2440', fontSize: typeScale.bodyLarge, fontWeight: '800' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  profileTabs: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  profileTab: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  profileTabActive: { backgroundColor: '#c2dcff' },
  profileTabText: { color: '#70677f', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '800' },
  profileTabTextActive: { color: '#1f1635' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: radius.lg,
    backgroundColor: '#c2dcff',
    padding: space.md,
    justifyContent: 'center',
    gap: 6,
  },
  statNumber: { color: '#1f1635', fontSize: typeScale.pageTitle, lineHeight: lineScale.pageTitle, fontWeight: '800' },
  statLabel: { color: '#5e4f79', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '700' },
  featureStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureStatCard: {
    width: '48%',
    minHeight: 116,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 15,
    gap: 10,
    justifyContent: 'space-between',
  },
  featureStatName: { color: '#1f1635', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '700', letterSpacing: -0.15 },
  featureStatNumbers: { flexDirection: 'row', gap: 10 },
  featureStatNumberBlock: { flex: 1, gap: 2 },
  featureStatNumber: { color: '#1f1635', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '800' },
  featureStatLabel: { color: '#5e4f79', fontSize: typeScale.eyebrow, lineHeight: lineScale.eyebrow, fontWeight: '800', textTransform: 'uppercase' },
  featureStatDetail: { color: '#70677f', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '700' },
  recapCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  recapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  recapMonth: { color: '#70677f', fontSize: typeScale.helper, fontWeight: '800' },
  recapText: { color: '#5e4f79', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600' },
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
  rowText: { flex: 1, color: '#1f1635', fontSize: typeScale.bodyLarge, fontWeight: '800' },
  chevron: { color: '#8f87a0', fontSize: 26, lineHeight: 28, fontWeight: '400' },
  section: { gap: 10 },
  sectionTitle: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '500',
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
    fontSize: typeScale.eyebrow,
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
  checkInPill: { borderRadius: 999, backgroundColor: '#d5f1f0', paddingHorizontal: 10, paddingVertical: 6 },
  checkInPillText: { color: '#2d6867', fontSize: typeScale.helper, fontWeight: '800' },
  emotionPill: { borderRadius: 999, backgroundColor: '#e1dcf9', paddingHorizontal: 10, paddingVertical: 6 },
  emotionPillText: { color: '#4a3f72', fontSize: typeScale.helper, fontWeight: '800' },
  expressPill: { borderRadius: 999, backgroundColor: '#c2dcff', paddingHorizontal: 10, paddingVertical: 6 },
  expressPillText: { color: '#294b78', fontSize: typeScale.helper, fontWeight: '800' },
  dateText: { color: '#8b829d', fontSize: typeScale.helper, fontWeight: '600' },
  contextText: { color: '#70677f', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600' },
  reflectionText: { color: '#241b3b', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  emptyTitle: { color: '#1f1635', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '800' },
  emptyText: { color: '#70677f', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge, textAlign: 'center' },
});

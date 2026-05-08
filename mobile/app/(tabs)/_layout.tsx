import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Text } from '@/components/nomy-type';
import { IconSymbol } from '@/components/ui/icon-symbol';

const INTRO_STORAGE_KEY = 'nomy_intro_seen';
const DEMO_STORAGE_KEY = 'nomy_demo_seen';

async function getIntroSeen() {
  try {
    return (await AsyncStorage.getItem(INTRO_STORAGE_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function setIntroSeenValue() {
  try {
    await AsyncStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch {
    // Expo Go can lack this native module in some clients. The app should still continue.
  }
}

async function getDemoSeen() {
  try {
    return (await AsyncStorage.getItem(DEMO_STORAGE_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function setDemoSeenValue() {
  try {
    await AsyncStorage.setItem(DEMO_STORAGE_KEY, 'true');
  } catch {
    // Demo should never block the app if storage is unavailable.
  }
}

const introSlides = [
  {
    body: [
      'You’ve just entered a space built differently on purpose.',
      'A space that understands the quiet exhaustion of always trying to fit into systems that weren’t made with your mind in mind.',
      'Here, you don’t have to mask, explain or perform.',
      'You get to simply be and explore who that really is.',
    ],
  },
  {
    body: ['nomy is here to help you reconnect with yourself and meet yourself with understanding, maybe for the first time.'],
    features: [
      ['Emotionize', 'understand your feelings.'],
      ['Express', 'create, reflect, and release.'],
      ['Check-in', 'set gentle goals for your day.'],
      ['Toolkit', 'find calm when things feel too much.'],
    ],
  },
  {
    body: ['Welcome home.'],
  },
];

const demoSlides = [
  {
    title: 'Adaptive Avatar',
    text: 'Tap Home whenever you want to return to your check-in and adaptive avatar.',
    target: 'avatar',
  },
  {
    title: 'Emotionize',
    text: 'Emotion Mapping helps you explore feelings, unlock emotional language, and read story prompts.',
    target: 'emotionize',
  },
  {
    title: 'Check-in',
    text: 'Daily Check-ins give you a gentle place for morning, evening, and reflection prompts.',
    target: 'dailies',
  },
  {
    title: 'Express',
    text: 'Self-Expression in Express helps you find words, write things out, and release a thought safely.',
    target: 'express',
  },
  {
    title: 'Toolkit',
    text: 'Tap Toolkit for breathing, focus, and grounding tools when things feel too much.',
    target: 'toolkit',
  },
] as const;

function FirstRunIntro({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = introSlides[index];
  const isLast = index === introSlides.length - 1;

  async function next() {
    if (!isLast) {
      setIndex((current) => current + 1);
      return;
    }

    await setIntroSeenValue();
    onComplete();
  }

  async function enterAuth(path: '/login' | '/register') {
    await setIntroSeenValue();
    onComplete();
    router.push(path);
  }

  function previous() {
    setIndex((current) => Math.max(0, current - 1));
  }

  return (
    <SafeAreaView style={styles.introScreen}>
      <View style={styles.progressRow}>
        {introSlides.map((_, slideIndex) => (
          <View key={slideIndex} style={styles.progressBar}>
            <View style={[styles.progressFill, slideIndex <= index && styles.progressFillActive]} />
          </View>
        ))}
      </View>

      <View style={styles.logoWrap}>
        <Image
          source={require('@/assets/images/nomy-logo-new.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.introCard}>
        {slide.body.map((line) => (
          <Text key={line} style={styles.introText}>
            {line}
          </Text>
        ))}

        {slide.features ? (
          <View style={styles.features}>
            {slide.features.map(([label, text], featureIndex) => (
              <View key={label} style={styles.featureRow}>
                <View style={[styles.featurePill, styles[`featurePill${featureIndex}`]]}>
                  <Text style={styles.featurePillText}>{label}</Text>
                </View>
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.introActions}>
        <Pressable onPress={previous} disabled={index === 0} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, index === 0 && styles.disabledText]}>
            Previous
          </Text>
        </Pressable>
        <Pressable onPress={next} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Tap to enter nomy' : 'Tap anywhere → to continue'}
          </Text>
        </Pressable>
      </View>
      {isLast ? (
        <View style={styles.authActions}>
          <Pressable onPress={() => enterAuth('/register')} style={styles.authButton}>
            <Text style={styles.authButtonText}>Create account</Text>
          </Pressable>
          <Pressable onPress={() => enterAuth('/login')} style={styles.authButton}>
            <Text style={styles.authButtonText}>Log in</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function FirstRunDemo({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = demoSlides[index];
  const isLast = index === demoSlides.length - 1;

  async function finishDemo() {
    await setDemoSeenValue();
    onComplete();
  }

  function next() {
    if (isLast) {
      finishDemo();
      return;
    }

    setIndex((current) => current + 1);
  }

  function previous() {
    setIndex((current) => Math.max(0, current - 1));
  }

  return (
    <SafeAreaView style={styles.demoScreen}>
      <View style={styles.progressRow}>
        {demoSlides.map((_, slideIndex) => (
          <View key={slideIndex} style={styles.demoProgressBar}>
            <View style={[styles.progressFill, slideIndex <= index && styles.progressFillActive]} />
          </View>
        ))}
      </View>

      <View style={styles.coachMock}>
        <View style={styles.coachHeader}>
          <View style={styles.coachLogo} />
          <View style={styles.coachAvatar} />
        </View>

        <View style={[styles.coachCheckIn, slide.target === 'avatar' && styles.coachHighlight]}>
          <Text style={styles.coachKicker}>Adaptive Avatar</Text>
          <Text style={styles.coachMockTitle}>How are you arriving?</Text>
          <View style={styles.coachMoodRow}>
            <View style={styles.coachMood} />
            <View style={styles.coachMood} />
          </View>
        </View>

        <View style={styles.coachContentFill}>
          <View style={styles.coachLine} />
          <View style={styles.coachLineShort} />
          <View style={styles.coachPreviewCard} />
        </View>

        <View style={styles.coachDim} pointerEvents="none" />

        <View style={styles.coachSpeechBubble}>
          <Text style={styles.demoTitle}>{slide.title}</Text>
          <Text style={styles.demoText}>{slide.text}</Text>
          <Text style={styles.demoCount}>{index + 1} of {demoSlides.length}</Text>
          <View style={styles.coachSpeechArrow} />
        </View>

        <View style={styles.coachTabBar}>
          {['Home', 'Emotionize', 'Check-in', 'Express', 'Toolkit'].map((label) => {
            const target = label === 'Home' ? 'avatar' : label === 'Check-in' ? 'dailies' : label.toLowerCase();
            const active = slide.target === target;
            return (
              <View
                key={label}
                style={[
                  styles.coachTab,
                  !active && styles.coachTabDimmed,
                  active && styles.coachTabHighlight,
                ]}>
                {active ? (
                  <View style={styles.coachTapBadge}>
                    <Text style={styles.coachTapBadgeText}>Tap</Text>
                  </View>
                ) : null}
                <View style={[styles.coachTabIcon, active && styles.coachTabIconActive]} />
                <Text style={[styles.coachTabText, active && styles.coachTabTextActive]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.introActions}>
        <Pressable onPress={previous} disabled={index === 0} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, index === 0 && styles.disabledText]}>
            Previous
          </Text>
        </Pressable>
        <Pressable onPress={next} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Start using nomy' : 'Next'}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={finishDemo} style={styles.skipDemoButton}>
        <Text style={styles.skipDemoText}>Skip demo</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [demoSeen, setDemoSeen] = useState<boolean | null>(null);

  useEffect(() => {
    getIntroSeen().then(setIntroSeen);
    getDemoSeen().then(setDemoSeen);
  }, []);

  const activeColor = '#1f003d';
  const inactiveColor = '#6f6285';

  if (introSeen === null || demoSeen === null) {
    return <View style={styles.loadingScreen} />;
  }

  if (!introSeen) {
    return <FirstRunIntro onComplete={() => setIntroSeen(true)} />;
  }

  if (!demoSeen) {
    return <FirstRunDemo onComplete={() => setDemoSeen(true)} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#d8d0e8',
          minHeight: 86,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          fontFamily: 'DMSans_700Bold',
          lineHeight: 14,
        },
        tabBarItemStyle: {
          minHeight: 62,
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <IconSymbol size={24} name="house.fill" color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="emotionize"
        options={{
          title: 'Emotionize',
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <IconSymbol size={23} name="heart.fill" color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dailies"
        options={{
          title: 'Check-in',
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <IconSymbol size={23} name="calendar" color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="express"
        options={{
          title: 'Express',
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <IconSymbol size={23} name="bubble.left.fill" color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="toolkit"
        options={{
          title: 'Toolkit',
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <IconSymbol size={23} name="wrench.and.screwdriver.fill" color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: '#f1ecff' },
  introScreen: {
    flex: 1,
    backgroundColor: '#eee9ff',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 18,
  },
  demoScreen: {
    flex: 1,
    backgroundColor: '#fbf9ff',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 18,
  },
  progressRow: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  progressBar: { flex: 1, height: 6, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.55)' },
  demoProgressBar: { flex: 1, height: 6, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e4deef' },
  progressFill: { height: '100%', width: '0%', backgroundColor: '#1f003d' },
  progressFillActive: { width: '100%' },
  logoWrap: { alignItems: 'center', paddingTop: 6 },
  logo: { width: 190, height: 132 },
  introCard: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.38)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  introText: { color: '#1f003d', textAlign: 'center', fontSize: 18, lineHeight: 27 },
  coachMock: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ded7ec',
    padding: 14,
    gap: 12,
    overflow: 'hidden',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachLogo: {
    width: 92,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#d8d0e8',
  },
  coachAvatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#eee9ff',
  },
  coachCheckIn: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f6f2ff',
    padding: 14,
    gap: 8,
    zIndex: 0,
  },
  coachKicker: { color: '#5e4f79', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  coachMockTitle: { color: '#1f003d', fontSize: 20, fontWeight: '800' },
  coachMoodRow: { flexDirection: 'row', gap: 8 },
  coachMood: { flex: 1, height: 42, borderRadius: 8, backgroundColor: '#ffffff' },
  coachContentFill: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#f7f4fc',
    borderWidth: 1,
    borderColor: '#eee7f7',
    padding: 12,
    gap: 10,
    justifyContent: 'center',
  },
  coachLine: {
    width: '74%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#ded7ec',
  },
  coachLineShort: {
    width: '52%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#e9e2f2',
  },
  coachPreviewCard: {
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded7ec',
    backgroundColor: '#eee9ff',
  },
  coachSpeechBubble: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded7ec',
    backgroundColor: '#ffffff',
    padding: 18,
    alignItems: 'center',
    gap: 10,
    zIndex: 4,
    shadowColor: '#1f003d',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  coachSpeechArrow: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ded7ec',
    transform: [{ rotate: '45deg' }],
  },
  coachTabBar: {
    minHeight: 76,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded7ec',
    backgroundColor: '#ffffff',
    padding: 5,
    gap: 4,
    zIndex: 3,
  },
  coachTab: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    position: 'relative',
  },
  coachTabHighlight: {
    borderColor: '#1f003d',
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.95,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 4,
  },
  coachTabDimmed: {
    opacity: 0.42,
  },
  coachTapBadge: {
    minWidth: 34,
    minHeight: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f003d',
    paddingHorizontal: 6,
  },
  coachTapBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  coachTabIcon: {
    width: 24,
    height: 18,
    borderRadius: 8,
    backgroundColor: '#d8d0e8',
  },
  coachTabIconActive: {
    backgroundColor: '#1f003d',
  },
  coachTabText: {
    color: '#6f6285',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  coachTabTextActive: {
    color: '#1f003d',
  },
  coachHighlight: {
    borderColor: '#1f003d',
    backgroundColor: '#ffffff',
    shadowColor: '#1f003d',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 3,
  },
  coachDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,0,61,0.58)',
    borderRadius: 8,
    zIndex: 2,
  },
  demoTitle: { color: '#1f003d', textAlign: 'center', fontSize: 25, lineHeight: 30, fontWeight: '800' },
  demoText: { color: '#4b3970', textAlign: 'center', fontSize: 16, lineHeight: 23 },
  demoCount: { color: '#6f6285', textAlign: 'center', fontSize: 13, fontWeight: '700' },
  features: { width: '100%', gap: 10, paddingTop: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featurePill: { width: 124, minHeight: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  featurePill0: { backgroundColor: '#e9c3f1' },
  featurePill1: { backgroundColor: '#e1dcf9' },
  featurePill2: { backgroundColor: '#f1f1ff' },
  featurePill3: { backgroundColor: '#fff5e9' },
  featurePillText: { color: '#1f003d', fontSize: 15, fontWeight: '600' },
  featureText: { flex: 1, color: '#1f003d', fontSize: 15, lineHeight: 21, fontStyle: 'italic' },
  introActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authActions: { flexDirection: 'row', gap: 10 },
  authButton: { flex: 1, minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: '#1f003d', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.35)' },
  authButtonText: { color: '#1f003d', fontSize: 15, fontWeight: '800' },
  skipDemoButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  skipDemoText: { color: '#4b3970', fontSize: 16, fontWeight: '700' },
  secondaryButton: { minHeight: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondaryButtonText: { color: '#4b3970', fontSize: 16, fontWeight: '600' },
  disabledText: { opacity: 0.35 },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f003d', paddingHorizontal: 16 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  tabIconWrap: {
    width: 34,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1eef8',
  },
  tabIconWrapActive: {
    backgroundColor: '#1f003d',
  },
});

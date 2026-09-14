import { Tabs, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';
import { loadOnboardingState, setDemoSeenValue, setIntroSeenValue } from '@/constants/onboarding';
import { IconSymbol } from '@/components/ui/icon-symbol';

const introSlides = [
  {
    body: [
      'This is a space for late-diagnosed autistic adults.',
      "We know how exhausting it can be to constantly adapt to a world that wasn't build with us in mind.",
      "Here. you don't have to mask, explain yourself or perform.",
      'You can simply be yourself and explore who you are.',
    ],
  },
  {
    body: ['nomy is here to help you reconnect with yourself and understand your experiences, maybe for the first\u00a0time.'],
    features: [
      ['Emotionize', "Understand what you're feeling"],
      ['Check-in', 'set gentle goals for your day.'],
      ['Express', 'Find words that feel authentic to you.'],
      ['Toolkit', 'Practical support when you need it'],
    ],
  },
  {
    body: ['Welcome home.'],
  },
];

const introFeatureActions = [
  {
    title: 'Emotionize',
    description: "Understand what you're feeling",
    color: '#f4f8f3',
  },
  {
    title: 'Check-in',
    description: 'set gentle goals for your day.',
    color: '#fffaeb',
  },
  {
    title: 'Express',
    description: 'Find words that feel authentic to you.',
    color: '#e9f0fa',
  },
  {
    title: 'Toolkit',
    description: 'Practical support when you need it',
    color: '#fde6cf',
  },
] as const;

const demoSlides = [
  {
    title: 'Home',
    text: 'Home lets you pick up where you left off, or use a quick start when you know what would help.',
    target: 'home',
  },
  {
    title: 'Support',
    text: "Explore all of nomy's tools, including Emotionize, Express, Check-in and Toolkit.",
    target: 'support',
  },
  {
    title: 'Profile',
    text: 'Profile is where login, saved reflections, monthly recaps, and personal stats live.',
    target: 'profile',
  },
] as const;

const demoSuggestedCards = [
  { title: 'Emotionize', label: "Understand what you're feeling", color: '#f4f8f3' },
  { title: 'Check-in', label: 'Use morning or evening prompts', color: '#fffaeb' },
  { title: 'Express', label: 'Find words that feel authentic', color: '#e9f0fa' },
  { title: 'Toolkit', label: 'Practical support when you need it', color: '#fde6cf' },
] as const;

const demoHomeEssentials = [
  { title: 'Calm my body', label: 'Breathing', color: '#fde6cf' },
  { title: 'Find words', label: 'Express', color: '#e9f0fa' },
  { title: 'Evening reflection', label: 'Check-in', color: '#fffaeb' },
] as const;

const featureTabColors = {
  home: '#fbf9ff',
  support: '#fbf9ff',
  profile: '#fbf9ff',
} as const;

const tabMeta = {
  index: { label: 'Home', color: featureTabColors.home },
  support: { label: 'Support', color: featureTabColors.support },
  profile: { label: 'Profile', color: featureTabColors.profile },
} as const;

type TabRouteName = keyof typeof tabMeta;

function isTabRouteName(name: string): name is TabRouteName {
  return name in tabMeta;
}

function primaryTabForRoute(name: string | undefined): TabRouteName {
  if (name === 'profile') {
    return 'profile';
  }

  if (name === 'index') {
    return 'index';
  }

  return 'support';
}

function TabIcon({ color, focused, name }: { color: string; focused: boolean; name: TabRouteName }) {
  const iconColor = focused ? '#1f1635' : color;

  if (name === 'index') {
    return <IconSymbol size={24} name="house.fill" color={iconColor} />;
  }

  if (name === 'support') {
    return <IconSymbol size={23} name="heart.fill" color={iconColor} />;
  }

  return <IconSymbol size={23} name="person.crop.circle.fill" color={iconColor} />;
}

type NomyTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function NomyTabBar({ descriptors, navigation, state }: NomyTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const [bubbleX] = useState(() => new Animated.Value(0));
  const routes = state.routes.filter((route) => isTabRouteName(route.name));
  const activeRoute = state.routes[state.index];
  const activeName = primaryTabForRoute(activeRoute?.name);
  const activeVisibleIndex = Math.max(0, routes.findIndex((route) => route.name === activeName));
  const tabWidth = barWidth > 0 ? (barWidth - 16) / routes.length : 0;

  useEffect(() => {
    if (!tabWidth) {
      return;
    }

    Animated.spring(bubbleX, {
      toValue: activeVisibleIndex * tabWidth,
      tension: 95,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [activeVisibleIndex, bubbleX, tabWidth]);

  return (
    <View
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      style={styles.customTabBar}>
      {tabWidth ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.movingTabBubble,
            {
              width: tabWidth + 8,
              backgroundColor: tabMeta[activeName].color,
              transform: [{ translateX: Animated.add(bubbleX, -4) }],
            },
          ]}
        />
      ) : null}

      {routes.map((route) => {
        const routeName = route.name as TabRouteName;
        const options = descriptors[route.key]?.options;
        const focused = activeName === routeName;
        const label = tabMeta[routeName].label;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        function onLongPress() {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        }

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options?.tabBarAccessibilityLabel}
            key={route.key}
            onLongPress={onLongPress}
            onPress={onPress}
            style={styles.customTabItem}>
            <View style={styles.customTabIcon}>
              <TabIcon color={focused ? '#1f1635' : '#6f6285'} focused={focused} name={routeName} />
            </View>
            <Text style={[styles.customTabLabel, focused && styles.customTabLabelFocused]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DemoPagePreview({ target }: { target: (typeof demoSlides)[number]['target'] }) {
  if (target === 'support') {
    return (
      <View style={[styles.demoPreview, styles.demoSupportPreview]}>
        <View style={styles.demoPageHeader}>
          <Text style={styles.demoPreviewKicker}>Support</Text>
        </View>
        <Text style={styles.demoPreviewTitle}>What kind of support do you want?</Text>
        <View style={styles.demoPreviewList}>
          {demoSuggestedCards.map((item) => (
            <View key={item.title} style={[styles.demoPreviewRow, { backgroundColor: item.color }]}>
              <View style={styles.demoPreviewCopy}>
                <Text style={styles.demoPreviewRowTitle}>{item.title}</Text>
                <Text style={styles.demoPreviewRowText}>{item.label}</Text>
              </View>
              <Text style={styles.demoPreviewChevron}>›</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (target === 'profile') {
    return (
      <View style={[styles.demoPreview, styles.demoProfilePreview]}>
        <View style={styles.demoPageHeader}>
          <Text style={styles.demoPreviewKicker}>Profile</Text>
        </View>
        <Text style={styles.demoPreviewTitle}>Profile</Text>
        <View style={styles.demoAccountCard}>
          <Text style={styles.demoPreviewRowTitle}>Account</Text>
          <Text style={styles.demoPreviewRowText}>Save reflections and see patterns</Text>
          <View style={styles.demoAuthButton}>
            <Text style={styles.demoAuthButtonText}>Log in or create account</Text>
          </View>
        </View>
        <View style={styles.demoStatsRow}>
          <View style={styles.demoStatCard}>
            <Text style={styles.demoStatNumber}>12</Text>
            <Text style={styles.demoStatLabel}>saved</Text>
          </View>
          <View style={styles.demoStatCard}>
            <Text style={styles.demoStatNumber}>4</Text>
            <Text style={styles.demoStatLabel}>tools</Text>
          </View>
        </View>
        <View style={styles.demoProfileRow}>
          <View style={styles.demoPreviewCopy}>
            <Text style={styles.demoPreviewRowTitle}>Monthly recap</Text>
            <Text style={styles.demoPreviewRowText}>Patterns and stats</Text>
          </View>
          <Text style={styles.demoPreviewChevron}>›</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.demoPreview, styles.demoHomePreview]}>
      <View style={styles.demoPageHeader}>
        <Text style={styles.demoPreviewKicker}>Home</Text>
      </View>
      <Text style={styles.demoPreviewTitle}>What would help next?</Text>
      <View style={styles.demoContinueCard}>
        <Text style={styles.demoPreviewRowText}>Continue</Text>
        <Text style={styles.demoPreviewRowTitle}>Continue Express</Text>
        <Text style={styles.demoMiniBody}>Pick up where you left off.</Text>
      </View>
      <Text style={styles.demoSectionLabel}>Your essentials</Text>
      <View style={styles.demoEssentialsGrid}>
        {demoHomeEssentials.map((item) => (
          <View key={item.title} style={[styles.demoEssentialCard, { backgroundColor: item.color }]}>
            <Text style={styles.demoEssentialText}>{item.title}</Text>
            <Text style={styles.demoEssentialMeta}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.demoProfileRow}>
        <View style={styles.demoPreviewCopy}>
          <Text style={styles.demoPreviewRowTitle}>Often helpful</Text>
          <Text style={styles.demoPreviewRowText}>Try one breathing round</Text>
        </View>
        <Text style={styles.demoPreviewChevron}>›</Text>
      </View>
    </View>
  );
}

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

  function previous() {
    setIndex((current) => Math.max(0, current - 1));
  }

  return (
    <SafeAreaView style={styles.introScreen}>
      <Text style={styles.introWordmark}>nomy</Text>

      <View style={styles.introCard}>
        {slide.body.map((line) => (
          <Text key={line} style={styles.introText}>
            {line}
          </Text>
        ))}

        {slide.features ? (
          <View style={styles.introFeatureGrid}>
            {introFeatureActions.map((item) => (
              <View key={item.title} style={[styles.introFeatureButton, { backgroundColor: item.color }]}>
                <View style={styles.introFeatureCopy}>
                  <Text style={styles.introFeatureTitle}>{item.title}</Text>
                  <Text style={styles.introFeatureDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.introActions}>
        {index > 0 ? (
          <Pressable onPress={previous} style={[styles.introNavButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={next} style={[styles.introNavButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Enter nomy' : 'Continue'}
          </Text>
        </Pressable>
      </View>
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
        </View>

        <DemoPagePreview target={slide.target} />

        <View style={styles.coachSpeechBubble}>
          <Text style={styles.demoTitle}>{slide.title}</Text>
          <Text style={styles.demoText}>{slide.text}</Text>
          <Text style={styles.demoCount}>{index + 1} of {demoSlides.length}</Text>
          <View style={styles.coachSpeechArrow} />
        </View>

        <View style={styles.coachTabBar}>
          {['Home', 'Support', 'Profile'].map((label) => {
            const target = label.toLowerCase();
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
                <Text style={[styles.coachTabText, active && styles.coachTabTextActive]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.introActions}>
        {index > 0 ? (
          <Pressable onPress={previous} style={[styles.introNavButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </Pressable>
        ) : (
          <Pressable onPress={finishDemo} style={[styles.introNavButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>Skip demo</Text>
          </Pressable>
        )}
        <Pressable onPress={next} style={[styles.introNavButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>
            {isLast ? 'Start using nomy' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  const segments = useSegments();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [demoSeen, setDemoSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function loadState() {
      const nextState = await loadOnboardingState();
      if (active) {
        setIntroSeen(nextState.introSeen);
        setDemoSeen(nextState.demoSeen);
      }
    }

    void loadState();

    return () => {
      active = false;
    };
  }, []);

  const activeColor = '#1f003d';
  const inactiveColor = '#6f6285';
  const currentTab = String(segments[segments.length - 1] ?? '');
  const shouldShowOnboarding = !currentTab || currentTab === '(tabs)' || currentTab === 'index';

  if (shouldShowOnboarding && (introSeen === null || demoSeen === null)) {
    return <View style={styles.loadingScreen} />;
  }

  if (shouldShowOnboarding && !introSeen) {
    return <FirstRunIntro onComplete={() => setIntroSeen(true)} />;
  }

  if (shouldShowOnboarding && !demoSeen) {
    return <FirstRunDemo onComplete={() => setDemoSeen(true)} />;
  }

  return (
    <Tabs
      tabBar={(props) => <NomyTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 12,
          minHeight: 76,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderRadius: 26,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(216, 208, 232, 0.9)',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          shadowColor: '#1f003d',
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          lineHeight: 14,
          marginTop: 4,
          textAlign: 'center',
        },
        tabBarItemStyle: {
          minHeight: 56,
          paddingVertical: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="emotionize"
        options={{
          href: null,
          title: 'Emotionize',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="dailies"
        options={{
          href: null,
          title: 'Check-in',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="express"
        options={{
          href: null,
          title: 'Express',
          headerTitle: '',
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="toolkit"
        options={{
          href: null,
          title: 'Toolkit',
          headerTitle: '',
          headerTransparent: true,
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
  loadingScreen: { flex: 1, backgroundColor: '#fffaf2' },
  introScreen: {
    flex: 1,
    backgroundColor: '#fffaf2',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 18,
  },
  demoScreen: {
    flex: 1,
    backgroundColor: '#fffaf2',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 18,
  },
  progressRow: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  progressBar: { flex: 1, height: 5, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e4deef' },
  demoProgressBar: { flex: 1, height: 6, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e4deef' },
  progressFill: { height: '100%', width: '0%', backgroundColor: '#1f003d' },
  progressFillActive: { width: '100%' },
  introCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  introWordmark: {
    color: '#1f1635',
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 2,
    marginBottom: 2,
  },
  introText: { color: '#1f1635', textAlign: 'center', fontSize: 18, lineHeight: 27, fontWeight: '500', maxWidth: 300 },
  coachMock: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ded7ec',
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachLogo: {
    width: 74,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#d8d0e8',
    alignSelf: 'center',
  },
  demoPreview: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee7f7',
    padding: 13,
    gap: 8,
    overflow: 'hidden',
  },
  demoHomePreview: { backgroundColor: '#f8f5e7' },
  demoSupportPreview: { backgroundColor: '#fffaf2' },
  demoProfilePreview: { backgroundColor: '#e9f0fa' },
  demoPageHeader: { alignItems: 'center', paddingTop: 1 },
  demoPreviewKicker: {
    color: '#7a708c',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    textAlign: 'center',
  },
  demoPreviewTitle: {
    color: '#1f1635',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: -0.25,
  },
  demoPreviewList: { flex: 1, gap: 7, justifyContent: 'center' },
  demoPreviewRow: {
    minHeight: 44,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.1)',
  },
  demoPreviewCopy: { flex: 1, gap: 1 },
  demoPreviewRowTitle: { color: '#1f1635', fontSize: 11, lineHeight: 14, fontWeight: '800' },
  demoPreviewRowText: {
    color: '#6f6285',
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.25,
  },
  demoPreviewChevron: { color: '#7a708c', fontSize: 18, lineHeight: 18, fontWeight: '500' },
  demoContinueCard: {
    minHeight: 62,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    padding: 10,
    gap: 3,
    justifyContent: 'center',
  },
  demoMiniBody: { color: '#817690', fontSize: 9, lineHeight: 12, fontWeight: '600' },
  demoSectionLabel: {
    color: '#6f6285',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginTop: 1,
  },
  demoEssentialsGrid: { flexDirection: 'row', gap: 6 },
  demoEssentialCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    padding: 7,
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    justifyContent: 'space-between',
  },
  demoEssentialText: {
    color: '#1f1635',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  demoEssentialMeta: {
    color: '#5e4f79',
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  demoAccountCard: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    padding: 10,
    gap: 8,
  },
  demoAuthButton: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#1f003d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  demoAuthButtonText: { color: '#ffffff', fontSize: 9, lineHeight: 11, fontWeight: '900' },
  demoStatsRow: { flexDirection: 'row', gap: 7 },
  demoStatCard: {
    flex: 1,
    minHeight: 50,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  demoStatNumber: { color: '#1f1635', fontSize: 17, lineHeight: 20, fontWeight: '900' },
  demoStatLabel: { color: '#6f6285', fontSize: 8, lineHeight: 10, fontWeight: '800', textTransform: 'uppercase' },
  demoProfileRow: {
    minHeight: 42,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachSpeechBubble: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 98,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ded7ec',
    backgroundColor: '#ffffff',
    padding: 16,
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ded7ec',
    backgroundColor: '#ffffff',
    padding: 8,
    gap: 4,
    zIndex: 3,
  },
  coachTab: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    position: 'relative',
  },
  coachTabHighlight: {
    borderColor: '#1f003d',
    backgroundColor: '#fffaf2',
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
    minWidth: 30,
    minHeight: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f003d',
    paddingHorizontal: 6,
  },
  coachTapBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  coachTabText: {
    color: '#6f6285',
    fontSize: 11,
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31,0,61,0.16)',
    borderRadius: 8,
    zIndex: 2,
  },
  demoTitle: { color: '#1f003d', textAlign: 'center', fontSize: 22, lineHeight: 27, fontWeight: '800' },
  demoText: { color: '#4b3970', textAlign: 'center', fontSize: 15, lineHeight: 21 },
  demoCount: { color: '#6f6285', textAlign: 'center', fontSize: 12, fontWeight: '700' },
  introFeatureGrid: { width: '100%', gap: 8, paddingTop: 8 },
  introFeatureButton: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introFeatureCopy: { flex: 1, gap: 1 },
  introFeatureTitle: { color: '#1f003d', fontSize: 15, fontWeight: '800' },
  introFeatureDescription: { color: '#5e4f79', fontSize: 12, fontWeight: '600' },
  introActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  introNavButton: { flex: 1, flexBasis: 0, minWidth: 0, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 1, paddingHorizontal: 18 },
  secondaryButton: { borderColor: '#d8d0e8', backgroundColor: '#ffffff' },
  secondaryButtonText: { color: '#5f5277', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  disabledText: { opacity: 0 },
  primaryButton: { borderColor: '#1f003d', backgroundColor: '#1f003d' },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  customTabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 8,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(216, 208, 232, 0.62)',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    shadowColor: '#1f003d',
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  movingTabBubble: {
    position: 'absolute',
    left: 8,
    top: 7,
    bottom: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    shadowColor: '#1f003d',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  customTabItem: {
    flex: 1,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 0,
  },
  customTabIcon: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTabLabel: {
    color: '#6f6285',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  customTabLabelFocused: {
    color: '#1f1635',
    fontWeight: '900',
  },
  tabIconWrap: {
    width: 36,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -1 }],
  },
  tabIconWrapFocused: {
    width: 54,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.12)',
    shadowColor: '#1f003d',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

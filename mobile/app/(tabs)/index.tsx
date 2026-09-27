import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';
import { TabSwipe } from '@/components/tab-swipe';
import { useAppTheme } from '@/constants/app-theme';
import { getAvatarActivities, type AvatarActivity } from '@/constants/avatar';
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

const HOME_ESSENTIALS_KEY = 'nomy_home_essentials';
const DEFAULT_ESSENTIAL_IDS = ['calm-body', 'find-words'] as const;
const MAX_ESSENTIALS = 4;

const continueTargets = {
  emotionize: {
    title: 'Continue Emotionize',
    description: 'Go back to exploring emotional language.',
    href: '/emotionize',
  },
  dailies: {
    title: 'Continue Check-in',
    description: 'Return to your daily prompts.',
    href: '/dailies',
  },
  express: {
    title: 'Continue Express',
    description: 'Keep finding your voice.',
    href: '/express',
  },
  toolkit: {
    title: 'Continue Toolkit',
    description: 'Return to grounding and focus tools.',
    href: '/toolkit',
  },
  breathing: {
    title: 'Continue Breathing',
    description: 'Do another calm breathing round.',
    href: '/toolkit-breathing',
  },
} as const;

const essentials = [
  {
    id: 'calm-body',
    title: 'Breathe',
    description: 'One guided breathing round.',
    href: '/toolkit-breathing',
    color: '#e9c3f1',
    icon: 'toolkit',
  },
  {
    id: 'find-words',
    title: 'Express',
    description: 'Open Express.',
    href: '/express',
    color: '#c2dcff',
    icon: 'express',
  },
  {
    id: 'morning-check-in',
    title: 'Affirm',
    description: 'Start daily prompts.',
    href: '/dailies-morning',
    color: '#d5f1f0',
    icon: 'checkin',
  },
  {
    id: 'understand-feeling',
    title: 'Feel',
    description: 'Open Emotionize.',
    href: '/emotionize',
    color: '#e1dcf9',
    icon: 'emotionize',
  },
  {
    id: 'memory-pairing',
    title: 'Match',
    description: 'A calm focus puzzle.',
    href: '/toolkit-puzzles',
    color: '#e9c3f1',
    icon: 'toolkit',
  },
] as const;

const oftenHelpfulCards = [
  {
    title: 'I need help communicating my needs',
    action: 'Open Express',
    href: '/express',
    color: '#c2dcff',
    icon: 'express',
  },
  {
    title: 'I want to understand what I’m feeling',
    action: 'Open Emotionize',
    href: '/emotionize',
    color: '#e1dcf9',
    icon: 'emotionize',
  },
] as const;

type ContinueFeature = keyof typeof continueTargets;
type EssentialId = (typeof essentials)[number]['id'];
type EssentialItem = (typeof essentials)[number];
type HomeIcon = 'emotionize' | 'express' | 'toolkit' | 'checkin';

function FeatureIcon({ name }: { name: HomeIcon }) {
  if (name === 'emotionize') {
    return <Image source={require('@/assets/images/emotionize.png')} style={styles.featureIcon} />;
  }

  if (name === 'express') {
    return <Image source={require('@/assets/images/express.png')} style={styles.featureIconLarge} />;
  }

  if (name === 'toolkit') {
    return <Image source={require('@/assets/images/toolkit.png')} style={styles.featureIconWide} />;
  }

  return (
    <View style={styles.checkInIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.checkInPencil}>
        <View style={styles.checkInPencilTip} />
        <View style={styles.checkInPencilBody} />
        <View style={styles.checkInPencilEnd} />
      </View>
    </View>
  );
}

function getContinueFeature(activities: AvatarActivity[]) {
  const lastFeature = [...activities]
    .reverse()
    .find((activity) => activity.feature && activity.feature in continueTargets)?.feature;

  return lastFeature as ContinueFeature | undefined;
}

function openHomeHref(href: string) {
  if (href.startsWith('/toolkit')) {
    router.push({ pathname: href, params: { origin: 'home' } } as Parameters<typeof router.push>[0]);
    return;
  }

  router.push(href as Parameters<typeof router.push>[0]);
}

function isEssentialId(value: string): value is EssentialId {
  return essentials.some((item) => item.id === value);
}

function timeAwareEssential(item: EssentialItem, hour: number) {
  if (item.id !== 'morning-check-in') {
    return item;
  }

  if (hour >= 17) {
    return {
      ...item,
      title: 'Reflect',
      description: 'Reflect on today.',
      href: '/dailies-evening',
    };
  }

  if (hour >= 12) {
    return {
      ...item,
      title: 'Check',
      description: 'Choose morning or evening.',
      href: '/dailies',
    };
  }

  return item;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const [activities, setActivities] = useState<AvatarActivity[]>([]);
  const [essentialIds, setEssentialIds] = useState<EssentialId[]>([...DEFAULT_ESSENTIAL_IDS]);
  const [editingEssentials, setEditingEssentials] = useState(false);
  const [essentialsDragging, setEssentialsDragging] = useState(false);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadHome() {
        const [items, savedEssentials] = await Promise.all([
          getAvatarActivities(),
          AsyncStorage.getItem(HOME_ESSENTIALS_KEY).catch(() => null),
        ]);

        if (active) {
          setCurrentHour(new Date().getHours());
          setActivities(items);

          if (savedEssentials) {
            const parsed = JSON.parse(savedEssentials);
            if (Array.isArray(parsed)) {
              const nextIds = parsed.filter((item): item is EssentialId => typeof item === 'string' && isEssentialId(item));
              if (nextIds.length) {
                setEssentialIds(nextIds.slice(0, MAX_ESSENTIALS));
              }
            }
          }
        }
      }

      loadHome().catch(() => {
        // Home should still render if local customisation cannot be loaded.
      });

      return () => {
        active = false;
      };
    }, []),
  );

  const continueFeature = useMemo(() => getContinueFeature(activities), [activities]);
  const continueItem = continueFeature ? continueTargets[continueFeature] : null;
  const selectedEssentials = useMemo(
    () => essentials.filter((item) => essentialIds.includes(item.id)).map((item) => timeAwareEssential(item, currentHour)),
    [currentHour, essentialIds],
  );
  const visibleEssentials = useMemo(
    () => essentials.map((item) => timeAwareEssential(item, currentHour)),
    [currentHour],
  );

  async function saveEssentials(nextIds: EssentialId[]) {
    setEssentialIds(nextIds);
    try {
      await AsyncStorage.setItem(HOME_ESSENTIALS_KEY, JSON.stringify(nextIds));
    } catch {
      // Customisation should never block Home.
    }
  }

  function toggleEssential(id: EssentialId) {
    const alreadySelected = essentialIds.includes(id);
    if (alreadySelected) {
      if (essentialIds.length <= 1) {
        return;
      }
      void saveEssentials(essentialIds.filter((item) => item !== id));
      return;
    }

    const nextIds = [...essentialIds, id].slice(-MAX_ESSENTIALS);
    void saveEssentials(nextIds);
  }

  return (
    <TabSwipe current="/" disabled={essentialsDragging}>
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <View style={styles.shell}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <View style={[styles.hero, { backgroundColor: theme.screen }]}>
              <View style={styles.promptBlock}>
                <Text style={[styles.promptText, { color: theme.text }]}>Pick up where you left off, or use your most used tools.</Text>
              </View>
            </View>
          </View>

          {continueItem ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.subtle }]}>Continue</Text>
              <Pressable
                onPress={() => openHomeHref(continueItem.href)}
                style={({ pressed }) => [styles.continueCard, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.quickCardPressed]}>
                <View style={styles.continueCopy}>
                  <Text style={[styles.continueEyebrow, { color: theme.subtle }]}>Last used</Text>
                  <Text style={[styles.continueTitle, { color: theme.text }]}>{continueItem.title}</Text>
                  <Text style={[styles.continueText, { color: theme.muted }]}>{continueItem.description}</Text>
                </View>
                <Text style={[styles.choiceChevron, { color: theme.text }]}>›</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.subtle }]}>Your essentials</Text>
              <Pressable
                onPress={() => setEditingEssentials((current) => !current)}
                style={({ pressed }) => [styles.editButton, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.quickCardPressed]}>
                <Text style={[styles.editButtonText, { color: theme.text }]}>{editingEssentials ? 'Done' : 'Edit'}</Text>
              </Pressable>
            </View>

            {editingEssentials ? (
              <View style={[styles.essentialsPicker, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.pickerHint, { color: theme.muted }]}>Choose up to {MAX_ESSENTIALS}. Keep at least one.</Text>
                {visibleEssentials.map((item) => {
                  const selected = essentialIds.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleEssential(item.id)}
                      style={({ pressed }) => [
                        styles.essentialOption,
                        { backgroundColor: selected ? item.color : theme.card, borderTopColor: theme.divider },
                        selected && styles.essentialOptionSelected,
                        pressed && styles.quickCardPressed,
                      ]}>
                      <View style={styles.essentialOptionCopy}>
                        <Text style={[styles.essentialOptionTitle, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.essentialOptionText, { color: theme.muted }]}>{item.description}</Text>
                      </View>
                      <Text style={[styles.checkMark, selected && styles.checkMarkSelected]}>{selected ? '✓' : '+'}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <ScrollView
                horizontal
                contentContainerStyle={styles.essentialsGrid}
                onMomentumScrollEnd={() => setEssentialsDragging(false)}
                onScrollBeginDrag={() => setEssentialsDragging(true)}
                onScrollEndDrag={() => setEssentialsDragging(false)}
                showsHorizontalScrollIndicator={false}>
                {selectedEssentials.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openHomeHref(item.href)}
                    style={({ pressed }) => [styles.essentialCard, { backgroundColor: item.color }, pressed && styles.quickCardPressed]}>
                    <View style={styles.essentialIconFrame}>
                      <FeatureIcon name={item.icon} />
                    </View>
                    <Text style={styles.essentialTitle}>{item.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.subtle }]}>Often helpful</Text>
            <View style={styles.oftenList}>
              {oftenHelpfulCards.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={() => openHomeHref(item.href)}
                  style={({ pressed }) => [styles.oftenCard, { backgroundColor: item.color }, pressed && styles.quickCardPressed]}>
                  <View style={styles.oftenIconFrame}>
                    <FeatureIcon name={item.icon} />
                  </View>
                  <View style={styles.choiceCopy}>
                    <Text style={styles.oftenTitle}>{item.title}</Text>
                    <Text style={styles.oftenAction}>{item.action}</Text>
                  </View>
                  <Text style={styles.choiceChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  shell: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: space.screenX, paddingTop: 34, paddingBottom: 112, gap: space.xl },
  heroWrap: { marginHorizontal: -space.screenX },
  hero: {
    backgroundColor: '#ffffff',
    paddingTop: 4,
    paddingHorizontal: space.screenX,
    paddingBottom: 10,
    gap: space.section,
    overflow: 'hidden',
    position: 'relative',
  },
  promptBlock: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    paddingTop: 12,
    gap: space.sm,
  },
  kicker: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  promptText: { color: '#1f1635', fontSize: typeScale.pageTitle, lineHeight: lineScale.pageTitle, fontWeight: '700', letterSpacing: -0.25 },
  promptSubtext: { color: '#5e4f79', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600', maxWidth: 330 },
  quickCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  section: { gap: space.sm },
  sectionTitle: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    minHeight: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.12)',
    paddingHorizontal: 14,
  },
  editButtonText: { color: '#3a2c6b', fontSize: typeScale.helper, fontWeight: '800' },
  continueCard: {
    minHeight: 126,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    backgroundColor: '#ffffff',
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  continueCopy: { flex: 1, gap: 6 },
  continueEyebrow: { color: '#70677f', fontSize: typeScale.eyebrow, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.35 },
  continueTitle: { color: '#1f1635', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '700', letterSpacing: -0.2 },
  continueText: { color: '#5e4f79', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600' },
  essentialsGrid: { gap: space.sm, paddingRight: space.screenX },
  essentialCard: {
    width: 156,
    minHeight: controlSize.tabBar,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: space.md,
    shadowColor: '#110c28',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  essentialIconFrame: {
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  featureIconLarge: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  featureIconWide: {
    width: 32,
    height: 24,
    resizeMode: 'contain',
  },
  checkInIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInPencil: {
    width: 27,
    height: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    transform: [{ rotate: '-45deg' }],
  },
  checkInPencilTip: {
    width: 0,
    height: 0,
    borderTopWidth: 4.5,
    borderBottomWidth: 4.5,
    borderRightWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#050505',
  },
  checkInPencilBody: {
    width: 15,
    height: 9,
    backgroundColor: '#050505',
  },
  checkInPencilEnd: {
    width: 6,
    height: 9,
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: '#050505',
  },
  essentialTitle: { color: '#1f1635', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '700', letterSpacing: -0.1 },
  essentialText: { color: '#5e4f79', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '700' },
  essentialsPicker: {
    borderRadius: radius.lg,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    overflow: 'hidden',
  },
  pickerHint: {
    color: '#70677f',
    fontSize: typeScale.helper,
    lineHeight: lineScale.helper,
    fontWeight: '700',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  essentialOption: {
    minHeight: controlSize.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31, 22, 53, 0.08)',
  },
  essentialOptionSelected: {
    borderColor: 'rgba(31, 22, 53, 0.14)',
  },
  essentialOptionCopy: { flex: 1, gap: 3 },
  essentialOptionTitle: { color: '#1f1635', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge, fontWeight: '800' },
  essentialOptionText: { color: '#5e4f79', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600' },
  checkMark: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    color: '#817690',
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '900',
    backgroundColor: '#fffaf2',
  },
  checkMarkSelected: {
    color: '#ffffff',
    backgroundColor: '#1f003d',
  },
  choiceCopy: { flex: 1, gap: 6 },
  choiceChevron: { color: '#1f1635', fontSize: 26, lineHeight: 26, fontWeight: '500', opacity: 0.36 },
  oftenList: { gap: space.md },
  oftenCard: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#110c28',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  oftenIconFrame: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oftenTitle: { color: '#1f1635', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '600', letterSpacing: -0.1 },
  oftenText: { color: '#5e4f79', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600' },
  oftenAction: { color: '#3a2c6b', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '800' },
});

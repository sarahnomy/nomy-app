import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';
import { TabSwipe } from '@/components/tab-swipe';
import { getAvatarActivities, type AvatarActivity } from '@/constants/avatar';

const HOME_ESSENTIALS_KEY = 'nomy_home_essentials';
const DEFAULT_ESSENTIAL_IDS = ['calm-body', 'find-words', 'morning-check-in', 'understand-feeling'] as const;
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
    description: 'Keep finding words that fit.',
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
    title: 'Calm my body',
    description: 'One guided breathing round.',
    href: '/toolkit-breathing',
    color: '#fde6cf',
  },
  {
    id: 'find-words',
    title: 'Find words',
    description: 'Open Express.',
    href: '/express',
    color: '#e9f0fa',
  },
  {
    id: 'morning-check-in',
    title: 'Morning check-in',
    description: 'Start daily prompts.',
    href: '/dailies-morning',
    color: '#fffaeb',
  },
  {
    id: 'understand-feeling',
    title: 'Understand a feeling',
    description: 'Open Emotionize.',
    href: '/emotionize',
    color: '#f4f8f3',
  },
  {
    id: 'memory-pairing',
    title: 'Memory Pairing',
    description: 'A calm focus puzzle.',
    href: '/toolkit-puzzles',
    color: '#fde6cf',
  },
] as const;

const oftenHelpfulCards = [
  {
    title: 'When things feel too much',
    description: 'Try one breathing round before choosing what to do next.',
    action: 'Try breathing',
    href: '/toolkit-breathing',
    color: '#fde6cf',
  },
  {
    title: 'When words feel stuck',
    description: 'Express can offer direct or relational wording.',
    action: 'Open Express',
    href: '/express',
    color: '#e9f0fa',
  },
] as const;

type ContinueFeature = keyof typeof continueTargets;
type EssentialId = (typeof essentials)[number]['id'];
type EssentialItem = (typeof essentials)[number];

function getContinueFeature(activities: AvatarActivity[]) {
  const lastFeature = [...activities]
    .reverse()
    .find((activity) => activity.feature && activity.feature in continueTargets)?.feature;

  return lastFeature as ContinueFeature | undefined;
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
      title: 'Evening reflection',
      description: 'Reflect on today.',
      href: '/dailies-evening',
    };
  }

  if (hour >= 12) {
    return {
      ...item,
      title: 'Daily check-in',
      description: 'Choose morning or evening.',
      href: '/dailies',
    };
  }

  return item;
}

export default function HomeScreen() {
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.shell}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <View style={styles.hero}>
              <View style={styles.promptBlock}>
                <Text style={styles.kicker}>Today</Text>
                <Text style={styles.promptText}>What would help next?</Text>
                <Text style={styles.promptSubtext}>Pick up where you left off, or keep your most useful supports close.</Text>
              </View>
            </View>
          </View>

          {continueItem ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue</Text>
              <Pressable
                onPress={() => router.push(continueItem.href)}
                style={({ pressed }) => [styles.continueCard, pressed && styles.quickCardPressed]}>
                <View style={styles.continueCopy}>
                  <Text style={styles.continueEyebrow}>Last used</Text>
                  <Text style={styles.continueTitle}>{continueItem.title}</Text>
                  <Text style={styles.continueText}>{continueItem.description}</Text>
                </View>
                <Text style={styles.choiceChevron}>›</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your essentials</Text>
              <Pressable
                onPress={() => setEditingEssentials((current) => !current)}
                style={({ pressed }) => [styles.editButton, pressed && styles.quickCardPressed]}>
                <Text style={styles.editButtonText}>{editingEssentials ? 'Done' : 'Edit'}</Text>
              </Pressable>
            </View>

            {editingEssentials ? (
              <View style={styles.essentialsPicker}>
                <Text style={styles.pickerHint}>Choose up to {MAX_ESSENTIALS}. Keep at least one.</Text>
                {visibleEssentials.map((item) => {
                  const selected = essentialIds.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleEssential(item.id)}
                      style={({ pressed }) => [
                        styles.essentialOption,
                        { backgroundColor: selected ? item.color : '#ffffff' },
                        selected && styles.essentialOptionSelected,
                        pressed && styles.quickCardPressed,
                      ]}>
                      <View style={styles.essentialOptionCopy}>
                        <Text style={styles.essentialOptionTitle}>{item.title}</Text>
                        <Text style={styles.essentialOptionText}>{item.description}</Text>
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
                    onPress={() => router.push(item.href as Parameters<typeof router.push>[0])}
                    style={({ pressed }) => [styles.essentialCard, { backgroundColor: item.color }, pressed && styles.quickCardPressed]}>
                    <Text style={styles.essentialTitle}>{item.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Often helpful</Text>
            <View style={styles.oftenList}>
              {oftenHelpfulCards.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [styles.oftenCard, { backgroundColor: item.color }, pressed && styles.quickCardPressed]}>
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
  screen: { flex: 1, backgroundColor: '#fffaf2' },
  shell: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 116, gap: 22 },
  heroWrap: { marginHorizontal: -18 },
  hero: {
    backgroundColor: '#fffaf2',
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  promptBlock: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    paddingTop: 12,
    gap: 10,
  },
  kicker: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  promptText: { color: '#1f1635', fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -0.65 },
  promptSubtext: { color: '#5e4f79', fontSize: 17, lineHeight: 25, fontWeight: '600', maxWidth: 330 },
  quickCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  section: { gap: 10 },
  sectionTitle: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
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
  editButtonText: { color: '#3a2c6b', fontSize: 14, fontWeight: '900' },
  continueCard: {
    minHeight: 146,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  continueCopy: { flex: 1, gap: 6 },
  continueEyebrow: { color: '#70677f', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.35 },
  continueTitle: { color: '#1f1635', fontSize: 22, lineHeight: 27, fontWeight: '800', letterSpacing: -0.35 },
  continueText: { color: '#5e4f79', fontSize: 16, lineHeight: 23, fontWeight: '600' },
  essentialsGrid: { gap: 10, paddingRight: 18 },
  essentialCard: {
    width: 164,
    minHeight: 86,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 14,
    justifyContent: 'center',
    shadowColor: '#110c28',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  essentialTitle: { color: '#1f1635', fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.2, textAlign: 'center' },
  essentialText: { color: '#5e4f79', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  essentialsPicker: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    overflow: 'hidden',
  },
  pickerHint: {
    color: '#70677f',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  essentialOption: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31, 22, 53, 0.08)',
  },
  essentialOptionSelected: {
    borderColor: 'rgba(31, 22, 53, 0.14)',
  },
  essentialOptionCopy: { flex: 1, gap: 3 },
  essentialOptionTitle: { color: '#1f1635', fontSize: 16, lineHeight: 21, fontWeight: '900' },
  essentialOptionText: { color: '#5e4f79', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  checkMark: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    color: '#817690',
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '900',
    backgroundColor: '#fffaf2',
  },
  checkMarkSelected: {
    color: '#ffffff',
    backgroundColor: '#1f003d',
  },
  choiceCopy: { flex: 1, gap: 6 },
  choiceChevron: { color: '#1f1635', fontSize: 30, lineHeight: 30, fontWeight: '500', opacity: 0.36 },
  oftenList: { gap: 12 },
  oftenCard: {
    minHeight: 112,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#110c28',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  oftenTitle: { color: '#1f1635', fontSize: 19, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  oftenText: { color: '#5e4f79', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  oftenAction: { color: '#3a2c6b', fontSize: 14, lineHeight: 18, fontWeight: '900' },
});

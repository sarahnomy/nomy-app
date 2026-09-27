import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabSwipe } from '@/components/tab-swipe';
import { Text, TextInput } from '@/components/nomy-type';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/constants/app-theme';
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

type SupportSearchItem = {
  title: string;
  description: string;
  href: Href;
  color: string;
  icon?: 'heart.fill' | 'calendar' | 'bubble.left.fill' | 'wrench.and.screwdriver.fill';
  meta?: string;
  aliases?: readonly string[];
};

const supportItems: SupportSearchItem[] = [
  {
    title: 'Emotionize',
    description: 'Understand a feeling through guided emotional stories.',
    href: '/emotionize',
    color: '#e1dcf9',
    icon: 'heart.fill',
  },
  {
    title: 'Check-in',
    description: 'Use morning, evening, or reflection prompts.',
    href: '/dailies',
    color: '#d5f1f0',
    icon: 'calendar',
  },
  {
    title: 'Express',
    description: 'Find direct or relational words for a situation.',
    href: '/express',
    color: '#c2dcff',
    icon: 'bubble.left.fill',
  },
  {
    title: 'Toolkit',
    description: 'Use breathing, puzzles, and grounding supports.',
    href: '/toolkit',
    color: '#e9c3f1',
    icon: 'wrench.and.screwdriver.fill',
  },
];

const toolSearchItems: SupportSearchItem[] = [
  {
    title: 'Box Breathing',
    description: 'A four-part breathing rhythm.',
    href: { pathname: '/toolkit-breathing', params: { tool: 'Box Breathing' } },
    color: '#e9c3f1',
    meta: 'Toolkit • Breathing',
    aliases: ['box breath', 'square breathing', 'calm down', 'breathing'],
  },
  {
    title: 'Triangle Breathing',
    description: 'A three-part breathing rhythm.',
    href: { pathname: '/toolkit-breathing', params: { tool: 'Triangle Breathing' } },
    color: '#e9c3f1',
    meta: 'Toolkit • Breathing',
    aliases: ['triangle breath', 'breathing'],
  },
  {
    title: 'Extended Exhale',
    description: 'A breathing rhythm with a longer out-breath.',
    href: { pathname: '/toolkit-breathing', params: { tool: 'Extended Exhale' } },
    color: '#e9c3f1',
    meta: 'Toolkit • Breathing',
    aliases: ['extended breathing', 'long exhale', 'exhale breathing', 'breathing'],
  },
  {
    title: 'Memory Pairing',
    description: 'Look at colours first, then match them from memory.',
    href: { pathname: '/toolkit-puzzles', params: { mode: 'memory-pairing' } },
    color: '#e9c3f1',
    meta: 'Toolkit • Puzzles',
    aliases: ['colour match', 'color match', 'memory game', 'matching colours'],
  },
  {
    title: 'Match Object',
    description: 'Flip hidden tiles and match the same object.',
    href: { pathname: '/toolkit-puzzles', params: { mode: 'match-object' } },
    color: '#e9c3f1',
    meta: 'Toolkit • Puzzles',
    aliases: ['object match', 'matching objects', 'object game'],
  },
  {
    title: 'Letter Steps',
    description: 'A gentle five-letter word focus game.',
    href: { pathname: '/toolkit-puzzles', params: { mode: 'letter-steps' } },
    color: '#e9c3f1',
    meta: 'Toolkit • Puzzles',
    aliases: ['word game', 'wordle', 'letters', 'five letter word'],
  },
];

const allSearchItems = [...supportItems, ...toolSearchItems];

function EmotionizeBlobIcon() {
  return <Image source={require('@/assets/images/emotionize.png')} style={styles.emotionizeIcon} />;
}

function ExpressWaveIcon() {
  return <Image source={require('@/assets/images/express.png')} style={styles.expressIcon} />;
}

function CheckInPencilIcon() {
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

function ToolkitCaseIcon() {
  return <Image source={require('@/assets/images/toolkit.png')} style={styles.toolkitIcon} />;
}

export default function SupportScreen() {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return supportItems;
    }

    return allSearchItems.filter((item) =>
      `${item.title} ${item.description} ${item.meta || ''} ${(item.aliases || []).join(' ')}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);
  const isSearching = Boolean(search.trim());

  return (
    <TabSwipe current="/support">
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>What support do you want?</Text>
          </View>

          <View style={[styles.searchBar, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <Text style={[styles.searchIcon, { color: theme.subtle }]}>⌕</Text>
            <TextInput
              onChangeText={setSearch}
              placeholder="Search support"
              placeholderTextColor={theme.subtle}
              style={[styles.searchInput, { color: theme.text }]}
              value={search}
            />
          </View>

          {isSearching ? (
            <View style={[styles.list, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {filteredItems.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [
                    styles.card,
                    { backgroundColor: item.color },
                    pressed && styles.cardPressed,
                  ]}>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.meta ? <Text style={styles.cardMeta}>{item.meta}</Text> : null}
                  </View>
                  <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.featureGrid}>
              {supportItems.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [
                    styles.featureTile,
                    { backgroundColor: item.color },
                    pressed && styles.cardPressed,
                  ]}>
                  <View style={styles.featureIconFrame}>
                    {item.title === 'Emotionize' ? (
                      <EmotionizeBlobIcon />
                    ) : item.title === 'Check-in' ? (
                      <CheckInPencilIcon />
                    ) : item.title === 'Express' ? (
                      <ExpressWaveIcon />
                    ) : item.title === 'Toolkit' ? (
                      <ToolkitCaseIcon />
                    ) : item.icon ? (
                      <IconSymbol color="#050505" name={item.icon} size={24} />
                    ) : null}
                  </View>
                  <Text style={styles.featureTileTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {filteredItems.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.cardSoft }]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No exact match</Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>Try breathing, puzzles, Express, Toolkit, Check-in, or Emotionize.</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: space.screenX, paddingTop: 42, paddingBottom: 122, gap: space.lg },
  header: { alignItems: 'flex-start', gap: space.xs, paddingHorizontal: space.sm, paddingTop: space.sm },
  kicker: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1f1635',
    alignSelf: 'stretch',
    textAlign: 'left',
    fontSize: typeScale.pageTitle,
    lineHeight: lineScale.pageTitle,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  searchBar: {
    minHeight: controlSize.compact,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  searchIcon: { color: '#8b829d', fontSize: 18, lineHeight: 20, fontWeight: '700' },
  searchInput: {
    flex: 1,
    minHeight: controlSize.compact,
    color: '#1f1635',
    fontSize: typeScale.body,
    lineHeight: lineScale.body,
    paddingVertical: 0,
  },
  list: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  featureTile: {
    width: '47.8%',
    minHeight: 68,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: space.sm,
  },
  featureIconFrame: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTileTitle: {
    color: '#050505',
    fontSize: typeScale.body,
    lineHeight: lineScale.body,
    fontWeight: '700',
    letterSpacing: -0.08,
  },
  emotionizeIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  expressIcon: {
    width: 28,
    height: 27,
    resizeMode: 'contain',
  },
  checkInIcon: {
    width: 26,
    height: 26,
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
  toolkitIcon: {
    width: 28,
    height: 22,
    resizeMode: 'contain',
  },
  toolkitHandle: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#050505',
  },
  toolkitHandleCutout: {
    position: 'absolute',
    left: 2.5,
    right: 2.5,
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#e9c3f1',
  },
  toolkitBody: {
    width: 24,
    height: 15,
    borderRadius: 3,
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  toolkitLeftLine: {
    position: 'absolute',
    left: 0,
    top: 5,
    width: 4,
    height: 1.3,
    backgroundColor: '#ffffff',
  },
  toolkitMiddleLine: {
    position: 'absolute',
    left: 7.5,
    right: 7.5,
    top: 5,
    height: 1.3,
    backgroundColor: '#ffffff',
  },
  toolkitRightLine: {
    position: 'absolute',
    right: 0,
    top: 5,
    width: 4,
    height: 1.3,
    backgroundColor: '#ffffff',
  },
  toolkitLeftCurve: {
    position: 'absolute',
    left: 3.4,
    top: 3.4,
    width: 4.2,
    height: 5,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#ffffff',
    borderTopLeftRadius: 6,
  },
  toolkitCornerVertical: {
    position: 'absolute',
    right: 1.2,
    bottom: 2.5,
    width: 1.4,
    height: 5.4,
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  toolkitCornerHorizontal: {
    position: 'absolute',
    right: 1.2,
    bottom: 1.6,
    width: 5.8,
    height: 1.4,
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  card: {
    minHeight: 58,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(31, 22, 53, 0.08)',
  },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
  cardCopy: { flex: 1 },
  cardTitle: { color: '#1f1635', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600', letterSpacing: -0.05 },
  cardMeta: { color: '#70677f', fontSize: typeScale.eyebrow, lineHeight: lineScale.eyebrow, fontWeight: '600' },
  chevron: { color: '#8f87a0', fontSize: 22, lineHeight: 24, fontWeight: '400' },
  emptyState: {
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: space.lg,
    gap: space.xs,
    alignItems: 'center',
  },
  emptyTitle: { color: '#1f1635', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge, fontWeight: '700' },
  emptyText: { color: '#70677f', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600', textAlign: 'center' },
});

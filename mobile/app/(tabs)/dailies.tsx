import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { useAppTheme } from '@/constants/app-theme';
import { recordAvatarActivity } from '@/constants/avatar';
import { lineScale, typeScale } from '@/constants/ui-scale';

const menu = [
  { name: 'Morning', href: '/dailies-morning' },
  { name: 'Evening', href: '/dailies-evening' },
  { name: 'Reflections', href: '/profile' },
  { name: 'Weekly Overview', href: '/profile' },
] as const;

export default function DailiesScreen() {
  const theme = useAppTheme();
  const [eveningPromptVisible, setEveningPromptVisible] = useState(false);

  useEffect(() => {
    void recordAvatarActivity({ type: 'feature_opened', feature: 'dailies' });
  }, []);

  function openCheckIn(href: (typeof menu)[number]['href']) {
    if (href === '/dailies-evening') {
      setEveningPromptVisible(true);
      return;
    }

    router.push(href);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label="Support" onPress={() => router.replace('/support')} />
        <View style={styles.waveWrap}>
          <View style={[styles.wave, { backgroundColor: theme.screen }]}>
            <View style={styles.header}>
              <Text style={[styles.stepLabel, { color: theme.subtle }]}>Check-in</Text>
              <Text style={[styles.title, { color: theme.text }]}>Which part of your day would you like to support?</Text>
            </View>
          </View>
        </View>

        <View style={[styles.grid, { backgroundColor: '#d5f1f0' }]}>
          {menu.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => openCheckIn(item.href)}
              style={({ pressed }) => [styles.categoryButton, { backgroundColor: '#d5f1f0', borderBottomColor: 'rgba(31, 22, 53, 0.1)' }, pressed && styles.rowPressed]}>
              <View style={styles.categoryCopy}>
                <Text style={[styles.categoryText, { color: theme.text }]}>{item.name}</Text>
              </View>
              <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
            </Pressable>
          ))}
        </View>
        </ScrollView>

        {eveningPromptVisible ? (
          <View pointerEvents="box-none" style={styles.promptOverlay}>
            <Pressable style={styles.promptScrim} onPress={() => setEveningPromptVisible(false)} />
            <View style={[styles.promptSheet, { backgroundColor: theme.card }]}>
              <Text style={[styles.promptTitle, { color: theme.text }]}>It might not be evening yet</Text>
              <Text style={[styles.promptText, { color: theme.muted }]}>
                Evening check-in is here for later in the day, when you have more of today to look back on. You can come back later, or continue now if this feels helpful.
              </Text>
              <View style={styles.promptActions}>
                <Pressable onPress={() => setEveningPromptVisible(false)} style={({ pressed }) => [styles.promptSecondary, pressed && styles.rowPressed]}>
                  <Text style={styles.promptSecondaryText}>Come back later</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEveningPromptVisible(false);
                    router.push('/dailies-evening');
                  }}
                  style={({ pressed }) => [styles.promptPrimary, pressed && styles.promptPrimaryPressed]}>
                  <Text style={styles.promptPrimaryText}>Continue now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#d5f1f0' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 24 },
  waveWrap: { marginHorizontal: -18 },
  wave: {
    backgroundColor: '#d5f1f0',
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  stepLabel: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: { color: '#1f1635', textAlign: 'center', fontSize: typeScale.pageTitle, fontWeight: '700', lineHeight: lineScale.pageTitle, letterSpacing: -0.25 },
  backControl: {
    alignSelf: 'flex-start',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  backChevron: { color: '#3a2c6b', fontSize: 28, lineHeight: 30, fontWeight: '400' },
  backControlText: { color: '#3a2c6b', fontSize: 16, fontWeight: '700' },
  backButtonPressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  header: { alignItems: 'center', gap: 8, paddingTop: 12 },
  grid: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  categoryButton: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  categoryCopy: { flex: 1, gap: 3 },
  categoryText: { color: '#1f003d', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '600' },
  categoryMeta: { color: '#817690', fontSize: typeScale.helper, fontWeight: '500' },
  rowPressed: { opacity: 0.68, backgroundColor: '#f7f5fb' },
  chevron: { color: '#b7afc5', fontSize: 26, lineHeight: 28, fontWeight: '400' },
  promptOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 12,
  },
  promptScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 0, 61, 0.14)',
  },
  promptSheet: {
    marginHorizontal: 18,
    marginBottom: 112,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 12,
    shadowColor: '#110c28',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  promptTitle: { color: '#1f003d', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '500' },
  promptText: { color: '#5e4f79', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge },
  promptActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promptSecondary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf2',
  },
  promptSecondaryText: { color: '#3a2c6b', fontSize: typeScale.body, fontWeight: '700' },
  promptPrimary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a3f72',
  },
  promptPrimaryPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  promptPrimaryText: { color: '#ffffff', fontSize: typeScale.body, fontWeight: '800' },
});

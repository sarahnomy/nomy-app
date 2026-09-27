import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { useAppTheme } from '@/constants/app-theme';
import { recordAvatarActivity } from '@/constants/avatar';
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

const toolRoutes = {
  Breathing: '/toolkit-breathing',
  Puzzles: '/toolkit-puzzles',
} as const;

const needOptions = [
  {
    id: 'calm',
    title: 'I need to calm down',
    description: 'For when your body or brain feels activated.',
    tools: ['Breathing', 'Sensory', 'Movement'],
  },
  {
    id: 'release',
    title: 'I need to release some energy',
    description: 'For when energy feels stuck, restless, or too much.',
    tools: ['Breathing', 'Movement', 'Puzzles'],
  },
  {
    id: 'elsewhere',
    title: 'I need to get my brain elsewhere',
    description: 'For when you need focus, distraction, or a different track.',
    tools: ['Puzzles', 'Creative', 'Sensory'],
  },
  {
    id: 'unknown',
    title: "I don't know what I need",
    description: 'Start with a low-demand option and adjust after.',
    tools: ['Breathing', 'Puzzles', 'Movement'],
  },
] as const;

type NeedOption = (typeof needOptions)[number];
type ToolName = NeedOption['tools'][number];

export default function ToolkitScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ origin?: string | string[] }>();
  const [selectedNeed, setSelectedNeed] = useState<NeedOption | null>(null);

  useEffect(() => {
    void recordAvatarActivity({ type: 'feature_opened', feature: 'toolkit' });
  }, []);

  function handleBack() {
    if (selectedNeed) {
      setSelectedNeed(null);
      return;
    }

    if (params.origin === 'home') {
      router.replace('/');
      return;
    }

    router.replace('/support');
  }

  function chooseNeed(need: NeedOption) {
    setSelectedNeed(need);
    void recordAvatarActivity({ type: 'toolkit_need_selected', feature: 'toolkit', label: need.title });
  }

  function openTool(tool: ToolName) {
    if (tool in toolRoutes) {
      router.push({
        pathname: toolRoutes[tool as keyof typeof toolRoutes],
        params: { origin: 'toolkit' },
      });
    }
  }

  const backLabel = selectedNeed ? 'Toolkit' : params.origin === 'home' ? 'Home' : 'Support';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label={backLabel} onPress={handleBack} />

        <View style={styles.waveWrap}>
          <View style={[styles.wave, { backgroundColor: theme.screen }]}>
            <View style={styles.header}>
              <Text style={[styles.stepLabel, { color: theme.subtle }]}>Toolkit</Text>
              <Text style={[styles.title, { color: theme.text }]}>
                {selectedNeed ? selectedNeed.title : 'What do you need right now?'}
              </Text>
            </View>
          </View>
        </View>

        {!selectedNeed ? (
          <View style={[styles.needList, { backgroundColor: '#e9c3f1' }]}>
            {needOptions.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => chooseNeed(item)}
                style={({ pressed }) => [styles.needCard, { backgroundColor: '#e9c3f1', borderBottomColor: 'rgba(31, 22, 53, 0.1)' }, pressed && styles.rowPressed]}>
                <View style={styles.needCopy}>
                  <Text style={[styles.needTitle, { color: theme.text }]}>{item.title}</Text>
                </View>
                <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.subtle }]}>You could try</Text>
              <View style={[styles.toolList, { backgroundColor: '#e9c3f1', borderColor: theme.border }]}>
                {selectedNeed.tools.map((tool) => {
                  const available = tool in toolRoutes;

                  return (
                    <Pressable
                      accessibilityRole={available ? 'button' : undefined}
                      disabled={!available}
                      key={tool}
                      onPress={() => openTool(tool)}
                      style={({ pressed }) => [
                        styles.toolRow,
                        { backgroundColor: available ? '#e9c3f1' : 'rgba(233, 195, 241, 0.46)', borderBottomColor: 'rgba(31, 22, 53, 0.1)' },
                        !available && styles.lockedTool,
                        pressed && available && styles.rowPressed,
                      ]}>
                      <View style={styles.toolCopy}>
                        <Text style={[available ? styles.toolText : styles.lockedText, { color: available ? theme.text : theme.subtle }]}>{tool}</Text>
                      </View>
                      {available ? (
                        <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Text style={styles.lockedLabel}>Soon</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={[styles.noteCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
              <Text style={[styles.noteText, { color: theme.muted }]}>You can try one thing, stop, or choose a different need. Nothing here has to be completed.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e9c3f1' },
  content: { paddingHorizontal: space.screenX, paddingBottom: 122, gap: space.xl },
  waveWrap: { marginHorizontal: -space.screenX },
  wave: {
    backgroundColor: '#e9c3f1',
    paddingTop: space.sm,
    paddingHorizontal: space.screenX,
    paddingBottom: space.xl,
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
  header: { alignItems: 'center', gap: space.xs, paddingTop: space.md },
  needList: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  needCard: {
    minHeight: controlSize.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  needCopy: { flex: 1 },
  needTitle: { color: '#1f003d', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '600' },
  needText: { color: '#5e4f79', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '500' },
  chevron: { color: '#b7afc5', fontSize: 24, lineHeight: 26, fontWeight: '400' },
  rowPressed: { opacity: 0.68, backgroundColor: '#f7f5fb' },
  section: { gap: space.sm },
  sectionTitle: {
    color: '#7a708c',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  toolList: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  toolRow: {
    minHeight: controlSize.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  lockedTool: { backgroundColor: '#fbfaff' },
  toolCopy: { flex: 1 },
  toolText: { color: '#1f003d', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '600' },
  lockedText: { color: '#9b93aa', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '600' },
  lockedBadge: {
    borderRadius: 999,
    backgroundColor: '#f0edf7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lockedLabel: { color: '#8f87a0', fontSize: 12, fontWeight: '800' },
  noteCard: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: space.lg,
  },
  noteText: { color: '#5e4f79', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600', textAlign: 'center' },
});

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { recordAvatarActivity } from '@/constants/avatar';

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
  const [selectedNeed, setSelectedNeed] = useState<NeedOption | null>(null);

  useEffect(() => {
    void recordAvatarActivity({ type: 'feature_opened', feature: 'toolkit' });
  }, []);

  function handleBack() {
    if (selectedNeed) {
      setSelectedNeed(null);
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
      router.push(toolRoutes[tool as keyof typeof toolRoutes]);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label={selectedNeed ? 'Toolkit' : 'Support'} onPress={handleBack} />

        <View style={styles.waveWrap}>
          <View style={styles.wave}>
            <View style={styles.header}>
              <Text style={styles.stepLabel}>Toolkit</Text>
              <Text style={styles.title}>
                {selectedNeed ? selectedNeed.title : 'What do you need right now?'}
              </Text>
            </View>
          </View>
        </View>

        {!selectedNeed ? (
          <View style={styles.needList}>
            {needOptions.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => chooseNeed(item)}
                style={({ pressed }) => [styles.needCard, pressed && styles.rowPressed]}>
                <View style={styles.needCopy}>
                  <Text style={styles.needTitle}>{item.title}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You could try</Text>
              <View style={styles.toolList}>
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
                        !available && styles.lockedTool,
                        pressed && available && styles.rowPressed,
                      ]}>
                      <View style={styles.toolCopy}>
                        <Text style={available ? styles.toolText : styles.lockedText}>{tool}</Text>
                        <Text style={styles.toolMeta}>
                          {available ? toolMeta(tool) : 'Coming later'}
                        </Text>
                      </View>
                      {available ? (
                        <Text style={styles.chevron}>›</Text>
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

            <View style={styles.noteCard}>
              <Text style={styles.noteText}>You can try one thing, stop, or choose a different need. Nothing here has to be completed.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function toolMeta(tool: ToolName) {
  if (tool === 'Breathing') {
    return 'Guided breathing rounds';
  }

  if (tool === 'Puzzles') {
    return 'Structured focus activities';
  }

  return 'Practical support';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fde6cf' },
  content: { paddingHorizontal: 18, paddingBottom: 126, gap: 24 },
  waveWrap: { marginHorizontal: -18 },
  wave: {
    backgroundColor: '#fde6cf',
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  stepLabel: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.45 },
  header: { alignItems: 'center', gap: 8, paddingTop: 12 },
  needList: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  needCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  needCopy: { flex: 1, gap: 5 },
  needTitle: { color: '#1f003d', fontSize: 19, lineHeight: 24, fontWeight: '700' },
  needText: { color: '#5e4f79', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  chevron: { color: '#b7afc5', fontSize: 26, lineHeight: 28, fontWeight: '400' },
  rowPressed: { opacity: 0.68, backgroundColor: '#f7f5fb' },
  section: { gap: 10 },
  sectionTitle: {
    color: '#7a708c',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  toolList: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  toolRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  lockedTool: { backgroundColor: '#fbfaff' },
  toolCopy: { flex: 1, gap: 3 },
  toolText: { color: '#1f003d', fontSize: 19, fontWeight: '600' },
  lockedText: { color: '#9b93aa', fontSize: 19, fontWeight: '600' },
  toolMeta: { color: '#817690', fontSize: 13, fontWeight: '500' },
  lockedBadge: {
    borderRadius: 999,
    backgroundColor: '#f0edf7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lockedLabel: { color: '#8f87a0', fontSize: 12, fontWeight: '800' },
  noteCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 16,
  },
  noteText: { color: '#5e4f79', fontSize: 15, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
});

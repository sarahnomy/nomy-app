import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { recordAvatarActivity } from '@/constants/avatar';
import { goBackOrReplace } from '@/constants/navigation';

const breathing = {
  'Box Breathing': [
    { label: 'Inhale', seconds: 4, scale: 0.75, color: '#cfe0ff' },
    { label: 'Hold', seconds: 4, scale: 0.75, color: '#cfe0ff' },
    { label: 'Exhale', seconds: 4, scale: 1, color: '#b9b3ff' },
    { label: 'Hold', seconds: 4, scale: 1, color: '#b9b3ff' },
  ],
  'Triangle Breathing': [
    { label: 'Inhale', seconds: 4, scale: 0.75, color: '#cfe0ff' },
    { label: 'Hold', seconds: 4, scale: 0.75, color: '#cfe0ff' },
    { label: 'Exhale', seconds: 6, scale: 1, color: '#b9b3ff' },
  ],
  'Extended Exhale': [
    { label: 'Inhale', seconds: 4, scale: 0.75, color: '#cfe0ff' },
    { label: 'Exhale', seconds: 6, scale: 1, color: '#b9b3ff' },
  ],
} as const;

type BreathingName = keyof typeof breathing;

export default function ToolkitBreathingScreen() {
  const [tool, setTool] = useState<BreathingName>('Box Breathing');
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(4);
  const [scale] = useState(() => new Animated.Value(1));
  const [bg] = useState(() => new Animated.Value(0));
  const phases = breathing[tool];
  const phase = phases[phaseIndex % phases.length];

  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: ['#b9b3ff', '#cfe0ff'],
  });

  useEffect(() => {
    if (!running) {
      return;
    }

    setCount(phase.seconds);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: phase.scale,
        duration: phase.seconds * 1000,
        useNativeDriver: false,
      }),
      Animated.timing(bg, {
        toValue: phase.color === '#cfe0ff' ? 1 : 0,
        duration: phase.seconds * 1000,
        useNativeDriver: false,
      }),
    ]).start();

    const countdown = setInterval(() => {
      setCount((current) => Math.max(1, current - 1));
    }, 1000);

    const next = setTimeout(() => {
      if (phaseIndex >= phases.length - 1) {
        setRunning(false);
        setCompleted(true);
        setCount(0);
        void recordAvatarActivity({ type: 'breathing_completed', feature: 'breathing', label: tool });
        return;
      }

      setPhaseIndex((current) => current + 1);
    }, phase.seconds * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(next);
    };
  }, [bg, phase, phaseIndex, phases.length, running, scale, tool]);

  function reset() {
    setRunning(false);
    setCompleted(false);
    setPhaseIndex(0);
    setCount(4);
    scale.setValue(1);
    bg.setValue(0);
  }

  function chooseTool(nextTool: BreathingName) {
    setTool(nextTool);
    reset();
  }

  function toggleBreathing() {
    if (running) {
      reset();
      return;
    }

    setCompleted(false);
    setPhaseIndex(0);
    setCount(phases[0].seconds);
    scale.setValue(1);
    bg.setValue(0);
    void recordAvatarActivity({ type: 'breathing_started', feature: 'toolkit', label: tool });
    setRunning(true);
  }

  const actionLabel = useMemo(() => (running ? "I'm done" : 'Start breathing'), [running]);
  const breathLabel = completed ? 'Complete' : phase.label;
  const breathNumber = completed ? '✓' : count;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackControl label="Toolkit" onPress={() => goBackOrReplace('/toolkit')} />

          <View style={styles.headerCopy}>
            <Text style={styles.stepLabel}>Toolkit</Text>
            <Text style={styles.title}>Breathing</Text>
            <Text style={styles.subtitle}>
              Choose a rhythm that feels manageable. You can stop whenever you need to.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rhythm</Text>
          <View style={styles.toolList}>
            {(Object.keys(breathing) as BreathingName[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => chooseTool(item)}
                style={({ pressed }) => [styles.rhythmRow, item === tool && styles.activeRhythmRow, pressed && styles.rowPressed]}>
                <Text style={[styles.rhythmText, item === tool && styles.activeRhythmText]}>{item}</Text>
                {item === tool ? <Text style={styles.selectedMark}>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.breathWrap}>
          <View style={styles.breathHeader}>
            <Text style={styles.breathTitle}>{tool}</Text>
            <Text style={styles.helper}>Follow the circle as it changes size.</Text>
          </View>
          <Animated.View style={[styles.circle, { transform: [{ scale }], backgroundColor }]}>
            <Text style={styles.breathLabel}>{breathLabel}</Text>
            <Text style={styles.breathNumber}>{breathNumber}</Text>
          </Animated.View>
          {completed ? (
            <View style={styles.completeCard}>
              <Text style={styles.completeTitle}>One breathing round is complete.</Text>
              <Text style={styles.completeText}>You can do it again if you want, or leave this activity here.</Text>
              <Pressable onPress={toggleBreathing} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
                <Text style={styles.actionText}>Do it again</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={toggleBreathing} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
              <Text style={styles.actionText}>{actionLabel}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fde6cf' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 20, alignItems: 'stretch' },
  header: { gap: 14 },
  headerCopy: { alignItems: 'center', gap: 8 },
  stepLabel: { color: '#7a708c', fontSize: 12, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.45 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 16, lineHeight: 24, fontWeight: '600', maxWidth: 320 },
  section: { gap: 10 },
  sectionTitle: { color: '#7a708c', fontSize: 12, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  toolList: {
    alignSelf: 'stretch',
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  rhythmRow: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ece6f7',
    backgroundColor: '#ffffff',
  },
  activeRhythmRow: { backgroundColor: '#faf8ff' },
  rowPressed: { backgroundColor: '#f7f5fb' },
  rhythmText: { color: '#1f1635', fontSize: 16, fontWeight: '700' },
  activeRhythmText: { color: '#1f003d' },
  selectedMark: { color: '#1f003d', fontSize: 17, fontWeight: '900' },
  breathWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 20,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    paddingHorizontal: 18,
    paddingVertical: 22,
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  breathHeader: { alignItems: 'center', gap: 6 },
  breathTitle: { color: '#1f1635', fontSize: 22, lineHeight: 27, fontWeight: '900', letterSpacing: -0.25 },
  helper: { color: '#5e4f79', fontSize: 15, lineHeight: 21, fontWeight: '600', textAlign: 'center' },
  circle: { width: 230, height: 230, borderRadius: 115, alignItems: 'center', justifyContent: 'center', shadowColor: '#13073f', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  breathLabel: { color: '#1f1635', fontSize: 18, fontWeight: '700' },
  breathNumber: { color: '#1f1635', fontSize: 46, fontWeight: '900', letterSpacing: -0.7 },
  completeCard: {
    alignSelf: 'stretch',
    borderRadius: 24,
    backgroundColor: '#f7f5fb',
    padding: 14,
    gap: 10,
  },
  completeTitle: { color: '#1f1635', textAlign: 'center', fontSize: 18, lineHeight: 23, fontWeight: '800' },
  completeText: { color: '#5e4f79', textAlign: 'center', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  action: { alignSelf: 'stretch', minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, backgroundColor: '#1f003d' },
  actionText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  actionPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});

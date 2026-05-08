import { Link } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

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
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(4);
  const scale = useRef(new Animated.Value(1)).current;
  const bg = useRef(new Animated.Value(0)).current;
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
      setPhaseIndex((current) => current + 1);
    }, phase.seconds * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(next);
    };
  }, [bg, phase, running, scale]);

  function reset() {
    setRunning(false);
    setPhaseIndex(0);
    setCount(4);
    scale.setValue(1);
    bg.setValue(0);
  }

  function chooseTool(nextTool: BreathingName) {
    setTool(nextTool);
    reset();
  }

  const actionLabel = useMemo(() => (running ? "I'm done" : 'Start breathing'), [running]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/toolkit" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Toolkit</Text>
          </Pressable>
        </Link>

        <Text style={styles.title}>Breathing</Text>
        <Text style={styles.subtitle}>
          Take a breath at your own pace. This space helps you regulate gently through guided breathing.{'\n'}
          Choose a rhythm that feels right for your body today.
        </Text>

        <View style={styles.toolList}>
          {(Object.keys(breathing) as BreathingName[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => chooseTool(item)}
              style={[styles.oval, item === tool && styles.activeOval]}>
              <Text style={styles.ovalText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.breathWrap}>
          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>{tool}</Text>
          </View>
          <Text style={styles.helper}>Follow the circle as it expands and softens</Text>
          <Animated.View style={[styles.circle, { transform: [{ scale }], backgroundColor }]}>
            <Text style={styles.breathLabel}>{phase.label}</Text>
            <Text style={styles.breathNumber}>{count}</Text>
          </Animated.View>
          <Pressable onPress={() => (running ? reset() : setRunning(true))} style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fbff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 20, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 30, fontWeight: '500', lineHeight: 36 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 16, lineHeight: 25 },
  toolList: { alignSelf: 'stretch', gap: 12 },
  oval: { minHeight: 70, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9f0fa' },
  activeOval: { borderWidth: 2, borderColor: '#1f003d' },
  ovalText: { color: '#1f003d', fontSize: 19, fontWeight: '500' },
  breathWrap: { alignSelf: 'stretch', alignItems: 'center', gap: 18, paddingTop: 10 },
  titlePill: { height: 70, width: 240, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9f0fa' },
  titlePillText: { color: '#1f003d', fontSize: 19, fontWeight: '500' },
  helper: { color: '#5e4f79', fontSize: 15, textAlign: 'center' },
  circle: { width: 250, height: 250, borderRadius: 125, alignItems: 'center', justifyContent: 'center', shadowColor: '#13073f', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  breathLabel: { color: '#1f003d', fontSize: 18 },
  breathNumber: { color: '#1f003d', fontSize: 42, fontWeight: '600' },
  action: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  actionText: { color: '#1f003d', fontSize: 16, fontWeight: '600' },
});

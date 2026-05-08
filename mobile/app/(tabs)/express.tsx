import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const scenarios = {
  'social-event': {
    prompt: 'Someone invites you to a social event you don’t want to attend',
    direct: 'Thanks for the invite but I’m not up for a group event right now.',
    relational: 'I really appreciate the invite but I’ve had a full week and need some quiet time.',
  },
  interrupted: {
    prompt: 'Your colleague interrupts you during a meeting',
    direct: 'Please let me finish my point, then I’ll listen to yours.',
    relational: 'I have a few more thoughts I’d like to finish before I lose them — can I share those first?',
  },
  'text-over-call': {
    prompt: 'You’re explaining why you prefer text over calls',
    direct: 'I find calls stressful. I prefer texting.',
    relational: 'Texting helps me focus and express myself clearly. I appreciate when people are understanding of that.',
  },
  'group-setting': {
    prompt: "You’re in a group and can't get a word in",
    direct: 'I’d like to share something too.',
    relational: 'I want to share something that connects with what you said. Can I go next?',
  },
} as const;

const lockedScenarios = [
  'A friend doesn’t understand why you need alone time',
  'You’re overstimulated in a public space',
  'You want to decline a call but feel guilty doing so',
  'You’re unsure how to explain sensory overload to someone',
];

type ScenarioKey = keyof typeof scenarios;
type Tone = 'direct' | 'relational';

export default function ExpressScreen() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('social-event');
  const [tone, setTone] = useState<Tone>('direct');
  const scenario = scenarios[scenarioKey];
  const response = useMemo(() => scenario[tone], [scenario, tone]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Main Menu</Text>
          </Pressable>
        </Link>

        <View style={styles.header}>
          <Text style={styles.title}>Express Yourself</Text>
          <Text style={styles.subtitle}>
            Choose a situation that fits how you feel or what you want to build confidence in today
          </Text>
        </View>

        <View style={styles.about}>
          <Text style={styles.aboutTitle}>About Express</Text>
          <Text style={styles.aboutText}>
            Here, you’ll be able to reconnect with your voice that exists beneath expectation, masking, or habit.
          </Text>
          <Text style={styles.aboutText}>
            You’ll find short, guided prompts drawn from real experiences autistic adults often navigate — like social invitations, interruptions, overstimulation, and moments of misunderstanding.
          </Text>
          <Text style={styles.aboutText}>
            Each one is an invitation to express yourself with honesty and care, at your own pace.
          </Text>
          <Text style={styles.aboutText}>There’s no rush, no right tone, and no pressure to change. Let your words find you.</Text>
        </View>

        <View style={styles.list}>
          {Object.entries(scenarios).map(([key, item]) => {
            const active = key === scenarioKey;
            return (
              <Pressable
                key={key}
                onPress={() => setScenarioKey(key as ScenarioKey)}
                style={[styles.option, active && styles.optionActive]}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.prompt}</Text>
              </Pressable>
            );
          })}
          {lockedScenarios.map((item) => (
            <View key={item} style={[styles.option, styles.locked]}>
              <Text style={styles.lockedText}>{item}</Text>
              <Text style={styles.lockedLabel}>Locked</Text>
            </View>
          ))}
        </View>

        <View style={styles.segment}>
          <Pressable
            onPress={() => setTone('direct')}
            style={[styles.segmentButton, tone === 'direct' && styles.segmentActive]}>
            <Text style={[styles.segmentText, tone === 'direct' && styles.segmentTextActive]}>
              Direct
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTone('relational')}
            style={[styles.segmentButton, tone === 'relational' && styles.segmentActive]}>
            <Text style={[styles.segmentText, tone === 'relational' && styles.segmentTextActive]}>
              Relational
            </Text>
          </Pressable>
        </View>

        <View style={styles.responseCard}>
          <Text style={styles.response}>{response}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 18 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  header: { alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 30, fontWeight: '500', lineHeight: 36 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 17, lineHeight: 26 },
  about: { borderRadius: 8, backgroundColor: '#f1f1ff', padding: 16, gap: 10 },
  aboutTitle: { color: '#1f003d', fontSize: 20, fontWeight: '600' },
  aboutText: { color: '#1f003d', fontSize: 16, lineHeight: 25 },
  list: { gap: 12 },
  option: {
    borderRadius: 8,
    backgroundColor: '#f5f4fc',
    padding: 16,
    shadowColor: '#110c28',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  optionActive: { backgroundColor: '#e1dcf9', borderWidth: 2, borderColor: '#1f003d' },
  optionText: { color: '#1f003d', fontSize: 17, lineHeight: 25, fontWeight: '300' },
  optionTextActive: { fontWeight: '500' },
  locked: { backgroundColor: '#efeff7', opacity: 0.75, gap: 4 },
  lockedText: { color: '#a29bb8', fontSize: 17, lineHeight: 25, fontWeight: '300' },
  lockedLabel: { color: '#a29bb8', fontSize: 13, fontWeight: '700' },
  segment: { flexDirection: 'row', borderRadius: 8, backgroundColor: '#e1dcf9', padding: 4, gap: 4 },
  segmentButton: { flex: 1, minHeight: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#ffffff' },
  segmentText: { color: '#5e4f79', fontSize: 16, fontWeight: '700' },
  segmentTextActive: { color: '#1f003d' },
  responseCard: { borderRadius: 8, backgroundColor: '#f5f4fc', padding: 18 },
  response: { color: '#1f003d', fontSize: 21, fontWeight: '500', lineHeight: 31 },
});

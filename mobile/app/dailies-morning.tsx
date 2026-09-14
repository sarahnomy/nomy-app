import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { goBackOrReplace } from '@/constants/navigation';
import { saveCheckInReflection } from '@/constants/reflections';
import { getSessionUser, type SessionUser } from '@/constants/session';

const todayOptions = ['Good', 'Okay', 'Not great', 'Low energy', 'Stressed', "I don't know"] as const;
const helpOptions = [
  'Quiet',
  'A clear plan',
  'Connection',
  'Time alone',
  'Rest',
  'Something enjoyable',
  'Help expressing something',
  "I don't know",
] as const;

const affirmationSuggestions = [
  'I can take today one step at a time.',
  'I do not have to mask to be worthy.',
  'My needs are real, even when they are hard to explain.',
  'I am allowed to move through today at my own pace.',
] as const;

const nextActions = [
  { label: 'Look at my patterns', href: '/profile' },
  { label: 'Understand a feeling', href: '/emotionize' },
  { label: 'Work out what to say', href: '/express' },
  { label: 'Find something that might help', href: '/toolkit' },
  { label: "No, I'm done", href: '/profile' },
] as const;

export default function DailiesMorningScreen() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [todayFeeling, setTodayFeeling] = useState('');
  const [todayHelp, setTodayHelp] = useState('');
  const [affirmationMode, setAffirmationMode] = useState<'own' | 'generated' | ''>('');
  const [affirmation, setAffirmation] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getSessionUser()
      .then(setSessionUser)
      .catch(() => setSessionUser(null));
  }, []);

  const greeting = useMemo(() => {
    if (!sessionUser?.username) {
      return 'Good Morning';
    }

    return `Good Morning, ${sessionUser.username}`;
  }, [sessionUser?.username]);

  const canSave = Boolean(todayFeeling && todayHelp && affirmation.trim());

  function chooseGeneratedAffirmation() {
    const seed = `${todayFeeling}-${todayHelp}`.length;
    const generated = affirmationSuggestions[seed % affirmationSuggestions.length];
    setAffirmationMode('generated');
    setAffirmation(generated);
  }

  async function saveMorningCheckIn() {
    if (isSaving) {
      return;
    }

    if (!canSave) {
      setStatus('Choose how you are doing, what might help, and an affirmation before saving.');
      return;
    }

    setIsSaving(true);
    setStatus('');

    const reflection = [
      `How I am doing today\n${todayFeeling}`,
      `What would help today\n${todayHelp}`,
      `Affirmation\n${affirmation.trim()}`,
    ].join('\n\n');

    try {
      await saveCheckInReflection({ period: 'morning', reflection });
      setSaved(true);
      setStatus('Saved to Profile.');
    } catch {
      setStatus('That did not save just now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled">
          <BackControl label="Check-in" onPress={() => goBackOrReplace('/dailies')} />

          <View style={styles.header}>
            <Text style={styles.kicker}>Check-In</Text>
            <Text style={styles.title}>{greeting}</Text>
          </View>

          <OptionSection
            title="How are you doing today?"
            options={todayOptions}
            selected={todayFeeling}
            onSelect={setTodayFeeling}
          />

          <OptionSection
            title="What would help you today?"
            options={helpOptions}
            selected={todayHelp}
            onSelect={setTodayHelp}
          />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Affirmation</Text>
            <View style={styles.segmentRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setAffirmationMode('own');
                  setAffirmation('');
                }}
                style={({ pressed }) => [
                  styles.segmentButton,
                  affirmationMode === 'own' && styles.segmentButtonActive,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.segmentText, affirmationMode === 'own' && styles.segmentTextActive]}>
                  Write my own affirmation
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={chooseGeneratedAffirmation}
                style={({ pressed }) => [
                  styles.segmentButton,
                  affirmationMode === 'generated' && styles.segmentButtonActive,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.segmentText, affirmationMode === 'generated' && styles.segmentTextActive]}>
                  Generate an affirmation
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={affirmation}
              onChangeText={(value) => {
                setAffirmation(value);
                if (value.trim() && affirmationMode !== 'generated') {
                  setAffirmationMode('own');
                }
              }}
              multiline
              textAlignVertical="top"
              placeholder="Write your affirmation here…"
              placeholderTextColor="#817690"
              style={styles.input}
            />
          </View>

          {status ? <Text style={styles.status}>{status}</Text> : null}

          {!saved ? (
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={saveMorningCheckIn}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
                isSaving && styles.saveButtonDisabled,
              ]}>
              <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Check-In'}</Text>
            </Pressable>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Do you want to do anything else?</Text>
              <View style={styles.actionList}>
                {nextActions.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    key={item.label}
                    onPress={() => router.push(item.href)}
                    style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
                    <Text style={styles.actionText}>{item.label}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function OptionSection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionGrid}>
        {options.map((option) => {
          const active = selected === option;
          return (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [styles.optionPill, active && styles.optionPillActive, pressed && styles.pressed]}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fffaeb' },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 140, gap: 18 },
  header: { alignItems: 'center', gap: 8, paddingTop: 4 },
  kicker: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 30, fontWeight: '700', lineHeight: 38 },
  card: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 16,
    gap: 14,
    shadowColor: '#110c28',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  sectionTitle: { color: '#1f1635', fontSize: 21, lineHeight: 27, fontWeight: '700' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionPill: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#f8f4e7',
    borderWidth: 1,
    borderColor: '#efe6c7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionPillActive: { backgroundColor: '#1f003d', borderColor: '#1f003d' },
  optionText: { color: '#2e2840', fontSize: 16, lineHeight: 21, fontWeight: '700' },
  optionTextActive: { color: '#ffffff' },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segmentButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#f8f4e7',
    borderWidth: 1,
    borderColor: '#efe6c7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  segmentButtonActive: { backgroundColor: '#1f003d', borderColor: '#1f003d' },
  segmentText: { color: '#2e2840', fontSize: 14, lineHeight: 19, fontWeight: '800', textAlign: 'center' },
  segmentTextActive: { color: '#ffffff' },
  input: {
    minHeight: 130,
    borderRadius: 20,
    backgroundColor: '#f8f4e7',
    padding: 14,
    color: '#1f1635',
    fontSize: 16,
    lineHeight: 23,
  },
  status: { color: '#6b647d', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  saveButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#1f003d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  saveButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  actionList: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#fbf8ed' },
  actionRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#efe6c7',
  },
  actionText: { flex: 1, color: '#1f1635', fontSize: 16, lineHeight: 22, fontWeight: '700' },
  chevron: { color: '#b7afc5', fontSize: 24, lineHeight: 24, fontWeight: '500' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});

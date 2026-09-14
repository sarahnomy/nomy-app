import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { goBackOrReplace } from '@/constants/navigation';
import { saveCheckInReflection } from '@/constants/reflections';

const nextActions = [
  { label: 'Look at my patterns', href: '/profile' },
  { label: 'Understand a feeling', href: '/emotionize' },
  { label: 'Work out what to say', href: '/express' },
  { label: 'Find something that might help', href: '/toolkit' },
  { label: "No, I'm done", href: '/profile' },
] as const;

export default function DailiesEveningScreen() {
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  async function saveReflection() {
    const trimmedReflection = reflection.trim();

    if (!trimmedReflection) {
      setStatus('Write anything you want to remember before saving.');
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setStatus('');

    try {
      await saveCheckInReflection({
        period: 'evening',
        reflection: `Is there anything you want to remember from today?\n${trimmedReflection}`,
      });
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
            <Text style={styles.kicker}>Evening Check-In</Text>
            <Text style={styles.title}>Is there anything you want to remember from today?</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              multiline
              textAlignVertical="top"
              placeholder="Write about anything you want to keep, notice, or come back to…"
              placeholderTextColor="#817690"
              style={styles.input}
            />
          </View>

          {status ? <Text style={styles.status}>{status}</Text> : null}

          {!saved ? (
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={saveReflection}
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
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '700', lineHeight: 35 },
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
  input: {
    minHeight: 250,
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

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { recordAvatarActivity } from '@/constants/avatar';
import { saveExpressReflection } from '@/constants/reflections';

type ExpressStyle = 'direct' | 'relational';
type ExpressMode = 'text' | 'voice';

export default function ExpressCaptureScreen() {
  const params = useLocalSearchParams<{
    style?: string | string[];
    scenario?: string | string[];
    response?: string | string[];
  }>();

  const expressStyle = useMemo<ExpressStyle>(() => (normalizeParam(params.style) === 'relational' ? 'relational' : 'direct'), [params.style]);
  const scenario = useMemo(() => normalizeParam(params.scenario), [params.scenario]);
  const suggestedResponse = useMemo(() => normalizeParam(params.response), [params.response]);

  const [mode, setMode] = useState<ExpressMode>('text');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveTextReflection() {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus('Write what you want to save first.');
      return;
    }

    setSaving(true);
    setStatus('');

    await saveExpressReflection({
      style: expressStyle,
      mode: 'text',
      scenario,
      suggestedResponse,
      reflection: trimmed,
    });
    await recordAvatarActivity({ type: 'express_reflection_saved', feature: 'express', label: expressStyle });

    setSaving(false);
    router.push('/profile');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <BackControl label="Responses" onPress={() => router.back()} />

          <View style={styles.header}>
            <Text style={styles.stepLabel}>Express</Text>
            <Text style={styles.title}>Express in a way that feels right</Text>
            <Text style={styles.subtitle}>Choose writing or speaking. Save what you want to keep in Reflections.</Text>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>{expressStyle === 'relational' ? 'Relational response' : 'Direct response'}</Text>
            <Text style={styles.contextText}>{suggestedResponse}</Text>
          </View>

          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode('text')} style={({ pressed }) => [styles.modeButton, mode === 'text' && styles.modeButtonActive, pressed && styles.pressed]}>
              <Text style={[styles.modeButtonText, mode === 'text' && styles.modeButtonTextActive]}>Write</Text>
            </Pressable>
            <Pressable onPress={() => setMode('voice')} style={({ pressed }) => [styles.modeButton, mode === 'voice' && styles.modeButtonActive, pressed && styles.pressed]}>
              <Text style={[styles.modeButtonText, mode === 'voice' && styles.modeButtonTextActive]}>Speak</Text>
            </Pressable>
          </View>

          {mode === 'text' ? (
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Write your version</Text>
              <TextInput
                multiline
                onChangeText={setText}
                placeholder="Write it in your own words here."
                placeholderTextColor="#8d829f"
                style={styles.input}
                textAlignVertical="top"
                value={text}
              />
              {status ? <Text style={styles.statusText}>{status}</Text> : null}
              <Pressable onPress={saveTextReflection} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save to Reflections'}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Speak your version</Text>
              <Text style={styles.voiceText}>
                Voice recording is the right next step here. The app needs an audio recorder package before it can save voice memos.
              </Text>
              <Text style={styles.voiceHint}>For now, use Write to save this Express reflection as text.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e9f0fa' },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 120, gap: 18 },
  header: { alignItems: 'center', gap: 8 },
  stepLabel: { color: '#7a708c', fontSize: 12, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.45 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 16, lineHeight: 24, fontWeight: '600', maxWidth: 330 },
  contextCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 18,
    gap: 8,
  },
  contextLabel: { color: '#31506f', fontSize: 13, fontWeight: '900', letterSpacing: 0.35, textTransform: 'uppercase' },
  contextText: { color: '#1f1635', fontSize: 18, lineHeight: 27, fontWeight: '700' },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
  },
  modeButtonActive: { backgroundColor: '#1f003d' },
  modeButtonText: { color: '#1f1635', fontSize: 16, fontWeight: '800' },
  modeButtonTextActive: { color: '#ffffff' },
  inputCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 18,
    gap: 12,
  },
  inputLabel: { color: '#1f1635', fontSize: 19, lineHeight: 24, fontWeight: '800' },
  input: {
    minHeight: 180,
    borderRadius: 18,
    backgroundColor: '#f8f6fb',
    borderWidth: 1,
    borderColor: '#e2dced',
    color: '#1f1635',
    fontSize: 17,
    lineHeight: 24,
    padding: 14,
  },
  statusText: { color: '#6f3150', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  primaryButton: {
    minHeight: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f003d',
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  voiceText: { color: '#1f1635', fontSize: 17, lineHeight: 25, fontWeight: '700' },
  voiceHint: { color: '#5e4f79', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});

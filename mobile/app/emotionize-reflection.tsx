import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { recordAvatarActivity } from '@/constants/avatar';
import { saveEmotionReflection } from '@/constants/reflections';

function paramToString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function EmotionizeReflectionScreen() {
  const params = useLocalSearchParams<{ emotion?: string; category?: string; categoryColor?: string; selectedNotes?: string }>();
  const emotion = useMemo(() => paramToString(params.emotion) || 'this feeling', [params.emotion]);
  const category = useMemo(() => paramToString(params.category) || 'Emotionize', [params.category]);
  const categoryColor = useMemo(() => paramToString(params.categoryColor) || '#f4f8f3', [params.categoryColor]);
  const selectedNotes = useMemo(() => paramToString(params.selectedNotes) || '', [params.selectedNotes]);
  const selectedGroups = useMemo(() => parseSelectedNotes(selectedNotes), [selectedNotes]);
  const [reflection, setReflection] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function saveReflection() {
    const text = reflection.trim();
    const savedText = [selectedNotes, text ? `Reflection:\n${text}` : ''].filter(Boolean).join('\n\n');
    if (!savedText || isSaving) {
      setStatus('Choose something or write a little before saving.');
      return;
    }

    setIsSaving(true);
    setStatus('');

    try {
      const result = await saveEmotionReflection({
        emotion,
        category,
        categoryColor,
        reflection: savedText,
      });
      await recordAvatarActivity({ type: 'emotionize_reflection_saved', feature: 'emotionize', label: emotion });
      setIsSaving(false);
      setStatus(result.synced ? 'Saved to Profile.' : 'Saved on this phone. It will still appear in Profile.');
      router.push('/profile');
    } catch {
      setIsSaving(false);
      setStatus('That did not save just now. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.navRow}>
            <BackControl label="Story" onPress={() => router.back()} />
            <Pressable onPress={() => router.push('/profile')} style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}>
              <Text style={styles.doneButtonText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.header}>
            <Text style={styles.stepLabel}>Step 4 of 4</Text>
            <View style={[styles.kickerPill, { backgroundColor: categoryColor }]}>
              <Text style={styles.kickerText}>{category}</Text>
            </View>
            <Text style={styles.title}>Reflect on {emotion}</Text>
          </View>

          <View style={styles.group}>
            <Text style={styles.groupLabel}>Reflection</Text>
            {selectedNotes ? (
              <View style={styles.selectedCard}>
                <Text style={styles.selectedTitle}>Selections from the story</Text>
                <View style={styles.selectedGroupList}>
                  {selectedGroups.map((group) => (
                    <View key={group.title} style={styles.selectedGroup}>
                      <Text style={styles.selectedGroupTitle}>{group.title}</Text>
                      <View style={styles.selectedPills}>
                        {group.items.map((item) => (
                          <View key={item} style={styles.selectedPill}>
                            <Text style={styles.selectedPillText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              multiline
              autoFocus
              textAlignVertical="top"
              placeholder="What feels important to remember about this feeling?"
              placeholderTextColor="#8b829d"
              style={styles.input}
            />
          </View>

          {status ? <Text style={styles.status}>{status}</Text> : null}

          <Pressable
            onPress={saveReflection}
            disabled={isSaving}
            style={({ pressed }) => [styles.primaryButton, (pressed || isSaving) && styles.primaryButtonPressed]}>
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Save to Reflections'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function parseSelectedNotes(notes: string) {
  return notes
    .split('\n\n')
    .map((block) => {
      const [rawTitle, ...rawItems] = block.split('\n');
      const title = rawTitle?.replace(/:$/, '').trim();
      const items = rawItems
        .map((item) => item.replace(/^- /, '').trim())
        .filter(Boolean);

      return title && items.length ? { title, items } : null;
    })
    .filter((item): item is { title: string; items: string[] } => Boolean(item));
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f8f3' },
  keyboardView: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 28, gap: 18 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backControl: {
    minHeight: 42,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingLeft: 10,
    paddingRight: 14,
  },
  backChevron: { color: '#332852', fontSize: 28, lineHeight: 30, fontWeight: '400' },
  backControlText: { color: '#332852', fontSize: 16, fontWeight: '700' },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  iconButtonText: { color: '#332852', fontSize: 34, lineHeight: 36, fontWeight: '400' },
  doneButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 },
  doneButtonText: { color: '#6557c8', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: 0.62 },
  header: { alignItems: 'center', gap: 10, paddingTop: 6, paddingBottom: 4 },
  stepLabel: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  kickerPill: { borderRadius: 999, backgroundColor: '#f4f8f3', borderWidth: 1, borderColor: '#dfe9dd', paddingHorizontal: 12, paddingVertical: 7 },
  kickerText: { color: '#3f5940', fontSize: 13, fontWeight: '700' },
  title: { color: '#1f1635', fontSize: 31, lineHeight: 37, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#70677f', fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 320 },
  group: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  groupLabel: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  selectedCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#f4f8f3',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    padding: 14,
    gap: 8,
  },
  selectedTitle: {
    color: '#5e4f79',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  selectedGroupList: { gap: 12 },
  selectedGroup: { gap: 8 },
  selectedGroupTitle: { color: '#241b3b', fontSize: 15, lineHeight: 20, fontWeight: '700' },
  selectedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedPill: {
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  selectedPillText: { color: '#241b3b', fontSize: 14, lineHeight: 18, fontWeight: '600' },
  input: {
    minHeight: 280,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dfe9dd',
    color: '#241b3b',
    fontSize: 17,
    lineHeight: 25,
    backgroundColor: '#ffffff',
  },
  status: { color: '#70677f', fontSize: 15, lineHeight: 21, textAlign: 'center' },
  primaryButton: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1635',
    shadowColor: '#1f1635',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryButtonPressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
});

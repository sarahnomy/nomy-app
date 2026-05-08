import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, TextInput } from '@/components/nomy-type';

export default function DailiesEveningScreen() {
  const [reflection, setReflection] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/dailies" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Check-in</Text>
          </Pressable>
        </Link>

        <Text style={styles.title}>Let’s check in, how did today go?</Text>
        <TextInput
          value={reflection}
          onChangeText={setReflection}
          multiline
          textAlignVertical="top"
          placeholder="Write about your day…"
          placeholderTextColor="#6b647d"
          style={styles.input}
        />
        <Text style={styles.hint}>Save to My Check-in</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 18 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  title: { color: '#2e2840', textAlign: 'center', fontSize: 30, fontWeight: '600', lineHeight: 38 },
  input: { minHeight: 260, borderRadius: 8, backgroundColor: '#eaeaf5', padding: 16, color: '#2e2840', fontSize: 16, lineHeight: 23 },
  hint: { color: '#6b647d', fontSize: 15, lineHeight: 22, textAlign: 'center' },
});

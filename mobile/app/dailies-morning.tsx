import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, TextInput } from '@/components/nomy-type';

export default function DailiesMorningScreen() {
  const [affirmation, setAffirmation] = useState('');
  const [goal, setGoal] = useState('');
  const [task, setTask] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/dailies" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Check-in</Text>
          </Pressable>
        </Link>

        <Text style={styles.title}>Good Morning</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>My Daily Affirmation</Text>
          <TextInput
            value={affirmation}
            onChangeText={setAffirmation}
            multiline
            textAlignVertical="top"
            placeholder="Type your affirmation…"
            placeholderTextColor="#6b647d"
            style={styles.input}
          />
          <Text style={styles.hint}>I don’t have to mask to be worthy{'\n'}I can rest without guilt{'\n'}I move at my own pace</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Let’s set your focus</Text>
          <TextInput
            value={goal}
            onChangeText={setGoal}
            multiline
            textAlignVertical="top"
            placeholder="Write your goal for today…"
            placeholderTextColor="#6b647d"
            style={styles.input}
          />
          <Text style={styles.hint}>Remember, no goal is too big or too small.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today’s checklist</Text>
          <TextInput
            value={task}
            onChangeText={setTask}
            placeholder="Add a task…"
            placeholderTextColor="#6b647d"
            style={styles.singleInput}
          />
          <Text style={styles.hint}>Press Enter to add a new item</Text>
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
  title: { color: '#2e2840', textAlign: 'center', fontSize: 30, fontWeight: '600', lineHeight: 38 },
  card: { borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', padding: 16, gap: 12 },
  sectionTitle: { color: '#2e2840', textAlign: 'center', fontSize: 22, fontWeight: '600' },
  input: { minHeight: 180, borderRadius: 8, backgroundColor: '#eaeaf5', padding: 16, color: '#2e2840', fontSize: 16, lineHeight: 23 },
  singleInput: { minHeight: 54, borderRadius: 8, backgroundColor: '#eaeaf5', paddingHorizontal: 16, color: '#2e2840', fontSize: 16 },
  hint: { color: '#6b647d', fontSize: 15, lineHeight: 22, textAlign: 'center' },
});

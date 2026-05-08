import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const puzzles = [
  ['Match Object', 'A visual matching activity that supports focus and pattern recognition.'],
  ['Memory Pairing', 'A gentle memory game that supports attention and working memory.'],
  ['Wordle', 'A word puzzle that offers predictable structure and problem-solving.'],
  ['Quordle', 'A more complex word puzzle for deeper focus and challenge.'],
] as const;

export default function ToolkitPuzzlesScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/toolkit" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Toolkit</Text>
          </Pressable>
        </Link>

        <View style={styles.header}>
          <Text style={styles.title}>Puzzles</Text>
          <Text style={styles.subtitle}>
            When your mind wants structure and focus, puzzles{'\n'}can offer calm stimulation
          </Text>
        </View>

        <View style={styles.grid}>
          {puzzles.map(([name, text]) => (
            <View key={name} style={styles.oval}>
              <Text style={styles.ovalTitle}>{name}</Text>
              <Text style={styles.ovalText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f6ff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 22 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  header: { alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 30, fontWeight: '500', lineHeight: 36 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 17, lineHeight: 26 },
  grid: { gap: 14 },
  oval: { minHeight: 110, borderRadius: 8, backgroundColor: '#e9f0fa', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8, shadowColor: '#110c28', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  ovalTitle: { color: '#1f003d', fontSize: 20, fontWeight: '500', textAlign: 'center' },
  ovalText: { color: '#5e4f79', fontSize: 15, lineHeight: 21, textAlign: 'center' },
});

import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const categories = [
  { name: 'Mental', options: ['Guided Breathing', 'Puzzles'], locked: false, color: '#e9f0fa' },
  { name: 'Creative', options: ['Colour', 'Doodle'], locked: true, color: '#fff8e7' },
  { name: 'Physical', options: ['Body Check In', 'Untense'], locked: true, color: '#ffeccf' },
  { name: 'Sensory', options: ['Sounds Tool', 'Grounding'], locked: true, color: '#f4f8f3' },
] as const;

function optionHref(option: string) {
  if (option === 'Guided Breathing') {
    return '/toolkit-breathing';
  }

  if (option === 'Puzzles') {
    return '/toolkit-puzzles';
  }

  return '/toolkit';
}

export default function ToolkitScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Main Menu</Text>
          </Pressable>
        </Link>

        <View style={styles.header}>
          <Text style={styles.title}>Explore your tools</Text>
          <Text style={styles.subtitle}>Find what helps you feel grounded, creative, or calm — in your own way.</Text>
        </View>

        <View style={styles.grid}>
          {categories.map((category) => (
            <View
              key={category.name}
              style={[styles.card, { backgroundColor: category.color }, category.locked && styles.lockedCard]}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{category.name}</Text>
                {category.locked ? <Text style={styles.lockedLabel}>Locked</Text> : null}
              </View>

              <View style={styles.optionList}>
                {category.options.map((option) =>
                  category.locked ? (
                    <View key={option} style={styles.optionPill}>
                      <Text style={styles.optionText}>{option}</Text>
                    </View>
                  ) : (
                    <Link key={option} href={optionHref(option)} asChild>
                      <Pressable style={({ pressed }) => [styles.optionPill, pressed && styles.optionPressed]}>
                        <Text style={styles.optionText}>{option}</Text>
                      </Pressable>
                    </Link>
                  ),
                )}
                {category.locked ? <Text style={styles.subscribe}>Subscribe to unlock this tool</Text> : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 22 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  header: { alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 30, fontWeight: '500', lineHeight: 36 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 17, lineHeight: 26 },
  grid: { gap: 16 },
  card: {
    minHeight: 130,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#110c28',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    gap: 12,
  },
  lockedCard: { opacity: 0.65 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTitle: { color: '#1f003d', fontSize: 20, fontWeight: '500' },
  lockedLabel: { color: '#5e4f79', fontSize: 13, fontWeight: '700' },
  optionList: { gap: 10 },
  optionPill: { minHeight: 48, borderRadius: 8, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14 },
  optionPressed: { backgroundColor: '#f5f5ff' },
  optionText: { color: '#1f003d', fontSize: 17, fontWeight: '500', textAlign: 'center' },
  subscribe: { color: '#5e4f79', fontSize: 15, textAlign: 'center' },
});

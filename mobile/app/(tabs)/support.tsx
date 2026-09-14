import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabSwipe } from '@/components/tab-swipe';
import { Text } from '@/components/nomy-type';

const supportItems = [
  {
    title: 'Emotionize',
    description: 'Understand a feeling through guided emotional stories.',
    href: '/emotionize',
    color: '#f4f8f3',
  },
  {
    title: 'Check-in',
    description: 'Use morning, evening, or reflection prompts.',
    href: '/dailies',
    color: '#fffaeb',
  },
  {
    title: 'Express',
    description: 'Find direct or relational words for a situation.',
    href: '/express',
    color: '#e9f0fa',
  },
  {
    title: 'Toolkit',
    description: 'Use breathing, puzzles, and grounding supports.',
    href: '/toolkit',
    color: '#fde6cf',
  },
] as const;

export default function SupportScreen() {
  return (
    <TabSwipe current="/support">
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Support</Text>
            <Text style={styles.title}>What support do you want?</Text>
          </View>

          <View style={styles.list}>
            {supportItems.map((item) => (
              <Pressable
                key={item.title}
                onPress={() => router.push(item.href)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: item.color },
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fffaf2' },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 126, gap: 22 },
  header: { alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingTop: 8 },
  kicker: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1f1635',
    textAlign: 'center',
    alignSelf: 'stretch',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.45,
  },
  list: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  card: {
    minHeight: 88,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(31, 22, 53, 0.08)',
  },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
  cardCopy: { flex: 1 },
  cardTitle: { color: '#1f1635', fontSize: 19, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  chevron: { color: '#8f87a0', fontSize: 28, lineHeight: 30, fontWeight: '400' },
});

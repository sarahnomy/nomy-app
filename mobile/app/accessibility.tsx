import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { useAppTheme } from '@/constants/app-theme';
import { lineScale, radius, space, typeScale } from '@/constants/ui-scale';

const accessibilityNotes = [
  {
    title: 'Plain language',
    text: 'Clear, straightforward wording that’s easy to understand.',
  },
  {
    title: 'Lower visual load',
    text: 'Simple, uncluttered screens designed to feel easier to take in.',
  },
  {
    title: 'Choice without pressure',
    text: 'Choose what you explore, skip what you don’t need, and go at your own pace.',
  },
  {
    title: 'Feedback',
    text: 'Have an idea or something that isn’t working? We’d like to hear from you.',
  },
] as const;

export default function AccessibilityScreen() {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label="Settings" onPress={() => router.back()} />
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: theme.subtle }]}>Access</Text>
          <Text style={[styles.title, { color: theme.text }]}>Accessibility</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
          {accessibilityNotes.map((item) => (
            <View key={item.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: space.screenX, paddingTop: space.sm, paddingBottom: 120, gap: space.lg },
  header: { alignItems: 'center', gap: space.xs },
  kicker: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { color: '#1f1635', textAlign: 'center', fontSize: typeScale.pageTitle, lineHeight: lineScale.pageTitle, fontWeight: '700' },
  card: {
    borderRadius: radius.lg,
    backgroundColor: '#f8f6fb',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: space.lg,
    gap: space.lg,
  },
  section: { gap: space.xs },
  sectionTitle: { color: '#1f1635', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge, fontWeight: '500' },
  body: { color: '#4f4268', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '500' },
});

import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { useAppTheme } from '@/constants/app-theme';
import { lineScale, radius, space, typeScale } from '@/constants/ui-scale';

const terms = [
  {
    title: 'What nomy is for',
    text: 'nomy is a self-reflection and wellbeing app. It helps you explore feelings, check in with yourself, find words, and use grounding tools.',
  },
  {
    title: 'What nomy is not',
    text: 'nomy is not a replacement for professional healthcare, therapy or emergency support, and it does not diagnose or tell you how you should feel or communicate. It is a tool for self-understanding and support, with you in control of what you explore and share.',
  },
  {
    title: 'Your account',
    text: 'If you create an account, keep your login details private. You can contact support if you need help with your account or saved information.',
  },
  {
    title: 'Privacy Policy',
    text: 'For information about what data is collected, how it is used, and how to ask about your data, please read our Privacy Policy.',
  },
  {
    title: 'Contact',
    text: 'For terms, privacy, or support questions, contact hello@nomy.app.',
  },
] as const;

export default function TermsScreen() {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label="Settings" onPress={() => router.back()} />
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: theme.subtle }]}>Legal</Text>
          <Text style={[styles.title, { color: theme.text }]}>Terms and conditions</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
          {terms.map((item) => (
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

import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { hydrateNightModePreference, setNightModeEnabled, useNightModeEnabled } from '@/constants/color-mode';
import { clearSessionUser, getSessionUser } from '@/constants/session';

const faqs = [
  {
    question: 'What is Emotionize?',
    answer:
      'Emotionize helps you explore feelings in a clearer way. You can choose an emotional space, open a feeling, and read short guidance that makes the feeling easier to understand.',
  },
  {
    question: 'What is Check-in?',
    answer:
      'Check-in is where you can come back to morning, evening, and reflection prompts. It is designed to make daily self-awareness feel lighter and more manageable.',
  },
  {
    question: 'What is Express?',
    answer:
      'Express helps you unpack what happened, notice what you want to say, and build words that feel authentic to you.',
  },
  {
    question: 'What is Toolkit?',
    answer:
      'Toolkit is where grounding and regulation supports live. It is for moments when your system needs calm, focus, or a softer starting point before reflection.',
  },
  {
    question: 'How do I change language?',
    answer:
      'Language settings are not fully wired yet, but the space is ready in Settings so it can be added cleanly next.',
  },
  {
    question: 'How do subscriptions work?',
    answer:
      'Subscription management is still being shaped in the mobile app. The section is here so account and subscription controls can sit in one familiar place.',
  },
  {
    question: 'Where can I get support?',
    answer:
      'For account, privacy, or app support, contact hello@nomy.app. Nomy is not an emergency or crisis service.',
  },
  {
    question: 'What is the privacy policy?',
    answer:
      'You can read the privacy policy at https://nomy-app.onrender.com/privacy/. It explains what Nomy stores, why it stores it, and how to ask about deletion.',
  },
  {
    question: 'Is Nomy medical advice?',
    answer:
      'No. Nomy is a self-reflection and wellbeing app. It is not a medical, diagnostic, therapy, emergency, or crisis service.',
  },
] as const;

const settingsGroups = [
  {
    title: 'Support',
    items: ['FAQs', 'Support', 'Privacy policy', 'Language'],
  },
  {
    title: 'Account',
    items: ['Account', 'Subscription'],
  },
] as const;

export default function SettingsScreen() {
  const [query, setQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const nightModeEnabled = useNightModeEnabled();
  const activeNightMode = isLoggedIn && nightModeEnabled;
  const palette = activeNightMode ? nightPalette : lightPalette;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSettingsState() {
        const [session] = await Promise.all([getSessionUser(), hydrateNightModePreference()]);
        if (active) {
          setIsLoggedIn(Boolean(session));
        }
      }

      loadSettingsState();

      return () => {
        active = false;
      };
    }, []),
  );

  const filteredFaqs = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return faqs;
    }

    return faqs.filter((item) => {
      const haystack = `${item.question} ${item.answer}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [query]);

  async function logout() {
    await setNightModeEnabled(false);
    await clearSessionUser();
    router.replace('/');
  }

  async function toggleNightMode(enabled: boolean) {
    if (!isLoggedIn) {
      return;
    }

    await setNightModeEnabled(enabled);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.screen }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled">
        <View style={styles.waveWrap}>
          <View style={[styles.wave, { backgroundColor: palette.wave }]}>
            <BackControl label="Home" onPress={() => router.back()} />

            <View style={styles.header}>
              <Text style={[styles.title, { color: palette.title }]}>Settings</Text>
            </View>
            <View style={[styles.waveCurveLeft, { backgroundColor: palette.screen }]} />
            <View style={[styles.waveCurveRight, { backgroundColor: palette.screen }]} />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>Display</Text>
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.row, styles.lastRow, { borderBottomColor: palette.divider }]}>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowText, { color: palette.title }]}>Night mode</Text>
                <Text style={[styles.rowHint, { color: palette.muted }]}>
                  {isLoggedIn ? 'Use a darker, lower-glare version of Nomy.' : 'Log in to save display settings.'}
                </Text>
              </View>
              <Switch
                disabled={!isLoggedIn}
                onValueChange={toggleNightMode}
                value={isLoggedIn && nightModeEnabled}
                trackColor={{ false: palette.switchOff, true: '#8f7cf6' }}
                thumbColor={isLoggedIn && nightModeEnabled ? '#ffffff' : '#f4f0fb'}
              />
            </View>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>Support FAQs</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search FAQs"
            placeholderTextColor={palette.placeholder}
            style={[
              styles.searchInput,
              { backgroundColor: palette.input, borderColor: palette.border, color: palette.title },
            ]}
          />
          <View style={styles.faqList}>
            {filteredFaqs.length ? (
              filteredFaqs.map((item) => (
                <View key={item.question} style={[styles.faqCard, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                  <Text style={[styles.faqQuestion, { color: palette.title }]}>{item.question}</Text>
                  <Text style={[styles.faqAnswer, { color: palette.body }]}>{item.answer}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
                <Text style={[styles.emptyTitle, { color: palette.title }]}>No matches yet</Text>
                <Text style={[styles.emptyText, { color: palette.muted }]}>Try a simpler word like express, toolkit, privacy, or subscription.</Text>
              </View>
            )}
          </View>
        </View>

        {settingsGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={[styles.groupTitle, { color: palette.groupTitle }]}>{group.title}</Text>
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              {group.items.map((item, index) => (
                <View key={item} style={[styles.row, { borderBottomColor: palette.divider }, index === group.items.length - 1 && styles.lastRow]}>
                  <Text style={[styles.rowText, { color: palette.title }]}>{item}</Text>
                  <Text style={[styles.rowArrow, { color: palette.muted }]}>›</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, { backgroundColor: palette.logoutBg, borderColor: palette.border }, pressed && styles.backButtonPressed]}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 140, gap: 20 },
  waveWrap: { marginHorizontal: -18 },
  wave: {
    backgroundColor: '#eaeaf5',
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  waveCurveLeft: {
    position: 'absolute',
    left: -22,
    bottom: -36,
    width: '58%',
    height: 78,
    borderTopRightRadius: 70,
    backgroundColor: '#ffffff',
  },
  waveCurveRight: {
    position: 'absolute',
    right: -28,
    bottom: -42,
    width: '52%',
    height: 88,
    borderTopLeftRadius: 82,
    backgroundColor: '#ffffff',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6e0f5',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backButtonText: { color: '#3a2c6b', fontSize: 22, lineHeight: 22, fontWeight: '500' },
  backButtonPressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  header: { alignItems: 'center', gap: 8, paddingTop: 12 },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 28, fontWeight: '500', lineHeight: 34 },
  group: { gap: 10 },
  groupTitle: { color: '#5e4f79', fontSize: 14, fontWeight: '700' },
  searchInput: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd7f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    color: '#1f003d',
    fontSize: 16,
  },
  faqList: { gap: 10 },
  faqCard: {
    borderRadius: 8,
    backgroundColor: '#f8f5ff',
    borderWidth: 1,
    borderColor: '#e6dff4',
    padding: 16,
    gap: 8,
  },
  faqQuestion: { color: '#1f003d', fontSize: 16, fontWeight: '700', lineHeight: 22 },
  faqAnswer: { color: '#4f4268', fontSize: 15, lineHeight: 22 },
  emptyCard: {
    borderRadius: 8,
    backgroundColor: '#fbf9ff',
    borderWidth: 1,
    borderColor: '#ece6f7',
    padding: 16,
    gap: 6,
  },
  emptyTitle: { color: '#1f003d', fontSize: 16, fontWeight: '700' },
  emptyText: { color: '#5e4f79', fontSize: 14, lineHeight: 21 },
  card: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e0f4',
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0ebf8',
  },
  lastRow: { borderBottomWidth: 0 },
  rowCopy: { flex: 1, gap: 4, paddingRight: 12 },
  rowText: { color: '#1f003d', fontSize: 16, fontWeight: '500' },
  rowHint: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  rowArrow: { color: '#7a7291', fontSize: 22, lineHeight: 22 },
  logoutButton: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6dceb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7fb',
  },
  logoutButtonText: { color: '#7a1738', fontSize: 16, fontWeight: '700' },
});

const lightPalette = {
  screen: '#ffffff',
  wave: '#eaeaf5',
  title: '#1f003d',
  body: '#4f4268',
  muted: '#5e4f79',
  groupTitle: '#5e4f79',
  card: '#ffffff',
  cardSoft: '#f8f5ff',
  input: '#ffffff',
  border: '#e6dff4',
  divider: '#f0ebf8',
  placeholder: '#7a7291',
  switchOff: '#d8d0e8',
  logoutBg: '#fff7fb',
};

const nightPalette = {
  screen: '#171120',
  wave: '#241a34',
  title: '#f7f1ff',
  body: '#d8cde8',
  muted: '#b9accd',
  groupTitle: '#cfc3e3',
  card: '#21172f',
  cardSoft: '#261b36',
  input: '#21172f',
  border: '#3a2b50',
  divider: '#332641',
  placeholder: '#a99cbb',
  switchOff: '#4b3a62',
  logoutBg: '#2a1826',
};

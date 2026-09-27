import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { useAppTheme } from '@/constants/app-theme';
import { faqs } from '@/constants/faqs';
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

export default function FaqsScreen() {
  const theme = useAppTheme();
  const [query, setQuery] = useState('');
  const filteredFaqs = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return faqs;
    }

    return faqs.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(search));
  }, [query]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <BackControl label="Profile" onPress={() => router.back()} />

          <View style={styles.header}>
            <Text style={[styles.kicker, { color: theme.subtle }]}>Help</Text>
            <Text style={[styles.title, { color: theme.text }]}>FAQs</Text>
          </View>

          <View style={[styles.searchBar, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <Text style={[styles.searchIcon, { color: theme.subtle }]}>⌕</Text>
            <TextInput
              onChangeText={setQuery}
              placeholder="Search FAQs"
              placeholderTextColor={theme.subtle}
              style={[styles.searchInput, { color: theme.text }]}
              value={query}
            />
          </View>

          <View style={styles.faqList}>
            {filteredFaqs.length ? (
              filteredFaqs.map((item) => {
                const linkUrl = item.linkUrl;
                const linkLabel = item.linkLabel;

                return (
                  <View key={item.question} style={[styles.faqCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                    <Text style={[styles.faqQuestion, { color: theme.text }]}>{item.question}</Text>
                    <Text style={[styles.faqAnswer, { color: theme.muted }]}>
                      {item.answer}
                      {linkLabel && linkUrl ? (
                        <>
                          {' '}
                          <Text style={styles.faqLink} onPress={() => Linking.openURL(linkUrl)}>
                            {linkLabel}
                          </Text>
                        </>
                      ) : null}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No matches yet</Text>
                <Text style={[styles.emptyText, { color: theme.muted }]}>Try a simpler word like express, toolkit, privacy, or subscription.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: space.screenX, paddingTop: space.sm, paddingBottom: 120, gap: space.lg },
  header: { alignItems: 'center', gap: space.xs },
  kicker: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { color: '#1f1635', fontSize: typeScale.pageTitle, lineHeight: lineScale.pageTitle, fontWeight: '700' },
  searchBar: {
    minHeight: controlSize.compact,
    borderRadius: radius.pill,
    backgroundColor: '#f8f6fb',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  searchIcon: { color: '#8b829d', fontSize: 18, lineHeight: 20, fontWeight: '700' },
  searchInput: {
    flex: 1,
    minHeight: controlSize.compact,
    color: '#1f1635',
    fontSize: typeScale.body,
    lineHeight: lineScale.body,
    paddingVertical: 0,
  },
  faqList: { gap: space.sm },
  faqCard: {
    borderRadius: radius.lg,
    backgroundColor: '#f8f6fb',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: space.lg,
    gap: space.sm,
  },
  faqQuestion: { color: '#1f1635', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge, fontWeight: '700' },
  faqAnswer: { color: '#4f4268', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '500' },
  faqLink: { color: '#3a2c6b', fontWeight: '800', textDecorationLine: 'underline' },
  emptyCard: {
    borderRadius: radius.lg,
    backgroundColor: '#f8f6fb',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: space.lg,
    gap: space.xs,
    alignItems: 'center',
  },
  emptyTitle: { color: '#1f1635', fontSize: typeScale.bodyLarge, lineHeight: lineScale.bodyLarge, fontWeight: '700' },
  emptyText: { color: '#70677f', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600', textAlign: 'center' },
});

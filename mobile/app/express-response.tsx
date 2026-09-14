import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';
import { apiUrl } from '@/constants/api';
import { goBackOrReplace } from '@/constants/navigation';

type ResponseState = {
  direct: string;
  relational: string;
  prompt: string;
};

export default function ExpressResponseScreen() {
  const params = useLocalSearchParams<{
    prompt?: string | string[];
    direct?: string | string[];
    relational?: string | string[];
    source?: string | string[];
  }>();

  const prompt = useMemo(() => normalizeParam(params.prompt), [params.prompt]);
  const source = useMemo(() => normalizeParam(params.source), [params.source]);
  const presetDirect = useMemo(() => normalizeParam(params.direct), [params.direct]);
  const presetRelational = useMemo(() => normalizeParam(params.relational), [params.relational]);

  const [responseState, setResponseState] = useState<ResponseState>({
    prompt,
    direct: presetDirect,
    relational: presetRelational,
  });
  const [loading, setLoading] = useState(source === 'custom');
  const [error, setError] = useState('');

  const loadCustomResponse = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/mobile/express-response/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario: prompt }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || 'Could not create a response just now.');
        setLoading(false);
        return;
      }

      setResponseState({
        prompt: data.prompt || prompt,
        direct: data.direct || '',
        relational: data.relational || '',
      });
      setLoading(false);
    } catch {
      setError('Could not reach the server. Check the backend and try again.');
      setLoading(false);
    }
  }, [prompt]);

  useEffect(() => {
    setResponseState({
      prompt,
      direct: presetDirect,
      relational: presetRelational,
    });
    setError('');

    if (source !== 'custom') {
      setLoading(false);
      return;
    }

    loadCustomResponse();
  }, [loadCustomResponse, presetDirect, presetRelational, prompt, source]);

  function retry() {
    setError('');
    setLoading(true);
    setResponseState((current) => ({ ...current, direct: '', relational: '' }));
    loadCustomResponse();
  }

  function openCapture(style: 'direct' | 'relational') {
    router.push({
      pathname: '/express-capture',
      params: {
        style,
        scenario: responseState.prompt,
        response: style === 'direct' ? responseState.direct : responseState.relational,
      },
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.waveWrap}>
          <View style={styles.wave}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backControl, pressed && styles.backButtonPressed]}>
              <Text style={styles.backChevron}>‹</Text>
              <Text style={styles.backControlText}>Express</Text>
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.stepLabel}>{source === 'custom' ? 'Custom scenario' : 'Scenario'}</Text>
              <Text style={styles.title}>{responseState.prompt}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#4b3f86" />
            <Text style={styles.loadingTitle}>Creating your responses</Text>
            <Text style={styles.loadingText}>nomy is writing one direct version and one relational version for this scenario.</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>That didn’t come through</Text>
            <Text style={styles.errorText}>{error}</Text>
            {source === 'custom' ? (
              <Pressable onPress={retry} style={({ pressed }) => [styles.retryButton, pressed && styles.primaryButtonPressed]}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!loading && !error ? (
          <View style={styles.responses}>
            <Pressable
              accessibilityRole="button"
              onPress={() => openCapture('direct')}
              style={({ pressed }) => [styles.responseCard, styles.directCard, pressed && styles.primaryButtonPressed]}>
              <View style={styles.responseCardInner}>
                <View style={styles.responseCopy}>
                  <View style={styles.responseTopRow}>
                    <View style={[styles.responseBadge, styles.directBadge]}>
                      <Text style={[styles.responseBadgeText, styles.directBadgeText]}>Direct</Text>
                    </View>
                    <Text style={styles.responseMicrocopy}>clear and simple</Text>
                  </View>
                  <Text style={styles.responseText}>{responseState.direct}</Text>
                </View>
                <Text style={styles.responseChevron}>›</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => openCapture('relational')}
              style={({ pressed }) => [styles.responseCard, styles.relationalCard, pressed && styles.primaryButtonPressed]}>
              <View style={styles.responseCardInner}>
                <View style={styles.responseCopy}>
                  <View style={styles.responseTopRow}>
                    <View style={[styles.responseBadge, styles.relationalBadge]}>
                      <Text style={[styles.responseBadgeText, styles.relationalBadgeText]}>Relational</Text>
                    </View>
                    <Text style={styles.responseMicrocopy}>warmer and more connective</Text>
                  </View>
                  <Text style={styles.responseText}>{responseState.relational}</Text>
                </View>
                <Text style={styles.responseChevron}>›</Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={() => goBackOrReplace('/express')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.secondaryButtonText}>Try another scenario</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 20 },
  waveWrap: { marginHorizontal: -18 },
  wave: {
    backgroundColor: '#e1dcf9',
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  stepLabel: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 26, fontWeight: '400', lineHeight: 34 },
  backControl: {
    alignSelf: 'flex-start',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  backChevron: { color: '#3a2c6b', fontSize: 28, lineHeight: 30, fontWeight: '400' },
  backControlText: { color: '#3a2c6b', fontSize: 16, fontWeight: '700' },
  backButtonPressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  header: { alignItems: 'center', gap: 8, paddingTop: 12 },
  loadingCard: {
    borderRadius: 8,
    backgroundColor: '#f1f1ff',
    padding: 18,
    gap: 10,
    alignItems: 'flex-start',
  },
  loadingTitle: { color: '#1f003d', fontSize: 19, fontWeight: '600' },
  loadingText: { color: '#5e4f79', fontSize: 15, lineHeight: 23 },
  errorCard: { borderRadius: 8, backgroundColor: '#fff1f4', padding: 18, gap: 10 },
  errorTitle: { color: '#7a1738', fontSize: 19, fontWeight: '700' },
  errorText: { color: '#7a1738', fontSize: 15, lineHeight: 23 },
  retryButton: {
    minHeight: 48,
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#d9d2fb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  retryButtonText: { color: '#1f003d', fontSize: 15, fontWeight: '700' },
  responses: { gap: 14 },
  responseCard: {
    borderRadius: 8,
    padding: 18,
  },
  responseCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  responseCopy: { flex: 1, gap: 12 },
  directCard: {
    backgroundColor: '#f3efff',
    borderWidth: 1,
    borderColor: '#d9cff8',
  },
  relationalCard: {
    backgroundColor: '#eef7f3',
    borderWidth: 1,
    borderColor: '#cee7da',
  },
  responseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  responseBadge: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directBadge: { backgroundColor: '#dfd2ff' },
  relationalBadge: { backgroundColor: '#d8efe4' },
  responseBadgeText: { fontSize: 13, fontWeight: '700' },
  directBadgeText: { color: '#43307f' },
  relationalBadgeText: { color: '#24533e' },
  responseMicrocopy: { color: '#6f6285', fontSize: 13, lineHeight: 18 },
  responseText: { color: '#1f003d', fontSize: 20, fontWeight: '500', lineHeight: 30 },
  responseChevron: { color: '#8d82a4', fontSize: 30, lineHeight: 30, fontWeight: '500' },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd7f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: { color: '#3a2c6b', fontSize: 16, fontWeight: '600' },
  primaryButtonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});

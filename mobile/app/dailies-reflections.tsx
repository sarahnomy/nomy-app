import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { goBackOrReplace } from '@/constants/navigation';
import {
  type CheckInReflectionEntry,
  type EmotionReflectionEntry,
  type ExpressReflectionEntry,
  getLocalCheckInReflections,
  getLocalExpressReflections,
  syncEmotionReflectionsFromServer,
} from '@/constants/reflections';

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DailiesReflectionsScreen() {
  const [checkInReflections, setCheckInReflections] = useState<CheckInReflectionEntry[]>([]);
  const [emotionReflections, setEmotionReflections] = useState<EmotionReflectionEntry[]>([]);
  const [expressReflections, setExpressReflections] = useState<ExpressReflectionEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadReflections() {
        const [checkInItems, emotionItems, expressItems] = await Promise.all([
          getLocalCheckInReflections(),
          syncEmotionReflectionsFromServer(),
          getLocalExpressReflections(),
        ]);
        if (active) {
          setCheckInReflections(checkInItems);
          setEmotionReflections(emotionItems);
          setExpressReflections(expressItems);
        }
      }

      loadReflections();

      return () => {
        active = false;
      };
    }, []),
  );

  const hasReflections = checkInReflections.length > 0 || emotionReflections.length > 0 || expressReflections.length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label="Check-in" onPress={() => goBackOrReplace('/dailies')} />

        <View style={styles.header}>
          <Text style={styles.title}>Reflections</Text>
          <Text style={styles.subtitle}>Check-in, Emotionize, and Express reflections you save live here.</Text>
        </View>

        {hasReflections ? (
          <>
            {checkInReflections.length ? (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Check-in</Text>
                {checkInReflections.map((item) => (
                  <View key={item.id} style={styles.reflectionRow}>
                    <View style={styles.rowHeader}>
                      <View style={styles.checkInPill}>
                        <Text style={styles.checkInPillText}>{item.period === 'evening' ? 'Evening' : 'Morning'}</Text>
                      </View>
                      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>
                    <Text style={styles.reflectionText}>{item.reflection}</Text>
                    <Text style={styles.localText}>Saved on this phone</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {emotionReflections.length ? (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Emotionize</Text>
                {emotionReflections.map((item) => (
                  <View key={item.id} style={styles.reflectionRow}>
                    <View style={styles.rowHeader}>
                      <View style={[styles.emotionPill, { backgroundColor: item.categoryColor || '#ebe7ff' }]}>
                        <Text style={styles.emotionPillText}>{item.emotion}</Text>
                      </View>
                      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>
                    <Text style={styles.reflectionText}>{item.reflection}</Text>
                    {!item.synced ? (
                      <Text style={styles.localText}>Saved on this phone</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {expressReflections.length ? (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Express</Text>
                {expressReflections.map((item) => (
                  <View key={item.id} style={styles.reflectionRow}>
                    <View style={styles.rowHeader}>
                      <View style={styles.expressPill}>
                        <Text style={styles.expressPillText}>{item.style === 'relational' ? 'Relational' : 'Direct'} · {item.mode === 'voice' ? 'Voice' : 'Text'}</Text>
                      </View>
                      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>
                    <Text style={styles.contextText}>{item.scenario}</Text>
                    <Text style={styles.reflectionText}>{item.reflection}</Text>
                    <Text style={styles.localText}>Saved on this phone</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>
              Check-in, Emotionize, and Express reflections will appear here after you save them.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fffaf2' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 18 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  backButtonText: { color: '#332852', fontSize: 34, lineHeight: 36, fontWeight: '400' },
  backButtonPressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
  header: { gap: 8, alignItems: 'center', paddingBottom: 4 },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 32, fontWeight: '700', lineHeight: 38 },
  subtitle: { color: '#70677f', textAlign: 'center', fontSize: 16, lineHeight: 23, maxWidth: 330 },
  group: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  groupLabel: {
    color: '#817690',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  reflectionRow: {
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e8e3f0',
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  checkInPill: { borderRadius: 999, backgroundColor: '#f1f1ff', paddingHorizontal: 10, paddingVertical: 6 },
  checkInPillText: { color: '#564d74', fontSize: 13, fontWeight: '700' },
  emotionPill: { borderRadius: 999, backgroundColor: '#ebe7ff', paddingHorizontal: 10, paddingVertical: 6 },
  emotionPillText: { color: '#5d50b6', fontSize: 13, fontWeight: '700' },
  expressPill: { borderRadius: 999, backgroundColor: '#e9f0fa', paddingHorizontal: 10, paddingVertical: 6 },
  expressPillText: { color: '#31506f', fontSize: 13, fontWeight: '700' },
  dateText: { color: '#8b829d', fontSize: 13, fontWeight: '600' },
  contextText: { color: '#70677f', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  reflectionText: { color: '#241b3b', fontSize: 16, lineHeight: 24 },
  localText: { color: '#8b829d', fontSize: 13, fontWeight: '600' },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 8,
    alignItems: 'center',
  },
  emptyTitle: { color: '#1f1635', fontSize: 20, fontWeight: '700' },
  emptyText: { color: '#70677f', fontSize: 16, lineHeight: 23, textAlign: 'center' },
});

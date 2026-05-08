import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const moods = [
  {
    label: 'Unclear',
    tone: 'A little hard to name',
    support: 'Start by choosing one emotional space. You do not need the exact word yet.',
    action: 'Open Emotionize',
    href: '/emotionize',
    color: '#f1eeff',
  },
  {
    label: 'Heavy',
    tone: 'Low energy or tired',
    support: 'Keep this small. A gentle daily check-in can help you notice what needs less pressure.',
    action: 'Open Check-in',
    href: '/dailies',
    color: '#e9f0fa',
  },
  {
    label: 'Too much',
    tone: 'Overloaded or tense',
    support: 'Try regulating before reflecting. Your body may need quiet before words.',
    action: 'Open Toolkit',
    href: '/toolkit',
    color: '#f4f8f3',
  },
  {
    label: 'Need words',
    tone: 'Something to say',
    support: 'Use a guided prompt to find language that feels honest and careful.',
    action: 'Open Express',
    href: '/express',
    color: '#e1dcf9',
  },
] as const;

const modules = [
  {
    title: 'Express',
    text: 'Write or record what’s on your mind — no rules, just space to express yourself.',
    image: require('@/assets/images/express.png'),
    color: '#e1dcf9',
    href: '/express',
  },
  {
    title: 'Emotionize',
    text: 'Explore and name your emotions through gentle prompts and visuals.',
    image: require('@/assets/images/emotionize.png'),
    color: '#e9c3f1',
    href: '/emotionize',
  },
  {
    title: 'Check-in',
    text: 'Morning and evening reflections to help you check in with how you feel each day.',
    image: require('@/assets/images/dailies.png'),
    color: '#eaeaf5',
    href: '/dailies',
  },
  {
    title: 'Toolkit',
    text: 'Quick grounding tools and calm exercises for support anytime.',
    image: require('@/assets/images/toolkit.png'),
    color: '#f9efe3',
    href: '/toolkit',
  },
] as const;

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState(moods[0]);

  const avatarState = useMemo(() => {
    if (selectedMood.label === 'Too much') {
      return 'Energy is high. Let’s lower the demand first.';
    }
    if (selectedMood.label === 'Heavy') {
      return 'Energy is low. A smaller step is enough.';
    }
    if (selectedMood.label === 'Need words') {
      return 'Words are nearby. We can shape them gently.';
    }
    return 'We can begin without needing the perfect label.';
  }, [selectedMood]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Image
              source={require('@/assets/images/nomy-logo-new.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.subtitle}>What would you like to do today?</Text>
          </View>
          <Image source={require('@/assets/images/nomy-avatar.png')} style={styles.avatar} />
        </View>

        <View style={styles.accountLinks}>
          <Link href="/login" asChild>
            <Pressable style={styles.accountButton}>
              <Text style={styles.accountButtonText}>Log in</Text>
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable style={styles.accountButton}>
              <Text style={styles.accountButtonText}>Create account</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.checkInCard}>
          <View style={styles.checkInHeader}>
            <View style={styles.checkInCopy}>
              <Text style={styles.kicker}>Adaptive Avatar</Text>
              <Text style={styles.checkInTitle}>How are you arriving?</Text>
            </View>
            <View style={styles.avatarBubble}>
              <Image source={require('@/assets/images/nomy-avatar.png')} style={styles.checkInAvatar} contentFit="contain" />
            </View>
          </View>

          <Text style={styles.avatarState}>{avatarState}</Text>

          <View style={styles.moodGrid}>
            {moods.map((mood) => {
              const active = selectedMood.label === mood.label;
              return (
                <Pressable
                  key={mood.label}
                  onPress={() => setSelectedMood(mood)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.moodButton, { backgroundColor: mood.color }, active && styles.moodButtonActive]}>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                  <Text style={styles.moodTone}>{mood.tone}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.recommendation}>
            <Text style={styles.recommendationText}>{selectedMood.support}</Text>
            <Link href={selectedMood.href} asChild>
              <Pressable style={styles.recommendationButton}>
                <Text style={styles.recommendationButtonText}>{selectedMood.action}</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All tools</Text>
          <Text style={styles.sectionHint}>Always available</Text>
        </View>

        <View style={styles.list}>
          {modules.map((item) => (
            <Link key={item.title} href={item.href} asChild>
              <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                <View style={[styles.iconTile, { backgroundColor: item.color }]}>
                  <Image source={item.image} style={styles.moduleImage} contentFit="contain" />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowText}>{item.text}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fbf9ff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: 16,
  },
  headerCopy: { flex: 1 },
  logo: { width: 150, height: 70, marginLeft: -12 },
  subtitle: { color: '#1f003d', fontSize: 20, lineHeight: 26, fontWeight: '500' },
  avatar: { width: 58, height: 58, borderRadius: 8 },
  accountLinks: { flexDirection: 'row', gap: 10 },
  accountButton: { flex: 1, minHeight: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ded7ec' },
  accountButtonText: { color: '#1f003d', fontSize: 15, fontWeight: '800' },
  checkInCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ded7ec',
    padding: 16,
    gap: 16,
  },
  checkInHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  checkInCopy: { flex: 1, gap: 5 },
  kicker: { color: '#5e4f79', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  checkInTitle: { color: '#1f003d', fontSize: 27, fontWeight: '800', lineHeight: 33 },
  avatarBubble: {
    width: 86,
    height: 86,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee9ff',
  },
  checkInAvatar: { width: 70, height: 70 },
  avatarState: {
    color: '#1f003d',
    backgroundColor: '#f6f2ff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
  },
  moodGrid: { gap: 10 },
  moodButton: {
    minHeight: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ded7ec',
    padding: 13,
    justifyContent: 'center',
    gap: 4,
  },
  moodButtonActive: {
    borderWidth: 2,
    borderColor: '#1f003d',
  },
  moodLabel: { color: '#1f003d', fontSize: 18, fontWeight: '800' },
  moodTone: { color: '#5e4f79', fontSize: 15, lineHeight: 20 },
  recommendation: {
    borderRadius: 8,
    backgroundColor: '#19003d',
    padding: 14,
    gap: 14,
  },
  recommendationText: { color: '#f4edff', fontSize: 16, lineHeight: 24 },
  recommendationButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  recommendationButtonText: { color: '#1f003d', fontSize: 16, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { color: '#1f003d', fontSize: 22, fontWeight: '800' },
  sectionHint: { color: '#5e4f79', fontSize: 14, fontWeight: '700' },
  list: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee8f8',
    overflow: 'hidden',
  },
  row: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee8f8',
  },
  rowPressed: { backgroundColor: '#faf7ff' },
  iconTile: {
    width: 58,
    height: 58,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleImage: { width: 42, height: 42 },
  rowCopy: { flex: 1, gap: 5 },
  rowTitle: { color: '#1f003d', fontSize: 19, fontWeight: '700' },
  rowText: { color: '#5e4f79', fontSize: 15, lineHeight: 21 },
  chevron: { color: '#7e7193', fontSize: 28, lineHeight: 30 },
});

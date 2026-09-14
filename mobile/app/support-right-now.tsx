import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, TextInput } from '@/components/nomy-type';
import { apiUrl } from '@/constants/api';
import { recordAvatarActivity } from '@/constants/avatar';
import { goBackOrReplace } from '@/constants/navigation';
import { completeOnboarding } from '@/constants/onboarding';
import { supportOptions } from '@/constants/support';

type Recommendation = {
  category: SupportCategory;
  feature: string;
  label: string;
  reason: string;
  source?: 'ai' | 'local';
};

type SupportCategory = 'unclear' | 'heavy' | 'too_much' | 'need_words';

const featureLabels = {
  emotionize: 'Emotionize',
  dailies: 'Check-in',
  express: 'Express',
  toolkit: 'Toolkit',
} as const;

const categoryLabels: Record<SupportCategory, string> = {
  unclear: 'Unclear',
  heavy: 'Heavy',
  too_much: 'Too much',
  need_words: 'Need words',
};

const featureVisuals: Record<string, { color: string; image: ImageSource }> = {
  emotionize: {
    color: '#e9c3f1',
    image: require('@/assets/images/emotionize.png'),
  },
  dailies: {
    color: '#f1f1ff',
    image: require('@/assets/images/dailies.png'),
  },
  express: {
    color: '#e1dcf9',
    image: require('@/assets/images/express.png'),
  },
  toolkit: {
    color: '#fff5e9',
    image: require('@/assets/images/toolkit.png'),
  },
};

const featureChoices = [
  {
    feature: 'emotionize',
    label: featureLabels.emotionize,
    href: '/emotionize',
  },
  {
    feature: 'dailies',
    label: featureLabels.dailies,
    href: '/dailies',
  },
  {
    feature: 'express',
    label: featureLabels.express,
    href: '/express',
  },
  {
    feature: 'toolkit',
    label: featureLabels.toolkit,
    href: '/toolkit',
  },
] as const;

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function normalizeCategory(value: unknown): SupportCategory | null {
  if (value === 'unclear' || value === 'heavy' || value === 'too_much' || value === 'need_words') {
    return value;
  }

  return null;
}

function categoryFromPresetLabel(label: string): SupportCategory {
  const lowered = label.toLowerCase();

  if (lowered === 'too much') {
    return 'too_much';
  }

  if (lowered === 'need words') {
    return 'need_words';
  }

  if (lowered === 'unclear') {
    return 'unclear';
  }

  return 'heavy';
}

function getLocalRecommendation(feeling: string): Recommendation {
  const lowered = feeling.toLowerCase();

  if (
    includesAny(lowered, [
      'overwhelmed',
      'panic',
      'panicky',
      'overstimulated',
      'overstim',
      'too much',
      'sensory',
      'noise',
      'loud',
      'shaky',
      'tense',
      'meltdown',
      'shutdown',
      'spiral',
    ])
  ) {
    return {
      category: 'too_much',
      feature: 'toolkit',
      label: featureLabels.toolkit,
      reason: 'Toolkit is the gentlest first step when your body needs regulation before reflection.',
      source: 'local',
    };
  }

  if (
    includesAny(lowered, [
      'say',
      'reply',
      'text',
      'message',
      'conversation',
      'talk',
      'speak',
      'tell',
      'discuss',
      'explain',
      'email',
      'ask',
      'boundar',
      'words',
      'communicat',
    ])
  ) {
    return {
      category: 'need_words',
      feature: 'express',
      label: featureLabels.express,
      reason: 'Express can help shape words when communication feels like the main pressure.',
      source: 'local',
    };
  }

  if (
    includesAny(lowered, [
      'tired',
      'exhausted',
      'drained',
      'heavy',
      'low energy',
      'flat',
      'burnt out',
      'burnout',
      'hard day',
      'slow',
    ])
  ) {
    return {
      category: 'heavy',
      feature: 'dailies',
      label: featureLabels.dailies,
      reason: 'Check-in gives you a small, steady place to notice what needs support today.',
      source: 'local',
    };
  }

  if (
    includesAny(lowered, [
      'lonely',
      'sad',
      'numb',
      'confused',
      'unclear',
      'feeling',
      'emotion',
      'angry',
      'frustrated',
      'happy',
      'anxious',
      'ashamed',
    ])
  ) {
    return {
      category: 'unclear',
      feature: 'emotionize',
      label: featureLabels.emotionize,
      reason: 'Emotionize is a good first step when the feeling needs naming and understanding.',
      source: 'local',
    };
  }

  return {
    category: 'heavy',
    feature: 'dailies',
    label: featureLabels.dailies,
    reason: 'Check-in gives you a small, steady place to notice what needs support today.',
    source: 'local',
  };
}

export default function SupportRightNowScreen() {
  const [customFeeling, setCustomFeeling] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const trimmedFeeling = useMemo(() => customFeeling.trim(), [customFeeling]);
  const recommendationVisual = recommendation ? featureVisuals[recommendation.feature] : null;

  async function choosePreset(label: string, feature: string, href: string) {
    const option = supportOptions.find((item) => item.label === label || item.feature === feature);
    const nextRecommendation = {
      category: categoryFromPresetLabel(label),
      feature,
      label: option?.action.replace('Open ', '') || featureLabels[feature as keyof typeof featureLabels] || label,
      reason: option?.support || 'This looks like a gentle place to start right now.',
      source: 'local' as const,
    };

    setError('');
    setNotice('');
    setRecommendation(nextRecommendation);
    await recordAvatarActivity({ type: 'support_mood_selected', feature, label });
  }

  async function getRecommendation() {
    if (!trimmedFeeling) {
      setError('Write how you feel first so nomy can help choose a starting point.');
      return;
    }

    Keyboard.dismiss();
    setInputFocused(false);
    const localRecommendation = getLocalRecommendation(trimmedFeeling);
    setRecommendation(localRecommendation);
    setLoading(true);
    setError('');
    setNotice('nomy has suggested a starting point. Checking if the AI service can refine it.');

    try {
      const response = await fetch(apiUrl('/api/mobile/support-recommendation/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feeling: trimmedFeeling }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setRecommendation(localRecommendation);
        setNotice('Using the on-device recommendation because the AI service was unavailable.');
        setLoading(false);
        return;
      }

      const nextRecommendation = {
        category: normalizeCategory(data.category) || localRecommendation.category,
        feature: data.feature || localRecommendation.feature,
        label: data.label || localRecommendation.label,
        reason: data.reason || localRecommendation.reason,
        source: 'ai' as const,
      };

      setRecommendation(nextRecommendation);
      setNotice('');
      await recordAvatarActivity({
        type: 'support_ai_recommended',
        feature: nextRecommendation.feature,
        label: trimmedFeeling,
      });
      setLoading(false);
    } catch {
      setRecommendation(localRecommendation);
      setNotice('Using the on-device recommendation because the server could not be reached.');
      setLoading(false);
    }
  }

  async function openRecommendedFeature(feature: string) {
    const option = featureChoices.find((item) => item.feature === feature);
    if (!option) {
      return;
    }

    await recordAvatarActivity({ type: 'support_recommendation_opened', feature: option.feature, label: option.label });
    await completeOnboarding();
    router.push(option.href);
  }

  return (
    <SafeAreaView style={styles.screen}>
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
          <View style={styles.wave}>
            <Pressable
              onPress={() => goBackOrReplace('/')}
              style={({ pressed }) => [styles.backControl, pressed && styles.backButtonPressed]}>
              <Text style={styles.backChevron}>‹</Text>
              <Text style={styles.backControlText}>Home</Text>
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.stepLabel}>Support</Text>
              <Text style={styles.title}>Support right now</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start with a feeling</Text>
          <View style={styles.options}>
            {supportOptions.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  void choosePreset(item.label, item.feature, item.href);
                }}
                style={({ pressed }) => [styles.optionCard, { backgroundColor: item.color }, pressed && styles.optionPressed]}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.optionTone}>{item.tone}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {recommendation ? (
          <View style={[styles.recommendationCard, { backgroundColor: recommendationVisual?.color || '#f8f5ff' }]}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationIconWrap}>
                {recommendationVisual ? (
                  <Image source={recommendationVisual.image} style={styles.recommendationIcon} contentFit="contain" />
                ) : null}
              </View>
              <View style={styles.recommendationCopy}>
                <Text style={styles.recommendationEyebrow}>
                  {recommendation.source === 'local' ? 'Suggested starting point' : 'Recommended first step'}
                </Text>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>Sounds like {categoryLabels[recommendation.category]}</Text>
                </View>
                <Text style={styles.recommendationTitle}>{recommendation.label}</Text>
              </View>
            </View>
            <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
            <Pressable
              onPress={() => {
                void openRecommendedFeature(recommendation.feature);
              }}
              style={({ pressed }) => [styles.openButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.openButtonText}>Open {recommendation.label}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionTitle}>Or write how you feel</Text>
            {inputFocused ? (
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setInputFocused(false);
                }}
                style={({ pressed }) => [styles.doneButton, pressed && styles.optionPressed]}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            multiline
            value={customFeeling}
            onBlur={() => setInputFocused(false)}
            onFocus={() => setInputFocused(true)}
            onChangeText={(value) => {
              setCustomFeeling(value);
              if (error) {
                setError('');
              }
              if (notice) {
                setNotice('');
              }
            }}
            placeholder="For example: I feel lonely and a bit disconnected but I do not know where to start."
            placeholderTextColor="#7a7291"
            returnKeyType="done"
            scrollEnabled={false}
            textAlignVertical="top"
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <Pressable onPress={getRecommendation} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
            <Text style={styles.primaryButtonText}>Recommend a feature</Text>
          </Pressable>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#4b3f86" />
              <Text style={styles.loadingText}>nomy is checking whether the recommendation can be refined.</Text>
            </View>
          ) : null}
        </View>

        {recommendation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose something else</Text>
            <View style={styles.alternativeList}>
              {featureChoices.filter((item) => item.feature !== recommendation.feature).map((item) => {
                const visual = featureVisuals[item.feature];

                return (
                <Pressable
                  key={item.feature}
                  onPress={() => {
                    void openRecommendedFeature(item.feature);
                  }}
                  style={({ pressed }) => [
                    styles.alternativeCard,
                    { backgroundColor: visual.color },
                    pressed && styles.optionPressed,
                  ]}>
                  <View style={styles.alternativeIconWrap}>
                    <Image source={visual.image} style={styles.alternativeIcon} contentFit="contain" />
                  </View>
                  <Text style={styles.alternativeText}>{item.label}</Text>
                  <Text style={styles.alternativeChevron}>›</Text>
                </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0d96d' },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 140, gap: 20 },
  waveWrap: { marginHorizontal: -18 },
  wave: {
    backgroundColor: '#f4df82',
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 22,
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
  section: { gap: 12 },
  inputHeader: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: '#1f003d', fontSize: 20, fontWeight: '700' },
  doneButton: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(31, 0, 61, 0.12)',
  },
  doneButtonText: { color: '#1f003d', fontSize: 14, fontWeight: '800' },
  options: { gap: 10 },
  optionCard: {
    minHeight: 72,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 4,
  },
  optionPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  optionLabel: { color: '#1f003d', fontSize: 18, fontWeight: '700' },
  optionTone: { color: '#5e4f79', fontSize: 14, lineHeight: 20 },
  input: {
    minHeight: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd7f0',
    backgroundColor: '#fcfbff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#1f003d',
    fontSize: 16,
    lineHeight: 24,
  },
  error: { color: '#9b2448', fontSize: 15, lineHeight: 21 },
  notice: { color: '#5e4f79', fontSize: 15, lineHeight: 21 },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: '#d9d2fb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  primaryButtonText: { color: '#1f003d', fontSize: 16, fontWeight: '700' },
  loadingCard: {
    borderRadius: 8,
    backgroundColor: '#f7f3fd',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: { color: '#5e4f79', fontSize: 15, lineHeight: 22 },
  recommendationCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(31, 0, 61, 0.08)',
    padding: 16,
    gap: 12,
  },
  recommendationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recommendationIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  recommendationIcon: { width: 44, height: 44 },
  recommendationCopy: { flex: 1, gap: 4 },
  recommendationEyebrow: { color: '#5e4f79', fontSize: 13, fontWeight: '700' },
  categoryChip: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  categoryChipText: { color: '#4f4268', fontSize: 12, fontWeight: '800' },
  recommendationTitle: { color: '#1f003d', fontSize: 22, fontWeight: '700' },
  recommendationReason: { color: '#4f4268', fontSize: 15, lineHeight: 22 },
  openButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#1f003d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  openButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  alternativeList: { gap: 10 },
  alternativeCard: {
    minHeight: 58,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alternativeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  alternativeIcon: { width: 32, height: 32 },
  alternativeText: { flex: 1, color: '#1f003d', fontSize: 16, fontWeight: '700' },
  alternativeChevron: { color: '#6f6285', fontSize: 22, lineHeight: 24, fontWeight: '400' },
});

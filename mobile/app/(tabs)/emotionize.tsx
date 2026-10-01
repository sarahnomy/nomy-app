import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { apiUrl } from '@/constants/api';
import { useAppTheme } from '@/constants/app-theme';
import { recordAvatarActivity } from '@/constants/avatar';
import {
  emotionizeCategories,
  emotionizeStories,
  type EmotionizeOptionGroupKey,
  type EmotionizeSelections,
  type EmotionizeStoryName,
  type EmotionizeStorySlide,
} from '@/constants/emotionize-content';
import { hapticLight, hapticSelection, hapticWarning } from '@/constants/haptics';
import { goBackToOriginOrReplace } from '@/constants/navigation';
import { controlSize, lineScale, radius, space, typeScale } from '@/constants/ui-scale';

const emptyEmotionSelections = (): EmotionizeSelections => ({ looks: [], body: [], afterwards: [] });
type ReadStatus = 'idle' | 'loading' | 'playing' | 'paused';

export default function EmotionizeScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ story?: string | string[]; origin?: string | string[] }>();
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [story, setStory] = useState<EmotionizeStoryName | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selections, setSelections] = useState<EmotionizeSelections>(emptyEmotionSelections);
  const [noteOpen, setNoteOpen] = useState(false);
  const [lockedFeeling, setLockedFeeling] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<ReadStatus>('idle');
  const [activeReadLineIndex, setActiveReadLineIndex] = useState<number | null>(null);
  const [readError, setReadError] = useState('');
  const [audioUri, setAudioUri] = useState('');
  const [audioCacheKey, setAudioCacheKey] = useState('');
  const readingRunRef = useRef(0);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);
  const playerStatus = useAudioPlayerStatus(player);

  const category = useMemo(
    () => emotionizeCategories.find((item) => item.name === categoryName) || null,
    [categoryName],
  );
  const slides = story ? emotionizeStories[story] : [];
  const currentSlide = slides[slideIndex];
  const readableLines = currentSlide ? getReadableSlideLines(currentSlide) : [];
  const canReadCurrentSlide = readableLines.length > 0;

  useEffect(() => {
    void recordAvatarActivity({ type: 'feature_opened', feature: 'emotionize' });
  }, []);

  useEffect(() => {
    readingRunRef.current += 1;
    player.pause();
    setSpeechStatus('idle');
    setActiveReadLineIndex(null);
    setReadError('');

    return () => {
      readingRunRef.current += 1;
      player.pause();
    };
  }, [slideIndex, story]);

  useEffect(() => {
    if (!readableLines.length || speechStatus === 'idle' || speechStatus === 'loading') {
      return;
    }

    const duration = playerStatus.duration || estimateTotalReadDuration(readableLines);
    setActiveReadLineIndex(getActiveLineIndex(readableLines, playerStatus.currentTime, duration));

    if (playerStatus.didJustFinish) {
      setSpeechStatus('idle');
      setActiveReadLineIndex(null);
    }
  }, [playerStatus.currentTime, playerStatus.didJustFinish, playerStatus.duration, readableLines, speechStatus]);

  useEffect(() => {
    const requestedStory = normalizeParam(params.story);

    if (!requestedStory || !(requestedStory in emotionizeStories)) {
      return;
    }

    const matchingCategory = emotionizeCategories.find((item) => item.feelings.includes(requestedStory as never));
    if (!matchingCategory) {
      return;
    }

    setCategoryName(matchingCategory.name);
    setStory(requestedStory as EmotionizeStoryName);
    setSlideIndex(0);
    setSelections(emptyEmotionSelections());
    void recordAvatarActivity({ type: 'emotionize_story_opened', feature: 'emotionize', label: requestedStory });
  }, [params.story]);

  function openStory(nextStory: EmotionizeStoryName) {
    if ((category?.locked as readonly string[] | undefined)?.includes(nextStory)) {
      hapticWarning();
      setLockedFeeling(nextStory);
      return;
    }

    hapticLight();
    const matchingCategory = emotionizeCategories.find((item) => item.feelings.includes(nextStory as never));
    if (matchingCategory) {
      setCategoryName(matchingCategory.name);
    }

    void recordAvatarActivity({ type: 'emotionize_story_opened', feature: 'emotionize', label: nextStory });
    setStory(nextStory);
    setSlideIndex(0);
    setSelections(emptyEmotionSelections());
  }

  function closeStory() {
    hapticLight();
    void stopReading();
    setStory(null);
    setSlideIndex(0);
    setSelections(emptyEmotionSelections());
  }

  function closeCategory() {
    hapticLight();
    setCategoryName(null);
    setNoteOpen(false);
    setLockedFeeling(null);
  }

  function previousStoryStep() {
    hapticLight();
    if (slideIndex > 0) {
      setSlideIndex((current) => current - 1);
      return;
    }

    closeStory();
  }

  function nextSlide() {
    if (!story) {
      return;
    }

    hapticLight();
    if (slideIndex < slides.length - 1) {
      setSlideIndex((current) => current + 1);
      return;
    }

    router.push({
      pathname: '/emotionize-reflection',
      params: {
        emotion: story,
        category: category?.name || '',
        categoryColor: '#e1dcf9',
        selectedNotes: formatSelectionsForSave(slides, selections),
      },
    });
  }

  function toggleOption(group: EmotionizeOptionGroupKey, option: string) {
    hapticSelection();
    setSelections((current) => {
      const isSelected = current[group].includes(option);
      return {
        ...current,
        [group]: isSelected ? current[group].filter((item) => item !== option) : [...current[group], option],
      };
    });
  }

  async function startReading() {
    if (!readableLines.length) {
      return;
    }

    hapticLight();
    const runId = readingRunRef.current + 1;
    readingRunRef.current = runId;
    setReadError('');
    setSpeechStatus('loading');
    setActiveReadLineIndex(0);

    try {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const cacheKey = `${story || 'emotion'}-${slideIndex}-${hashText(readableLines.join('\n'))}`;
      const nextUri = await getTtsAudioUri(readableLines, cacheKey);

      if (readingRunRef.current !== runId) {
        return;
      }

      if (audioCacheKey !== cacheKey || audioUri !== nextUri) {
        player.replace({ uri: nextUri });
        setAudioUri(nextUri);
        setAudioCacheKey(cacheKey);
      }

      await player.seekTo(0);
      player.play();
      setSpeechStatus('playing');
    } catch {
      if (readingRunRef.current === runId) {
        hapticWarning();
        setReadError('Read to me could not start just now.');
        setSpeechStatus('idle');
        setActiveReadLineIndex(null);
      }
    }
  }

  async function pauseReading() {
    readingRunRef.current += 1;
    player.pause();
    setSpeechStatus('paused');
  }

  async function resumeReading() {
    if (!readableLines.length) {
      return;
    }

    hapticLight();
    player.play();
    setSpeechStatus('playing');
  }

  async function stopReading() {
    readingRunRef.current += 1;
    player.pause();
    await player.seekTo(0);
    setSpeechStatus('idle');
    setActiveReadLineIndex(null);
  }

  if (story && currentSlide && category) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
        <View style={styles.storyContent}>
          <Pressable
            onPress={previousStoryStep}
            style={({ pressed }) => [styles.backControl, pressed && styles.backButtonPressed]}>
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.backControlText}>{slideIndex > 0 ? 'Previous' : 'Feelings'}</Text>
          </Pressable>

          <View style={styles.progressRow}>
            {slides.map((_, index) => (
              <View key={index} style={styles.progressBar}>
                <View style={[styles.progressFill, index <= slideIndex && styles.progressFillActive]} />
              </View>
            ))}
          </View>

          <View style={styles.storyPill}>
            <Text style={styles.storyPillText}>{currentSlide.note || story}</Text>
          </View>

          {canReadCurrentSlide ? (
            <View>
              <View style={styles.readToMeBar}>
                <Text style={styles.readToMeLabel}>Read to me</Text>
                <View style={styles.readToMeActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={speechStatus === 'paused' ? 'Resume reading' : 'Play reading'}
                    disabled={speechStatus === 'loading'}
                    onPress={speechStatus === 'paused' ? resumeReading : startReading}
                    style={({ pressed }) => [
                      styles.readButton,
                      speechStatus === 'loading' && styles.readButtonDisabled,
                      pressed && speechStatus !== 'loading' && styles.readButtonPressed,
                    ]}>
                    <Text style={[styles.readButtonText, speechStatus === 'loading' && styles.readButtonTextDisabled]}>
                      {speechStatus === 'loading' ? 'Preparing' : speechStatus === 'paused' ? 'Resume' : 'Play'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Pause reading"
                    disabled={speechStatus !== 'playing'}
                    onPress={pauseReading}
                    style={({ pressed }) => [
                      styles.readButton,
                      speechStatus !== 'playing' && styles.readButtonDisabled,
                      pressed && speechStatus === 'playing' && styles.readButtonPressed,
                    ]}>
                    <Text style={[styles.readButtonText, speechStatus !== 'playing' && styles.readButtonTextDisabled]}>Pause</Text>
                  </Pressable>
                </View>
              </View>
              {readError ? <Text style={styles.readError}>{readError}</Text> : null}
            </View>
          ) : null}

          <ScrollView style={styles.slide} contentContainerStyle={styles.slideContent} showsVerticalScrollIndicator={false}>
            <View style={styles.slideCard}>{renderSlide(currentSlide, slides, selections, toggleOption, activeReadLineIndex)}</View>
          </ScrollView>

          <View style={styles.storyActions}>
            <Pressable onPress={previousStoryStep} style={({ pressed }) => [styles.storyNavButton, styles.secondaryStepButton, pressed && styles.secondaryStepButtonPressed]}>
              <Text style={styles.secondaryStepButtonText}>{slideIndex > 0 ? 'Previous' : 'Feelings'}</Text>
            </Pressable>
            <Pressable onPress={nextSlide} style={({ pressed }) => [styles.storyNavButton, styles.nextButton, pressed && styles.pressedPrimary]}>
              <Text style={styles.nextButtonText}>{slideIndex === slides.length - 1 ? 'Reflect' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (category) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.choiceHeader}>
            <Pressable
              onPress={closeCategory}
              style={({ pressed }) => [styles.backControl, pressed && styles.backButtonPressed]}>
              <Text style={styles.backChevron}>‹</Text>
              <Text style={styles.backControlText}>Spaces</Text>
            </Pressable>
            <View style={styles.choiceTitleCard}>
              <Text style={[styles.choiceEyebrow, { color: theme.subtle }]}>{category.name}</Text>
              <Text style={[styles.choiceTitle, { color: theme.text }]}>{category.description}</Text>
            </View>
          </View>

          <View style={[styles.panel, { backgroundColor: theme.card }]}>
            <Text style={[styles.panelTitle, { color: theme.subtle }]}>Feelings</Text>
            {category.feelings.map((feeling) => {
              const isLocked = (category.locked as readonly string[]).includes(feeling);

              return (
                <Pressable
                  key={feeling}
                  onPress={() => openStory(feeling as EmotionizeStoryName)}
                  style={({ pressed }) => [
                    styles.feeling,
                    { backgroundColor: isLocked ? 'rgba(225, 220, 249, 0.45)' : '#e1dcf9', borderTopColor: 'rgba(31, 22, 53, 0.1)' },
                    pressed && styles.rowPressed,
                  ]}>
                  <Text style={[styles.feelingText, { color: theme.text }, isLocked && styles.feelingTextLocked]}>{feeling}</Text>
                  {isLocked ? (
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockBadgeText}>Nomy+</Text>
                    </View>
                  ) : (
                    <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {category.note ? (
            <Pressable
              onPress={() => setNoteOpen(true)}
              style={({ pressed }) => [styles.noteRow, pressed && styles.rowPressed]}>
              <Text style={styles.noteRowText}>A note about {category.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent
          visible={noteOpen}
          onRequestClose={() => setNoteOpen(false)}>
          <View style={styles.noteModalRoot}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close note"
              onPress={() => setNoteOpen(false)}
              style={styles.noteModalScrim}
            />
            <View style={styles.noteSheet}>
              <View style={styles.noteSheetHandle} />
              <View style={styles.noteSheetHeader}>
                <Text style={styles.noteSheetTitle}>A note about {category.name}</Text>
                <Pressable
                  onPress={() => setNoteOpen(false)}
                  style={({ pressed }) => [styles.noteCloseButton, pressed && styles.backButtonPressed]}>
                  <Text style={styles.noteCloseText}>Done</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.noteSheetContent} showsVerticalScrollIndicator={false}>
                {renderNoteText(category.note)}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent
          visible={Boolean(lockedFeeling)}
          onRequestClose={() => setLockedFeeling(null)}>
          <View style={styles.noteModalRoot}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close locked feeling message"
              onPress={() => setLockedFeeling(null)}
              style={styles.noteModalScrim}
            />
            <View style={styles.unlockSheet}>
              <View style={styles.noteSheetHandle} />
              <Text style={styles.unlockTitle}>{lockedFeeling}</Text>
              <Text style={styles.unlockText}>
                This feeling is part of the full Emotionize library in Nomy+.
              </Text>
              <Pressable
                onPress={() => setLockedFeeling(null)}
                style={({ pressed }) => [styles.unlockButton, pressed && styles.readButtonPressed]}>
                <Text style={styles.unlockButtonText}>Okay</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl
          label={params.origin === 'home' ? 'Home' : 'Support'}
          onPress={() => goBackToOriginOrReplace(params.origin, '/support')}
        />
        <View style={styles.waveWrap}>
          <View style={[styles.wave, { backgroundColor: theme.screen }]}>
            <View style={styles.header}>
              <Text style={[styles.stepLabel, { color: theme.subtle }]}>Emotionize</Text>
              <Text style={[styles.title, { color: theme.text }]}>Explore Your Emotions</Text>
            </View>
          </View>
        </View>

        <View style={[styles.grid, { backgroundColor: '#e1dcf9' }]}>
          {emotionizeCategories.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => setCategoryName(item.name)}
              style={({ pressed }) => [styles.categoryButton, { backgroundColor: '#e1dcf9', borderBottomColor: 'rgba(31, 22, 53, 0.1)' }, pressed && styles.rowPressed]}>
              <View style={styles.categoryCopy}>
                <Text style={[styles.categoryText, { color: theme.text }]}>{item.name}</Text>
              </View>
              <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatSelectionsForSave(slides: readonly EmotionizeStorySlide[], selections: EmotionizeSelections) {
  return slides
    .filter((slide) => slide.optionGroup && selections[slide.optionGroup].length > 0)
    .map((slide) => {
      const group = slide.optionGroup!;
      return `${slide.note}:\n${selections[group].map((item) => `- ${item}`).join('\n')}`;
    })
    .join('\n\n');
}

function renderNoteText(note: string) {
  return note
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .filter((line) => line.trim() !== 'A little note from Emotionize')
    .map((line, index) => (
      <Text key={`${line}-${index}`} style={[styles.noteParagraph, index === 0 && styles.noteParagraphFirst]}>
        {line}
      </Text>
    ));
}

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getReadableSlideLines(slide: EmotionizeStorySlide) {
  if (slide.optionGroup || slide.dynamicPattern) {
    return [];
  }

  return splitReadableLines(slide.sub);
}

function splitReadableLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/☐/g, '').trim())
    .filter(Boolean);
}

async function getTtsAudioUri(lines: string[], cacheKey: string) {
  const safeKey = cacheKey.replace(/[^a-zA-Z0-9_-]/g, '-');
  const uri = `${FileSystem.cacheDirectory}emotionize-read-${safeKey}.mp3`;
  const info = await FileSystem.getInfoAsync(uri);

  if (info.exists) {
    return uri;
  }

  const response = await fetch(apiUrl('/api/mobile/emotionize-tts/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: lines.join('\n\n') }),
  });

  const payload = await response.json();
  if (!response.ok || !payload?.ok || !payload.audio) {
    throw new Error(payload?.error || 'Read to me could not create audio.');
  }

  await FileSystem.writeAsStringAsync(uri, payload.audio, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function estimateTotalReadDuration(lines: string[]) {
  const words = lines.reduce((total, line) => total + countWords(line), 0);
  return Math.max(6, words * 0.46 + lines.length * 0.55);
}

function getActiveLineIndex(lines: string[], currentTime: number, duration: number) {
  const weights = lines.map((line) => Math.max(1.4, countWords(line) * 0.46 + 0.55));
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  const safeDuration = duration || estimateTotalReadDuration(lines);
  let elapsed = 0;

  for (let index = 0; index < weights.length; index += 1) {
    elapsed += (weights[index] / totalWeight) * safeDuration;
    if (currentTime <= elapsed) {
      return index;
    }
  }

  return Math.max(0, lines.length - 1);
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function renderSlide(
  slide: EmotionizeStorySlide,
  slides: readonly EmotionizeStorySlide[],
  selections: EmotionizeSelections,
  onToggle: (group: EmotionizeOptionGroupKey, option: string) => void,
  activeReadLineIndex: number | null,
) {
  if (slide.optionGroup && slide.options) {
    return renderOptionSlide(slide, selections, onToggle);
  }

  if (slide.dynamicPattern) {
    const selectedGroups = formatSelectionsForDisplay(slides, selections);
    return (
      <View style={styles.patternWrap}>
        {renderPatternText(slide.sub)}
        {selectedGroups.length ? (
          <View style={styles.selectedSummary}>
            <Text style={styles.selectedSummaryTitle}>What you selected</Text>
            <View style={styles.selectedGroupList}>
              {selectedGroups.map((group) => (
                <View key={group.title} style={styles.selectedGroup}>
                  <Text style={styles.selectedGroupTitle}>{group.title}</Text>
                  <View style={styles.selectedPills}>
                    {group.items.map((item) => (
                      <View key={item} style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return renderReadableSlideText(slide.sub, activeReadLineIndex);
}

function renderReadableSlideText(text: string, activeReadLineIndex: number | null) {
  const lines = splitReadableLines(text);

  return (
    <View style={styles.readableTextWrap}>
      {lines.map((line, index) => (
        <View
          key={`${line}-${index}`}
          style={[styles.readableLine, activeReadLineIndex === index && styles.readableLineActive]}>
          <Text style={[styles.slideText, activeReadLineIndex === index && styles.slideTextActive]}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function renderPatternText(text: string) {
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  const [heading, ...paragraphs] = lines;

  return (
    <View style={styles.patternTextWrap}>
      {heading ? <Text style={styles.patternHeading}>{heading}</Text> : null}
      <View style={styles.patternParagraphList}>
        {paragraphs.map((line, index) => (
          <View key={`${line}-${index}`} style={styles.patternParagraphCard}>
            <Text style={styles.patternParagraphText}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatSelectionsForDisplay(slides: readonly EmotionizeStorySlide[], selections: EmotionizeSelections) {
  return slides
    .filter((item) => item.optionGroup && selections[item.optionGroup].length > 0)
    .map((item) => {
      const group = item.optionGroup!;
      return {
        title: item.note,
        items: selections[group],
      };
    });
}

function renderOptionSlide(
  slide: EmotionizeStorySlide,
  selections: EmotionizeSelections,
  onToggle: (group: EmotionizeOptionGroupKey, option: string) => void,
) {
  if (!slide.optionGroup || !slide.options) {
    return null;
  }

  const optionGroup = slide.optionGroup;

  return (
    <View style={styles.optionWrap}>
      {slide.sub ? <Text style={styles.slideText}>{withoutTrailingFullStop(slide.sub)}</Text> : null}
      <View style={styles.optionList}>
        {slide.options.map((option) => {
          const isSelected = selections[optionGroup].includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => onToggle(optionGroup, option)}
              style={({ pressed }) => [styles.checkboxRow, isSelected && styles.checkboxRowSelected, pressed && styles.rowPressed]}>
              <Text style={styles.checkboxText}>{option}</Text>
              <View style={[styles.selectionMark, isSelected && styles.selectionMarkSelected]}>
                {isSelected ? <Text style={styles.selectionTick}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function withoutTrailingFullStop(value: string) {
  return value.endsWith('.') ? value.slice(0, -1) : value;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e1dcf9' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 24 },
  waveWrap: { marginHorizontal: -space.screenX },
  wave: {
    backgroundColor: '#e1dcf9',
    paddingTop: space.sm,
    paddingHorizontal: space.screenX,
    paddingBottom: space.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  header: { alignItems: 'center', gap: space.xs, paddingTop: space.md, paddingBottom: space.sm },
  stepLabel: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: { color: '#1f1635', textAlign: 'center', fontSize: typeScale.pageTitle, fontWeight: '700', lineHeight: lineScale.pageTitle, letterSpacing: -0.25 },
  grid: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  categoryButton: {
    minHeight: controlSize.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  categoryCopy: { flex: 1 },
  categoryText: { color: '#1f003d', fontSize: typeScale.cardTitle, fontWeight: '600' },
  choiceHeader: { gap: space.md },
  choiceTitleCard: {
    gap: space.sm,
    alignItems: 'center',
  },
  choiceEyebrow: {
    color: '#5e4f79',
    fontSize: typeScale.helper,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  choiceTitle: { color: '#1f003d', fontSize: typeScale.cardTitle, lineHeight: lineScale.cardTitle, fontWeight: '600', textAlign: 'center' },
  panel: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  panelTitle: {
    color: '#817690',
    fontSize: typeScale.eyebrow,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  feeling: {
    minHeight: controlSize.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  feelingText: { flex: 1, color: '#1f003d', fontSize: typeScale.cardTitle, fontWeight: '600' },
  feelingTextLocked: { opacity: 0.52 },
  lockBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(31, 22, 53, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lockBadgeText: { color: '#5e4f79', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '700' },
  chevron: { color: '#b7afc5', fontSize: 24, lineHeight: 26, fontWeight: '400' },
  rowPressed: { opacity: 0.68, backgroundColor: '#f7f5fb' },
  noteRow: {
    minHeight: controlSize.large,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#110c28',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  noteRowText: { flex: 1, color: '#1f003d', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600' },
  noteModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  noteModalScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 22, 53, 0.22)',
  },
  noteSheet: {
    maxHeight: '78%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: '#e1dcf9',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
  },
  noteSheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#d7cfdf',
  },
  noteSheetHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  noteSheetTitle: { flex: 1, color: '#1f003d', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '500' },
  noteCloseButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#e1dcf9',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2dbea',
  },
  noteCloseText: { color: '#3a2c6b', fontSize: 15, fontWeight: '700' },
  unlockSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 14,
  },
  unlockTitle: { color: '#1f003d', fontSize: typeScale.pageTitle, lineHeight: lineScale.pageTitle, fontWeight: '700', textAlign: 'center' },
  unlockText: { color: '#5e4f79', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600', textAlign: 'center' },
  unlockButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#1f003d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  unlockButtonText: { color: '#ffffff', fontSize: typeScale.bodyLarge, fontWeight: '700' },
  noteSheetContent: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    padding: space.lg,
  },
  noteParagraph: {
    color: '#1b1230',
    fontSize: typeScale.body,
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 12,
  },
  noteParagraphFirst: {
    marginTop: 0,
  },
  storyContent: { flex: 1, paddingHorizontal: space.screenX, paddingBottom: 114, gap: space.md },
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
  storyPill: { alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  storyPillText: { color: '#22163c', fontSize: typeScale.pageTitle, lineHeight: lineScale.pageTitle, fontWeight: '600', textAlign: 'center' },
  readToMeBar: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  readToMeLabel: { color: '#3f335a', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600' },
  readToMeActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readButton: {
    minHeight: 32,
    minWidth: 68,
    borderRadius: 16,
    backgroundColor: '#e1dcf9',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  readButtonPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  readButtonDisabled: { opacity: 0.42 },
  readButtonText: { color: '#241b3b', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '700' },
  readButtonTextDisabled: { color: '#8a819d' },
  readError: { color: '#8a3f55', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600', marginTop: 8 },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressBar: { flex: 1, height: 6, borderRadius: 8, backgroundColor: '#c9c0ee', overflow: 'hidden' },
  progressFill: { height: '100%', width: '0%', backgroundColor: '#22163c' },
  progressFillActive: { width: '100%' },
  slide: { flex: 1 },
  slideContent: { paddingVertical: space.lg },
  slideCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    padding: space.lg,
  },
  slideText: { color: '#1b1230', fontSize: typeScale.body, lineHeight: 25 },
  slideTextActive: { color: '#160f27', fontWeight: '700' },
  readableTextWrap: { gap: 10 },
  readableLine: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: -8,
  },
  readableLineActive: {
    backgroundColor: '#f1f1ff',
  },
  optionWrap: { gap: space.lg },
  optionList: { gap: space.sm },
  checkboxRow: {
    minHeight: controlSize.regular,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkboxRowSelected: {
    borderColor: '#1f003d',
    backgroundColor: '#e1dcf9',
  },
  selectionMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionMarkSelected: {
    backgroundColor: '#1f003d',
  },
  selectionTick: { color: '#ffffff', fontSize: 14, lineHeight: 16, fontWeight: '900' },
  checkboxText: { flex: 1, color: '#241b3b', fontSize: typeScale.body, lineHeight: lineScale.body, fontWeight: '600' },
  patternWrap: { gap: space.lg },
  patternTextWrap: { gap: space.md },
  patternHeading: { color: '#1f1635', fontSize: typeScale.sectionTitle, lineHeight: lineScale.sectionTitle, fontWeight: '500', textAlign: 'center' },
  patternParagraphList: { gap: space.sm },
  patternParagraphCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  patternParagraphText: { color: '#241b3b', fontSize: typeScale.body, lineHeight: lineScale.bodyLarge, fontWeight: '500' },
  selectedSummary: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    padding: 14,
    gap: 12,
  },
  selectedSummaryTitle: { color: '#5e4f79', fontSize: typeScale.eyebrow, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  selectedGroupList: { gap: 12 },
  selectedGroup: { gap: 8 },
  selectedGroupTitle: { color: '#241b3b', fontSize: 15, lineHeight: 20, fontWeight: '700' },
  selectedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedPill: {
    borderRadius: 999,
    backgroundColor: '#e1dcf9',
    borderWidth: 1,
    borderColor: '#c9c0ee',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  selectedPillText: { color: '#241b3b', fontSize: typeScale.helper, lineHeight: lineScale.helper, fontWeight: '600' },
  storyActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  storyNavButton: { flex: 1, flexBasis: 0, minWidth: 0 },
  secondaryStepButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6e0f5',
    paddingHorizontal: 16,
  },
  secondaryStepButtonPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  secondaryStepButtonText: { color: '#3a2c6b', fontSize: typeScale.body, fontWeight: '700' },
  nextButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f003d' },
  nextButtonText: { color: '#ffffff', fontSize: typeScale.bodyLarge, fontWeight: '700' },
  pressedPrimary: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});

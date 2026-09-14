import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text } from '@/components/nomy-type';
import { recordAvatarActivity } from '@/constants/avatar';
import {
  emotionizeCategories,
  emotionizeStories,
  type EmotionizeOptionGroupKey,
  type EmotionizeSelections,
  type EmotionizeStoryName,
  type EmotionizeStorySlide,
} from '@/constants/emotionize-content';

const emptyEmotionSelections = (): EmotionizeSelections => ({ looks: [], body: [], afterwards: [] });

export default function EmotionizeScreen() {
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [story, setStory] = useState<EmotionizeStoryName | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selections, setSelections] = useState<EmotionizeSelections>(emptyEmotionSelections);
  const [noteOpen, setNoteOpen] = useState(false);

  const category = useMemo(
    () => emotionizeCategories.find((item) => item.name === categoryName) || null,
    [categoryName],
  );
  const slides = story ? emotionizeStories[story] : [];
  const currentSlide = slides[slideIndex];
  const progress = slides.length ? `${slideIndex + 1} / ${slides.length}` : '';

  useEffect(() => {
    void recordAvatarActivity({ type: 'feature_opened', feature: 'emotionize' });
  }, []);

  function openStory(nextStory: EmotionizeStoryName) {
    void recordAvatarActivity({ type: 'emotionize_story_opened', feature: 'emotionize', label: nextStory });
    setStory(nextStory);
    setSlideIndex(0);
    setSelections(emptyEmotionSelections());
  }

  function closeStory() {
    setStory(null);
    setSlideIndex(0);
    setSelections(emptyEmotionSelections());
  }

  function closeCategory() {
    setCategoryName(null);
    setNoteOpen(false);
  }

  function previousStoryStep() {
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

    if (slideIndex < slides.length - 1) {
      setSlideIndex((current) => current + 1);
      return;
    }

    router.push({
      pathname: '/emotionize-reflection',
      params: {
        emotion: story,
        category: category?.name || '',
        categoryColor: '#f4f8f3',
        selectedNotes: formatSelectionsForSave(slides, selections),
      },
    });
  }

  function toggleOption(group: EmotionizeOptionGroupKey, option: string) {
    setSelections((current) => {
      const isSelected = current[group].includes(option);
      return {
        ...current,
        [group]: isSelected ? current[group].filter((item) => item !== option) : [...current[group], option],
      };
    });
  }

  if (story && currentSlide && category) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.storyContent}>
          <Pressable
            onPress={previousStoryStep}
            style={({ pressed }) => [styles.backControl, pressed && styles.backButtonPressed]}>
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.backControlText}>{slideIndex > 0 ? 'Previous' : 'Feelings'}</Text>
          </Pressable>

          <View style={styles.storyPill}>
            <Text style={styles.storyPillText}>{currentSlide.note || story}</Text>
          </View>

          <View style={styles.progressRow}>
            {slides.map((_, index) => (
              <View key={index} style={styles.progressBar}>
                <View style={[styles.progressFill, index <= slideIndex && styles.progressFillActive]} />
              </View>
            ))}
          </View>

          <ScrollView style={styles.slide} contentContainerStyle={styles.slideContent} showsVerticalScrollIndicator={false}>
            <View style={styles.slideCard}>{renderSlide(currentSlide, slides, selections, toggleOption)}</View>
          </ScrollView>

          <View style={styles.storyActions}>
            <Pressable onPress={previousStoryStep} style={({ pressed }) => [styles.storyNavButton, styles.secondaryStepButton, pressed && styles.secondaryStepButtonPressed]}>
              <Text style={styles.secondaryStepButtonText}>{slideIndex > 0 ? 'Previous' : 'Feelings'}</Text>
            </Pressable>
            <Pressable onPress={nextSlide} style={({ pressed }) => [styles.storyNavButton, styles.nextButton, pressed && styles.pressedPrimary]}>
              <Text style={styles.nextButtonText}>{slideIndex === slides.length - 1 ? 'Reflect' : 'Next'}</Text>
            </Pressable>
          </View>
          <Text style={styles.footer}>{story} • {progress}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (category) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.choiceHeader}>
            <Pressable
              onPress={closeCategory}
              style={({ pressed }) => [styles.backControl, pressed && styles.backButtonPressed]}>
              <Text style={styles.backChevron}>‹</Text>
              <Text style={styles.backControlText}>Spaces</Text>
            </Pressable>
            <View style={styles.choiceTitleCard}>
              <Text style={styles.choiceEyebrow}>{category.name}</Text>
              <Text style={styles.choiceTitle}>{category.description}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Available now</Text>
            {category.feelings.map((feeling) => (
              <Pressable
                key={feeling}
                onPress={() => openStory(feeling as EmotionizeStoryName)}
                style={({ pressed }) => [styles.feeling, pressed && styles.rowPressed]}>
                <Text style={styles.feelingText}>{feeling}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label="Support" onPress={() => router.replace('/support')} />
        <View style={styles.waveWrap}>
          <View style={styles.wave}>
            <View style={styles.header}>
              <Text style={styles.title}>Which emotional space would you like to explore?</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {emotionizeCategories.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => setCategoryName(item.name)}
              style={({ pressed }) => [styles.categoryButton, pressed && styles.rowPressed]}>
              <View style={styles.categoryCopy}>
                <Text style={styles.categoryText}>{item.name}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
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

function renderSlide(
  slide: EmotionizeStorySlide,
  slides: readonly EmotionizeStorySlide[],
  selections: EmotionizeSelections,
  onToggle: (group: EmotionizeOptionGroupKey, option: string) => void,
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

  return <Text style={styles.slideText}>{slide.sub}</Text>;
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
  screen: { flex: 1, backgroundColor: '#f4f8f3' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 24 },
  waveWrap: { marginHorizontal: -18 },
  wave: {
    backgroundColor: '#f4f8f3',
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  header: { alignItems: 'center', gap: 8, paddingTop: 12 },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.45 },
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
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  categoryCopy: { flex: 1 },
  categoryText: { color: '#1f003d', fontSize: 19, fontWeight: '600' },
  categoryMeta: { color: '#817690', fontSize: 14, lineHeight: 19, fontWeight: '500' },
  choiceHeader: { gap: 14 },
  choiceTitleCard: {
    borderRadius: 8,
    backgroundColor: '#f4f8f3',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  choiceEyebrow: {
    color: '#5e4f79',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  choiceTitle: { color: '#1f003d', fontSize: 24, lineHeight: 30, fontWeight: '600', textAlign: 'center' },
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  feeling: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  feelingText: { flex: 1, color: '#1f003d', fontSize: 18, fontWeight: '600' },
  chevron: { color: '#b7afc5', fontSize: 26, lineHeight: 28, fontWeight: '400' },
  rowPressed: { opacity: 0.68, backgroundColor: '#f7f5fb' },
  noteRow: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dfe9dd',
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
  noteRowText: { flex: 1, color: '#1f003d', fontSize: 15, lineHeight: 20, fontWeight: '600' },
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#f4f8f3',
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
  noteSheetTitle: { flex: 1, color: '#1f003d', fontSize: 20, lineHeight: 25, fontWeight: '700' },
  noteCloseButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#f4f8f3',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2dbea',
  },
  noteCloseText: { color: '#3a2c6b', fontSize: 15, fontWeight: '700' },
  noteSheetContent: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    padding: 18,
  },
  noteParagraph: {
    color: '#1b1230',
    fontSize: 17,
    lineHeight: 27,
    fontWeight: '500',
    marginTop: 12,
  },
  noteParagraphFirst: {
    marginTop: 0,
  },
  storyContent: { flex: 1, paddingHorizontal: 18, paddingBottom: 118, gap: 16 },
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
  storyPillText: { color: '#22163c', fontSize: 24, lineHeight: 30, fontWeight: '600', textAlign: 'center' },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressBar: { flex: 1, height: 6, borderRadius: 8, backgroundColor: '#dfe9dd', overflow: 'hidden' },
  progressFill: { height: '100%', width: '0%', backgroundColor: '#22163c' },
  progressFillActive: { width: '100%' },
  slide: { flex: 1 },
  slideContent: { paddingVertical: 16 },
  slideCard: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    padding: 18,
  },
  slideText: { color: '#1b1230', fontSize: 17, lineHeight: 28 },
  optionWrap: { gap: 16 },
  optionList: { gap: 10 },
  checkboxRow: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkboxRowSelected: {
    borderColor: '#1f003d',
    backgroundColor: '#f4f8f3',
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
  checkboxText: { flex: 1, color: '#241b3b', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  patternWrap: { gap: 18 },
  patternTextWrap: { gap: 14 },
  patternHeading: { color: '#1f1635', fontSize: 23, lineHeight: 29, fontWeight: '700', textAlign: 'center' },
  patternParagraphList: { gap: 10 },
  patternParagraphCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  patternParagraphText: { color: '#241b3b', fontSize: 16, lineHeight: 24, fontWeight: '500' },
  selectedSummary: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    padding: 14,
    gap: 12,
  },
  selectedSummaryTitle: { color: '#5e4f79', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  selectedGroupList: { gap: 12 },
  selectedGroup: { gap: 8 },
  selectedGroupTitle: { color: '#241b3b', fontSize: 15, lineHeight: 20, fontWeight: '700' },
  selectedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedPill: {
    borderRadius: 999,
    backgroundColor: '#f4f8f3',
    borderWidth: 1,
    borderColor: '#dfe9dd',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  selectedPillText: { color: '#241b3b', fontSize: 14, lineHeight: 18, fontWeight: '600' },
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
  secondaryStepButtonText: { color: '#3a2c6b', fontSize: 16, fontWeight: '700' },
  nextButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f003d' },
  nextButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  pressedPrimary: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  footer: { color: '#3f335a', textAlign: 'center', fontSize: 14 },
});

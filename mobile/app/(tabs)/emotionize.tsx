import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const stories = {
  Frustration: [
    {
      note: 'How it Shows Up',
      sub: 'Frustration is the feeling that happens when something gets in the way of what’s needed or wanted. It’s that sense of being blocked or stuck. Everyone feels it, but for autistic people, it can be stronger and more intense because of how the brain and nervous system process information and emotion. Frustration is the body and brain’s way of saying, “Something isn’t working right now, and support is needed.”',
    },
    {
      note: 'Common Sources',
      sub: 'Frustration can show up in many ways:\n\nThe body might feel tight, hot or restless.\nThe mind may feel foggy, fast or overwhelmed.\nWords might stumble, or come out louder or sharper than intended.\nMovement might increase, pacing, clenching fists, rocking, or flapping.\n\nThese are all ways the nervous system tries to release built-up energy.',
    },
    {
      note: 'It Affects',
      sub: 'Frustration often builds when there are barriers that make daily life harder to manage, such as:\n\nCommunication difficulties – knowing what to say but not being able to express it.\nExecutive function challenges – trouble starting, organisng, or finishing tasks.\nSensory overload – too much noise, light, movement, or touch.\nChanges in routine – unexpected shifts or uncertainty.\nSocial misunderstandings – being misread, interrupted, or dismissed.\nFeeling unsupported – not being given the time, space, or understanding needed.\n\nThese experiences can pile up and when they do, frustration can quickly turn into overwhelm.',
    },
    {
      note: 'Reflect',
      sub: 'For autistic people, frustration is an emotion and a physical state. The nervous system moves into stress mode to prepare to protect itself. This can make it hard to think clearly, use words, or stay calm. When this stress keeps building, it can lead to: Meltdowns, where the body releases energy through crying, yelling, or movement. Shutdowns, where the body and mind pull inward to recover. Both are natural responses to overload and neither failures nor overreactions. They are signs that the body and mind have reached their limit and need care.',
    },
  ],
  Happiness: [
    {
      note: 'How it Shows Up',
      sub: 'When masking has been part of life for a long time, it’s easy to wonder if happiness is something you really feel or to minimise it because it doesn’t look the way the world tells you it should. But your version of happiness has always been there. It’s steady, subtle, and deeply personal. It doesn’t have to be loud or shared to be real.',
    },
    {
      note: 'Reflect',
      sub: 'For many autistic adults, happiness doesn’t show up as big smiles or bursts of energy. It’s often quiet. It lives in those small, grounding moments when the body feels calm, the mind feels clear and the world finally feels safe to exist in. It’s when everything inside says, this feels right.\n\nSometimes happiness looks like gentle stimming, humming softly, or being deeply focused on something that feels good. Many autistic people describe it as a sense of alignment—when body, mind and environment are working together instead of against each other.',
    },
    {
      note: 'It Affects',
      sub: 'Happiness often comes from experiences that create comfort, safety, or meaning:\n\nSpecial interests that bring deep focus and satisfaction.\nPredictable routines that offer stability and peace.\nSensory comfort from sound, light, touch, or movement.\nQuiet time alone to recharge and feel grounded.\nAuthentic connection with people who accept and understand you.\nSelf-expression through movement, creativity, or work that feels purposeful.',
    },
    {
      note: 'Reflect',
      sub: 'When happiness is present, the nervous system begins to settle. Breathing slows. Muscles release. The body shifts from protection into calm.\n\nThis is regulation for autistic people. These moments allow the body to recover from masking, stress and sensory overload. Even brief moments of happiness like listening to a comforting sound, engaging in a favourite routine, or sitting in a space that feels right, can be deeply restorative.',
    },
  ],
  Exhaustion: [
    {
      note: 'How it Shows Up',
      sub: 'Exhaustion in the autistic body is a deep, full-body depletion that affects thinking, movement and even words. It’s waking up already spent, because simply existing, processing light, sound, expectations and unspoken social rules, takes more from you than most people realise.\n\nFor many autistic adults, this exhaustion builds quietly over time. Masking, trying to make yourself understood, reading social cues, or being “easy to be around” drains energy. Eventually, the body runs on borrowed energy. When it runs out, you crash. Words may vanish. Simple decisions feel impossible. This is autistic burnout—a full-body shutdown after long-term overwhelm.',
    },
    {
      note: 'Common Sources',
      sub: 'Exhaustion can show up in many ways:\n\nFeeling mentally foggy, detached, or slowed down.\nPhysical fatigue that doesn’t improve with ordinary rest.\nDifficulty speaking or finding words.\nEven small decisions feel like huge effort.\nLoss of motivation or pleasure in things that usually feel good.',
    },
    {
      note: 'Common Sources',
      sub: 'Exhaustion often comes from ongoing energy depletion, including:\n\nMasking – hiding autistic traits or adapting constantly to social expectations.\nSensory overload – processing lights, sounds, textures, and movement nonstop.\nSocial navigation – interpreting unspoken rules and expectations.\nEmotional labor – regulating your own and others’ emotions simultaneously.\nSustained demands – work, routines, and responsibilities that require constant attention.\n\nOver time, all of this adds up until the system can no longer maintain balance.',
    },
    {
      note: 'Reflect',
      sub: 'Exhaustion changes how the body operates. Muscles can feel tense or unresponsive. Breathing may become shallow or irregular. Sensory input can feel sharper or harder to filter. The nervous system stays in overdrive, making it harder to regulate energy, focus, and emotions.\n\nFor autistic adults, these bodily effects show that rest, calm environments, and reduced demands are essential. Recovery helps the body rebuild trust that it doesn’t always have to be in overdrive and that safety, stillness, and balance are possible.',
    },
  ],
  Loneliness: [
    {
      note: 'How it Feels',
      sub: 'Loneliness in the autistic experience is often less about being physically alone and more about the ache of being unseen. It’s the feeling of existing in a world that speaks a language slightly different from yours. You might crave connection deeply, yet most social spaces can feel exhausting or inaccessible.\n\nFor many autistic adults, loneliness begins early. Your ways of communicating or your sensory needs may not have matched the people around you. Over time, you may have learned to hide parts of yourself to stay safe. That safety often comes with silence and silence can feel heavy. It’s a loneliness of self.\n\nAnd yet, autistic loneliness is rarely total. There are moments of belonging, with another neurodivergent person, a trusted friend, or even a comforting routine that reflects you back to yourself. Connection often happens best for you through shared focus rather than forced conversation: parallel play, mutual interests, or simply being side by side without pressure.',
    },
    {
      note: 'Affects',
      sub: 'Loneliness often arises from experiences like:\n\nCommunication differences – ways of expressing yourself that aren’t understood by others.\nSocial mismatch – being in spaces that feel exhausting or inaccessible.\nMasking or hiding – concealing parts of yourself to stay safe.\nUnmet desire for connection – wanting relationships that feel authentic but feeling unable to access them.',
    },
    {
      note: 'Reflect',
      sub: 'Loneliness can affect the body in ways similar to chronic stress. The nervous system may become tense or alert. You might notice tightness, shallow breathing, or a low energy state. Mental focus can waver, and fatigue or restlessness can appear.\n\nFor autistic adults, this physical impact is a reminder that connection or the lack of it, affects both mind and body. Recognising this can help you respond with care and create environments that allow for authentic belonging.',
    },
  ],
} as const;

const categories = [
  { name: 'Energised', color: '#f4f8f3', feelings: ['Frustration'], locked: ['Excitement', 'Curiosity', 'Anxiety'] },
  { name: 'Pleasant', color: '#fffaeb', feelings: ['Happiness'], locked: ['Relief', 'Amusement', 'Contentment'] },
  { name: 'Low-Energy', color: '#e9f0fa', feelings: ['Exhaustion'], locked: ['Numbness', 'Sadness', 'Overwhelm', 'Uncertainty'] },
  { name: 'Vulnerable', color: '#f1eeff', feelings: ['Loneliness'], locked: ['Shame', 'Embarrassment', 'Confusion', 'Stupidity'] },
] as const;

type StoryName = keyof typeof stories;

export default function EmotionizeScreen() {
  const [category, setCategory] = useState(categories[0]);
  const [story, setStory] = useState<StoryName | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = story ? stories[story] : [];
  const currentSlide = slides[slideIndex];
  const progress = useMemo(() => (slides.length ? `${slideIndex + 1} / ${slides.length}` : ''), [slideIndex, slides.length]);

  function openStory(nextStory: StoryName) {
    setStory(nextStory);
    setSlideIndex(0);
  }

  function closeStory() {
    setStory(null);
    setSlideIndex(0);
  }

  function nextSlide() {
    if (!story) {
      return;
    }
    if (slideIndex < slides.length - 1) {
      setSlideIndex((current) => current + 1);
    } else {
      closeStory();
    }
  }

  if (story && currentSlide) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.storyContent}>
          <Pressable onPress={closeStory} style={styles.backButton}>
            <Text style={styles.backButtonText}>← {category.name} feelings</Text>
          </Pressable>

          <View style={[styles.storyPill, { backgroundColor: category.color }]}>
            <Text style={styles.storyPillText}>{currentSlide.note || story}</Text>
          </View>

          <View style={styles.progressRow}>
            {slides.map((_, index) => (
              <View key={index} style={styles.progressBar}>
                <View style={[styles.progressFill, index <= slideIndex && styles.progressFillActive]} />
              </View>
            ))}
          </View>

          <ScrollView style={styles.slide} contentContainerStyle={styles.slideContent}>
            <Text style={styles.slideText}>{currentSlide.sub}</Text>
          </ScrollView>

          <Pressable onPress={nextSlide} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>{slideIndex === slides.length - 1 ? 'Reflect' : 'Next'}</Text>
          </Pressable>
          <Text style={styles.footer}>{story} • {progress}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Main Menu</Text>
          </Pressable>
        </Link>

        <View style={styles.header}>
          <Text style={styles.title}>Which emotional space would you like to explore?</Text>
          <Text style={styles.subtitle}>Pick a category to begin exploring</Text>
        </View>

        <View style={styles.grid}>
          {categories.map((item) => {
            const active = item.name === category.name;
            return (
              <Pressable
                key={item.name}
                onPress={() => setCategory(item)}
                style={[styles.oval, { backgroundColor: item.color }, active && styles.activeOval]}>
                <Text style={styles.ovalText}>{item.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Choose a Feeling</Text>
          {category.feelings.map((feeling) => (
            <Pressable
              key={feeling}
              onPress={() => openStory(feeling as StoryName)}
              style={[styles.feeling, { backgroundColor: category.color }]}>
              <Text style={styles.feelingText}>{feeling}</Text>
            </Pressable>
          ))}
          {category.locked.map((feeling) => (
            <View key={feeling} style={[styles.feeling, styles.lockedFeeling]}>
              <Text style={styles.lockedText}>{feeling}</Text>
              <Text style={styles.lockedLabel}>Locked</Text>
            </View>
          ))}
          <Text style={styles.subscribeText}>Subscribe to unlock this feeling and access all emotional stories.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 24 },
  header: { alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 26, fontWeight: '400', lineHeight: 34 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 17 },
  grid: { gap: 14 },
  oval: {
    minHeight: 86,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#110c28',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  activeOval: { borderWidth: 2, borderColor: '#1f003d' },
  ovalText: { color: '#1f003d', fontSize: 20, fontWeight: '400' },
  panel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee8f8',
    padding: 16,
    gap: 12,
  },
  panelTitle: { color: '#1f003d', fontSize: 22, fontWeight: '500', textAlign: 'center' },
  feeling: {
    minHeight: 58,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  feelingText: { color: '#1f003d', fontSize: 18, fontWeight: '500' },
  lockedFeeling: { backgroundColor: '#efeff7', opacity: 0.75, gap: 3 },
  lockedText: { color: '#a29bb8', fontSize: 18, fontWeight: '500' },
  lockedLabel: { color: '#a29bb8', fontSize: 13, fontWeight: '700' },
  subscribeText: { color: '#5e4f79', fontSize: 15, textAlign: 'center', lineHeight: 21 },
  storyContent: { flex: 1, paddingHorizontal: 18, paddingBottom: 18, gap: 16 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  storyPill: { alignSelf: 'center', borderRadius: 8, paddingHorizontal: 22, paddingVertical: 12 },
  storyPillText: { color: '#22163c', fontSize: 19, fontWeight: '500' },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressBar: { flex: 1, height: 6, borderRadius: 8, backgroundColor: '#e9e6f7', overflow: 'hidden' },
  progressFill: { height: '100%', width: '0%', backgroundColor: '#22163c' },
  progressFillActive: { width: '100%' },
  slide: { flex: 1 },
  slideContent: { paddingVertical: 16 },
  slideText: { color: '#1b1230', textAlign: 'center', fontSize: 17, lineHeight: 28 },
  nextButton: { minHeight: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f5f7' },
  nextButtonText: { color: '#22163c', fontSize: 17, fontWeight: '600' },
  footer: { color: '#3f335a', textAlign: 'center', fontSize: 14 },
});

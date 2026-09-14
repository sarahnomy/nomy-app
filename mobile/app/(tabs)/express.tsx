import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { recordAvatarActivity } from '@/constants/avatar';
import { getLocalEmotionReflections, type EmotionReflectionEntry } from '@/constants/reflections';

const feelingOptions = [
  { name: 'Frustrated', reason: 'because something keeps happening or changing.' },
  { name: 'Hurt', reason: 'because this may be affecting how valued you feel.' },
  { name: 'Worried', reason: 'because you do not want this to become a bigger problem.' },
  { name: 'Unsure', reason: 'because it is hard to know what to say or how it will land.' },
] as const;

const conversationGoals = [
  'I want them to understand me.',
  'I want something to change.',
  'I want to set a boundary.',
  'I want reassurance.',
  'I want to repair things.',
  'I want to explain what happened.',
  "I don't know yet.",
  'Something else.',
] as const;

const notWantOptions = [
  "I don't want to apologise for having feelings.",
  "I don't want to pretend I'm okay.",
  "I don't want to sound angrier than I am.",
  "I don't want to blame them.",
  "I don't want to make myself smaller.",
  "I don't want to agree just to end the conversation.",
  "I don't want to explain every detail.",
  "I don't want to sound overly emotional.",
  "I don't know.",
] as const;

const toneOptions = [
  {
    name: 'Gentle but honest',
    description: "I want to be kind, but I don't want to hide how I feel.",
  },
  {
    name: 'Direct',
    description: 'I want to say exactly what I mean without softening it too much.',
  },
  {
    name: 'Warm',
    description: "I want them to know I care about them while I explain what's wrong.",
  },
  {
    name: 'Firm',
    description: "I need to be clear about what I can and can't accept.",
  },
  {
    name: 'Matter-of-fact',
    description: "I don't want to make this emotional. I just want to explain what's happening.",
  },
  {
    name: 'Help finding my own words',
    description: 'I want a starting point I can change.',
  },
] as const;

type ToneName = (typeof toneOptions)[number]['name'];
type EmotionMemory = {
  emotion: string;
  message: string;
  draft: string;
};

function shortSituation(text: string) {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return 'what happened';
  }

  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
}

function buildTryingToSay(situation: string, feeling: string, goal: string) {
  return `I want to talk about ${shortSituation(situation)}. I think I might be feeling ${feeling.toLowerCase()}, and ${goal.toLowerCase()}`;
}

function buildDrafts(situation: string, feeling: string, goal: string, notWants: string[], tone: ToneName | '', memory: EmotionMemory | null) {
  const notWantLine = notWants.length
    ? ` I also do not want to ${notWants[0].replace(/^I don't want to /, '').replace(/\.$/, '')}.`
    : '';
  const topic = shortSituation(situation);
  const feelingWord = feeling.toLowerCase();
  const goalText = goal.toLowerCase();

  const softer = `I wanted to be honest about something. When ${topic}, I feel ${feelingWord}. ${goalText} I care about how this comes across, but I do not want to pretend it is not affecting me.${notWantLine}`;
  const direct = `I need to say this clearly. When ${topic}, I feel ${feelingWord}. ${goalText} I do not want to leave this unspoken.`;
  const everyday = `I don't really know the perfect way to say this, but ${topic} has been getting to me. I think I feel ${feelingWord}, and ${goalText}`;

  const baseDrafts = (() => {
    if (tone === 'Firm') {
      return [
      { label: 'Firm', text: direct },
      { label: 'Softer', text: softer },
      { label: 'Everyday speech', text: everyday },
      ];
    }

    if (tone === 'Matter-of-fact') {
      return [
      { label: 'Matter-of-fact', text: direct },
      { label: 'Everyday speech', text: everyday },
      { label: 'Softer', text: softer },
      ];
    }

    return [
    { label: 'Softer', text: softer },
    { label: 'Direct', text: direct },
    { label: 'More like everyday speech', text: everyday },
    ];
  })();

  return memory ? [{ label: `From ${memory.emotion}`, text: memory.draft }, ...baseDrafts] : baseDrafts;
}

function includesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function buildEmotionMemory(reflections: EmotionReflectionEntry[], situation: string): EmotionMemory | null {
  const lowerSituation = situation.toLowerCase();
  const relevantReflections = reflections.filter((entry) => {
    const text = `${entry.emotion} ${entry.reflection}`.toLowerCase();
    const isOverwhelmLike = entry.emotion.toLowerCase() === 'overwhelm'
      || includesAny(text, ['overwhelm', 'quiet', 'alone', 'speak', 'talk', 'questions', 'shutdown']);
    const situationFits = includesAny(lowerSituation, ['quiet', 'talk', 'speak', "what's wrong", 'whats wrong', 'partner', 'work', 'home']);

    return isOverwhelmLike && situationFits;
  });

  if (!relevantReflections.length) {
    return null;
  }

  const first = relevantReflections[0];
  const emotion = first.emotion || 'Overwhelm';

  return {
    emotion,
    message: `I remember you've told me that when you're ${emotion.toLowerCase()}, talking can become difficult.\n\nIt sounds like you might want to explain that before it happens, so the other person does not have to guess what's going on.\n\nWould you like help saying that?`,
    draft: "When I get home and I'm quiet, it usually means I've had a lot to process. I'm not angry with you and I don't want you to fix anything. I just need some quiet before I can talk.",
  };
}

export default function ExpressScreen() {
  const [situation, setSituation] = useState('');
  const [unpacked, setUnpacked] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [missingFeeling, setMissingFeeling] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedNotWants, setSelectedNotWants] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<ToneName | ''>('');
  const [emotionReflections, setEmotionReflections] = useState<EmotionReflectionEntry[]>([]);
  const [notWantsConfirmed, setNotWantsConfirmed] = useState(false);

  useEffect(() => {
    void recordAvatarActivity({ type: 'feature_opened', feature: 'express' });
    getLocalEmotionReflections()
      .then(setEmotionReflections)
      .catch(() => setEmotionReflections([]));
  }, []);

  const chosenFeeling = missingFeeling.trim() || selectedFeeling || 'unsure';
  const chosenGoal = selectedGoal || "I don't know yet.";
  const hasFeelingAnswer = Boolean(selectedFeeling || missingFeeling.trim());
  const shouldShowGoalStep = hasFeelingAnswer;
  const shouldShowNotWantStep = shouldShowGoalStep && Boolean(selectedGoal);
  const shouldShowToneStep = shouldShowNotWantStep && notWantsConfirmed;
  const emotionMemory = useMemo(
    () => (unpacked ? buildEmotionMemory(emotionReflections, situation) : null),
    [emotionReflections, situation, unpacked],
  );
  const readyForDrafts = Boolean(situation.trim() && unpacked && hasFeelingAnswer && selectedGoal && notWantsConfirmed && selectedTone);
  const tryingToSay = useMemo(
    () => buildTryingToSay(situation, chosenFeeling, chosenGoal),
    [chosenFeeling, chosenGoal, situation],
  );
  const drafts = useMemo(
    () => buildDrafts(situation, chosenFeeling, chosenGoal, selectedNotWants, selectedTone, emotionMemory),
    [chosenFeeling, chosenGoal, emotionMemory, selectedNotWants, selectedTone, situation],
  );

  function unpackSituation() {
    if (!situation.trim()) {
      return;
    }

    setUnpacked(true);
    setSelectedFeeling('');
    setMissingFeeling('');
    setSelectedGoal('');
    setSelectedNotWants([]);
    setSelectedTone('');
    setNotWantsConfirmed(false);
    void recordAvatarActivity({ type: 'express_unpack_started', feature: 'express' });
  }

  function toggleNotWant(item: string) {
    setNotWantsConfirmed(false);
    setSelectedNotWants((current) => (
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    ));
  }

  function openCapture(label: string, response: string) {
    void recordAvatarActivity({ type: 'express_response_opened', feature: 'express', label });
    router.push({
      pathname: '/express-capture',
      params: {
        style: label.toLowerCase().includes('direct') || label.toLowerCase().includes('firm') ? 'direct' : 'relational',
        scenario: situation,
        response,
      },
    });
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
          <View style={styles.topRow}>
            <BackControl label="Support" onPress={() => router.replace('/support')} />
            <Text style={styles.topTitle}>Express</Text>
            <View style={styles.topSpacer} />
          </View>

          <View style={styles.chatThread}>
            <NomyBubble>
              <Text style={styles.bubbleTitle}>What happened?</Text>
              <Text style={styles.bubbleText}>Write it however it comes out. It does not need to be tidy.</Text>
            </NomyBubble>

            <View style={styles.inputBubble}>
            <TextInput
              multiline
              onChangeText={(value) => {
                setSituation(value);
                setUnpacked(false);
              }}
              placeholder="Example: My friend keeps cancelling plans and I feel like I’m always the one making the effort..."
              placeholderTextColor="#8d829f"
              style={styles.situationInput}
              textAlignVertical="top"
              value={situation}
            />
            <Pressable
              onPress={unpackSituation}
              disabled={!situation.trim()}
              style={({ pressed }) => [styles.sendButton, !situation.trim() && styles.disabledButton, pressed && styles.pressed]}>
              <Text style={styles.sendButtonText}>Send to Nomy</Text>
            </Pressable>
            </View>

          {unpacked ? (
            <>
              <UserBubble text={situation} />

              {emotionMemory ? (
                <>
                  <NomyBubble>
                    <Text style={styles.bubbleText}>{emotionMemory.message}</Text>
                  </NomyBubble>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openCapture(`From ${emotionMemory.emotion}`, emotionMemory.draft)}
                    style={({ pressed }) => [styles.draftCard, styles.memoryDraftCard, pressed && styles.pressed]}>
                    <View style={styles.optionCopy}>
                      <Text style={styles.draftLabel}>From Emotionize</Text>
                      <Text style={styles.draftText}>{emotionMemory.draft}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </>
              ) : null}

              <NomyBubble>
                <Text style={styles.bubbleTitle}>Okay. There might be a few things tangled together here.</Text>
                <Text style={styles.bubbleText}>You do not have to choose just one. Which feels closest?</Text>
              </NomyBubble>

              <View style={styles.chatOptions}>
                  {feelingOptions.map((item) => (
                    <Pressable
                      key={item.name}
                      onPress={() => {
                        setSelectedFeeling(item.name);
                        setMissingFeeling('');
                      }}
                      style={({ pressed }) => [
                        styles.optionBubble,
                        selectedFeeling === item.name && !missingFeeling && styles.optionBubbleActive,
                        pressed && styles.pressed,
                      ]}>
                      <View style={styles.optionCopy}>
                        <Text style={styles.optionTitle}>{item.name}</Text>
                        <Text style={styles.optionText}>{item.reason}</Text>
                      </View>
                      <Text style={styles.checkText}>{selectedFeeling === item.name && !missingFeeling ? '✓' : ''}</Text>
                    </Pressable>
                  ))}
              </View>

              <NomyBubble>
                <Text style={styles.bubbleText}>None of these? Tell me what I’m missing.</Text>
              </NomyBubble>

              <View style={styles.inputBubble}>
                  <TextInput
                    onChangeText={(value) => {
                      setMissingFeeling(value);
                      if (value.trim()) {
                        setSelectedFeeling('');
                      }
                    }}
                    placeholder="Write the feeling or missing piece."
                    placeholderTextColor="#8d829f"
                    style={styles.shortInput}
                    value={missingFeeling}
                  />
              </View>

              {chosenFeeling && chosenFeeling !== 'unsure' ? <UserBubble text={chosenFeeling} /> : null}

              {shouldShowGoalStep ? (
                <>
                  <NomyBubble>
                    <Text style={styles.bubbleTitle}>What do you want from this conversation?</Text>
                  </NomyBubble>

                  <View style={styles.chatOptions}>
                    {conversationGoals.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setSelectedGoal(item);
                          setSelectedNotWants([]);
                          setSelectedTone('');
                          setNotWantsConfirmed(false);
                        }}
                        style={({ pressed }) => [
                          styles.optionBubble,
                          selectedGoal === item && styles.optionBubbleActive,
                          pressed && styles.pressed,
                        ]}>
                        <Text style={styles.singleOptionText}>{item}</Text>
                        <Text style={styles.checkText}>{selectedGoal === item ? '✓' : ''}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {selectedGoal ? <UserBubble text={selectedGoal} /> : null}

              {shouldShowNotWantStep ? (
                <>
                  <NomyBubble>
                    <Text style={styles.bubbleTitle}>What do you not want to say?</Text>
                    <Text style={styles.bubbleText}>Choose any that fit, then continue.</Text>
                  </NomyBubble>

                  <View style={styles.chatOptions}>
                    {notWantOptions.map((item) => {
                      const selected = selectedNotWants.includes(item);
                      return (
                        <Pressable
                          key={item}
                          onPress={() => toggleNotWant(item)}
                          style={({ pressed }) => [
                            styles.optionBubble,
                            selected && styles.optionBubbleActive,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={styles.singleOptionText}>{item}</Text>
                          <Text style={styles.checkText}>{selected ? '✓' : ''}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setNotWantsConfirmed(true)}
                    style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
                    <Text style={styles.continueButtonText}>
                      {selectedNotWants.length ? 'Continue' : 'Skip this question'}
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {notWantsConfirmed ? (
                <UserBubble text={selectedNotWants.length ? selectedNotWants.join('\n') : 'Skip this question'} />
              ) : null}

              {shouldShowToneStep ? (
                <>
                  <NomyBubble>
                    <Text style={styles.bubbleTitle}>How do you want to say it?</Text>
                    <Text style={styles.bubbleText}>Pick what sounds most like you.</Text>
                  </NomyBubble>

                  <View style={styles.chatOptions}>
                    {toneOptions.map((item) => (
                      <Pressable
                        key={item.name}
                        onPress={() => setSelectedTone(item.name)}
                        style={({ pressed }) => [
                          styles.optionBubble,
                          selectedTone === item.name && styles.optionBubbleActive,
                          pressed && styles.pressed,
                        ]}>
                        <View style={styles.optionCopy}>
                          <Text style={styles.optionTitle}>{item.name}</Text>
                          <Text style={styles.optionText}>{item.description}</Text>
                        </View>
                        <Text style={styles.checkText}>{selectedTone === item.name ? '✓' : ''}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {selectedTone ? <UserBubble text={selectedTone} /> : null}

              {readyForDrafts ? (
                <>
                  <NomyBubble>
                    <Text style={styles.bubbleTitle}>Here’s what you seem to be trying to say:</Text>
                    <Text style={styles.draftText}>{tryingToSay}</Text>
                  </NomyBubble>

                  <NomyBubble>
                    <Text style={styles.bubbleText}>You could say it like this:</Text>
                  </NomyBubble>

                  <View style={styles.draftList}>
                    {drafts.map((item) => (
                      <Pressable
                        accessibilityRole="button"
                        key={item.label}
                        onPress={() => openCapture(item.label, item.text)}
                        style={({ pressed }) => [styles.draftCard, pressed && styles.pressed]}>
                        <View style={styles.optionCopy}>
                          <Text style={styles.draftLabel}>{item.label}</Text>
                          <Text style={styles.draftText}>{item.text}</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </Pressable>
                    ))}
                  </View>

                  <NomyBubble>
                    <Text style={styles.bubbleTitle}>None of these sound like you?</Text>
                    <Text style={styles.bubbleText}>Tap the closest one and use the writing space to build it in your own words.</Text>
                  </NomyBubble>
                </>
              ) : null}
            </>
          ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NomyBubble({ children }: { children: ReactNode }) {
  return <View style={styles.nomyBubble}>{children}</View>;
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userBubble}>
      <Text style={styles.userBubbleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e9f0fa' },
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 14, paddingBottom: 140, gap: 16 },
  topRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: { color: '#1f1635', fontSize: 18, lineHeight: 24, fontWeight: '800' },
  topSpacer: { width: 76 },
  chatThread: { gap: 12 },
  nomyBubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    borderRadius: 24,
    borderTopLeftRadius: 9,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 7,
    shadowColor: '#110c28',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '86%',
    borderRadius: 24,
    borderTopRightRadius: 9,
    backgroundColor: '#1f003d',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  userBubbleText: { color: '#ffffff', fontSize: 16, lineHeight: 23, fontWeight: '600' },
  bubbleTitle: { color: '#1f1635', fontSize: 18, lineHeight: 24, fontWeight: '800' },
  bubbleText: { color: '#5e4f79', fontSize: 16, lineHeight: 23, fontWeight: '600' },
  inputBubble: {
    alignSelf: 'stretch',
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 12,
    gap: 10,
  },
  situationInput: {
    minHeight: 150,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    color: '#1f1635',
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  shortInput: {
    minHeight: 54,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    color: '#1f1635',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  sendButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f003d',
    paddingHorizontal: 18,
  },
  sendButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  chatOptions: { gap: 8, alignSelf: 'stretch' },
  optionBubble: {
    minHeight: 58,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  optionBubbleActive: {
    backgroundColor: '#ffffff',
    borderColor: '#31506f',
    shadowColor: '#31506f',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  optionCopy: { flex: 1, gap: 5 },
  optionTitle: { color: '#1f1635', fontSize: 17, lineHeight: 22, fontWeight: '800' },
  optionText: { color: '#5e4f79', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  singleOptionText: { flex: 1, color: '#1f1635', fontSize: 16, lineHeight: 22, fontWeight: '700' },
  checkText: { width: 24, color: '#1f003d', fontSize: 18, lineHeight: 22, fontWeight: '900', textAlign: 'center' },
  continueButton: {
    alignSelf: 'flex-end',
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#1f003d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  continueButtonText: { color: '#ffffff', fontSize: 15, lineHeight: 20, fontWeight: '800' },
  draftList: { gap: 10 },
  draftCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  memoryDraftCard: {
    borderColor: '#31506f',
    backgroundColor: '#f7fbff',
  },
  draftLabel: { color: '#31506f', fontSize: 13, lineHeight: 18, fontWeight: '900', letterSpacing: 0.35, textTransform: 'uppercase' },
  draftText: { color: '#1f1635', fontSize: 16, lineHeight: 24, fontWeight: '600' },
  chevron: { color: '#b7afc5', fontSize: 24, lineHeight: 24, fontWeight: '500' },
});

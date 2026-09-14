import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackControl } from '@/components/back-control';
import { Text, TextInput } from '@/components/nomy-type';
import { SwipeToHome } from '@/components/swipe-to-home';
import { goBackOrReplace } from '@/constants/navigation';

const puzzles = [
  {
    name: 'Memory Pairing',
    meta: 'Colour memory',
    description: 'Look at the colours first, then match them from memory.',
    action: 'memory-pairing',
  },
  {
    name: 'Match Object',
    meta: 'Object matching',
    description: 'Flip two hidden tiles and match the same object.',
    action: 'match-object',
  },
  {
    name: 'Letter Steps',
    meta: 'Word focus',
    description: 'Guess a five-letter word with gentle letter feedback.',
    action: 'letter-steps',
  },
] as const;

const memoryPairingColors = ['#dfeaf7', '#d9d4f5', '#c67d72', '#f4877b', '#fff7e7', '#f1aed6', '#b9d8fb', '#dcefdc'] as const;
type ObjectIconName = ComponentProps<typeof MaterialIcons>['name'];

const matchObjects: { icon: ObjectIconName; label: string; color: string }[] = [
  { icon: 'directions-car', label: 'car', color: '#dfeaf7' },
  { icon: 'vpn-key', label: 'key', color: '#d9d4f5' },
  { icon: 'eco', label: 'leaf', color: '#dcefdc' },
  { icon: 'star', label: 'star', color: '#fff7e7' },
  { icon: 'menu-book', label: 'book', color: '#f1aed6' },
  { icon: 'home', label: 'house', color: '#f4f8f3' },
  { icon: 'nights-stay', label: 'moon', color: '#e9f0fa' },
  { icon: 'local-florist', label: 'flower', color: '#f4877b' },
];

const letterStepWords = ['still', 'space', 'clear', 'trust', 'quiet', 'light', 'focus', 'pause', 'words', 'plant'] as const;
const letterStepKeyboard = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as const;

type PuzzleMode = 'menu' | 'memory-pairing' | 'match-object' | 'letter-steps';
type LetterFeedback = 'correct' | 'present' | 'absent';
type LetterStepGuess = {
  word: string;
  feedback: LetterFeedback[];
};

function getLetterStepWord(round: number) {
  return letterStepWords[round % letterStepWords.length];
}

function getLetterFeedback(guess: string, answer: string) {
  return guess.split('').map((letter, index): LetterFeedback => {
    if (answer[index] === letter) {
      return 'correct';
    }

    if (answer.includes(letter)) {
      return 'present';
    }

    return 'absent';
  });
}

function buildMemoryPairingTiles(round: number) {
  const tiles = [...memoryPairingColors, ...memoryPairingColors].map((color, index) => ({
    id: `${round}-${index}-${color}`,
    color,
  }));

  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = (round * 7 + index * 3) % (index + 1);
    const current = tiles[index];
    tiles[index] = tiles[swapIndex];
    tiles[swapIndex] = current;
  }

  return tiles;
}

function buildObjectTiles(round: number) {
  const tiles = [...matchObjects, ...matchObjects].map((object, index) => ({
    id: `${round}-${index}-${object.label}`,
    ...object,
  }));

  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = tiles[index];
    tiles[index] = tiles[swapIndex];
    tiles[swapIndex] = current;
  }

  return tiles;
}

export default function ToolkitPuzzlesScreen() {
  const [mode, setMode] = useState<PuzzleMode>('menu');
  const [memoryPairingStarted, setMemoryPairingStarted] = useState(false);
  const [memoryPairingRound, setMemoryPairingRound] = useState(0);
  const [memoryPairingTiles, setMemoryPairingTiles] = useState(() => buildMemoryPairingTiles(0));
  const [selectedMemoryTiles, setSelectedMemoryTiles] = useState<number[]>([]);
  const [matchedMemoryTiles, setMatchedMemoryTiles] = useState<number[]>([]);
  const [memoryPairingLocked, setMemoryPairingLocked] = useState(false);
  const memoryPairingComplete = matchedMemoryTiles.length === memoryPairingTiles.length;
  const [objectRound, setObjectRound] = useState(0);
  const [objectTiles, setObjectTiles] = useState(() => buildObjectTiles(0));
  const [selectedObjectTiles, setSelectedObjectTiles] = useState<number[]>([]);
  const [matchedObjectTiles, setMatchedObjectTiles] = useState<number[]>([]);
  const [objectLocked, setObjectLocked] = useState(false);
  const objectMatchComplete = matchedObjectTiles.length === objectTiles.length;
  const [letterRound, setLetterRound] = useState(0);
  const [letterInput, setLetterInput] = useState('');
  const [letterGuesses, setLetterGuesses] = useState<LetterStepGuess[]>([]);
  const [letterMessage, setLetterMessage] = useState('Write one five-letter word.');
  const letterAnswer = getLetterStepWord(letterRound);
  const letterComplete = letterGuesses.some((guess) => guess.word === letterAnswer);
  const letterFinished = letterComplete || letterGuesses.length >= 6;

  function handleBack() {
    if (mode !== 'menu') {
      setMode('menu');
      return;
    }

    goBackOrReplace('/toolkit');
  }

  function choosePuzzle(item: (typeof puzzles)[number]) {
    if (item.action === 'memory-pairing') {
      resetMemoryPairing(false);
    }

    if (item.action === 'match-object') {
      resetObjectMatch();
    }

    if (item.action === 'letter-steps') {
      resetLetterSteps(false);
    }

    setMode(item.action);
  }

  function resetMemoryPairing(started = true) {
    const nextRound = memoryPairingRound + 1;
    setMemoryPairingRound(nextRound);
    setMemoryPairingTiles(buildMemoryPairingTiles(nextRound));
    setSelectedMemoryTiles([]);
    setMatchedMemoryTiles([]);
    setMemoryPairingLocked(false);
    setMemoryPairingStarted(started);
  }

  function startMemoryPairing() {
    setSelectedMemoryTiles([]);
    setMatchedMemoryTiles([]);
    setMemoryPairingLocked(false);
    setMemoryPairingStarted(true);
  }

  function chooseMemoryTile(index: number) {
    if (
      !memoryPairingStarted ||
      memoryPairingComplete ||
      memoryPairingLocked ||
      selectedMemoryTiles.includes(index) ||
      matchedMemoryTiles.includes(index) ||
      selectedMemoryTiles.length >= 2
    ) {
      return;
    }

    const nextSelected = [...selectedMemoryTiles, index];
    setSelectedMemoryTiles(nextSelected);

    if (nextSelected.length < 2) {
      return;
    }

    const [firstIndex, secondIndex] = nextSelected;
    if (memoryPairingTiles[firstIndex]?.color === memoryPairingTiles[secondIndex]?.color) {
      setMatchedMemoryTiles((current) => [...current, firstIndex, secondIndex]);
      setSelectedMemoryTiles([]);
      return;
    }

    setMemoryPairingLocked(true);
    setTimeout(() => {
      setSelectedMemoryTiles([]);
      setMemoryPairingLocked(false);
    }, 700);
  }

  function resetObjectMatch() {
    const nextRound = objectRound + 1;
    setObjectRound(nextRound);
    setObjectTiles(buildObjectTiles(nextRound));
    setSelectedObjectTiles([]);
    setMatchedObjectTiles([]);
    setObjectLocked(false);
  }

  function chooseObjectTile(index: number) {
    if (
      objectMatchComplete ||
      objectLocked ||
      selectedObjectTiles.includes(index) ||
      matchedObjectTiles.includes(index) ||
      selectedObjectTiles.length >= 2
    ) {
      return;
    }

    const nextSelected = [...selectedObjectTiles, index];
    setSelectedObjectTiles(nextSelected);

    if (nextSelected.length < 2) {
      return;
    }

    const [firstIndex, secondIndex] = nextSelected;
    if (objectTiles[firstIndex]?.label === objectTiles[secondIndex]?.label) {
      setMatchedObjectTiles((current) => [...current, firstIndex, secondIndex]);
      setSelectedObjectTiles([]);
      return;
    }

    setObjectLocked(true);
    setTimeout(() => {
      setSelectedObjectTiles([]);
      setObjectLocked(false);
    }, 700);
  }

  function resetLetterSteps(nextWord = true) {
    if (nextWord) {
      setLetterRound((current) => current + 1);
    }
    setLetterInput('');
    setLetterGuesses([]);
    setLetterMessage('Write one five-letter word.');
  }

  function submitLetterGuess() {
    const guess = letterInput.trim().toLowerCase();

    if (letterFinished) {
      return;
    }

    if (guess.length !== 5) {
      setLetterMessage('Use exactly five letters.');
      return;
    }

    if (!/^[a-z]+$/.test(guess)) {
      setLetterMessage('Use letters only.');
      return;
    }

    const nextGuess = {
      word: guess,
      feedback: getLetterFeedback(guess, letterAnswer),
    };
    const nextGuesses = [...letterGuesses, nextGuess];
    setLetterGuesses(nextGuesses);
    setLetterInput('');

    if (guess === letterAnswer) {
      setLetterMessage('The word is complete.');
      return;
    }

    if (nextGuesses.length >= 6) {
      setLetterMessage(`The word was ${letterAnswer}. You can try another if you want.`);
      return;
    }

    setLetterMessage('Try another word when you are ready.');
  }

  const screenTitle = mode === 'menu' ? 'Puzzles' : mode === 'memory-pairing' ? 'Memory Pairing' : mode === 'match-object' ? 'Match Object' : 'Letter Steps';
  const screenSubtitle =
    mode === 'menu'
      ? 'When your mind wants structure and focus, puzzles can offer calm stimulation.'
      : mode === 'memory-pairing'
        ? 'Flip two tiles at a time. Matching colours stay face up.'
        : mode === 'match-object'
          ? 'Match two of the same object.'
          : 'Guess a five-letter word. The colours show what changed.';

  return (
    <SwipeToHome>
    <SafeAreaView style={[styles.screen, mode === 'memory-pairing' && styles.patternScreen]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackControl label={mode === 'menu' ? 'Toolkit' : 'Puzzles'} onPress={handleBack} />

        <View style={styles.header}>
          <Text style={styles.title}>{screenTitle}</Text>
          <Text style={styles.subtitle}>{screenSubtitle}</Text>
        </View>

        {mode === 'menu' ? (
          <View style={styles.grid}>
            {puzzles.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.name}
                onPress={() => choosePuzzle(item)}
                style={({ pressed }) => [styles.puzzleButton, pressed && styles.rowPressed]}>
                <View style={styles.puzzleCopy}>
                  <Text style={styles.puzzleTitle}>{item.name}</Text>
                  <Text style={styles.puzzleMeta}>{item.meta}</Text>
                  <Text style={styles.puzzleDescription}>{item.description}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {mode === 'memory-pairing' ? (
          <View style={styles.patternCard}>
            <Text style={styles.patternText}>
              {memoryPairingComplete
                ? 'All pairs are matched. The game is complete.'
                : memoryPairingStarted
                  ? 'Match the colours from memory.'
                  : 'First, look at the colours. When you are ready, hide them and match from memory.'}
            </Text>
            <View style={styles.patternGrid}>
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <View key={`memory-row-${rowIndex}`} style={styles.patternRow}>
                  {memoryPairingTiles.slice(rowIndex * 4, rowIndex * 4 + 4).map((tile, columnIndex) => {
                    const index = rowIndex * 4 + columnIndex;
                    const isVisible = !memoryPairingStarted || selectedMemoryTiles.includes(index) || matchedMemoryTiles.includes(index);

                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={isVisible ? 'Revealed colour tile' : 'Hidden colour tile'}
                        key={tile.id}
                        onPress={() => chooseMemoryTile(index)}
                        style={({ pressed }) => [
                          styles.patternDot,
                          { backgroundColor: isVisible ? tile.color : '#5b527c' },
                          pressed && memoryPairingStarted && !isVisible ? styles.patternDotPressed : null,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
            {memoryPairingComplete ? (
              <View style={styles.completeCard}>
                <Text style={styles.completeText}>You can play again if you want, or use the back button to leave this activity.</Text>
                <Pressable onPress={() => resetMemoryPairing(false)} style={({ pressed }) => [styles.patternActionPrimary, pressed && styles.rowPressed]}>
                  <Text style={styles.patternActionPrimaryText}>Play again</Text>
                </Pressable>
              </View>
            ) : !memoryPairingStarted ? (
              <View style={styles.patternActions}>
                <Pressable onPress={() => resetMemoryPairing(false)} style={({ pressed }) => [styles.patternAction, pressed && styles.rowPressed]}>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.patternActionText}>Shuffle colours</Text>
                </Pressable>
                <Pressable onPress={startMemoryPairing} style={({ pressed }) => [styles.patternActionPrimary, pressed && styles.rowPressed]}>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.patternActionPrimaryText}>Hide colours</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {mode === 'match-object' ? (
          <View style={[styles.patternCard, styles.objectCard]}>
            <Text style={styles.patternText}>
              {objectMatchComplete
                ? 'All object pairs are matched.'
                : 'Flip two tiles. Match the same object.'}
            </Text>
            <View style={styles.patternGrid}>
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <View key={`object-row-${rowIndex}`} style={styles.patternRow}>
                  {objectTiles.slice(rowIndex * 4, rowIndex * 4 + 4).map((tile, columnIndex) => {
                    const index = rowIndex * 4 + columnIndex;
                    const isVisible = selectedObjectTiles.includes(index) || matchedObjectTiles.includes(index);

                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={isVisible ? `Revealed ${tile.label} tile` : 'Hidden object tile'}
                        key={tile.id}
                        onPress={() => chooseObjectTile(index)}
                        style={({ pressed }) => [
                          styles.patternDot,
                          styles.objectDot,
                          { backgroundColor: isVisible ? tile.color : '#5b527c' },
                          pressed && !isVisible ? styles.patternDotPressed : null,
                        ]}>
                        {isVisible ? <MaterialIcons color="#1f1635" name={tile.icon} size={34} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
            {objectMatchComplete ? (
              <View style={styles.completeCard}>
                <Text style={styles.completeText}>You can play again if you want, or use the back button to leave this activity.</Text>
                <Pressable onPress={resetObjectMatch} style={({ pressed }) => [styles.patternActionPrimary, pressed && styles.rowPressed]}>
                  <Text style={styles.patternActionPrimaryText}>Play again</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        {mode === 'letter-steps' ? (
          <View style={styles.letterCard}>
            <Text style={styles.letterGuide}>
              Blue means the letter is in the right place. Pink means the letter is in the word, but somewhere else.
            </Text>

            <View style={styles.letterBoard}>
              {Array.from({ length: 6 }).map((_, rowIndex) => {
                const guess = letterGuesses[rowIndex];
                const rowLetters = guess?.word.split('') ?? Array.from({ length: 5 }).map(() => '');

                return (
                  <View key={`letter-row-${rowIndex}`} style={styles.letterRow}>
                    {rowLetters.map((letter, letterIndex) => {
                      const feedback = guess?.feedback[letterIndex];
                      return (
                        <View
                          key={`letter-${rowIndex}-${letterIndex}`}
                          style={[
                            styles.letterTile,
                            feedback === 'correct' && styles.letterTileCorrect,
                            feedback === 'present' && styles.letterTilePresent,
                            feedback === 'absent' && styles.letterTileAbsent,
                          ]}>
                          <Text style={styles.letterTileText}>{letter.toUpperCase()}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>

            <View style={styles.letterInputGroup}>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!letterFinished}
                maxLength={5}
                onChangeText={(value) => setLetterInput(value.replace(/[^a-zA-Z]/g, '').slice(0, 5).toLowerCase())}
                onSubmitEditing={submitLetterGuess}
                placeholder="Type 5 letters"
                placeholderTextColor="#817690"
                returnKeyType="done"
                style={styles.letterInput}
                value={letterInput}
              />
              <Pressable
                disabled={letterFinished}
                onPress={submitLetterGuess}
                style={({ pressed }) => [styles.patternActionPrimary, letterFinished && styles.disabledAction, pressed && styles.rowPressed]}>
                <Text style={styles.patternActionPrimaryText}>Check word</Text>
              </Pressable>
            </View>

            <Text style={styles.letterMessage}>{letterMessage}</Text>

            <View style={styles.letterKeyboard}>
              {letterStepKeyboard.map((row) => (
                <View key={row} style={styles.letterKeyboardRow}>
                  {row.split('').map((letter) => (
                    <View key={letter} style={styles.keyboardKey}>
                      <Text style={styles.keyboardKeyText}>{letter.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {letterFinished ? (
              <Pressable onPress={() => resetLetterSteps()} style={({ pressed }) => [styles.patternActionPrimary, pressed && styles.rowPressed]}>
                <Text style={styles.patternActionPrimaryText}>Try another word</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
    </SwipeToHome>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fde6cf' },
  patternScreen: { backgroundColor: '#fde6cf' },
  content: { paddingHorizontal: 18, paddingBottom: 116, gap: 22 },
  header: { alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { color: '#1f1635', textAlign: 'center', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.45 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 17, lineHeight: 26 },
  grid: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  puzzleButton: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e3f0',
    backgroundColor: '#ffffff',
  },
  puzzleCopy: { flex: 1, gap: 3 },
  puzzleTitle: { color: '#1f003d', fontSize: 19, fontWeight: '600' },
  puzzleMeta: { color: '#817690', fontSize: 13, fontWeight: '500' },
  puzzleDescription: { color: '#5e4f79', fontSize: 14, lineHeight: 20 },
  rowPressed: { opacity: 0.68, backgroundColor: '#f7f5fb' },
  chevron: { color: '#b7afc5', fontSize: 26, lineHeight: 28, fontWeight: '400' },
  patternCard: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 28,
    alignItems: 'center',
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  objectCard: { gap: 22 },
  patternText: { alignSelf: 'stretch', color: '#1f1635', textAlign: 'center', fontSize: 19, lineHeight: 27, fontWeight: '700' },
  patternGrid: {
    width: 340,
    maxWidth: '100%',
    gap: 18,
    alignItems: 'center',
  },
  patternRow: {
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
  },
  patternDot: { width: 70, height: 70, borderRadius: 35 },
  objectDot: { alignItems: 'center', justifyContent: 'center' },
  patternDotPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  completeCard: {
    alignSelf: 'stretch',
    borderRadius: 24,
    backgroundColor: '#f7f5fb',
    padding: 14,
    gap: 12,
  },
  completeText: { color: '#5e4f79', textAlign: 'center', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  patternActions: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  patternAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf2',
    paddingHorizontal: 12,
  },
  patternActionText: { color: '#1f003d', fontSize: 15, fontWeight: '800' },
  patternActionPrimary: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f003d',
    paddingHorizontal: 12,
  },
  patternActionPrimaryText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  disabledAction: { opacity: 0.45 },
  letterCard: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 18,
    gap: 18,
    shadowColor: '#110c28',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  letterGuide: { color: '#5e4f79', textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  letterBoard: { gap: 8, alignItems: 'center' },
  letterRow: { flexDirection: 'row', gap: 8 },
  letterTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f5fb',
    borderWidth: 1,
    borderColor: '#e8e3f0',
  },
  letterTileCorrect: { backgroundColor: '#dfeaf7', borderColor: '#b9d8fb' },
  letterTilePresent: { backgroundColor: '#fde6cf', borderColor: '#f1aed6' },
  letterTileAbsent: { backgroundColor: '#f0edf7', borderColor: '#ded7ec' },
  letterTileText: { color: '#1f1635', fontSize: 20, lineHeight: 24, fontWeight: '900' },
  letterInputGroup: { gap: 10 },
  letterInput: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ded7ec',
    backgroundColor: '#fbf9ff',
    color: '#1f1635',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  letterMessage: { color: '#5e4f79', textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: '700' },
  letterKeyboard: { gap: 6, alignItems: 'center' },
  letterKeyboardRow: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  keyboardKey: {
    minWidth: 24,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf2',
  },
  keyboardKeyText: { color: '#5e4f79', fontSize: 11, fontWeight: '900' },
});

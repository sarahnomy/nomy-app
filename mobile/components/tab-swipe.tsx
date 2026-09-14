import { router } from 'expo-router';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';

const TAB_ORDER = ['/', '/support', '/profile'] as const;
const SWIPE_DISTANCE = 78;
const SCREEN_WIDTH = Dimensions.get('window').width;

type TabPath = (typeof TAB_ORDER)[number];

const TAB_PREVIEWS: Record<TabPath, { background: string; card: string; rows: number }> = {
  '/': { background: '#fffaf2', card: '#ffffff', rows: 2 },
  '/support': { background: '#fffaf2', card: '#ffffff', rows: 5 },
  '/profile': { background: '#fffaf2', card: '#ffffff', rows: 4 },
};

export function TabSwipe({ children, current, disabled = false }: PropsWithChildren<{ current: TabPath; disabled?: boolean }>) {
  const currentIndex = TAB_ORDER.indexOf(current);
  const [translateX] = useState(() => new Animated.Value(0));
  const disabledRef = useRef(disabled);
  const [previewPath, setPreviewPath] = useState<TabPath | null>(null);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) => {
        if (disabledRef.current) {
          return false;
        }

        const mostlyHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8;
        return Math.abs(gesture.dx) > 28 && mostlyHorizontal;
      },
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (disabledRef.current) {
          return false;
        }

        const mostlyHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8;
        return Math.abs(gesture.dx) > 28 && mostlyHorizontal;
      },
      onPanResponderMove: (_, gesture) => {
        const nextIndex = gesture.dx < 0 ? currentIndex + 1 : currentIndex - 1;
        const nextPath = TAB_ORDER[nextIndex] ?? null;
        setPreviewPath(nextPath);

        if (!nextPath) {
          translateX.setValue(gesture.dx * 0.18);
          return;
        }

        translateX.setValue(Math.max(-SCREEN_WIDTH, Math.min(SCREEN_WIDTH, gesture.dx)));
      },
      onPanResponderRelease: (_, gesture) => {
        const settleBack = () => {
          Animated.spring(translateX, {
            toValue: 0,
            tension: 90,
            friction: 12,
            useNativeDriver: true,
          }).start(() => setPreviewPath(null));
        };

        if (Math.abs(gesture.dx) < SWIPE_DISTANCE || Math.abs(gesture.dy) > 70) {
          settleBack();
          return;
        }

        const nextIndex = gesture.dx < 0 ? currentIndex + 1 : currentIndex - 1;
        const nextPath = TAB_ORDER[nextIndex];
        if (nextPath) {
          Animated.timing(translateX, {
            toValue: gesture.dx < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
            duration: 170,
            useNativeDriver: true,
          }).start(() => {
            router.replace(nextPath);
            translateX.setValue(0);
            setPreviewPath(null);
          });
          return;
        }

        settleBack();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }).start(() => setPreviewPath(null));
      },
      }),
    [currentIndex, translateX],
  );

  const preview = previewPath ? TAB_PREVIEWS[previewPath] : null;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {preview ? (
        <View style={[styles.preview, { backgroundColor: preview.background }]}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewTitleLine, { backgroundColor: preview.card }]} />
            <View style={[styles.previewSubtitleLine, { backgroundColor: preview.card }]} />
          </View>
          <View style={styles.previewList}>
            {Array.from({ length: preview.rows }).map((_, index) => (
              <View key={index} style={[styles.previewRow, { backgroundColor: preview.card }]}>
                <View style={styles.previewRowCopy}>
                  <View style={styles.previewRowLine} />
                  <View style={styles.previewRowLineShort} />
                </View>
                <View style={styles.previewChevron} />
              </View>
            ))}
          </View>
        </View>
      ) : null}
      <Animated.View style={[styles.page, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#fffaf2' },
  page: {
    flex: 1,
    shadowColor: '#1f003d',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  preview: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 18,
    paddingTop: 74,
    paddingBottom: 116,
    gap: 22,
  },
  previewHeader: {
    alignItems: 'center',
    gap: 10,
  },
  previewTitleLine: {
    width: 220,
    height: 34,
    borderRadius: 17,
    opacity: 0.86,
  },
  previewSubtitleLine: {
    width: 270,
    height: 18,
    borderRadius: 9,
    opacity: 0.66,
  },
  previewList: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
  },
  previewRow: {
    minHeight: 76,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(31, 22, 53, 0.08)',
  },
  previewRowCopy: { flex: 1, gap: 8 },
  previewRowLine: {
    width: '74%',
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 22, 53, 0.12)',
  },
  previewRowLineShort: {
    width: '46%',
    height: 11,
    borderRadius: 6,
    backgroundColor: 'rgba(31, 22, 53, 0.08)',
  },
  previewChevron: {
    width: 9,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(31, 22, 53, 0.12)',
  },
});

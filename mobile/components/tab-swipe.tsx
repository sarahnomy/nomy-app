import { router } from 'expo-router';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/constants/app-theme';

const TAB_ORDER = ['/', '/support', '/profile'] as const;
const SWIPE_DISTANCE = 78;
const SCREEN_WIDTH = Dimensions.get('window').width;

type TabPath = (typeof TAB_ORDER)[number];

type FeatureIconName = 'emotionize' | 'express' | 'toolkit' | 'checkin';

function PreviewFeatureIcon({ name }: { name: FeatureIconName }) {
  if (name === 'emotionize') {
    return <Image source={require('@/assets/images/emotionize.png')} style={styles.previewFeatureIcon} />;
  }

  if (name === 'express') {
    return <Image source={require('@/assets/images/express.png')} style={styles.previewFeatureIconLarge} />;
  }

  if (name === 'toolkit') {
    return <Image source={require('@/assets/images/toolkit.png')} style={styles.previewFeatureIconWide} />;
  }

  return (
    <View style={styles.previewCheckInIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.previewCheckInPencil}>
        <View style={styles.previewCheckInPencilTip} />
        <View style={styles.previewCheckInPencilBody} />
        <View style={styles.previewCheckInPencilEnd} />
      </View>
    </View>
  );
}

function TabPreview({ path }: { path: TabPath }) {
  if (path === '/') {
    return (
      <View style={styles.previewContent}>
        <Text style={styles.previewPageTitle}>Pick up where you left off, or use your most used tools.</Text>
        <View style={styles.previewContinueCard}>
          <Text style={styles.previewSmallLabel}>Continue</Text>
          <Text style={styles.previewCardTitle}>Continue Express</Text>
          <Text style={styles.previewMutedText}>Keep finding your voice.</Text>
        </View>
        <Text style={styles.previewSectionTitle}>Your essentials</Text>
        <View style={styles.previewEssentialsRow}>
          <View style={[styles.previewEssentialCard, { backgroundColor: '#e9c3f1' }]}>
            <PreviewFeatureIcon name="toolkit" />
            <Text style={styles.previewCardTitle}>Breathe</Text>
          </View>
          <View style={[styles.previewEssentialCard, { backgroundColor: '#c2dcff' }]}>
            <PreviewFeatureIcon name="express" />
            <Text style={styles.previewCardTitle}>Express</Text>
          </View>
        </View>
        <View style={[styles.previewWideCard, { backgroundColor: '#c2dcff' }]}>
          <PreviewFeatureIcon name="express" />
          <View style={styles.previewCardCopy}>
            <Text style={styles.previewCardTitle}>I need help communicating my needs</Text>
            <Text style={styles.previewMutedText}>Open Express</Text>
          </View>
          <Text style={styles.previewChevronText}>›</Text>
        </View>
      </View>
    );
  }

  if (path === '/support') {
    const items = [
      { title: 'Emotionize', color: '#e1dcf9', icon: 'emotionize' },
      { title: 'Check-in', color: '#d5f1f0', icon: 'checkin' },
      { title: 'Express', color: '#c2dcff', icon: 'express' },
      { title: 'Toolkit', color: '#e9c3f1', icon: 'toolkit' },
    ] as const;

    return (
      <View style={styles.previewContent}>
        <Text style={styles.previewPageTitle}>What support do you want?</Text>
        <View style={styles.previewSearchBar}>
          <Text style={styles.previewSearchIcon}>⌕</Text>
          <Text style={styles.previewSearchText}>Search support</Text>
        </View>
        <View style={styles.previewFeatureGrid}>
          {items.map((item) => (
            <View key={item.title} style={[styles.previewFeatureTile, { backgroundColor: item.color }]}>
              <View style={styles.previewFeatureFrame}>
                <PreviewFeatureIcon name={item.icon} />
              </View>
              <Text style={styles.previewFeatureTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.previewContent}>
      <Text style={styles.previewPageTitle}>Your nomy space</Text>
      <View style={styles.previewAccountCard}>
        <Text style={styles.previewSmallLabel}>Account</Text>
        <Text style={styles.previewMutedText}>Use an account when you want your saved space connected to you.</Text>
        <View style={styles.previewLoginButton}>
          <Text style={styles.previewLoginButtonText}>Log in or create account</Text>
          <Text style={styles.previewLoginButtonText}>›</Text>
        </View>
        <Text style={styles.previewMutedText}>You can still use the app without logging in.</Text>
      </View>
      <View style={styles.previewProfileRows}>
        <View style={styles.previewProfileRow}>
          <Text style={styles.previewCardTitle}>Settings</Text>
          <Text style={styles.previewChevronText}>›</Text>
        </View>
        <View style={styles.previewProfileRow}>
          <Text style={styles.previewCardTitle}>FAQs</Text>
          <Text style={styles.previewChevronText}>›</Text>
        </View>
      </View>
    </View>
  );
}

export function TabSwipe({ children, current, disabled = false }: PropsWithChildren<{ current: TabPath; disabled?: boolean }>) {
  const theme = useAppTheme();
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

  return (
    <View style={[styles.container, { backgroundColor: theme.screen }]} {...panResponder.panHandlers}>
      {previewPath ? (
        <View style={[styles.preview, { backgroundColor: theme.screen }]}>
          <TabPreview path={previewPath} />
        </View>
      ) : null}
      <Animated.View style={[styles.page, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  page: {
    flex: 1,
    shadowColor: '#1f003d',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  preview: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 22,
    paddingTop: 62,
    paddingBottom: 116,
  },
  previewContent: {
    flex: 1,
    gap: 14,
  },
  previewPageTitle: {
    color: '#1f1635',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  previewContinueCard: {
    minHeight: 116,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    padding: 18,
    justifyContent: 'center',
    gap: 6,
  },
  previewSmallLabel: {
    color: '#817690',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewCardTitle: {
    color: '#1f1635',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  previewMutedText: {
    color: '#5e4f79',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  previewSectionTitle: {
    color: '#817690',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewEssentialsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewEssentialCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  previewWideCard: {
    minHeight: 86,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewCardCopy: { flex: 1, gap: 4 },
  previewChevronText: {
    color: '#1f1635',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '500',
    opacity: 0.36,
  },
  previewSearchBar: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewSearchIcon: {
    color: '#8b829d',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
  },
  previewSearchText: {
    color: '#817690',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
  },
  previewFeatureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  previewFeatureTile: {
    width: '47.8%',
    minHeight: 68,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  previewFeatureFrame: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFeatureTitle: {
    color: '#050505',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: -0.08,
  },
  previewFeatureIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  previewFeatureIconLarge: {
    width: 28,
    height: 27,
    resizeMode: 'contain',
  },
  previewFeatureIconWide: {
    width: 28,
    height: 22,
    resizeMode: 'contain',
  },
  previewCheckInIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCheckInPencil: {
    width: 27,
    height: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    transform: [{ rotate: '-45deg' }],
  },
  previewCheckInPencilTip: {
    width: 0,
    height: 0,
    borderTopWidth: 4.5,
    borderBottomWidth: 4.5,
    borderRightWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#050505',
  },
  previewCheckInPencilBody: {
    width: 15,
    height: 9,
    backgroundColor: '#050505',
  },
  previewCheckInPencilEnd: {
    width: 6,
    height: 9,
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: '#050505',
  },
  previewAccountCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    padding: 18,
    gap: 12,
  },
  previewLoginButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#1f003d',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewLoginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  previewProfileRows: {
    gap: 10,
  },
  previewProfileRow: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.1)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

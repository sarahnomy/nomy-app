import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AccessibilityInfo, Animated, Easing, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/nomy-type';
import { getAvatarActivities, getAvatarActivityVersion, subscribeAvatarActivities, type AvatarActivity } from '@/constants/avatar';
import {
  getAvatarVisibleAfterDemo,
  hydrateAvatarHomePreference,
  sendAvatarHome,
  subscribeAvatarVisibleAfterDemo,
} from '@/constants/avatar-visibility';
import { apiUrl } from '@/constants/api';

const AVATAR_POSITION_KEY = 'nomy_avatar_launcher_position';
const LAUNCHER_SIZE = 66;
const SCREEN_MARGIN = 12;
const TOP_CLEARANCE = 54;
const BOTTOM_CLEARANCE = 112;

type AvatarVisualState = 'guarded' | 'settling' | 'opening';

type AvatarPresentation = {
  state: AvatarVisualState;
  headline: string;
  support: string;
};

type LauncherPosition = {
  x: number;
  y: number;
};

type LauncherBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function getBounds(width: number, height: number): LauncherBounds {
  return {
    minX: SCREEN_MARGIN,
    maxX: Math.max(SCREEN_MARGIN, width - LAUNCHER_SIZE - SCREEN_MARGIN),
    minY: TOP_CLEARANCE,
    maxY: Math.max(TOP_CLEARANCE, height - LAUNCHER_SIZE - BOTTOM_CLEARANCE),
  };
}

function clampPosition(position: LauncherPosition, bounds: LauncherBounds) {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y)),
  };
}

function samePosition(first: LauncherPosition, second: LauncherPosition) {
  return Math.abs(first.x - second.x) < 0.5 && Math.abs(first.y - second.y) < 0.5;
}

function snapToNearestEdge(position: LauncherPosition, bounds: LauncherBounds) {
  const distances = [
    { edge: 'left', value: Math.abs(position.x - bounds.minX) },
    { edge: 'right', value: Math.abs(bounds.maxX - position.x) },
    { edge: 'top', value: Math.abs(position.y - bounds.minY) },
    { edge: 'bottom', value: Math.abs(bounds.maxY - position.y) },
  ].sort((a, b) => a.value - b.value);

  if (distances[0]?.edge === 'left') {
    return { ...position, x: bounds.minX };
  }

  if (distances[0]?.edge === 'right') {
    return { ...position, x: bounds.maxX };
  }

  if (distances[0]?.edge === 'top') {
    return { ...position, y: bounds.minY };
  }

  return { ...position, y: bounds.maxY };
}

function parseSavedPosition(value: string | null): LauncherPosition | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LauncherPosition>;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    return null;
  }

  return null;
}

export function AdaptiveAvatar() {
  const pathname = usePathname();
  const visible = useSyncExternalStore(
    subscribeAvatarVisibleAfterDemo,
    getAvatarVisibleAfterDemo,
    getAvatarVisibleAfterDemo,
  );
  const avatarActivityVersion = useSyncExternalStore(
    subscribeAvatarActivities,
    getAvatarActivityVersion,
    getAvatarActivityVersion,
  );
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [positionReady, setPositionReady] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [launcherPosition, setLauncherPosition] = useState<LauncherPosition>({ x: SCREEN_MARGIN, y: TOP_CLEARANCE });
  const [avatarPulse] = useState(() => new Animated.Value(0));
  const dragStart = useRef<LauncherPosition>({ x: SCREEN_MARGIN, y: TOP_CLEARANCE });
  const positionRef = useRef<LauncherPosition>({ x: SCREEN_MARGIN, y: TOP_CLEARANCE });
  const boundsRef = useRef<LauncherBounds>(getBounds(390, 844));
  const [avatarPresentation, setAvatarPresentation] = useState<AvatarPresentation>({
    state: 'guarded',
    headline: 'nomy is sleeping',
    support: 'A small step is enough. Start where your energy already is.',
  });

  useEffect(() => {
    void hydrateAvatarHomePreference();
  }, []);

  useEffect(() => {
    positionRef.current = launcherPosition;
  }, [launcherPosition]);

  useEffect(() => {
    if (!visible) {
      setPositionReady(false);
      return;
    }

    let active = true;

    async function restorePosition() {
      const savedPosition = parseSavedPosition(await AsyncStorage.getItem(AVATAR_POSITION_KEY).catch(() => null));
      const fallbackPosition = { x: boundsRef.current.maxX, y: boundsRef.current.maxY };
      const nextPosition = clampPosition(savedPosition ?? fallbackPosition, boundsRef.current);

      if (!active) {
        return;
      }

      positionRef.current = nextPosition;
      setLauncherPosition(nextPosition);
      setPositionReady(true);
    }

    restorePosition();

    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setAvatarOpen(false);
      return;
    }

    let active = true;

    async function syncAvatarState() {
      const activities = await getAvatarActivities();
      const localPresentation = buildLocalAvatarState(activities);

      if (active) {
        setAvatarPresentation(localPresentation);
      }

      try {
        const response = await fetch(apiUrl('/api/mobile/avatar-state/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activities }),
        });

        const data = await response.json().catch(() => null);
        if (!active || !response.ok || !data?.ok) {
          if (active) {
            setAvatarPresentation(localPresentation);
          }
          return;
        }

        const serverState = normalizeAvatarState(data.state);
        const finalState = strongerAvatarState(serverState, localPresentation.state);
        const serverCanLead = finalState === serverState;
        setAvatarPresentation({
          state: finalState,
          headline: serverCanLead ? data.headline || localPresentation.headline : localPresentation.headline,
          support: serverCanLead ? data.support || localPresentation.support : localPresentation.support,
        });
      } catch {
        if (active) {
          setAvatarPresentation(localPresentation);
        }
      }
    }

    syncAvatarState();

    return () => {
      active = false;
    };
  }, [avatarActivityVersion, pathname, visible]);

  const avatarPalette = useMemo(() => paletteForAvatarState(avatarPresentation.state), [avatarPresentation.state]);
  const avatarLife = useMemo(() => lifeForAvatarState(avatarPresentation.state), [avatarPresentation.state]);
  const avatarPulseStyle = {
    opacity: avatarPulse.interpolate({
      inputRange: [0, 1],
      outputRange: avatarLife.pulseOpacity,
    }),
    transform: [
      {
        scale: avatarPulse.interpolate({
          inputRange: [0, 1],
          outputRange: avatarLife.pulseScale,
        }),
      },
    ],
  };

  const avatarDragResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
      onPanResponderGrant: () => {
        dragStart.current = positionRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const nextPosition = clampPosition(
          {
            x: dragStart.current.x + gesture.dx,
            y: dragStart.current.y + gesture.dy,
          },
          boundsRef.current,
        );

        positionRef.current = nextPosition;
        setLauncherPosition(nextPosition);
      },
      onPanResponderRelease: (_, gesture) => {
        const nextPosition = snapToNearestEdge(
          clampPosition(
            {
              x: dragStart.current.x + gesture.dx,
              y: dragStart.current.y + gesture.dy,
            },
            boundsRef.current,
          ),
          boundsRef.current,
        );

        positionRef.current = nextPosition;
        setLauncherPosition(nextPosition);
        void AsyncStorage.setItem(AVATAR_POSITION_KEY, JSON.stringify(nextPosition)).catch(() => null);
      },
      onPanResponderTerminate: () => {
        const nextPosition = snapToNearestEdge(positionRef.current, boundsRef.current);

        positionRef.current = nextPosition;
        setLauncherPosition(nextPosition);
        void AsyncStorage.setItem(AVATAR_POSITION_KEY, JSON.stringify(nextPosition)).catch(() => null);
      },
    }),
  ).current;

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) {
        setReduceMotionEnabled(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotionEnabled);

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible || reduceMotionEnabled) {
      avatarPulse.stopAnimation();
      avatarPulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [avatarPulse, reduceMotionEnabled, visible]);

  async function openSupportRightNow() {
    if (pathname === '/support-right-now') {
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      }
      setAvatarOpen(false);
      return;
    }

    setAvatarOpen(false);
    router.push('/support-right-now');
  }

  async function putAvatarAway() {
    setAvatarOpen(false);
    await sendAvatarHome();
  }

  const avatarHeadline = avatarLife.headline;

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={styles.root}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        const nextBounds = getBounds(width, height);
        const nextPosition = clampPosition(positionRef.current, nextBounds);

        boundsRef.current = nextBounds;
        if (!samePosition(positionRef.current, nextPosition)) {
          positionRef.current = nextPosition;
          setLauncherPosition(nextPosition);
        }
      }}>
      {avatarOpen ? (
        <View pointerEvents="box-none" style={styles.avatarOverlay}>
          <Pressable style={styles.avatarScrim} onPress={() => setAvatarOpen(false)} />
          <View style={[styles.avatarPanel, { backgroundColor: avatarPalette.panel }]}>
            <Pressable onPress={() => setAvatarOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
            <View style={styles.avatarVisualRow}>
              <Animated.View style={[styles.avatarVisualGlow, { backgroundColor: avatarPalette.glow }, avatarPulseStyle]}>
                <BlobAvatar state={avatarPresentation.state} size="large" />
              </Animated.View>
              <View style={styles.avatarMoodWrap}>
                <Text style={styles.avatarHeadline}>{avatarHeadline}</Text>
                <Text style={styles.avatarSupport}>{avatarLife.panelText}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                void openSupportRightNow();
              }}
              style={styles.recommendationButton}>
              <Text style={styles.recommendationButtonText}>Open support right now</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void putAvatarAway();
              }}
              style={styles.homeRestButton}>
              <Text style={styles.homeRestButtonText}>Send nomy home</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!avatarOpen && positionReady ? (
        <Animated.View
          {...avatarDragResponder.panHandlers}
          style={[
            styles.avatarLauncher,
            {
              opacity: avatarPulseStyle.opacity,
              transform: [
                { translateX: launcherPosition.x },
                { translateY: launcherPosition.y },
                ...(avatarPulseStyle.transform ?? []),
              ],
            },
            { backgroundColor: avatarPalette.launcher, borderColor: avatarPalette.border },
          ]}>
          <Pressable onPress={() => setAvatarOpen(true)} style={styles.avatarLauncherButton}>
            <View style={[styles.avatarLauncherGlow, { backgroundColor: avatarPalette.glow }]}>
              <BlobAvatar state={avatarPresentation.state} size="small" />
              <View style={[styles.avatarLauncherBadge, { backgroundColor: avatarPalette.chip }]}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.avatarLauncherBadgeText}>{avatarLife.badge}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

function BlobAvatar({ state, size }: { state: AvatarVisualState; size: 'large' | 'small' }) {
  const small = size === 'small';
  const sleeping = state === 'guarded';

  return (
    <View
      style={[
        styles.blobWrap,
        small ? styles.blobWrapSmall : styles.blobWrapLarge,
        sleeping && styles.blobWrapSleeping,
      ]}>
      {sleeping ? <View style={[styles.blobCocoon, small && styles.blobCocoonSmall]} /> : null}
      <View style={[styles.blobBody, sleeping && styles.blobBodySleeping, small && styles.blobBodySmall, sleeping && small && styles.blobBodySleepingSmall]}>
        <View style={[styles.blobCheek, styles.blobCheekLeft, small && styles.blobCheekSmall, small && styles.blobCheekLeftSmall]} />
        <View style={[styles.blobCheek, styles.blobCheekRight, small && styles.blobCheekSmall, small && styles.blobCheekRightSmall]} />
        <View style={[styles.blobEye, styles.blobEyeLeft, small && styles.blobEyeSmall, small && styles.blobEyeLeftSmall]} />
        <View style={[styles.blobEye, styles.blobEyeRight, small && styles.blobEyeSmall, small && styles.blobEyeRightSmall]} />
        <View style={[styles.blobMouth, small && styles.blobMouthSmall]} />
        {!sleeping ? <View style={[styles.blobSideBump, small && styles.blobSideBumpSmall]} /> : null}
        <View style={[styles.blobArm, small && styles.blobArmSmall]} />
        {!sleeping ? <View style={[styles.blobFootLine, small && styles.blobFootLineSmall]} /> : null}
      </View>
      {sleeping ? <View style={[styles.blobBlanket, small && styles.blobBlanketSmall]} /> : null}
    </View>
  );
}

function buildLocalAvatarState(activities: AvatarActivity[]): AvatarPresentation {
  const featureCount = new Set(activities.map((activity) => activity.feature).filter(Boolean)).size;
  const emotionReads = activities.filter((activity) => activity.type === 'emotionize_story_opened').length;

  if (featureCount >= 3 || emotionReads >= 3) {
    return {
      state: 'opening',
      headline: 'nomy is opening',
      support: 'You have explored a few parts of the app. nomy is more open and ready to support you.',
    };
  }

  if (featureCount >= 1 || emotionReads >= 1) {
    return {
      state: 'settling',
      headline: 'nomy is settling',
      support: 'You have started using the app. nomy is settling into the space with you.',
    };
  }

  return {
    state: 'guarded',
    headline: 'nomy is sleeping',
    support: 'A small step is enough. nomy can settle slowly as you use the app.',
  };
}

function normalizeAvatarState(state: string): AvatarVisualState {
  if (state === 'opening' || state === 'settling') {
    return state;
  }

  return 'guarded';
}

function strongerAvatarState(first: AvatarVisualState, second: AvatarVisualState): AvatarVisualState {
  const rank: Record<AvatarVisualState, number> = {
    guarded: 0,
    settling: 1,
    opening: 2,
  };

  return rank[first] >= rank[second] ? first : second;
}

function lifeForAvatarState(state: AvatarVisualState) {
  if (state === 'opening') {
    return {
      label: 'opening',
      headline: 'nomy is opening',
      panelText: 'nomy is active now. You can ask for support or choose your own next step.',
      badge: 'open',
      pulseOpacity: [0.96, 1],
      pulseScale: [1, 1.055],
    };
  }

  if (state === 'settling') {
    return {
      label: 'settling',
      headline: 'nomy is settling',
      panelText: 'Using the app a little helps nomy settle into the space. You can keep going at your pace.',
      badge: 'settle',
      pulseOpacity: [0.86, 0.98],
      pulseScale: [0.99, 1.035],
    };
  }

  return {
    label: 'sleeping',
    headline: 'nomy is sleeping',
    panelText: 'nomy is resting while you arrive. Using the app gently helps him settle into the space.',
    badge: 'sleep',
    pulseOpacity: [0.68, 0.84],
    pulseScale: [0.97, 1.01],
  };
}

function paletteForAvatarState(state: AvatarVisualState) {
  if (state === 'opening') {
    return {
      panel: '#24103f',
      glow: 'rgba(214, 203, 255, 0.65)',
      chip: '#e6deff',
      launcher: '#efe8ff',
      border: '#ccbdf6',
    };
  }

  if (state === 'settling') {
    return {
      panel: '#2a1347',
      glow: 'rgba(198, 183, 255, 0.52)',
      chip: '#ddd3ff',
      launcher: '#ece4ff',
      border: '#cdbff7',
    };
  }

  return {
    panel: '#321353',
    glow: 'rgba(177, 154, 245, 0.34)',
    chip: '#d6cafb',
    launcher: '#ece4ff',
    border: '#cdbff7',
  };
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    elevation: 999,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 7,
  },
  avatarScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 0, 61, 0.16)',
  },
  avatarPanel: {
    marginHorizontal: 18,
    marginBottom: 176,
    borderRadius: 28,
    padding: 16,
    gap: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1ebff',
  },
  closeButtonText: { color: '#1f003d', fontSize: 24, lineHeight: 26, fontWeight: '500' },
  avatarVisualRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 26 },
  avatarVisualGlow: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  blobWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobWrapLarge: {
    width: 104,
    height: 104,
    transform: [{ scale: 0.9 }],
  },
  blobWrapSmall: {
    width: 50,
    height: 50,
  },
  blobWrapSleeping: {
    transform: [{ rotate: '-8deg' }],
  },
  blobCocoon: {
    position: 'absolute',
    width: 118,
    height: 92,
    borderRadius: 38,
    backgroundColor: '#b8b0f4',
    borderWidth: 2.4,
    borderColor: '#1f1635',
    transform: [{ translateX: 8 }],
  },
  blobCocoonSmall: {
    width: 45,
    height: 36,
    borderRadius: 15,
    borderWidth: 1.4,
  },
  blobBody: {
    position: 'absolute',
    width: 88,
    height: 94,
    borderTopLeftRadius: 46,
    borderTopRightRadius: 46,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 20,
    backgroundColor: '#fffef7',
    borderWidth: 2.4,
    borderColor: '#1f1635',
    alignItems: 'center',
  },
  blobBodySmall: {
    width: 34,
    height: 42,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1.4,
  },
  blobBodySleeping: {
    width: 78,
    height: 74,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 24,
    transform: [{ translateX: -8 }, { translateY: 10 }],
  },
  blobBodySleepingSmall: {
    width: 32,
    height: 32,
    borderRadius: 14,
    transform: [{ translateY: 4 }],
  },
  blobCheek: {
    position: 'absolute',
    top: 31,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ded8ff',
  },
  blobCheekSmall: {
    top: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  blobCheekLeft: { left: 13 },
  blobCheekRight: { right: 13 },
  blobCheekLeftSmall: { left: 6 },
  blobCheekRightSmall: { right: 6 },
  blobEye: {
    position: 'absolute',
    top: 33,
    width: 11,
    height: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#1f1635',
    borderRadius: 8,
  },
  blobEyeSmall: {
    top: 15,
    width: 5,
    height: 3,
    borderBottomWidth: 1.4,
  },
  blobEyeLeft: { left: 31 },
  blobEyeRight: { right: 31 },
  blobEyeLeftSmall: { left: 13 },
  blobEyeRightSmall: { right: 13 },
  blobMouth: {
    position: 'absolute',
    top: 50,
    width: 20,
    height: 7,
    borderBottomWidth: 2,
    borderBottomColor: '#1f1635',
    borderRadius: 8,
  },
  blobMouthSmall: {
    top: 23,
    width: 8,
    height: 4,
    borderBottomWidth: 1.4,
  },
  blobSideBump: {
    position: 'absolute',
    right: -25,
    top: 42,
    width: 32,
    height: 34,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    backgroundColor: '#fffef7',
    borderWidth: 2.4,
    borderLeftWidth: 0,
    borderColor: '#1f1635',
  },
  blobSideBumpSmall: {
    right: -9,
    top: 19,
    width: 12,
    height: 15,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1.4,
    borderLeftWidth: 0,
  },
  blobArm: {
    position: 'absolute',
    right: 19,
    top: 47,
    width: 24,
    height: 25,
    borderLeftWidth: 2.4,
    borderBottomWidth: 2.4,
    borderColor: '#1f1635',
    borderBottomLeftRadius: 10,
  },
  blobArmSmall: {
    right: 7,
    top: 21,
    width: 9,
    height: 10,
    borderLeftWidth: 1.4,
    borderBottomWidth: 1.4,
  },
  blobFootLine: {
    position: 'absolute',
    bottom: -1,
    width: 2.4,
    height: 14,
    backgroundColor: '#1f1635',
  },
  blobFootLineSmall: {
    height: 7,
    width: 1.4,
  },
  blobBlanket: {
    position: 'absolute',
    bottom: 17,
    left: 13,
    width: 86,
    height: 42,
    borderRadius: 23,
    backgroundColor: '#b8b0f4',
    borderWidth: 2.4,
    borderColor: '#1f1635',
  },
  blobBlanketSmall: {
    bottom: 8,
    width: 39,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.4,
  },
  avatarMoodWrap: { flex: 1, gap: 6 },
  avatarHeadline: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
  },
  avatarSupport: {
    color: '#ebe4ff',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  recommendationButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#19003d',
  },
  recommendationButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  homeRestButton: {
    minHeight: 36,
    alignSelf: 'center',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  homeRestButtonText: { color: '#d9cffd', fontSize: 14, fontWeight: '800' },
  avatarLauncher: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 66,
    height: 66,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#1f003d',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 1000,
    elevation: 1000,
  },
  avatarLauncherButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLauncherGlow: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarLauncherBadge: {
    position: 'absolute',
    top: -8,
    right: -16,
    width: 42,
    minHeight: 20,
    borderRadius: 999,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 22, 53, 0.16)',
  },
  avatarLauncherBadgeText: { color: '#22163c', fontSize: 8, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' },
});

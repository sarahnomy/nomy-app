import { router } from 'expo-router';
import { PropsWithChildren, useMemo, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';

import HomeScreen from '@/app/(tabs)';

const EDGE_WIDTH = 42;
const SWIPE_DISTANCE = 96;
const SCREEN_WIDTH = Dimensions.get('window').width;

export function SwipeToHome({ children }: PropsWithChildren) {
  const [translateX] = useState(() => new Animated.Value(0));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
      onMoveShouldSetPanResponderCapture: (event, gesture) => {
        const startsAtLeftEdge = event.nativeEvent.pageX <= EDGE_WIDTH;
        const movesRight = gesture.dx > 18;
        const mostlyHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6;

        return startsAtLeftEdge && movesRight && mostlyHorizontal;
      },
      onMoveShouldSetPanResponder: (_, gesture) => {
        const movesRight = gesture.dx > 18;
        const mostlyHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6;

        return movesRight && mostlyHorizontal;
      },
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(Math.max(0, Math.min(gesture.dx, SCREEN_WIDTH)));
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx >= SWIPE_DISTANCE && Math.abs(gesture.dy) < 70) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            router.replace('/');
            translateX.setValue(0);
          });
          return;
        }

        Animated.spring(translateX, {
          toValue: 0,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }).start();
      },
      }),
    [translateX],
  );

  const shadowOpacity = translateX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [0, 0.18],
  });

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.homePreview}>
        <HomeScreen />
      </View>
      <Animated.View
        style={[
          styles.swipePage,
          {
            shadowOpacity,
            transform: [{ translateX }],
          },
        ]}>
        {children}
      </Animated.View>
      <View style={styles.edgeZone} {...panResponder.panHandlers} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#fffaf2' },
  homePreview: {
    ...StyleSheet.absoluteFill,
  },
  swipePage: {
    flex: 1,
    backgroundColor: '#fffaf2',
    shadowColor: '#1f003d',
    shadowRadius: 18,
    shadowOffset: { width: -8, height: 0 },
  },
  edgeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_WIDTH,
    zIndex: 20,
  },
});

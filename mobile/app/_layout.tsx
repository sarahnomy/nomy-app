import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { hydrateNightModePreference } from '@/constants/color-mode';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void hydrateNightModePreference();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animation: 'ios_from_right',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="support-right-now" options={{ headerShown: false }} />
        <Stack.Screen name="emotionize-reflection" options={{ headerShown: false }} />
        <Stack.Screen name="express-response" options={{ headerShown: false }} />
        <Stack.Screen name="express-capture" options={{ headerShown: false }} />
        <Stack.Screen name="toolkit-breathing" options={{ headerShown: false }} />
        <Stack.Screen name="toolkit-puzzles" options={{ headerShown: false }} />
        <Stack.Screen name="dailies-morning" options={{ headerShown: false }} />
        <Stack.Screen name="dailies-evening" options={{ headerShown: false }} />
        <Stack.Screen name="dailies-reflections" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

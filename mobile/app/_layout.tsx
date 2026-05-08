import {
  DMSans_300Light,
  DMSans_300Light_Italic,
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_500Medium_Italic,
  DMSans_600SemiBold,
  DMSans_600SemiBold_Italic,
  DMSans_700Bold,
  DMSans_700Bold_Italic,
  DMSans_800ExtraBold,
  DMSans_800ExtraBold_Italic,
  DMSans_900Black,
  DMSans_900Black_Italic,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    DMSans_300Light,
    DMSans_300Light_Italic,
    DMSans_400Regular,
    DMSans_400Regular_Italic,
    DMSans_500Medium,
    DMSans_500Medium_Italic,
    DMSans_600SemiBold,
    DMSans_600SemiBold_Italic,
    DMSans_700Bold,
    DMSans_700Bold_Italic,
    DMSans_800ExtraBold,
    DMSans_800ExtraBold_Italic,
    DMSans_900Black,
    DMSans_900Black_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="toolkit-breathing" options={{ headerShown: false }} />
        <Stack.Screen name="toolkit-puzzles" options={{ headerShown: false }} />
        <Stack.Screen name="dailies-morning" options={{ headerShown: false }} />
        <Stack.Screen name="dailies-evening" options={{ headerShown: false }} />
        <Stack.Screen name="dailies-reflections" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { useNightModeEnabled } from '@/constants/color-mode';

export const lightAppTheme = {
  screen: '#ffffff',
  softScreen: '#fffaf2',
  card: '#ffffff',
  cardSoft: '#f8f6fb',
  text: '#1f1635',
  muted: '#5e4f79',
  subtle: '#817690',
  border: 'rgba(31, 22, 53, 0.1)',
  divider: 'rgba(31, 22, 53, 0.08)',
  tabBar: 'rgba(255, 255, 255, 0.92)',
  input: '#ffffff',
  press: '#f7f5fb',
} as const;

export const darkAppTheme = {
  screen: '#171120',
  softScreen: '#1d1528',
  card: '#241a34',
  cardSoft: '#2c203d',
  text: '#f7f1ff',
  muted: '#c8bbd9',
  subtle: '#a99cbb',
  border: 'rgba(247, 241, 255, 0.14)',
  divider: 'rgba(247, 241, 255, 0.1)',
  tabBar: 'rgba(28, 20, 39, 0.92)',
  input: '#241a34',
  press: '#302342',
} as const;

export function useAppTheme() {
  return useNightModeEnabled() ? darkAppTheme : lightAppTheme;
}

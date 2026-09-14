import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/nomy-type';

type BackControlProps = {
  label: string;
  onPress?: () => void;
};

export function BackControl({ label, onPress }: BackControlProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
      <Text style={styles.chevron}>‹</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    alignSelf: 'flex-start',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  chevron: { color: '#3a2c6b', fontSize: 28, lineHeight: 30, fontWeight: '400' },
  label: { color: '#3a2c6b', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
});

import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const menu = [
  { title: 'Morning', href: '/dailies-morning', color: '#e1dcf9' },
  { title: 'Evening', href: '/dailies-evening', color: '#564d74', dark: true },
  { title: 'Reflections', href: '/dailies-reflections', color: '#f1f1ff' },
  { title: 'Weekly Overview', href: '/dailies-reflections', color: '#f4f5f7' },
] as const;

export default function DailiesScreen() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 4 && hour < 14
      ? 'Good Morning'
      : "You've reached the quiet end of the day. Would you like to reflect on how things went?";
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Main Menu</Text>
          </Pressable>
        </Link>

        <View style={styles.header}>
          <Text style={styles.title}>Daily Check-ins</Text>
          <Text style={styles.subtitle}>{greeting}</Text>
        </View>

        <View style={styles.menu}>
          {menu.map((item) => (
            <Link key={item.title} href={item.href} asChild>
              <Pressable style={[styles.oval, { backgroundColor: item.color }]}>
                <Text style={[styles.ovalText, item.dark && styles.ovalTextLight]}>{item.title}</Text>
              </Pressable>
            </Link>
          ))}
        </View>

        <View style={styles.about}>
          <Text style={styles.aboutTitle}>About Check-in</Text>
          <Text style={styles.aboutText}>
            Each morning, you’ll be invited to write a short affirmation — something that grounds or encourages you.
          </Text>
          <Text style={styles.aboutText}>
            Then, you can set one main goal for the day and list any tasks or checklists that help you move toward it.
          </Text>
          <Text style={styles.aboutText}>
            In the evening, Check-in will gently help you reflect on how the day felt.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 20 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  header: { alignItems: 'center', gap: 8, paddingTop: 8 },
  title: { color: '#1f003d', textAlign: 'center', fontSize: 28, fontWeight: '400', lineHeight: 35 },
  subtitle: { color: '#5e4f79', textAlign: 'center', fontSize: 17, lineHeight: 24 },
  menu: { gap: 14 },
  oval: { minHeight: 86, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#110c28', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  ovalText: { color: '#1f003d', fontSize: 20, fontWeight: '400' },
  ovalTextLight: { color: '#ffffff' },
  about: { borderRadius: 8, backgroundColor: '#f1f1ff', padding: 16, gap: 10 },
  aboutTitle: { color: '#1f003d', fontSize: 20, fontWeight: '600' },
  aboutText: { color: '#1f003d', fontSize: 16, lineHeight: 25 },
});

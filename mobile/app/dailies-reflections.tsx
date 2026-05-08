import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

export default function DailiesReflectionsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Link href="/dailies" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>← Check-in</Text>
          </Pressable>
        </Link>

        <Text style={styles.title}>Reflections</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Your saved check-ins will appear here once the mobile app is connected to the Django backend.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 18, paddingBottom: 34, gap: 18 },
  backButton: { alignSelf: 'flex-start', borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e6e0f5', paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { color: '#3a2c6b', fontSize: 15, fontWeight: '500' },
  title: { color: '#2e2840', textAlign: 'center', fontSize: 30, fontWeight: '600', lineHeight: 38 },
  card: { borderRadius: 8, backgroundColor: '#f1f1ff', padding: 18 },
  cardText: { color: '#1f003d', fontSize: 16, lineHeight: 25, textAlign: 'center' },
});

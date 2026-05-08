import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/nomy-type';

const steps = [
  'Build the native screens',
  'Add a Django API',
  'Connect Expo to the API',
  'Test on real devices',
  'Publish with EAS',
];

export default function BuildGuideScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Your route from web to mobile.</Text>
          <Text style={styles.summaryText}>
            We will move one piece at a time: screens first, data next, store builds last.
          </Text>
        </View>

        <View style={styles.list}>
          {steps.map((step, index) => (
            <View key={step} style={styles.row}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <Text style={styles.rowText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7fbf8',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 34,
    gap: 18,
  },
  summary: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9e1',
    padding: 18,
    gap: 8,
  },
  summaryTitle: {
    color: '#182520',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29,
  },
  summaryText: {
    color: '#4f625b',
    fontSize: 16,
    lineHeight: 23,
  },
  list: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9e1',
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dbe9e1',
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dff3e8',
  },
  numberText: {
    color: '#276653',
    fontSize: 15,
    fontWeight: '800',
  },
  rowText: {
    flex: 1,
    color: '#182520',
    fontSize: 17,
    fontWeight: '700',
  },
});

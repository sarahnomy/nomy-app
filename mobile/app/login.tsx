import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiUrl } from '@/constants/api';
import { Text, TextInput } from '@/components/nomy-type';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/mobile/login/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || 'Login failed. Please try again.');
        return;
      }

      router.replace('/');
    } catch {
      setError('Could not reach the server. Check the backend URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/images/nomy-logo-new.png')} style={styles.logo} contentFit="contain" />

        <View style={styles.card}>
          <Text style={styles.title}>Login to Your Account</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              placeholderTextColor="#6b647d"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="current-password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Your password"
              placeholderTextColor="#6b647d"
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={handleLogin} style={[styles.button, isSubmitting && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Logging in...' : 'Log In'}</Text>
          </Pressable>

          <Text style={styles.help}>You can pause and come back anytime.</Text>
          <Text style={styles.note}>Use the same username and password as your nomy web account.</Text>
        </View>

        <Link href="/register" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Create an account</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eaeaf5' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22, gap: 18 },
  logo: { width: 190, height: 120, alignSelf: 'center' },
  card: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1dcf9',
    padding: 20,
    gap: 16,
    shadowColor: '#120e20',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  title: { color: '#2e2840', fontSize: 26, fontWeight: '800', lineHeight: 32 },
  field: { gap: 7 },
  label: { color: '#2e2840', fontSize: 16, fontWeight: '700' },
  input: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e1dcf9',
    paddingHorizontal: 14,
    color: '#2e2840',
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  error: { color: '#9b2448', fontSize: 15, lineHeight: 21 },
  button: {
    minHeight: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d3cbf9',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#1e1635', fontSize: 17, fontWeight: '800' },
  help: { color: '#6b647d', fontSize: 15, lineHeight: 21 },
  note: { color: '#6b647d', fontSize: 14, lineHeight: 20 },
  secondaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#3d2e7a', fontSize: 16, fontWeight: '700' },
});

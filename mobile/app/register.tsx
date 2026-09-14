import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiUrl } from '@/constants/api';
import { Text, TextInput } from '@/components/nomy-type';
import { setSessionUser } from '@/constants/session';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (isSubmitting) return;

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/mobile/register/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password1,
          password2,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.error || 'Could not create your account.');
        return;
      }

      if (data?.user) {
        await setSessionUser(data.user);
        router.replace('/profile');
        return;
      }

      setSuccess(data?.message || 'Account created.');
      setTimeout(() => {
        router.replace('/profile');
      }, 1200);
    } catch {
      setError('Could not reach the server. Check the backend URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
        style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.replace('/profile')} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>← Profile</Text>
        </Pressable>

        <View style={styles.authHeader}>
          <Text style={styles.wordmark}>nomy</Text>
          <Text style={styles.subtitle}>Create your account to start using nomy.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Join nomy</Text>
            <Text style={styles.lead}>A few simple steps. Take your time.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              placeholder="e.g. sarah_a"
              placeholderTextColor="#6b647d"
              style={styles.input}
            />
            <Text style={styles.help}>Pick a simple name you’ll remember.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#6b647d"
              style={styles.input}
            />
            <Text style={styles.help}>We’ll use this for account emails.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              value={password1}
              onChangeText={setPassword1}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor="#6b647d"
              style={styles.input}
            />
            <Text style={styles.help}>At least 8 characters is enough.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password confirmation</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry
              placeholder="Type the same password again"
              placeholderTextColor="#6b647d"
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Pressable onPress={handleRegister} style={[styles.button, isSubmitting && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Signing up...' : 'Sign up'}</Text>
          </Pressable>

          <Text style={styles.note}>We’ll send a verification link to your email before your first login.</Text>
        </View>

        <Link href="/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Already have an account? Sign in</Text>
          </Pressable>
        </Link>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fffaf2' },
  keyboardView: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingBottom: 116, gap: 18 },
  homeButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ded7ec',
    paddingHorizontal: 14,
  },
  homeButtonText: { color: '#1f003d', fontSize: 14, fontWeight: '800' },
  authHeader: { alignItems: 'center', gap: 6 },
  wordmark: { color: '#24004b', fontSize: 42, lineHeight: 48, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#5e4f79', fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'center', maxWidth: 300 },
  card: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 22, 53, 0.08)',
    padding: 22,
    gap: 16,
    shadowColor: '#120e20',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  cardHeader: { gap: 6 },
  title: { color: '#1f1635', fontSize: 30, fontWeight: '900', lineHeight: 36, letterSpacing: -0.5 },
  lead: { color: '#5e4f79', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  field: { gap: 8 },
  label: { color: '#1f1635', fontSize: 14, fontWeight: '800' },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ded7ec',
    paddingHorizontal: 16,
    color: '#1f1635',
    backgroundColor: '#fbf9ff',
    fontSize: 16,
  },
  error: { color: '#9b2448', fontSize: 15, lineHeight: 21, fontWeight: '700' },
  success: { color: '#2f6b2f', fontSize: 15, lineHeight: 21, fontWeight: '700' },
  button: {
    minHeight: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f003d',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  help: { color: '#6b647d', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  note: { color: '#6b647d', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ded7ec',
  },
  secondaryText: { color: '#1f003d', fontSize: 16, fontWeight: '800' },
});

import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiUrl } from '@/constants/api';
import { Text, TextInput } from '@/components/nomy-type';

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

      setSuccess(data?.message || 'Account created. Please verify your email before logging in.');
      setTimeout(() => {
        router.replace('/login');
      }, 1200);
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.lead}>A few simple steps. Take your time.</Text>

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

          <Text style={styles.help}>You can pause and come back anytime.</Text>
          <Text style={styles.note}>We’ll send a verification link to your email before your first login.</Text>
        </View>

        <Link href="/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Already have an account? Sign in</Text>
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
    gap: 15,
    shadowColor: '#120e20',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  title: { color: '#2e2840', fontSize: 26, fontWeight: '800', lineHeight: 32 },
  lead: { color: '#6b647d', fontSize: 16, lineHeight: 22 },
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
  success: { color: '#2f6b2f', fontSize: 15, lineHeight: 21 },
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

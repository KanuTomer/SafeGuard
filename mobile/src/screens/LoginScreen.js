import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { MessageBanner } from '../components/MessageBanner';
import { getApiErrorMessage } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Unable to sign in.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        testID="login-screen"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SafeGuard Mobile</Text>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.description}>
              Use your SafeGuard account to start SOS sessions and send location
              updates.
            </Text>
          </View>

          <MessageBanner message={error} type="error" />

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              style={styles.input}
              testID="email-input"
              value={email}
            />
            <TextInput
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              testID="password-input"
              value={password}
            />
            <AppButton
              disabled={!email || !password}
              loading={isSubmitting}
              onPress={handleLogin}
              testID="login-button"
              title="Sign in"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 24,
    padding: 24,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 24,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  form: {
    gap: 14,
  },
  header: {
    gap: 10,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function MessageBanner({ message, type = 'info' }) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole={type === 'error' ? 'alert' : 'summary'}
      style={[
        styles.container,
        type === 'error' && styles.error,
        type === 'success' && styles.success,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    padding: 12,
  },
  error: {
    backgroundColor: '#fee2e2',
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  text: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
});

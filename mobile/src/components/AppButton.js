import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function AppButton({
  disabled = false,
  loading = false,
  onPress,
  testID,
  title,
  variant = 'primary',
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        variant === 'danger' && styles.danger,
        variant === 'secondary' && styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContent}>
          <ActivityIndicator
            color={variant === 'secondary' ? '#1d4ed8' : '#ffffff'}
          />
          <Text
            style={[
              styles.text,
              variant === 'secondary' && styles.secondaryText,
            ]}
          >
            {title}
          </Text>
        </View>
      ) : (
        <Text
          style={[styles.text, variant === 'secondary' && styles.secondaryText]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  disabled: {
    opacity: 0.55,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.82,
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff',
  },
  secondaryText: {
    color: '#1d4ed8',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

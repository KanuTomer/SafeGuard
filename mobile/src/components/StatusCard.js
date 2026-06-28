import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatDateTime, formatLocation } from '../utils/formatters';

export function StatusCard({ emergency }) {
  const isActive = emergency?.status === 'active';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Emergency status</Text>
      <Text style={[styles.status, isActive ? styles.active : styles.idle]}>
        {isActive ? 'SOS active' : 'No active SOS'}
      </Text>
      {emergency ? (
        <>
          <Text style={styles.detail}>
            Started {formatDateTime(emergency.startedAt)}
          </Text>
          <Text style={styles.detail}>
            Last known location: {formatLocation(emergency.lastKnownLocation)}
          </Text>
        </>
      ) : (
        <Text style={styles.detail}>
          Start SOS when you need to begin tracking.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  active: {
    color: '#dc2626',
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  detail: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  idle: {
    color: '#2563eb',
  },
  label: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 24,
    fontWeight: '800',
  },
});

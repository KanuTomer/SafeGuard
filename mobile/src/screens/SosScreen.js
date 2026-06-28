import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { MessageBanner } from '../components/MessageBanner';
import { StatusCard } from '../components/StatusCard';
import { getApiErrorMessage } from '../services/apiClient';
import {
  createEmergency,
  createLocation,
  endEmergency,
  getActiveEmergency,
} from '../services/emergencyService';
import { getCurrentLocation } from '../utils/location';
import { useAuth } from '../hooks/useAuth';

export function SosScreen() {
  const { logout, user } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [success, setSuccess] = useState('');

  const loadActiveEmergency = useCallback(async () => {
    try {
      setIsLoading(true);
      const emergency = await getActiveEmergency();
      setActiveEmergency(emergency);
      setError('');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load SOS status.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveEmergency();
  }, [loadActiveEmergency]);

  const handleStartSos = async () => {
    setError('');
    setSuccess('');
    setIsStarting(true);

    try {
      const location = await getCurrentLocation();
      const emergency = await createEmergency({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.recordedAt,
      });
      setActiveEmergency(emergency);
      setSuccess('SOS started. Your initial location was saved.');
    } catch (startError) {
      setError(getApiErrorMessage(startError, 'Unable to start SOS.'));
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSos = async () => {
    if (!activeEmergency) {
      return;
    }

    setError('');
    setSuccess('');
    setIsEnding(true);

    try {
      await endEmergency(activeEmergency.id);
      setActiveEmergency(null);
      setSuccess('SOS ended.');
    } catch (endError) {
      setError(getApiErrorMessage(endError, 'Unable to end SOS.'));
    } finally {
      setIsEnding(false);
    }
  };

  const handleSendLocation = async () => {
    if (!activeEmergency) {
      setError('Start SOS before sending location updates.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSendingLocation(true);

    try {
      const location = await getCurrentLocation();
      await createLocation(activeEmergency.id, location);
      const refreshedEmergency = await getActiveEmergency();
      setActiveEmergency(refreshedEmergency);
      setSuccess('Location update sent.');
    } catch (locationError) {
      setError(
        getApiErrorMessage(locationError, 'Unable to send current location.'),
      );
    } finally {
      setIsSendingLocation(false);
    }
  };

  const isBusy = isLoading || isStarting || isEnding || isSendingLocation;

  return (
    <SafeAreaView style={styles.safeArea} testID="sos-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadActiveEmergency}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SafeGuard</Text>
            <Text style={styles.title}>SOS control</Text>
          </View>
          <AppButton
            onPress={logout}
            testID="logout-button"
            title="Logout"
            variant="secondary"
          />
        </View>

        <Text style={styles.greeting}>
          Signed in as {user?.name || 'SafeGuard user'}
        </Text>

        <MessageBanner message={error} type="error" />
        <MessageBanner message={success} type="success" />

        <StatusCard emergency={activeEmergency} />

        <View style={styles.actions}>
          {activeEmergency ? (
            <>
              <AppButton
                disabled={isBusy}
                loading={isSendingLocation}
                onPress={handleSendLocation}
                testID="send-location-button"
                title="Send current location"
              />
              <AppButton
                disabled={isBusy}
                loading={isEnding}
                onPress={handleEndSos}
                testID="end-sos-button"
                title="End SOS"
                variant="danger"
              />
            </>
          ) : (
            <AppButton
              disabled={isBusy}
              loading={isStarting}
              onPress={handleStartSos}
              testID="start-sos-button"
              title="Start SOS"
              variant="danger"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  content: {
    gap: 20,
    padding: 24,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  greeting: {
    color: '#4b5563',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  title: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '800',
  },
});

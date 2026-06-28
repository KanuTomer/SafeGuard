import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'SafeGuard location access',
      message:
        'SafeGuard uses your location while you manually send SOS updates.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error('Location permission is required to send your position.');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          recordedAt: new Date(position.timestamp).toISOString(),
        });
      },
      error => {
        reject(new Error(error.message || 'Unable to read current location.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

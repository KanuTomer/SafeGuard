import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import App from '../App';
import { getCurrentLocation } from '../src/utils/location';
import { getCurrentUser, loginUser } from '../src/services/authService';
import {
  createEmergency,
  createLocation,
  endEmergency,
  getActiveEmergency,
} from '../src/services/emergencyService';

jest.mock('@react-native-async-storage/async-storage', () =>
  (() => {
    const store = {};

    return {
      clear: jest.fn(async () => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      getItem: jest.fn(async key => store[key] || null),
      multiRemove: jest.fn(async keys => {
        keys.forEach(key => delete store[key]);
      }),
      removeItem: jest.fn(async key => {
        delete store[key];
      }),
      setItem: jest.fn(async (key, value) => {
        store[key] = value;
      }),
    };
  })(),
);

jest.mock('react-native-safe-area-context', () => {
  const ReactForMock = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }) =>
      ReactForMock.createElement(View, null, children),
    SafeAreaView: ({ children, ...props }) =>
      ReactForMock.createElement(View, props, children),
  };
});

jest.mock('@react-navigation/native', () => {
  const ReactForMock = require('react');
  return {
    NavigationContainer: ({ children }) =>
      ReactForMock.createElement(ReactForMock.Fragment, null, children),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const ReactForMock = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) =>
        ReactForMock.createElement(ReactForMock.Fragment, null, children),
      Screen: ({ component: Component }) =>
        ReactForMock.createElement(Component),
    }),
  };
});

jest.mock('../src/services/authService', () => ({
  getCurrentUser: jest.fn(),
  loginUser: jest.fn(),
}));

jest.mock('../src/services/emergencyService', () => ({
  createEmergency: jest.fn(),
  createLocation: jest.fn(),
  endEmergency: jest.fn(),
  getActiveEmergency: jest.fn(),
}));

jest.mock('../src/utils/location', () => ({
  getCurrentLocation: jest.fn(),
}));

const user = {
  id: 'user-1',
  name: 'Kanu Tomer',
  email: 'kanu@example.com',
};

const activeEmergency = {
  id: 'emergency-1',
  status: 'active',
  startedAt: '2026-06-28T10:00:00.000Z',
  lastKnownLocation: {
    latitude: 28.6139,
    longitude: 77.209,
    accuracy: 12,
    timestamp: '2026-06-28T10:05:00.000Z',
  },
};

const currentLocation = {
  latitude: 28.7,
  longitude: 77.3,
  accuracy: 8,
  recordedAt: '2026-06-28T10:06:00.000Z',
};

const flushPromises = async () => {
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

const renderApp = async () => {
  let renderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await flushPromises();

  return renderer;
};

const findByTestId = (renderer, testID) => {
  return renderer.root.findByProps({ testID });
};

const waitForTestId = async (renderer, testID) => {
  let found;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await flushPromises();
    const matches = renderer.root.findAllByProps({ testID });

    if (matches.length > 0) {
      found = matches[0];
      break;
    }
  }

  if (!found) {
    throw new Error(`Unable to find testID: ${testID}`);
  }

  return found;
};

const press = async element => {
  await ReactTestRenderer.act(async () => {
    await element.props.onPress();
  });
  await flushPromises();
};

const changeText = async (element, value) => {
  await ReactTestRenderer.act(async () => {
    element.props.onChangeText(value);
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  loginUser.mockResolvedValue({ token: 'test-token', user });
  getCurrentUser.mockResolvedValue(user);
  getActiveEmergency.mockResolvedValue(null);
  createEmergency.mockResolvedValue(activeEmergency);
  endEmergency.mockResolvedValue({ ...activeEmergency, status: 'ended' });
  createLocation.mockResolvedValue({ id: 'location-1', ...currentLocation });
  getCurrentLocation.mockResolvedValue(currentLocation);
});

test('unauthenticated app shows login screen', async () => {
  const renderer = await renderApp();

  expect(await waitForTestId(renderer, 'login-screen')).toBeTruthy();
});

test('login submits credentials and stores token', async () => {
  const renderer = await renderApp();

  await waitForTestId(renderer, 'login-screen');
  await changeText(findByTestId(renderer, 'email-input'), 'kanu@example.com');
  await changeText(findByTestId(renderer, 'password-input'), 'Password123');
  await press(findByTestId(renderer, 'login-button'));

  expect(loginUser).toHaveBeenCalledWith({
    email: 'kanu@example.com',
    password: 'Password123',
  });
  expect(await AsyncStorage.getItem('safeguard.mobile.token')).toBe(
    'test-token',
  );
});

test('authenticated app shows SOS screen', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));

  const renderer = await renderApp();

  expect(await waitForTestId(renderer, 'sos-screen')).toBeTruthy();
});

test('active emergency state renders correctly', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));
  getActiveEmergency.mockResolvedValue(activeEmergency);

  const renderer = await renderApp();

  await waitForTestId(renderer, 'sos-screen');
  expect(findByTestId(renderer, 'send-location-button')).toBeTruthy();
  expect(findByTestId(renderer, 'end-sos-button')).toBeTruthy();
});

test('start SOS calls emergency create service', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));
  const renderer = await renderApp();

  await waitForTestId(renderer, 'start-sos-button');
  await press(findByTestId(renderer, 'start-sos-button'));

  expect(getCurrentLocation).toHaveBeenCalled();
  expect(createEmergency).toHaveBeenCalledWith({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    accuracy: currentLocation.accuracy,
    timestamp: currentLocation.recordedAt,
  });
});

test('end SOS calls emergency end service', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));
  getActiveEmergency.mockResolvedValue(activeEmergency);
  const renderer = await renderApp();

  await waitForTestId(renderer, 'end-sos-button');
  await press(findByTestId(renderer, 'end-sos-button'));

  expect(endEmergency).toHaveBeenCalledWith(activeEmergency.id);
});

test('send location requests current position and posts location', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));
  getActiveEmergency.mockResolvedValue(activeEmergency);
  const renderer = await renderApp();

  await waitForTestId(renderer, 'send-location-button');
  await press(findByTestId(renderer, 'send-location-button'));

  expect(getCurrentLocation).toHaveBeenCalled();
  expect(createLocation).toHaveBeenCalledWith(
    activeEmergency.id,
    currentLocation,
  );
});

test('denied location permission shows an error', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));
  getCurrentLocation.mockRejectedValue(
    new Error('Location permission is required.'),
  );
  const renderer = await renderApp();

  await waitForTestId(renderer, 'start-sos-button');
  await press(findByTestId(renderer, 'start-sos-button'));

  expect(createEmergency).not.toHaveBeenCalled();
  expect(
    renderer.root.findByProps({ accessibilityRole: 'alert' }),
  ).toBeTruthy();
});

test('logout clears stored token', async () => {
  await AsyncStorage.setItem('safeguard.mobile.token', 'test-token');
  await AsyncStorage.setItem('safeguard.mobile.user', JSON.stringify(user));
  const renderer = await renderApp();

  await waitForTestId(renderer, 'logout-button');
  await press(findByTestId(renderer, 'logout-button'));

  expect(await AsyncStorage.getItem('safeguard.mobile.token')).toBeNull();
});

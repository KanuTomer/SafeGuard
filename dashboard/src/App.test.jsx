import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { AuthProvider } from './context/AuthContext';

vi.mock('./services/authService', () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
}));

vi.mock('./services/emergencyService', () => ({
  getActiveEmergency: vi.fn(),
  getEmergency: vi.fn(),
  listEmergencies: vi.fn(),
  listEvidence: vi.fn(),
  listLocations: vi.fn(),
}));

vi.mock('./services/userService', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('./services/socketService', () => ({
  createEmergencySocket: vi.fn(),
}));

const authService = await import('./services/authService');
const emergencyService = await import('./services/emergencyService');
const userService = await import('./services/userService');
const socketService = await import('./services/socketService');

const testUser = {
  id: 'user-1',
  name: 'Kanu Tomer',
  email: 'kanu@example.com',
  phone: '+911234567890',
};

const testProfile = {
  ...testUser,
  contacts: [
    {
      id: 'contact-1',
      name: 'Asha',
      phone: '+911111111111',
      email: 'asha@example.com',
      relationship: 'Friend',
    },
  ],
};

const activeEmergency = {
  id: 'emergency-1',
  status: 'active',
  startedAt: '2026-06-28T10:00:00.000Z',
  endedAt: null,
  lastKnownLocation: {
    latitude: 28.6139,
    longitude: 77.209,
    accuracy: 12,
    timestamp: '2026-06-28T10:05:00.000Z',
  },
  contactsSnapshot: testProfile.contacts,
};

const endedEmergency = {
  ...activeEmergency,
  id: 'emergency-2',
  status: 'ended',
  endedAt: '2026-06-28T11:00:00.000Z',
};

let latestSocket;

const createMockSocket = () => {
  const handlers = {};

  return {
    disconnect: vi.fn(),
    emit: vi.fn(),
    handlers,
    on: vi.fn((event, handler) => {
      handlers[event] = handler;
    }),
  };
};

const renderApp = (initialRoute = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
};

const seedAuthenticatedSession = () => {
  localStorage.setItem('safeguard.dashboard.token', 'test-token');
  localStorage.setItem('safeguard.dashboard.user', JSON.stringify(testUser));
  authService.getCurrentUser.mockResolvedValue(testUser);
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  latestSocket = createMockSocket();
  socketService.createEmergencySocket.mockReturnValue(latestSocket);
  authService.loginUser.mockResolvedValue({ token: 'test-token', user: testUser });
  authService.getCurrentUser.mockResolvedValue(testUser);
  emergencyService.getActiveEmergency.mockResolvedValue(activeEmergency);
  emergencyService.listEmergencies.mockResolvedValue([activeEmergency, endedEmergency]);
  emergencyService.getEmergency.mockResolvedValue(activeEmergency);
  emergencyService.listLocations.mockResolvedValue([
    {
      id: 'location-1',
      latitude: 28.6139,
      longitude: 77.209,
      accuracy: 12,
      recordedAt: '2026-06-28T10:05:00.000Z',
    },
  ]);
  emergencyService.listEvidence.mockResolvedValue([
    {
      id: 'evidence-1',
      type: 'image',
      originalName: 'door.png',
      size: 2048,
      secureUrl: 'https://example.com/door.png',
      notes: 'Front door',
      createdAt: '2026-06-28T10:10:00.000Z',
    },
  ]);
  userService.getUserProfile.mockResolvedValue(testProfile);
});

afterEach(() => {
  cleanup();
});

describe('SafeGuard dashboard', () => {
  it('submits the login form and stores auth state', async () => {
    const user = userEvent.setup();
    renderApp('/login');

    await user.type(screen.getByLabelText(/email/i), 'kanu@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith({
        email: 'kanu@example.com',
        password: 'Password123',
      });
    });
    expect(localStorage.getItem('safeguard.dashboard.token')).toBe('test-token');
  });

  it('redirects protected routes to login when unauthenticated', async () => {
    renderApp('/dashboard');

    expect(
      await screen.findByRole('heading', { name: /safeguard dashboard/i })
    ).toBeInTheDocument();
  });

  it('renders dashboard summary data from the API', async () => {
    seedAuthenticatedSession();
    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /emergency sessions/i })).toBeInTheDocument();
  });

  it('renders emergency details, locations, and evidence', async () => {
    seedAuthenticatedSession();
    renderApp('/emergencies/emergency-1');

    expect(await screen.findByRole('heading', { name: /emergency details/i })).toBeInTheDocument();
    expect(screen.getByText(/contacts snapshot/i)).toBeInTheDocument();
    expect(screen.getAllByText(/28.61390, 77.20900/i).length).toBeGreaterThan(0);
    expect(screen.getByText('door.png')).toBeInTheDocument();
  });

  it('logs out when auth bootstrap fails', async () => {
    seedAuthenticatedSession();
    authService.getCurrentUser.mockRejectedValue({
      response: { status: 401, data: { message: 'Invalid token' } },
    });

    renderApp('/dashboard');

    expect(
      await screen.findByRole('heading', { name: /safeguard dashboard/i })
    ).toBeInTheDocument();
    expect(localStorage.getItem('safeguard.dashboard.token')).toBeNull();
  });

  it('updates the location list when a realtime location is received', async () => {
    seedAuthenticatedSession();
    renderApp('/emergencies/emergency-1');

    await screen.findByRole('heading', { name: /emergency details/i });
    expect(screen.getAllByText(/28.61390, 77.20900/i).length).toBeGreaterThan(0);

    act(() => {
      latestSocket.handlers['location:created']({
        location: {
          id: 'location-2',
          latitude: 28.7,
          longitude: 77.3,
          accuracy: 8,
          recordedAt: '2026-06-28T10:06:00.000Z',
        },
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText(/28.70000, 77.30000/i).length).toBeGreaterThan(0);
    });
  });

  it('renders empty states for missing emergency data', async () => {
    seedAuthenticatedSession();
    emergencyService.getActiveEmergency.mockResolvedValue(null);
    emergencyService.listEmergencies.mockResolvedValue([]);

    renderApp('/dashboard');

    expect(await screen.findByText('No active emergency session.')).toBeInTheDocument();
    expect(screen.getByText('No emergency sessions have been created yet.')).toBeInTheDocument();
  });
});

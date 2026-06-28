import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { AuthProvider } from './context/AuthContext';

vi.mock('./services/authService', () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

vi.mock('./services/emergencyService', () => ({
  createEmergency: vi.fn(),
  createLocation: vi.fn(),
  endEmergency: vi.fn(),
  getActiveEmergency: vi.fn(),
  getEmergency: vi.fn(),
  listEmergencies: vi.fn(),
  listEvidence: vi.fn(),
  listLocations: vi.fn(),
  uploadEvidence: vi.fn(),
}));

vi.mock('./services/userService', () => ({
  createContact: vi.fn(),
  deleteContact: vi.fn(),
  getUserProfile: vi.fn(),
  updateContact: vi.fn(),
  updateUserProfile: vi.fn(),
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
  authService.registerUser.mockResolvedValue({ token: 'test-token', user: testUser });
  authService.getCurrentUser.mockResolvedValue(testUser);
  emergencyService.createEmergency.mockResolvedValue(activeEmergency);
  emergencyService.createLocation.mockResolvedValue({
    id: 'location-2',
    latitude: 28.7,
    longitude: 77.3,
    accuracy: 8,
    recordedAt: '2026-06-28T10:06:00.000Z',
  });
  emergencyService.endEmergency.mockResolvedValue(endedEmergency);
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
  emergencyService.uploadEvidence.mockResolvedValue({
    id: 'evidence-2',
    type: 'image',
    originalName: 'scene.png',
    size: 1024,
    secureUrl: 'https://example.com/scene.png',
    notes: 'Scene photo',
    createdAt: '2026-06-28T10:11:00.000Z',
  });
  userService.createContact.mockResolvedValue(testProfile.contacts[0]);
  userService.deleteContact.mockResolvedValue();
  userService.getUserProfile.mockResolvedValue(testProfile);
  userService.updateContact.mockResolvedValue(testProfile.contacts[0]);
  userService.updateUserProfile.mockResolvedValue(testProfile);
});

afterEach(() => {
  cleanup();
});

describe('SafeGuard dashboard', () => {
  it('submits the login form and stores auth state', async () => {
    renderApp('/login');

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'kanu@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith({
        email: 'kanu@example.com',
        password: 'Password123',
      });
    });
    expect(localStorage.getItem('safeguard.dashboard.token')).toBe('test-token');
  });

  it('registers a new account and stores auth state', async () => {
    renderApp('/login');

    fireEvent.click(screen.getByRole('button', { name: /create a demo account/i }));
    expect(screen.getByLabelText(/phone/i)).toHaveValue('+91');
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Kanu Tomer' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'kanu@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalledWith({
        name: 'Kanu Tomer',
        phone: '+91',
        email: 'kanu@example.com',
        password: 'Password123',
      });
    });
    expect(localStorage.getItem('safeguard.dashboard.token')).toBe('test-token');
  });

  it('shows detailed registration validation errors from the API', async () => {
    authService.registerUser.mockRejectedValue({
      response: {
        data: {
          errors: ['Password must be at least 8 characters'],
          message: 'Validation failed',
        },
      },
    });
    renderApp('/login');

    fireEvent.click(screen.getByRole('button', { name: /create a demo account/i }));
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Kanu Tomer' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'kanu@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
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

  it('adds an emergency contact from the dashboard', async () => {
    seedAuthenticatedSession();
    renderApp('/dashboard');

    await screen.findByRole('heading', { name: 'Dashboard' });
    expect(screen.getByLabelText(/contact phone/i)).toHaveValue('+91');
    fireEvent.change(screen.getByLabelText(/contact name/i), {
      target: { value: 'Asha' },
    });
    fireEvent.change(screen.getByLabelText(/contact phone/i), {
      target: { value: '+911111111111' },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'asha@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/relationship/i), {
      target: { value: 'Friend' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add contact/i }));

    await waitFor(() => {
      expect(userService.createContact).toHaveBeenCalledWith({
        name: 'Asha',
        phone: '+911111111111',
        email: 'asha@example.com',
        relationship: 'Friend',
      });
    });
  });

  it('updates profile information from the dashboard', async () => {
    seedAuthenticatedSession();
    renderApp('/dashboard');

    await screen.findByRole('heading', { name: 'Dashboard' });
    fireEvent.change(screen.getByLabelText(/profile name/i), {
      target: { value: 'Kanu SafeGuard' },
    });
    fireEvent.change(screen.getByLabelText(/profile phone/i), {
      target: { value: '+919999999999' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(userService.updateUserProfile).toHaveBeenCalledWith({
        name: 'Kanu SafeGuard',
        phone: '+919999999999',
      });
    });
  });

  it('edits and deletes emergency contacts from the dashboard', async () => {
    seedAuthenticatedSession();
    renderApp('/dashboard');

    await screen.findByRole('heading', { name: 'Dashboard' });
    fireEvent.click(screen.getByRole('button', { name: /edit asha/i }));
    fireEvent.change(screen.getByLabelText(/edit contact phone/i), {
      target: { value: '+912222222222' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save contact/i }));

    await waitFor(() => {
      expect(userService.updateContact).toHaveBeenCalledWith('contact-1', {
        name: 'Asha',
        phone: '+912222222222',
        email: 'asha@example.com',
        relationship: 'Friend',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /delete asha/i }));

    await waitFor(() => {
      expect(userService.deleteContact).toHaveBeenCalledWith('contact-1');
    });
  });

  it('starts, updates, and ends an emergency from dashboard controls', async () => {
    seedAuthenticatedSession();
    emergencyService.getActiveEmergency
      .mockResolvedValueOnce(null)
      .mockResolvedValue(activeEmergency);
    emergencyService.listEmergencies.mockResolvedValue([]);
    renderApp('/dashboard');

    await screen.findByRole('heading', { name: 'Dashboard' });
    fireEvent.click(screen.getByRole('button', { name: /start emergency/i }));

    await waitFor(() => {
      expect(emergencyService.createEmergency).toHaveBeenCalled();
    });

    expect(await screen.findByText(/emergency session started/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /send location/i }));

    await waitFor(() => {
      expect(emergencyService.createLocation).toHaveBeenCalledWith(
        activeEmergency.id,
        expect.objectContaining({
          latitude: 28.6139,
          longitude: 77.209,
        })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /end emergency/i }));

    await waitFor(() => {
      expect(emergencyService.endEmergency).toHaveBeenCalledWith(activeEmergency.id);
    });
  });

  it('renders emergency details, locations, and evidence', async () => {
    seedAuthenticatedSession();
    renderApp('/emergencies/emergency-1');

    expect(await screen.findByRole('heading', { name: /emergency details/i })).toBeInTheDocument();
    expect(screen.getByText(/contacts snapshot/i)).toBeInTheDocument();
    expect(screen.getAllByText(/28.61390, 77.20900/i).length).toBeGreaterThan(0);
    expect(screen.getByText('door.png')).toBeInTheDocument();
  });

  it('uploads evidence from the emergency detail page', async () => {
    seedAuthenticatedSession();
    renderApp('/emergencies/emergency-1');

    await screen.findByRole('heading', { name: /emergency details/i });
    const file = new File(['fake image'], 'scene.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/choose image or audio/i), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText(/evidence notes/i), {
      target: { value: 'Scene photo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /upload evidence/i }));

    await waitFor(() => {
      expect(emergencyService.uploadEvidence).toHaveBeenCalledWith('emergency-1', {
        file,
        notes: 'Scene photo',
      });
    });
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

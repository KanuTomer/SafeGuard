process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { io: Client } = require('socket.io-client');
const request = require('supertest');

const app = require('../app');
const EmergencySession = require('../models/EmergencySession');
const LocationPoint = require('../models/LocationPoint');
const User = require('../models/User');
const { initializeSocket } = require('../sockets');
const generateToken = require('../utils/generateToken');

let httpServer;
let ioServer;
let mongoServer;
let serverUrl;

jest.setTimeout(30000);

const createAuthenticatedUser = async (overrides = {}) => {
  const uniqueValue = new mongoose.Types.ObjectId().toString();
  const user = await User.create({
    name: 'Kanu Tomer',
    email: `kanu-${uniqueValue}@example.com`,
    password: 'Password123',
    phone: '+911234567890',
    ...overrides,
  });

  return {
    token: generateToken(user._id),
    user,
  };
};

const createEmergencySession = async (user, overrides = {}) => {
  return EmergencySession.create({
    user: user._id,
    status: 'active',
    ...overrides,
  });
};

const connectSocket = (token) => {
  return new Promise((resolve, reject) => {
    const client = Client(serverUrl, {
      auth: token ? { token } : {},
      reconnection: false,
      transports: ['websocket'],
    });

    client.on('connect', () => resolve(client));
    client.on('connect_error', reject);
  });
};

const expectConnectionError = (token) => {
  return new Promise((resolve) => {
    const client = Client(serverUrl, {
      auth: token ? { token } : {},
      reconnection: false,
      transports: ['websocket'],
    });

    client.on('connect_error', (error) => {
      client.close();
      resolve(error);
    });
  });
};

const waitForEvent = (client, eventName) => {
  return new Promise((resolve) => {
    client.once(eventName, resolve);
  });
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  httpServer = http.createServer(app);
  ioServer = initializeSocket(httpServer, app);

  await new Promise((resolve) => {
    httpServer.listen(0, resolve);
  });

  const address = httpServer.address();
  serverUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise((resolve) => {
    ioServer.close(resolve);
  });
  await new Promise((resolve) => {
    httpServer.close(resolve);
  });
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await LocationPoint.deleteMany({});
  await EmergencySession.deleteMany({});
  await User.deleteMany({});
});

describe('Socket.io realtime location updates', () => {
  it('connects with a valid JWT', async () => {
    const { token } = await createAuthenticatedUser();
    const client = await connectSocket(token);

    expect(client.connected).toBe(true);
    client.close();
  });

  it('rejects missing JWT connections', async () => {
    const error = await expectConnectionError();

    expect(error.message).toBe('Authentication token is required');
  });

  it('rejects invalid JWT connections', async () => {
    const error = await expectConnectionError('invalid-token');

    expect(error.message).toBe('Invalid or expired authentication token');
  });

  it('allows an authenticated user to join an owned emergency room', async () => {
    const { token, user } = await createAuthenticatedUser();
    const emergency = await createEmergencySession(user);
    const client = await connectSocket(token);
    const joinedPromise = waitForEvent(client, 'emergency:joined');

    client.emit('emergency:join', { emergencyId: emergency._id.toString() });

    await expect(joinedPromise).resolves.toEqual({
      emergencyId: emergency._id.toString(),
      room: `emergency:${emergency._id}`,
    });

    client.close();
  });

  it('rejects joining another user emergency room', async () => {
    const { token } = await createAuthenticatedUser();
    const { user: otherUser } = await createAuthenticatedUser();
    const otherEmergency = await createEmergencySession(otherUser);
    const client = await connectSocket(token);
    const errorPromise = waitForEvent(client, 'socket:error');

    client.emit('emergency:join', { emergencyId: otherEmergency._id.toString() });

    await expect(errorPromise).resolves.toEqual({
      message: 'Emergency session not found',
    });

    client.close();
  });

  it('rejects joining with an invalid emergency id', async () => {
    const { token } = await createAuthenticatedUser();
    const client = await connectSocket(token);
    const errorPromise = waitForEvent(client, 'socket:error');

    client.emit('emergency:join', { emergencyId: 'not-a-valid-id' });

    await expect(errorPromise).resolves.toEqual({
      message: 'Emergency session id must be valid',
    });

    client.close();
  });

  it('broadcasts REST-created locations to sockets in the emergency room', async () => {
    const { token, user } = await createAuthenticatedUser();
    const emergency = await createEmergencySession(user);
    const client = await connectSocket(token);

    client.emit('emergency:join', { emergencyId: emergency._id.toString() });
    await waitForEvent(client, 'emergency:joined');

    const locationPromise = waitForEvent(client, 'location:created');

    await request(app)
      .post(`/api/emergencies/${emergency._id}/locations`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 12,
        recordedAt: '2026-06-27T12:00:00.000Z',
      })
      .expect(201);

    const payload = await locationPromise;
    expect(payload.location).toEqual(
      expect.objectContaining({
        emergencySession: emergency._id.toString(),
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 12,
      })
    );

    client.close();
  });

  it('does not broadcast REST-created locations to other emergency rooms', async () => {
    const { token, user } = await createAuthenticatedUser();
    const targetEmergency = await createEmergencySession(user);
    const otherEmergency = await createEmergencySession(user, {
      status: 'ended',
      endedAt: new Date(),
    });
    const client = await connectSocket(token);

    client.emit('emergency:join', { emergencyId: otherEmergency._id.toString() });
    await waitForEvent(client, 'emergency:joined');

    let receivedLocation = false;
    client.once('location:created', () => {
      receivedLocation = true;
    });

    await request(app)
      .post(`/api/emergencies/${targetEmergency._id}/locations`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: 28.6139,
        longitude: 77.209,
      })
      .expect(201);

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(receivedLocation).toBe(false);
    client.close();
  });

  it('does not broadcast failed REST location creates', async () => {
    const { token, user } = await createAuthenticatedUser();
    const emergency = await createEmergencySession(user);
    const client = await connectSocket(token);

    client.emit('emergency:join', { emergencyId: emergency._id.toString() });
    await waitForEvent(client, 'emergency:joined');

    let receivedLocation = false;
    client.once('location:created', () => {
      receivedLocation = true;
    });

    await request(app)
      .post(`/api/emergencies/${emergency._id}/locations`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: 'invalid',
        longitude: 77.209,
      })
      .expect(400);

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(receivedLocation).toBe(false);
    client.close();
  });
});

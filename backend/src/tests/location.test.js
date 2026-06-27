process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const app = require('../app');
const EmergencySession = require('../models/EmergencySession');
const LocationPoint = require('../models/LocationPoint');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

let mongoServer;

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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await LocationPoint.deleteMany({});
  await EmergencySession.deleteMany({});
  await User.deleteMany({});
});

describe('Location history routes', () => {
  describe('POST /api/emergencies/:emergencyId/locations', () => {
    it('creates a location point for an active owned emergency session', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      const recordedAt = '2026-06-27T12:00:00.000Z';

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10,
          recordedAt,
        })
        .expect(201);

      expect(response.body.data.location).toEqual({
        id: expect.any(String),
        user: user._id.toString(),
        emergencySession: emergency._id.toString(),
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 10,
        recordedAt,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('updates the emergency session last known location', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      const recordedAt = '2026-06-27T12:01:00.000Z';

      await request(app)
        .post(`/api/emergencies/${emergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 28.614,
          longitude: 77.21,
          accuracy: 8,
          recordedAt,
        })
        .expect(201);

      const savedEmergency = await EmergencySession.findById(emergency._id);
      expect(savedEmergency.lastKnownLocation.toObject()).toEqual({
        latitude: 28.614,
        longitude: 77.21,
        accuracy: 8,
        timestamp: new Date(recordedAt),
      });
    });

    it('rejects invalid coordinates', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: '28.6139',
          longitude: 181,
          accuracy: -1,
          recordedAt: 'not-a-date',
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Latitude must be a number',
          'Longitude must be between -180 and 180',
          'Accuracy cannot be negative',
          'Recorded at must be a valid date string',
        ])
      );
    });

    it('requires authentication', async () => {
      const { user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/locations`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
        })
        .expect(401);

      expect(response.body.message).toBe('Authentication token is required');
    });

    it('rejects invalid emergency session ids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/emergencies/not-a-valid-id/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining(['Emergency session id must be valid'])
      );
    });

    it('returns 404 for another user emergency session', async () => {
      const { token } = await createAuthenticatedUser();
      const { user: otherUser } = await createAuthenticatedUser();
      const otherEmergency = await createEmergencySession(otherUser);

      const response = await request(app)
        .post(`/api/emergencies/${otherEmergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
        })
        .expect(404);

      expect(response.body.message).toBe('Emergency session not found');
    });

    it('rejects adding a location to an ended emergency session', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user, {
        status: 'ended',
        endedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          latitude: 28.6139,
          longitude: 77.209,
        })
        .expect(409);

      expect(response.body.message).toBe('Cannot add location to an ended emergency session');
    });
  });

  describe('GET /api/emergencies/:emergencyId/locations', () => {
    it('lists owned location points oldest first', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      const otherEmergency = await createEmergencySession(user, {
        status: 'ended',
        endedAt: new Date(),
      });

      const newerPoint = await LocationPoint.create({
        user: user._id,
        emergencySession: emergency._id,
        latitude: 28.614,
        longitude: 77.21,
        recordedAt: new Date('2026-06-27T12:02:00.000Z'),
      });
      const olderPoint = await LocationPoint.create({
        user: user._id,
        emergencySession: emergency._id,
        latitude: 28.6139,
        longitude: 77.209,
        recordedAt: new Date('2026-06-27T12:00:00.000Z'),
      });
      await LocationPoint.create({
        user: user._id,
        emergencySession: otherEmergency._id,
        latitude: 30,
        longitude: 70,
      });

      const response = await request(app)
        .get(`/api/emergencies/${emergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.locations).toHaveLength(2);
      expect(response.body.data.locations.map((location) => location.id)).toEqual([
        olderPoint._id.toString(),
        newerPoint._id.toString(),
      ]);
    });

    it('returns 404 when reading another user location history', async () => {
      const { token } = await createAuthenticatedUser();
      const { user: otherUser } = await createAuthenticatedUser();
      const otherEmergency = await createEmergencySession(otherUser);

      const response = await request(app)
        .get(`/api/emergencies/${otherEmergency._id}/locations`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Emergency session not found');
    });
  });
});

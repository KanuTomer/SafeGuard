process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const app = require('../app');
const EmergencySession = require('../models/EmergencySession');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

let mongoServer;

jest.setTimeout(30000);

const contactPayload = {
  name: 'Parent',
  phone: '+911111111111',
  email: 'parent@example.com',
  relationship: 'Father',
};

const createAuthenticatedUser = async (overrides = {}) => {
  const uniqueValue = new mongoose.Types.ObjectId().toString();
  const user = await User.create({
    name: 'Kanu Tomer',
    email: `kanu-${uniqueValue}@example.com`,
    password: 'Password123',
    phone: '+911234567890',
    contacts: [contactPayload],
    ...overrides,
  });

  return {
    token: generateToken(user._id),
    user,
  };
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
  await EmergencySession.deleteMany({});
  await User.deleteMany({});
});

describe('Emergency session routes', () => {
  describe('POST /api/emergencies', () => {
    it('creates an active emergency session for an authenticated user', async () => {
      const { token, user } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Emergency session created successfully');
      expect(response.body.data.emergency).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          user: user._id.toString(),
          status: 'active',
          endedAt: null,
          initialLocation: null,
          lastKnownLocation: null,
          contactsSnapshot: [
            {
              name: contactPayload.name,
              phone: contactPayload.phone,
              email: contactPayload.email,
              relationship: contactPayload.relationship,
            },
          ],
          startedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });

    it('creates an active session with valid initial location', async () => {
      const { token } = await createAuthenticatedUser();
      const timestamp = '2026-06-27T12:00:00.000Z';

      const response = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          initialLocation: {
            latitude: 28.6139,
            longitude: 77.209,
            accuracy: 12,
            timestamp,
          },
        })
        .expect(201);

      expect(response.body.data.emergency.initialLocation).toEqual({
        latitude: 28.6139,
        longitude: 77.209,
        accuracy: 12,
        timestamp,
      });
      expect(response.body.data.emergency.lastKnownLocation).toEqual(
        response.body.data.emergency.initialLocation
      );
    });

    it('rejects invalid initial location payloads', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          initialLocation: {
            latitude: '28.6139',
            longitude: 181,
            accuracy: -1,
            timestamp: 'not-a-date',
          },
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Latitude must be a number',
          'Longitude must be between -180 and 180',
          'Accuracy cannot be negative',
          'Timestamp must be a valid date string',
        ])
      );
    });

    it('requires authentication', async () => {
      const response = await request(app).post('/api/emergencies').send({}).expect(401);

      expect(response.body.message).toBe('Authentication token is required');
    });

    it('rejects creating a second active emergency session', async () => {
      const { token } = await createAuthenticatedUser();

      await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(201);

      const response = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(409);

      expect(response.body.message).toBe('An active emergency session already exists');
    });

    it('allows creating a new session after the previous one is ended', async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(201);

      await request(app)
        .patch(`/api/emergencies/${createResponse.body.data.emergency.id}/end`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const response = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(201);

      expect(response.body.data.emergency.status).toBe('active');
      expect(response.body.data.emergency.id).not.toBe(createResponse.body.data.emergency.id);
    });
  });

  describe('GET /api/emergencies/active', () => {
    it('returns the active emergency session', async () => {
      const { token } = await createAuthenticatedUser();

      const createResponse = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(201);

      const response = await request(app)
        .get('/api/emergencies/active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.emergency.id).toBe(createResponse.body.data.emergency.id);
      expect(response.body.data.emergency.status).toBe('active');
    });

    it('returns null when no active emergency session exists', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/emergencies/active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.emergency).toBeNull();
    });
  });

  describe('GET /api/emergencies', () => {
    it('lists only the authenticated user emergency sessions newest first', async () => {
      const { token, user } = await createAuthenticatedUser();
      const { user: otherUser } = await createAuthenticatedUser();

      const olderSession = await EmergencySession.create({
        user: user._id,
        status: 'ended',
        startedAt: new Date('2026-06-26T10:00:00.000Z'),
        endedAt: new Date('2026-06-26T10:05:00.000Z'),
      });
      const newerSession = await EmergencySession.create({
        user: user._id,
        status: 'active',
        startedAt: new Date('2026-06-27T10:00:00.000Z'),
      });
      await EmergencySession.create({
        user: otherUser._id,
        status: 'active',
      });

      const response = await request(app)
        .get('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.emergencies).toHaveLength(2);
      expect(response.body.data.emergencies.map((session) => session.id)).toEqual([
        newerSession._id.toString(),
        olderSession._id.toString(),
      ]);
    });
  });

  describe('GET /api/emergencies/:emergencyId', () => {
    it('returns one owned emergency session', async () => {
      const { token, user } = await createAuthenticatedUser();
      const session = await EmergencySession.create({
        user: user._id,
        status: 'active',
      });

      const response = await request(app)
        .get(`/api/emergencies/${session._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.emergency.id).toBe(session._id.toString());
    });

    it('returns 404 when accessing another user emergency session', async () => {
      const { token } = await createAuthenticatedUser();
      const { user: otherUser } = await createAuthenticatedUser();
      const otherSession = await EmergencySession.create({
        user: otherUser._id,
        status: 'active',
      });

      const response = await request(app)
        .get(`/api/emergencies/${otherSession._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Emergency session not found');
    });

    it('rejects invalid emergency session ids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/emergencies/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining(['Emergency session id must be valid'])
      );
    });
  });

  describe('PATCH /api/emergencies/:emergencyId/end', () => {
    it('ends an active emergency session', async () => {
      const { token } = await createAuthenticatedUser();
      const createResponse = await request(app)
        .post('/api/emergencies')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(201);

      const response = await request(app)
        .patch(`/api/emergencies/${createResponse.body.data.emergency.id}/end`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.emergency.status).toBe('ended');
      expect(response.body.data.emergency.endedAt).toEqual(expect.any(String));
    });

    it('rejects ending an already ended emergency session', async () => {
      const { token, user } = await createAuthenticatedUser();
      const session = await EmergencySession.create({
        user: user._id,
        status: 'ended',
        endedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/emergencies/${session._id}/end`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);

      expect(response.body.message).toBe('Emergency session has already ended');
    });
  });
});

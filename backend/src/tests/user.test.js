process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const app = require('../app');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

let mongoServer;

jest.setTimeout(30000);

const userPayload = {
  name: 'Kanu Tomer',
  email: 'kanu@example.com',
  password: 'Password123',
  phone: '+911234567890',
};

const contactPayload = {
  name: 'Parent',
  phone: '+911111111111',
  email: 'parent@example.com',
  relationship: 'Father',
};

const createAuthenticatedUser = async (overrides = {}) => {
  const user = await User.create({
    ...userPayload,
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
  await User.deleteMany({});
});

describe('User profile routes', () => {
  describe('GET /api/users/me', () => {
    it('returns the current user profile', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual({
        id: expect.any(String),
        name: userPayload.name,
        email: userPayload.email,
        phone: userPayload.phone,
        contacts: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('requires authentication', async () => {
      const response = await request(app).get('/api/users/me').expect(401);

      expect(response.body.message).toBe('Authentication token is required');
    });
  });

  describe('PATCH /api/users/me', () => {
    it('updates allowed profile fields', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          phone: '+919999999999',
        })
        .expect(200);

      expect(response.body.data.user).toEqual(
        expect.objectContaining({
          name: 'Updated Name',
          phone: '+919999999999',
          email: userPayload.email,
        })
      );
    });

    it('does not allow email or password mutation', async () => {
      const { token, user } = await createAuthenticatedUser();

      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'changed@example.com',
          password: 'ChangedPassword123',
          name: 'Still Allowed',
        })
        .expect(200);

      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser.email).toBe(userPayload.email);
      await expect(savedUser.comparePassword(userPayload.password)).resolves.toBe(true);
      await expect(savedUser.comparePassword('ChangedPassword123')).resolves.toBe(false);
    });
  });
});

describe('Emergency contact routes', () => {
  describe('POST /api/users/me/contacts', () => {
    it('adds an emergency contact', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/users/me/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send(contactPayload)
        .expect(201);

      expect(response.body.data.contact).toEqual({
        id: expect.any(String),
        name: contactPayload.name,
        phone: contactPayload.phone,
        email: contactPayload.email,
        relationship: contactPayload.relationship,
      });
    });

    it('rejects invalid contact payloads', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/users/me/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'A',
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Contact name must be at least 2 characters',
          'Contact phone or email is required',
        ])
      );
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/users/me/contacts')
        .send(contactPayload)
        .expect(401);

      expect(response.body.message).toBe('Authentication token is required');
    });
  });

  describe('GET /api/users/me/contacts', () => {
    it('lists embedded emergency contacts', async () => {
      const { token, user } = await createAuthenticatedUser({
        contacts: [contactPayload],
      });

      const response = await request(app)
        .get('/api/users/me/contacts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.contacts).toEqual([
        {
          id: user.contacts[0]._id.toString(),
          name: contactPayload.name,
          phone: contactPayload.phone,
          email: contactPayload.email,
          relationship: contactPayload.relationship,
        },
      ]);
    });
  });

  describe('PATCH /api/users/me/contacts/:contactId', () => {
    it('updates an embedded emergency contact', async () => {
      const { token, user } = await createAuthenticatedUser({
        contacts: [contactPayload],
      });

      const response = await request(app)
        .patch(`/api/users/me/contacts/${user.contacts[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Parent',
          email: 'updated@example.com',
        })
        .expect(200);

      expect(response.body.data.contact).toEqual({
        id: user.contacts[0]._id.toString(),
        name: 'Updated Parent',
        phone: contactPayload.phone,
        email: 'updated@example.com',
        relationship: contactPayload.relationship,
      });
    });

    it('returns 404 when the contact does not exist', async () => {
      const { token } = await createAuthenticatedUser();
      const missingContactId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/users/me/contacts/${missingContactId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Missing Contact',
        })
        .expect(404);

      expect(response.body.message).toBe('Contact not found');
    });
  });

  describe('DELETE /api/users/me/contacts/:contactId', () => {
    it('deletes an embedded emergency contact', async () => {
      const { token, user } = await createAuthenticatedUser({
        contacts: [contactPayload],
      });

      await request(app)
        .delete(`/api/users/me/contacts/${user.contacts[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const savedUser = await User.findById(user._id);
      expect(savedUser.contacts).toHaveLength(0);
    });
  });
});

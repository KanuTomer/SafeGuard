process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const app = require('../app');
const User = require('../models/User');

let mongoServer;

jest.setTimeout(30000);

const registerPayload = {
  name: 'Kanu Tomer',
  email: 'kanu@example.com',
  password: 'Password123',
  phone: '+911234567890',
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

describe('Auth routes', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user, hashes the password, and returns a token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...registerPayload,
          email: 'KANU@example.com',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toEqual({
        id: expect.any(String),
        name: registerPayload.name,
        email: registerPayload.email,
        phone: registerPayload.phone,
      });
      expect(response.body.data.token).toEqual(expect.any(String));
      expect(response.body.data.user.password).toBeUndefined();

      const savedUser = await User.findOne({ email: registerPayload.email }).select('+password');
      expect(savedUser).toBeTruthy();
      expect(savedUser.password).not.toBe(registerPayload.password);
      await expect(savedUser.comparePassword(registerPayload.password)).resolves.toBe(true);
    });

    it('rejects duplicate email registration', async () => {
      await User.create(registerPayload);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        message: 'Email is already registered',
        errors: [],
      });
    });

    it('rejects missing fields', async () => {
      const response = await request(app).post('/api/auth/register').send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Name must be at least 2 characters',
          'A valid email is required',
          'Password must be at least 8 characters',
        ])
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in an existing user and returns a token', async () => {
      await User.create(registerPayload);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'KANU@example.com',
          password: registerPayload.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toEqual({
        id: expect.any(String),
        name: registerPayload.name,
        email: registerPayload.email,
        phone: registerPayload.phone,
      });
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.token).toEqual(expect.any(String));
    });

    it('rejects an incorrect password', async () => {
      await User.create(registerPayload);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid email or password',
        errors: [],
      });
    });

    it('rejects an unknown email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'missing@example.com',
          password: registerPayload.password,
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('rejects invalid login input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining(['A valid email is required', 'Password is required'])
      );
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user with a valid token', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registerResponse.body.data.token}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Current user retrieved successfully',
        data: {
          user: {
            id: registerResponse.body.data.user.id,
            name: registerPayload.name,
            email: registerPayload.email,
            phone: registerPayload.phone,
          },
        },
      });
    });

    it('rejects missing tokens', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authentication token is required',
        errors: [],
      });
    });

    it('rejects invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired authentication token',
        errors: [],
      });
    });
  });
});

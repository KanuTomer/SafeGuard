process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

jest.mock('../utils/cloudinaryUpload', () => ({
  uploadBufferToCloudinary: jest.fn(),
}));

const app = require('../app');
const EmergencySession = require('../models/EmergencySession');
const Evidence = require('../models/Evidence');
const User = require('../models/User');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
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

const mockCloudinarySuccess = (publicId = 'safeguard/evidence/test-file') => {
  uploadBufferToCloudinary.mockResolvedValue({
    public_id: publicId,
    url: `http://res.cloudinary.com/demo/${publicId}`,
    secure_url: `https://res.cloudinary.com/demo/${publicId}`,
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
  uploadBufferToCloudinary.mockReset();
  await Evidence.deleteMany({});
  await EmergencySession.deleteMany({});
  await User.deleteMany({});
});

describe('Evidence routes', () => {
  describe('POST /api/emergencies/:emergencyId/evidence', () => {
    it('uploads image evidence for an active owned emergency session', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      mockCloudinarySuccess('safeguard/evidence/image');

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .field('notes', 'Front door photo')
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body.data.evidence).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          user: user._id.toString(),
          emergencySession: emergency._id.toString(),
          type: 'image',
          originalName: 'door.png',
          mimeType: 'image/png',
          size: expect.any(Number),
          cloudinaryPublicId: 'safeguard/evidence/image',
          notes: 'Front door photo',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
      expect(uploadBufferToCloudinary).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'door.png',
          mimetype: 'image/png',
        }),
        { resourceType: 'image' }
      );
    });

    it('uploads audio evidence for an active owned emergency session', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      mockCloudinarySuccess('safeguard/evidence/audio');

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake audio'), {
          filename: 'recording.mp3',
          contentType: 'audio/mpeg',
        })
        .expect(201);

      expect(response.body.data.evidence).toEqual(
        expect.objectContaining({
          type: 'audio',
          originalName: 'recording.mp3',
          mimeType: 'audio/mpeg',
          cloudinaryPublicId: 'safeguard/evidence/audio',
        })
      );
      expect(uploadBufferToCloudinary).toHaveBeenCalledWith(expect.any(Object), {
        resourceType: 'video',
      });
    });

    it('creates an Evidence document with Cloudinary metadata', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      mockCloudinarySuccess('safeguard/evidence/document');

      await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'scene.webp',
          contentType: 'image/webp',
        })
        .expect(201);

      const evidence = await Evidence.findOne({
        user: user._id,
        emergencySession: emergency._id,
      });

      expect(evidence).toEqual(
        expect.objectContaining({
          type: 'image',
          originalName: 'scene.webp',
          mimeType: 'image/webp',
          cloudinaryPublicId: 'safeguard/evidence/document',
        })
      );
    });

    it('requires authentication', async () => {
      const { user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(401);

      expect(response.body.message).toBe('Authentication token is required');
    });

    it('rejects invalid emergency ids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/emergencies/not-a-valid-id/evidence')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
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
      mockCloudinarySuccess();

      const response = await request(app)
        .post(`/api/emergencies/${otherEmergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(404);

      expect(response.body.message).toBe('Emergency session not found');
    });

    it('rejects uploads to ended emergency sessions', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user, {
        status: 'ended',
        endedAt: new Date(),
      });
      mockCloudinarySuccess();

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(409);

      expect(response.body.message).toBe('Cannot upload evidence to an ended emergency session');
    });

    it('rejects missing files', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.errors).toEqual(expect.arrayContaining(['Evidence file is required']));
    });

    it('rejects invalid MIME types', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake text'), {
          filename: 'notes.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid file type');
    });

    it('rejects oversized files', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      const oversizedFile = Buffer.alloc(10 * 1024 * 1024 + 1);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', oversizedFile, {
          filename: 'large.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body.message).toBe('File size cannot exceed 10 MB');
    });

    it('rejects invalid notes', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .field('notes', 'a'.repeat(501))
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining(['Notes cannot exceed 500 characters'])
      );
      expect(uploadBufferToCloudinary).not.toHaveBeenCalled();
    });

    it('handles Cloudinary upload failures cleanly', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      uploadBufferToCloudinary.mockRejectedValue(new Error('Cloudinary failed'));

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(502);

      expect(response.body.message).toBe('Evidence upload failed');
    });

    it('handles incomplete Cloudinary upload responses cleanly', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      uploadBufferToCloudinary.mockResolvedValue({
        public_id: 'safeguard/evidence/incomplete',
      });

      const response = await request(app)
        .post(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake image'), {
          filename: 'door.png',
          contentType: 'image/png',
        })
        .expect(502);

      expect(response.body.message).toBe('Evidence upload failed');
    });
  });

  describe('GET /api/emergencies/:emergencyId/evidence', () => {
    it('lists evidence for an owned emergency session newest first', async () => {
      const { token, user } = await createAuthenticatedUser();
      const emergency = await createEmergencySession(user);
      const otherEmergency = await createEmergencySession(user, {
        status: 'ended',
        endedAt: new Date(),
      });

      const olderEvidence = await Evidence.create({
        user: user._id,
        emergencySession: emergency._id,
        type: 'image',
        originalName: 'older.png',
        mimeType: 'image/png',
        size: 10,
        cloudinaryPublicId: 'older',
        url: 'http://example.com/older.png',
        secureUrl: 'https://example.com/older.png',
        createdAt: new Date('2026-06-27T12:00:00.000Z'),
      });
      const newerEvidence = await Evidence.create({
        user: user._id,
        emergencySession: emergency._id,
        type: 'audio',
        originalName: 'newer.mp3',
        mimeType: 'audio/mpeg',
        size: 20,
        cloudinaryPublicId: 'newer',
        url: 'http://example.com/newer.mp3',
        secureUrl: 'https://example.com/newer.mp3',
        createdAt: new Date('2026-06-27T12:05:00.000Z'),
      });
      await Evidence.create({
        user: user._id,
        emergencySession: otherEmergency._id,
        type: 'image',
        originalName: 'other.png',
        mimeType: 'image/png',
        size: 30,
        cloudinaryPublicId: 'other',
        url: 'http://example.com/other.png',
        secureUrl: 'https://example.com/other.png',
      });

      const response = await request(app)
        .get(`/api/emergencies/${emergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.evidence).toHaveLength(2);
      expect(response.body.data.evidence.map((item) => item.id)).toEqual([
        newerEvidence._id.toString(),
        olderEvidence._id.toString(),
      ]);
    });

    it('returns 404 when listing another user evidence', async () => {
      const { token } = await createAuthenticatedUser();
      const { user: otherUser } = await createAuthenticatedUser();
      const otherEmergency = await createEmergencySession(otherUser);

      const response = await request(app)
        .get(`/api/emergencies/${otherEmergency._id}/evidence`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Emergency session not found');
    });
  });
});

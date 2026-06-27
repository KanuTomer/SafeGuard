const request = require('supertest');

const app = require('../app');

describe('GET /api/health', () => {
  it('returns the API health status', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'SafeGuard API is healthy',
      data: {
        status: 'ok',
        timestamp: expect.any(String),
      },
    });
  });
});

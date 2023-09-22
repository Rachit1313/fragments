const request = require('supertest');
const app = require('../../src/app'); // Assuming your Express app is exported in src/app.js

describe('404 Handler', () => {
  it('should return a 404 status and error message for an unknown route', async () => {
    const response = await request(app).get('/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.error.message).toBe('not found');
    expect(response.body.error.code).toBe(404);
  });
});

// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  const UUIDFormat = new RegExp(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  );
  const fragmentDateFormat = new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@gmail.com', 'invalid')
      .set('Content-Type', 'text/plain');

    expect(res.statusCode).toBe(401);
  });

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users receive a response code 200 and status ok', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('test body');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('Created fragment should proper data', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('new fragment');

    expect(res.body.fragment.id).toMatch(UUIDFormat);
    expect(res.body.fragment.ownerId).toMatch('user1@email.com');
    expect(res.body.fragment.created && res.body.fragment.updated).toMatch(fragmentDateFormat);
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(Buffer.byteLength('new fragment'));
  });

  test('Location URL must be present in header and match the fragment ID', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('new fragment');

    expect(res.headers.location).toMatch(`v1/fragments/${res.body.fragment.id}`);
  });

  test('trying to create a fragment with unsupported content', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1')
      .send('new fragment');

    expect(res.statusCode).toBe(415);
  });
});

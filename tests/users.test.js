const request = require('supertest');
const createApp = require('../src/app');
const usersModel = require('../src/models/users.model');

const app = createApp();

// Reset the in-memory "database" before each test so tests don't
// leak state into one another.
beforeEach(() => {
  usersModel._reset();
});

describe('GET /health', () => {
  it('returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/users', () => {
  it('returns the seeded list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('name', 'Ada Lovelace');
  });
});

describe('GET /api/users/:id', () => {
  it('returns a single user when found', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('ada@example.com');
  });

  it('returns 404 when the user does not exist', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/users', () => {
  it('creates a new user with valid input', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Grace Hopper', email: 'grace@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Grace Hopper', email: 'grace@example.com' });
    expect(res.body.id).toBeDefined();
  });

  it('rejects a request missing required fields', async () => {
    const res = await request(app).post('/api/users').send({ name: 'No Email' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /api/users/:id', () => {
  it('updates an existing user', async () => {
    const res = await request(app).put('/api/users/1').send({ name: 'Ada Byron' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Ada Byron');
  });

  it('returns 404 for a non-existent user', async () => {
    const res = await request(app).put('/api/users/999').send({ name: 'Nobody' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes an existing user', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(204);

    const followUp = await request(app).get('/api/users/1');
    expect(followUp.status).toBe(404);
  });

  it('returns 404 when deleting a non-existent user', async () => {
    const res = await request(app).delete('/api/users/999');
    expect(res.status).toBe(404);
  });
});

describe('Unknown route', () => {
  it('returns 404 with a helpful message', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

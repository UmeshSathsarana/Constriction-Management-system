const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('User Management - View Users', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    // Create test users
    await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin'
      },
      {
        name: 'Worker User',
        email: 'worker@example.com',
        password: 'password123',
        role: 'Worker'
      },
      {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'password123',
        role: 'Project Manager'
      }
    ]);
  });

  it('should retrieve all users', async () => {
    const response = await request(app)
      .get('/users');

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(3);
    expect(response.body.users[0]).toHaveProperty('name');
    expect(response.body.users[0]).toHaveProperty('email');
    expect(response.body.users[0]).toHaveProperty('role');
    expect(response.body.users[0]).not.toHaveProperty('password');
  });

  it('should filter users by role', async () => {
    const response = await request(app)
      .get('/users?role=Admin');

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].role).toBe('Admin');
  });

  it('should paginate users', async () => {
    const response = await request(app)
      .get('/users?page=1&limit=2');

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.pagination.currentPage).toBe(1);
    expect(response.body.pagination.totalUsers).toBe(3);
    expect(response.body.pagination.hasNext).toBe(true);
  });
});

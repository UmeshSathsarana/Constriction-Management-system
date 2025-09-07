const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('User Management - Add User', () => {
  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  it('should create a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Worker',
      phone: '1234567890',
      address: '123 Test St, Test City, TC 12345'
    };

    const response = await request(app)
      .post('/users')
      .send(userData);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user).toHaveProperty('name', 'Test User');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
    expect(response.body.user).toHaveProperty('role', 'Worker');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).toHaveProperty('phone', '1234567890');
    expect(response.body.user).toHaveProperty('address', '123 Test St, Test City, TC 12345');
  });

  it('should fail to create user with missing required fields', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/users')
      .send(userData);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Name, role, and password are required');
  });

  it('should fail to create user with duplicate email', async () => {
    // Create first user
    await User.create({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123',
      role: 'Worker',
      phone: '1234567890',
      address: '123 Test St, Test City, TC 12345'
    });

    // Try to create second user with same email
    const userData = {
      name: 'Second User',
      email: 'duplicate@example.com',
      password: 'password456',
      role: 'Worker',
      phone: '0987654321',
      address: '456 Another St, Another City, AC 67890'
      
    };

    const response = await request(app)
      .post('/users')
      .send(userData);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('User with this email already exists');
  });
});

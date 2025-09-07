const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('User Management - Edit User', () => {
  let userId;

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});

    // Create a test user
    const user = await User.create({
      name: 'Edit Test User',
      email: 'edit@example.com',
      password: 'password123',
      role: 'Worker',
      phone: '1234567890',
      address: '123 Test St, Test City, TC 12345'
    });
    userId = user._id;
  });

  it('should update user email successfully', async () => {
    const updateData = {
      email: 'updated@example.com'
    };

    const response = await request(app)
      .put(`/users/${userId}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User updated successfully');
    expect(response.body.user).toHaveProperty('email', 'updated@example.com');
    expect(response.body.user).toHaveProperty('name', 'Edit Test User');
  });

  it('should update user name and phone', async () => {
    const updateData = {
      name: 'Updated Name',
      phone: '0987654321'
    };

    const response = await request(app)
      .put(`/users/${userId}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User updated successfully');
    expect(response.body.user).toHaveProperty('name', 'Updated Name');
    expect(response.body.user).toHaveProperty('phone', '0987654321');
  });
});

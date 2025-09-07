const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('User Management - Delete User', () => {
  let userId;

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});

    // Create a test user
    const user = await User.create({
      name: 'Delete Test User',
      email: 'delete@example.com',
      password: 'password123',
      role: 'Worker',
      phone: '1234567890',
      address: '123 Test St, Test City, TC 12345'
    });
    userId = user._id;
  });

  it('should delete user successfully', async () => {
    const response = await request(app)
      .delete(`/users/${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
    expect(response.body.deletedUser).toHaveProperty('name', 'Delete Test User');
    expect(response.body.deletedUser).toHaveProperty('email', 'delete@example.com');
    expect(response.body.deletedUser).toHaveProperty('role', 'Worker');

    // Verify user is actually deleted
    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });


});

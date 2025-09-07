const request = require('supertest');
const app = require('../../app');
const Client = require('../../models/Client');

describe('Client Management - Delete Client', () => {
  let clientId;

  beforeEach(async () => {
    // Clean up test data
    await Client.deleteMany({});

    // Create a test client
    const client = await Client.create({
      name: 'Delete Test Client',
      email: 'deleteclient@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Test St, Test City, TC 12345'
    });
    clientId = client._id;
  });

  it('should delete client successfully', async () => {
    const response = await request(app)
      .delete(`/clients/${clientId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Client deleted successfully');
    expect(response.body.deletedClient).toHaveProperty('name', 'Delete Test Client');
    expect(response.body.deletedClient).toHaveProperty('email', 'deleteclient@example.com');

    // Verify client is actually deleted
    const deletedClient = await Client.findById(clientId);
    expect(deletedClient).toBeNull();
  });

  it('should fail to delete non-existent client', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    const response = await request(app)
      .delete(`/clients/${fakeId}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Client not found');
  });

  it('should fail to delete with invalid client ID format', async () => {
    const invalidId = 'invalid-id';

    const response = await request(app)
      .delete(`/clients/${invalidId}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid client ID format');
  });
});

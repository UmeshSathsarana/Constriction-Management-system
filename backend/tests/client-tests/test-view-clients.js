const request = require('supertest');
const app = require('../../app');
const Client = require('../../models/Client');

describe('Client Management - View Clients', () => {
  beforeEach(async () => {
    await Client.deleteMany({});
    // Create test clients
    await Client.create([
      {
        name: 'Client One',
        company: 'Company One',
        email: 'client1@example.com',
        password: 'password123',
        phone: '1234567890'
      },
      {
        name: 'Client Two',
        company: 'Company Two',
        email: 'client2@example.com',
        password: 'password456',
        phone: '0987654321'
      }
    ]);
  });

  it('should retrieve all clients', async () => {
    const response = await request(app)
      .get('/clients');

    expect(response.statusCode).toBe(200);
    expect(response.body.clients).toHaveLength(2);
    expect(response.body.clients[0]).toHaveProperty('name');
    expect(response.body.clients[0]).toHaveProperty('company');
    expect(response.body.clients[0]).toHaveProperty('email');
  });

  it('should retrieve client by ID', async () => {
    const client = await Client.findOne({ name: 'Client One' });
    const response = await request(app)
      .get(`/clients/${client._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.client.name).toBe('Client One');
    expect(response.body.client.company).toBe('Company One');
  });

  it('should return 404 for non-existent client', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .get(`/clients/${fakeId}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Client not found');
  });
});

const request = require('supertest');
const app = require('../../app');
const Client = require('../../models/Client');

describe('Client Management - Add Client', () => {
  beforeEach(async () => {
    await Client.deleteMany({});
  });

  it('should create a new client successfully', async () => {
    const clientData = {
      name: 'Test Client',
      company: 'Test Company',
      email: 'client@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Test Street'
    };

    const response = await request(app)
      .post('/clients')
      .send(clientData);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Client created successfully');
    expect(response.body.client).toHaveProperty('name', 'Test Client');
    expect(response.body.client).toHaveProperty('company', 'Test Company');
    expect(response.body.client).toHaveProperty('email', 'client@example.com');
  });

  it('should fail to create client with duplicate email', async () => {
    // Create first client
    await Client.create({
      name: 'First Client',
      company: 'First Company',
      email: 'duplicate@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    // Try to create second client with same email
    const clientData = {
      name: 'Second Client',
      company: 'Second Company',
      email: 'duplicate@example.com',
      password: 'password456',
      phone: '0987654321'
    };

    const response = await request(app)
      .post('/clients')
      .send(clientData);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email address already exists. Please use a different email.');
  });
});

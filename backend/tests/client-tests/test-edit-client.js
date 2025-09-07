const request = require('supertest');
const app = require('../../app');
const Client = require('../../models/Client');

describe('Client Management - Edit Client', () => {
  let clientId;

  beforeEach(async () => {
    await Client.deleteMany({});
    const client = await Client.create({
      name: 'Original Client',
      company: 'Original Company',
      email: 'original@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    clientId = client._id;
  });

  it('should update client successfully', async () => {
    const updateData = {
      name: 'Updated Client',
      phone: '0987654321'
    };

    const response = await request(app)
      .put(`/clients/${clientId}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Client updated successfully');
    expect(response.body.client.name).toBe('Updated Client');
    expect(response.body.client.phone).toBe('0987654321');
  });

  it('should fail to update non-existent client', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const updateData = {
      name: 'Updated Name'
    };

    const response = await request(app)
      .put(`/clients/${fakeId}`)
      .send(updateData);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Client not found');
  });
});

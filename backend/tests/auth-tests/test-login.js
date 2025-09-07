const request = require('supertest');
const app = require('../../app'); // Assuming your Express app is exported from app.js

describe('Authentication - Login', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'admin@gmail.com',
        password: 'admin'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'admin@gmail.com');
  });
});

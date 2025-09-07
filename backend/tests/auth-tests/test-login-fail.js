const request = require('supertest');
const app = require('../../app');

describe('Authentication - Login Fail', () => {
  it('should fail login with invalid email', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'invalid@email.com',
        password: 'password'
      });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

});

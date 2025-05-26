import request from 'supertest';
import { app } from '../app';

describe('Password Reset Endpoints', () => {
  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return success message for valid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('password reset link has been sent');
    });

    it('should return validation error for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
    });

    it('should return validation error for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should return validation error for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          password: 'NewPassword123'
        });

      expect(response.status).toBe(400);
    });

    it('should return validation error for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'some-token',
          password: 'weak'
        });

      expect(response.status).toBe(400);
    });

    it('should return validation error for missing password requirements', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'some-token',
          password: 'onlylowercase'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/verify-reset-token', () => {
    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify-reset-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Reset token is required');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify-reset-token?token=invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid or expired reset token');
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should return unauthorized for missing auth token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .send({
          currentPassword: 'CurrentPass123',
          newPassword: 'NewPassword123'
        });

      expect(response.status).toBe(401);
    });

    it('should return validation error for weak new password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer fake-token')
        .send({
          currentPassword: 'CurrentPass123',
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
    });

    it('should return validation error for missing current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', 'Bearer fake-token')
        .send({
          newPassword: 'NewPassword123'
        });

      expect(response.status).toBe(400);
    });
  });
}); 
import request from 'supertest';
import app from '../app';

describe('RecoverAI REST API Endpoints', () => {
  it('GET /api/health returns 200 with service metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('recoverai-api');
    expect(res.body.disclaimer).toContain('Demo project');
  });

  it('POST /api/ai/analyze returns deterministic recovery scoring', async () => {
    const payload = {
      amount: 15000,
      paymentMethod: 'UPI',
      failureReason: 'BANK_SERVER_DOWN',
      lifetimeValue: 95000,
      totalTransactions: 15,
      successfulTransactions: 13,
      failedTransactions: 2,
      activityLevel: 'HIGH',
      subscriptionStatus: 'ACTIVE',
      daysSinceLastSuccess: 3,
      retryAttemptsCount: 0,
    };

    const res = await request(app).post('/api/ai/analyze').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recoveryScore).toBeGreaterThanOrEqual(75);
    expect(res.body.data.expectedRecovery).toBeGreaterThan(10000);
    expect(res.body.data.explanation.factorBreakdown.length).toBe(6);
  });

  it('POST /api/ai/analyze returns 400 validation error on negative or missing amount', async () => {
    const invalidPayload = {
      amount: -500,
      failureReason: 'INVALID',
    };

    const res = await request(app).post('/api/ai/analyze').send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/strategies returns standard recovery strategy definitions', async () => {
    const res = await request(app).get('/api/strategies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });
});

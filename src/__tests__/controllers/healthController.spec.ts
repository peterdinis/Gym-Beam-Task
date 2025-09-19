import request from 'supertest';
import app from '../../server';

describe('HealthController E2E', () => {
    it('GET /health should return health status', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('version', '1.0.0');
    });
});

import request from 'supertest';
import app from '../../server';

/**
 * E2E tests for the HealthController.
 *
 * These tests verify that the `/health` endpoint responds correctly,
 * ensuring that the service is running and provides the expected
 * health status information.
 */
describe('HealthController E2E', () => {
    /**
     * Test: GET /health should return the current health status.
     *
     * This test checks that:
     * - The HTTP status code is 200 (OK).
     * - The response body contains:
     *   - `status`: Service health status (expected to be `"healthy"`).
     *   - `timestamp`: A timestamp indicating when the check was made.
     *   - `uptime`: The server uptime in seconds.
     *   - `version`: The current application version (expected to be `"1.0.0"`).
     */
    it('GET /health should return health status', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('version', '1.0.0');
    });
});

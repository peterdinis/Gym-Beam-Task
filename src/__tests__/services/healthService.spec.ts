import { parseISO, isValid } from 'date-fns';
import { HealthService } from '../../services/healthService';

/**
 * Test suite for the {@link HealthService}.
 *
 * This suite verifies that the `HealthService` correctly provides
 * health status information, including:
 * - Service health status
 * - Current timestamp in ISO format
 * - Server uptime
 * - Application version
 */
describe('HealthService', () => {
    let service: HealthService;

    /**
     * Creates a new instance of {@link HealthService} before each test.
     */
    beforeEach(() => {
        service = new HealthService();
    });

    /**
     * Ensures the health status object contains the correct structure.
     *
     * Expected properties:
     * - `status`: The health status of the service (should be `"healthy"`).
     * - `timestamp`: The ISO-formatted timestamp of the health check.
     * - `uptime`: The current uptime of the service in seconds.
     * - `version`: The application version (expected `"1.0.0"`).
     */
    it('should return correct health status structure', () => {
        const result = service.getHealthStatus();

        expect(result).toHaveProperty('status', 'healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
        expect(result).toHaveProperty('version', '1.0.0');
    });

    /**
     * Verifies that the `timestamp` returned by the health status
     * is a valid ISO 8601 date string.
     */
    it('should return a valid ISO timestamp', () => {
        const result = service.getHealthStatus();
        const date = parseISO(result.timestamp);

        expect(isValid(date)).toBe(true);
    });

    /**
     * Checks that the `uptime` is a number greater than or equal to 0,
     * indicating the service has been running for a measurable duration.
     */
    it('uptime should be a number greater than 0', () => {
        const result = service.getHealthStatus();
        expect(typeof result.uptime).toBe('number');
        expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
});

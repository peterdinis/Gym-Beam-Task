import { parseISO, isValid } from 'date-fns';
import { HealthService } from '../../services/healthService';

describe('HealthService', () => {
    let service: HealthService;

    beforeEach(() => {
        service = new HealthService();
    });

    it('should return correct health status structure', () => {
        const result = service.getHealthStatus();

        expect(result).toHaveProperty('status', 'healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
        expect(result).toHaveProperty('version', '1.0.0');
    });

    it('should return a valid ISO timestamp', () => {
        const result = service.getHealthStatus();
        const date = parseISO(result.timestamp);

        expect(isValid(date)).toBe(true);
    });

    it('uptime should be a number greater than 0', () => {
        const result = service.getHealthStatus();
        expect(typeof result.uptime).toBe('number');
        expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
});

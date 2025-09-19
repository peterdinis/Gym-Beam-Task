import { formatISO } from 'date-fns';

export class HealthService {
    getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: formatISO(new Date()),
            uptime: process.uptime(),
            version: '1.0.0',
        };
    }
}
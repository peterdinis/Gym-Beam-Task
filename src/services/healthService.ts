import { formatISO } from 'date-fns';

/**
 * Service responsible for retrieving the application's health status.
 *
 * The {@link HealthService} provides runtime information such as:
 * - Current health status
 * - Server uptime
 * - Application version
 * - Timestamp of the health check
 */
export class HealthService {
    /**
     * Retrieves the current health status of the application.
     *
     * @returns {object} Health status information
     * @property {string} status - Current service health (e.g., "healthy")
     * @property {string} timestamp - ISO 8601 formatted timestamp of the health check
     * @property {number} uptime - Server uptime in seconds
     * @property {string} version - Application version
     *
     * @example
     * const healthService = new HealthService();
     * const status = healthService.getHealthStatus();
     * // {
     * //   status: 'healthy',
     * //   timestamp: '2025-09-20T12:34:56.789Z',
     * //   uptime: 12345,
     * //   version: '1.0.0'
     * // }
     */
    getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: formatISO(new Date()),
            uptime: process.uptime(),
            version: '1.0.0',
        };
    }
}

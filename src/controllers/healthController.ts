import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';

/**
 * Controller responsible for handling health check requests.
 *
 * The {@link HealthController} exposes an endpoint to verify the
 * application's runtime status, including:
 * - Current health status
 * - Server uptime
 * - Application version
 * - Current timestamp
 *
 * ---
 * ### Swagger Documentation
 * @swagger
 * tags:
 *   name: Health
 *   description: API endpoint for checking application health status
 *
 * /health:
 *   get:
 *     summary: Returns the current health status of the application.
 *     description: Provides a quick health check with status, uptime, version, and a timestamp.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-09-20T12:34:56.789Z
 *                 uptime:
 *                   type: number
 *                   example: 12345
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
export class HealthController {
    /** Service used to retrieve the current health status of the application. */
    private healthService = new HealthService();

    /**
     * Express route handler for `GET /health`.
     *
     * Retrieves the current health status from the {@link HealthService}
     * and responds with a JSON object containing:
     * - `status`: The service health status (e.g., `"healthy"`).
     * - `timestamp`: ISO 8601 timestamp of the health check.
     * - `uptime`: The current server uptime in seconds.
     * - `version`: The application version.
     *
     * @param _req - The incoming HTTP request (not used in this handler).
     * @param res - The HTTP response used to send the health status.
     * @returns {void} Sends a JSON response with the health status.
     */
    getHealth = (_req: Request, res: Response): void => {
        const healthStatus = this.healthService.getHealthStatus();
        res.json(healthStatus);
    };
}

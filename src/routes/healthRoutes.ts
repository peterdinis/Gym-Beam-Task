import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

/**
 * Express router responsible for **health check** endpoints.
 *
 * This router exposes application runtime status information,
 * such as current health, uptime, version, and timestamp.
 *
 * @module HealthRoutes
 */
const router = Router();

/** Instance of {@link HealthController} used to handle health check requests. */
const healthController = new HealthController();

/**
 * GET `/health`
 *
 * Returns the current health status of the application.
 *
 * **Response:**
 * ```json
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-09-20T12:34:56.000Z",
 *   "uptime": 12345,
 *   "version": "1.0.0"
 * }
 * ```
 *
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the current health status of the API, including uptime, version, and a timestamp.
 *     responses:
 *       200:
 *         description: Successful health check response
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
 *                   example: "2025-09-20T12:34:56.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 12345
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get('/health', healthController.getHealth);

export default router;

import express, { Router } from 'express';
import { OptimizationController } from '../controllers/optimalizationController';

const router: Router = express.Router();
const optimizationController = new OptimizationController();

/**
 * @module OptimizationRoutes
 * @description Routes for warehouse order optimization
 */

/**
 * POST /optimize
 *
 * Optimize order picking based on a list of products and the worker's starting position.
 *
 * @name POST /optimize
 * @function
 * @memberof module:OptimizationRoutes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with optimized picking order and total distance
 *
 * @example
 * // Request body
 * {
 *   "products": ["product-1", "product-2"],
 *   "startingPosition": { "x": 0, "y": 0, "z": 0 }
 * }
 *
 * @example
 * // Successful response
 * {
 *   "distance": 512,
 *   "pickingOrder": [
 *     { "productId": "product-2", "positionId": "position-123" },
 *     { "productId": "product-1", "positionId": "position-55" }
 *   ]
 * }
 */
router.post('/optimize', (req, res) => {
    optimizationController.optimizeOrder(req, res);
});

export default router;

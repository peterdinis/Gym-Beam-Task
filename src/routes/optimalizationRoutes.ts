import express, { Router } from 'express';
import { OptimizationController } from '../controllers/optimalizationController';

const router: Router = express.Router();
const optimizationController = new OptimizationController();

/**
 * @module OptimizationRoutes
 * @description Routes for warehouse order optimization.
 *
 * Provides endpoints to optimize the picking sequence of warehouse products
 * based on their positions and the worker's starting coordinates.
 */

/**
 * POST /optimize
 *
 * Optimize order picking based on a list of products and the worker's starting position.
 *
 * @name POST /optimize
 * @function
 * @memberof module:OptimizationRoutes
 * @param {Request} req - Express request object containing:
 * ```json
 * {
 *   "products": ["product-1", "product-2"],
 *   "startingPosition": { "x": 0, "y": 0, "z": 0 }
 * }
 * ```
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with optimized picking order and total distance.
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
 *
 * @openapi
 * /optimize:
 *   post:
 *     summary: Optimize order picking
 *     description: |
 *       Computes the most efficient picking order based on provided product IDs and
 *       a starting warehouse position. Returns the total travel distance and the
 *       optimized picking sequence.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - startingPosition
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["product-1", "product-2"]
 *               startingPosition:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                     example: 0
 *                   y:
 *                     type: number
 *                     example: 0
 *                   z:
 *                     type: number
 *                     example: 0
 *     responses:
 *       200:
 *         description: Optimization successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 distance:
 *                   type: number
 *                   description: Total optimized travel distance
 *                   example: 512
 *                 pickingOrder:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         example: product-1
 *                       positionId:
 *                         type: string
 *                         example: position-123
 *       400:
 *         description: Invalid request format
 *       404:
 *         description: Product positions not found
 *       502:
 *         description: Warehouse API unavailable
 *       500:
 *         description: Internal server error
 */
router.post('/optimize', (req, res) => {
    optimizationController.optimizeOrder(req, res);
});

export default router;

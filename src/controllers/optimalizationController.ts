import { Request, Response } from 'express';
import { OptimizationService } from '../services/optimalizationService';
import { WarehouseApiService } from '../services/warehouseService';
import { validateOrderRequest } from '../validators/orderValidator';
import { OptimizationError } from '../types/optimizationTypes';
import { ZodError } from 'zod';

/**
 * Controller responsible for handling **order optimization** requests.
 */
export class OptimizationController {
    private warehouseApi = new WarehouseApiService();
    private optimizationService = new OptimizationService();

    /**
     * Handles the **POST /optimize** request.
     *
     * @swagger
     * /optimize:
     *   post:
     *     summary: Optimize picking order for an order
     *     tags:
     *       - Optimization
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
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
     *         description: Successfully optimized picking order
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 distance:
     *                   type: number
     *                 pickingOrder:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       productId:
     *                         type: string
     *                       positionId:
     *                         type: string
     *       400:
     *         description: Invalid request body
     *       404:
     *         description: No available positions found for some products
     *       502:
     *         description: Unable to fetch warehouse data
     *       500:
     *         description: Internal server error
     */
    async optimizeOrder(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body using Zod
            const orderRequest = validateOrderRequest(req.body);

            // Fetch available positions for all products
            const productsPositions = await this.warehouseApi.getMultipleProductPositions(
                orderRequest.products,
            );

            // Throw 404 if any product has no positions
            const missingProducts = Array.from(productsPositions.entries())
                .filter(([positions]) => positions.length === 0)
                .map(([productId]) => productId);

            if (missingProducts.length > 0) {
                res.status(404).json({
                    error: `No available positions found for remaining products: ${missingProducts.join(
                        ', ',
                    )}`,
                });
                return;
            }

            // Run optimization
            const result = this.optimizationService.optimizePickingOrder(
                productsPositions,
                orderRequest.startingPosition,
            );

            res.json(result);
        } catch (err: unknown) {
            const error = err as OptimizationError;

            console.error(
                'Error processing optimization request:',
                error instanceof Error ? error.message : error,
            );

            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Invalid request format',
                    details: error.issues,
                });
            } else if (
                error instanceof Error &&
                (error.message.includes('API Error') || error.message.includes('Network Error'))
            ) {
                res.status(502).json({
                    error: 'Unable to fetch warehouse data',
                    details: error.message,
                });
            } else {
                res.status(500).json({
                    error: 'Internal server error',
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
}

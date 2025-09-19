import { Request, Response } from 'express';
import { OptimizationService } from '../services/optimalizationService';
import { WarehouseApiService } from '../services/warehouseService';
import { validateOrderRequest } from '../validators/orderValidator';
import { OptimizationError } from '../types/optimizationTypes';
import { ZodError } from 'zod';
/**
 * Controller for order optimization
 */
export class OptimizationController {
    private warehouseApi = new WarehouseApiService();
    private optimizationService = new OptimizationService();

    /**
     * @openapi
     * /optimize:
     *   post:
     *     summary: Optimize order picking
     *     description: Optimize picking order based on products and starting position
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
     *                   y:
     *                     type: number
     *                   z:
     *                     type: number
     *                 example: { x: 0, y: 0, z: 0 }
     *     responses:
     *       200:
     *         description: Optimization result
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
     *         description: Invalid request format
     *       404:
     *         description: Product positions not found
     *       502:
     *         description: Warehouse API unavailable
     *       500:
     *         description: Internal server error
     */
    async optimizeOrder(req: Request, res: Response): Promise<void> {
        try {
            const orderRequest = validateOrderRequest(req.body);

            const productsPositions = await this.warehouseApi.getMultipleProductPositions(
                orderRequest.products,
            );

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
            } else if (error instanceof Error && error.message.includes('No available positions')) {
                res.status(404).json({
                    error: error.message,
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

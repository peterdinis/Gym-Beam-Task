import { OptimizationService } from '../../services/optimalizationService';
import { ProductPosition, Position3D, OptimizationResult } from '../../types/globalTypes';

/**
 * Test suite for the {@link OptimizationService}.
 *
 * This suite validates that the `OptimizationService` correctly determines
 * the optimal picking order of products in a warehouse and calculates the
 * total distance traveled when picking items.
 */
describe('OptimizationService', () => {
    let service: OptimizationService;

    /**
     * Creates a new instance of {@link OptimizationService} before each test.
     */
    beforeEach(() => {
        service = new OptimizationService();
    });

    /**
     * Tests for the `optimizePickingOrder` method.
     *
     * This method is expected to:
     * - Determine the most efficient order to pick products based on their positions.
     * - Skip products with zero available quantity.
     * - Throw an error if no valid product positions are available.
     * - Correctly calculate the total distance traveled.
     */
    describe('optimizePickingOrder', () => {
        /**
         * Verifies that the service returns the correct picking order
         * and total distance when multiple products are available.
         *
         * Scenario:
         * - Two products are present (`product-1` and `product-2`).
         * - The service should choose the nearest position for each product
         *   and calculate the distance from the starting position.
         */
        it('should return correct picking order and distance for multiple products', () => {
            const productsPositions = new Map<string, ProductPosition[]>();

            productsPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 1 },
                { productId: 'product-1', positionId: 'pos-2', x: 5, y: 0, z: 0, quantity: 1 },
            ]);

            productsPositions.set('product-2', [
                { productId: 'product-2', positionId: 'pos-3', x: 1, y: 1, z: 0, quantity: 1 },
            ]);

            const startingPosition: Position3D = { x: 0, y: 0, z: 0 };

            const result: OptimizationResult = service.optimizePickingOrder(
                productsPositions,
                startingPosition,
            );

            expect(result.pickingOrder[0].productId).toBe('product-1');
            expect(result.pickingOrder[0].positionId).toBe('pos-1');

            expect(result.pickingOrder[1].productId).toBe('product-2');
            expect(result.pickingOrder[1].positionId).toBe('pos-3');

            expect(result.distance).toBeCloseTo(Math.sqrt(2), 2);
        });

        /**
         * Ensures that products with zero available quantity are skipped
         * and not included in the picking order.
         */
        it('should skip products with no available quantity', () => {
            const productsPositions = new Map<string, ProductPosition[]>();

            productsPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 0 },
            ]);

            productsPositions.set('product-2', [
                { productId: 'product-2', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 1 },
            ]);

            const startingPosition: Position3D = { x: 0, y: 0, z: 0 };

            const result: OptimizationResult = service.optimizePickingOrder(
                productsPositions,
                startingPosition,
            );

            expect(result.pickingOrder.length).toBe(1);
            expect(result.pickingOrder[0].productId).toBe('product-2');
            expect(result.pickingOrder[0].positionId).toBe('pos-2');
        });

        /**
         * Verifies that an error is thrown when no products
         * have available positions to pick from.
         *
         * Expected behavior:
         * - Throws an error with the message:
         *   `"No available positions found for remaining products"`.
         */
        it('should throw error if no available positions for any product', () => {
            const productsPositions = new Map<string, ProductPosition[]>();

            productsPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 0 },
            ]);

            productsPositions.set('product-2', [
                { productId: 'product-2', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 0 },
            ]);

            const startingPosition: Position3D = { x: 0, y: 0, z: 0 };

            expect(() => service.optimizePickingOrder(productsPositions, startingPosition)).toThrow(
                'No available positions found for remaining products',
            );
        });

        /**
         * Confirms that the method correctly handles the case
         * where there is only a single product to pick.
         *
         * Checks that:
         * - The picking order contains exactly one item.
         * - The calculated distance matches the expected
         *   Euclidean distance from the starting position.
         */
        it('should correctly handle single product', () => {
            const productsPositions = new Map<string, ProductPosition[]>();
            productsPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 3, y: 4, z: 0, quantity: 1 },
            ]);

            const startingPosition: Position3D = { x: 0, y: 0, z: 0 };

            const result = service.optimizePickingOrder(productsPositions, startingPosition);

            expect(result.pickingOrder.length).toBe(1);
            expect(result.distance).toBe(5); // 3-4-5 triangle
        });
    });
});

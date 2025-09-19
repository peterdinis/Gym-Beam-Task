import { OptimizationService } from '../services/optimalizationService';
import { ProductPosition, Position3D, OptimizationResult } from '../types/globalTypes';

describe('OptimizationService', () => {
  let service: OptimizationService;

  beforeEach(() => {
    service = new OptimizationService();
  });

  describe('optimizePickingOrder', () => {
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

      const result: OptimizationResult = service.optimizePickingOrder(productsPositions, startingPosition);

      // Should pick closest product first
      expect(result.pickingOrder[0].productId).toBe('product-1');
      expect(result.pickingOrder[0].positionId).toBe('pos-1');

      // Then product-2
      expect(result.pickingOrder[1].productId).toBe('product-2');
      expect(result.pickingOrder[1].positionId).toBe('pos-3');

      // Distance should be correct (approximate)
      expect(result.distance).toBeCloseTo(Math.sqrt(0) + Math.sqrt(1*1 + 1*1 + 0*0), 2);
    });

    it('should skip products with no available quantity', () => {
      const productsPositions = new Map<string, ProductPosition[]>();

      productsPositions.set('product-1', [
        { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 0 },
      ]);

      productsPositions.set('product-2', [
        { productId: 'product-2', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 1 },
      ]);

      const startingPosition: Position3D = { x: 0, y: 0, z: 0 };

      const result: OptimizationResult = service.optimizePickingOrder(productsPositions, startingPosition);

      expect(result.pickingOrder.length).toBe(1);
      expect(result.pickingOrder[0].productId).toBe('product-2');
    });

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

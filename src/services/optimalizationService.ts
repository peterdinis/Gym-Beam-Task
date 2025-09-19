import { Position3D, ProductPosition, OptimizationResult, PickingOrderItem } from "../types/globalTypes";


export class OptimizationService {
  /**
   * Calculate 3D Euclidean distance between two positions
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Distance between positions
   */
  private calculateDistance(pos1: Position3D, pos2: Position3D): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Find the best position for a product (closest to current location with available quantity)
   * @param positions - Available positions for the product
   * @param currentPosition - Current worker position
   * @returns Best position to pick the product from
   */
  private findBestPosition(positions: ProductPosition[], currentPosition: Position3D): ProductPosition {
    // Filter positions with available quantity
    const availablePositions = positions.filter(pos => pos.quantity > 0);
    
    if (availablePositions.length === 0) {
      throw new Error('No available positions with stock for product');
    }

    // Find position with minimum distance
    let bestPosition = availablePositions[0];
    let minDistance = this.calculateDistance(currentPosition, bestPosition);

    for (let i = 1; i < availablePositions.length; i++) {
      const distance = this.calculateDistance(currentPosition, availablePositions[i]);
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = availablePositions[i];
      }
    }

    return bestPosition;
  }

  /**
   * Optimize the picking order using a greedy nearest-neighbor approach
   * @param productsPositions - Map of product IDs to their available positions
   * @param startingPosition - Worker's starting position
   * @returns Optimization result with total distance and picking order
   */
  optimizePickingOrder(
    productsPositions: Map<string, ProductPosition[]>,
    startingPosition: Position3D
  ): OptimizationResult {
    const pickingOrder: PickingOrderItem[] = [];
    let currentPosition: Position3D = { ...startingPosition };
    let totalDistance = 0;

    // Create array of products to pick
    const productsToPickup = Array.from(productsPositions.keys());

    // Greedy algorithm: always pick the closest available product
    while (productsToPickup.length > 0) {
      let closestProductIndex = 0;
      let closestPosition: ProductPosition | null = null;
      let minDistance = Infinity;

      // Find the closest product from current position
      for (let i = 0; i < productsToPickup.length; i++) {
        const productId = productsToPickup[i];
        const positions = productsPositions.get(productId)!;
        
        try {
          const bestPosition = this.findBestPosition(positions, currentPosition);
          const distance = this.calculateDistance(currentPosition, bestPosition);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestProductIndex = i;
            closestPosition = bestPosition;
          }
        } catch (error) {
          // Skip products with no available positions
          continue;
        }
      }

      if (!closestPosition) {
        throw new Error('No available positions found for remaining products');
      }

      // Add to picking order
      const productId = productsToPickup[closestProductIndex];
      pickingOrder.push({
        productId,
        positionId: closestPosition.positionId
      });

      // Update totals
      totalDistance += minDistance;
      currentPosition = {
        x: closestPosition.x,
        y: closestPosition.y,
        z: closestPosition.z
      };

      // Remove picked product from list
      productsToPickup.splice(closestProductIndex, 1);
    }

    return {
      distance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
      pickingOrder
    };
  }
}
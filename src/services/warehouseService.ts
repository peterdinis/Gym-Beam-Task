import axios, { AxiosResponse } from 'axios';
import { ProductPosition } from '../types';

export class WarehouseApiService {
  private readonly baseUrl = 'https://api.gymbeam.io/case-study-picking-optimization';
  private readonly apiKey = 'MVGBMS0VQI555bTery9qJ91BfUpi53N24SkKMf9Z';

  /**
   * Fetch all positions for a specific product from the warehouse API
   * @param productId - The product identifier (e.g., "product-1")
   * @returns Array of product positions
   */
  async getProductPositions(productId: string): Promise<ProductPosition[]> {
    try {
      const response: AxiosResponse<ProductPosition[]> = await axios.get(
        `${this.baseUrl}/products/${productId}/positions`,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Unable to reach warehouse API');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  /**
   * Fetch positions for multiple products concurrently
   * @param productIds - Array of product identifiers
   * @returns Map of productId to array of positions
   */
  async getMultipleProductPositions(productIds: string[]): Promise<Map<string, ProductPosition[]>> {
    const promises = productIds.map(async (productId) => {
      const positions = await this.getProductPositions(productId);
      return { productId, positions };
    });

    const results = await Promise.all(promises);
    const positionsMap = new Map<string, ProductPosition[]>();

    results.forEach(({ productId, positions }) => {
      positionsMap.set(productId, positions);
    });

    return positionsMap;
  }
}
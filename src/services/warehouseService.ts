import axios, { AxiosResponse } from 'axios';
import { ProductPosition } from '../types/globalTypes';
import { WarehouseApiError } from '../types/warehouseTypes';

export class WarehouseApiService {
    private readonly baseUrl = process.env.WAREHOUSE_API_BASE_URL;
    private readonly apiKey = process.env.WAREHOUSE_API_KEY;

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
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                },
            );

            return response.data;
        } catch (err: unknown) {
            const error = err as WarehouseApiError;

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new Error(
                        `API Error: ${error.response.status} - ${error.response.statusText}`,
                    );
                } else if (error.request) {
                    throw new Error('Network Error: Unable to reach warehouse API');
                } else {
                    throw new Error(`Request Error: ${error.message}`);
                }
            } else if (error instanceof Error) {
                throw new Error(`Unknown Error: ${error.message}`);
            } else {
                throw new Error('Unknown non-error thrown');
            }
        }
    }

    /**
     * Fetch positions for multiple products concurrently
     * @param productIds - Array of product identifiers
     * @returns Map of productId to array of positions
     */
    async getMultipleProductPositions(
        productIds: string[],
    ): Promise<Map<string, ProductPosition[]>> {
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

import axios, { AxiosResponse } from 'axios';
import { MockAxiosError, ProductPosition } from '../types/globalTypes';

/**
 * Service for interacting with the external **Warehouse API**.
 *
 * The {@link WarehouseApiService} provides methods to fetch product positions
 * for single or multiple products, handling both network and API errors.
 */
export class WarehouseApiService {
    /** Base URL of the warehouse API, taken from environment variables. */
    private readonly baseUrl = process.env.WAREHOUSE_API_BASE_URL;

    /** API key used for authenticating requests to the warehouse API. */
    private readonly apiKey = process.env.WAREHOUSE_API_KEY;

    /**
     * Fetches all available positions for a single product from the warehouse API.
     *
     * @param productId - The ID of the product to fetch positions for.
     * @returns {Promise<ProductPosition[]>} Array of product positions.
     *
     * @throws {Error} When the API returns an error response, network error occurs,
     * or an unknown error is encountered.
     *
     * @example
     * const service = new WarehouseApiService();
     * const positions = await service.getProductPositions('product-1');
     * // [
     * //   { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 10 },
     * //   { productId: 'product-1', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 5 }
     * // ]
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
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    throw new Error(
                        `API Error: ${err.response.status} - ${err.response.statusText}`,
                    );
                } else if (err.request) {
                    throw new Error('Network Error: Unable to reach warehouse API');
                } else {
                    throw new Error(`Request Error: ${err.message}`);
                }
            }

            // Handle mock axios errors in tests
            const mockError = err as MockAxiosError;
            if (mockError.isAxiosError) {
                if (mockError.response) {
                    throw new Error(
                        `API Error: ${mockError.response.status} - ${mockError.response.statusText}`,
                    );
                } else if (mockError.request) {
                    throw new Error('Network Error: Unable to reach warehouse API');
                } else {
                    throw new Error(`Request Error: ${mockError.message || 'Unknown axios error'}`);
                }
            }

            if (err instanceof Error) {
                throw new Error(`Unknown Error: ${err.message}`);
            }

            throw new Error('Unknown non-error thrown');
        }
    }

    /**
     * Fetches product positions for multiple products and returns a map of results.
     *
     * @param productIds - Array of product IDs to fetch positions for.
     * @returns {Promise<Map<string, ProductPosition[]>>} Map where keys are product IDs and values are arrays of positions.
     *
     * @example
     * const service = new WarehouseApiService();
     * const positionsMap = await service.getMultipleProductPositions(['p1', 'p2']);
     * const p1Positions = positionsMap.get('p1');
     * const p2Positions = positionsMap.get('p2');
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

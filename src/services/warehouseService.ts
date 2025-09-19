import axios, { AxiosResponse } from 'axios';
import { MockAxiosError, ProductPosition } from '../types/globalTypes';

export class WarehouseApiService {
    private readonly baseUrl = process.env.WAREHOUSE_API_BASE_URL;
    private readonly apiKey = process.env.WAREHOUSE_API_KEY;

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

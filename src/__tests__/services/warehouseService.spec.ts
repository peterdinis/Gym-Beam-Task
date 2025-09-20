import axios from 'axios';
import { WarehouseApiService } from '../../services/warehouseService';
import { ProductPosition } from '../../types/globalTypes';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * Test suite for the {@link WarehouseApiService}.
 *
 * This suite verifies that the service correctly interacts with the external
 * Warehouse API to:
 * - Retrieve product positions for a single product.
 * - Retrieve product positions for multiple products.
 * - Handle different error scenarios (API errors, network errors).
 */
describe('WarehouseApiService', () => {
    let service: WarehouseApiService;

    /**
     * Creates a new instance of {@link WarehouseApiService} before each test
     * and clears all previous mock calls to avoid cross-test interference.
     */
    beforeEach(() => {
        service = new WarehouseApiService();
        jest.clearAllMocks();
    });

    /**
     * Tests for the {@link WarehouseApiService.getProductPositions} method.
     *
     * This method should:
     * - Perform an HTTP GET request to the warehouse API for a specific product.
     * - Return a list of {@link ProductPosition} objects.
     * - Throw appropriate errors when the API call fails.
     */
    describe('getProductPositions', () => {
        /**
         * Ensures the service successfully fetches product positions when
         * the warehouse API returns a valid response.
         *
         * Expected behavior:
         * - Returns the same array of positions provided by the API.
         * - Calls Axios with the correct URL and request headers.
         */
        it('should fetch product positions successfully', async () => {
            const mockPositions: ProductPosition[] = [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 10 },
                { productId: 'product-1', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 5 },
            ];

            mockedAxios.get.mockResolvedValue({ data: mockPositions });

            const result = await service.getProductPositions('product-1');

            expect(result).toEqual(mockPositions);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${process.env.WAREHOUSE_API_BASE_URL}/products/product-1/positions`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-api-key': process.env.WAREHOUSE_API_KEY,
                        'Content-Type': 'application/json',
                    }),
                }),
            );
        });

        /**
         * Verifies that the service throws a descriptive API error when the
         * Axios request fails with an HTTP response.
         *
         * Example error message:
         * `"API Error: 500 - Internal Server Error"`.
         */
        it('should throw error if axios request fails with response', async () => {
            // Properly simulates an AxiosError with a response object.
            const error = {
                isAxiosError: true,
                response: { status: 500, statusText: 'Internal Server Error' },
            };

            mockedAxios.get.mockRejectedValue(error);

            await expect(service.getProductPositions('product-1')).rejects.toThrow(
                'API Error: 500 - Internal Server Error',
            );
        });

        /**
         * Verifies that the service throws a network error when the
         * Axios request fails without receiving a response.
         *
         * Example error message:
         * `"Network Error: Unable to reach warehouse API"`.
         */
        it('should throw network error if request fails without response', async () => {
            const error = {
                isAxiosError: true,
                request: {},
            };

            mockedAxios.get.mockRejectedValue(error);

            await expect(service.getProductPositions('product-1')).rejects.toThrow(
                'Network Error: Unable to reach warehouse API',
            );
        });
    });

    /**
     * Tests for the {@link WarehouseApiService.getMultipleProductPositions} method.
     *
     * This method should:
     * - Fetch product positions for each product ID provided.
     * - Return a Map where each key is a product ID and each value is an array of positions.
     * - Perform multiple Axios GET requests (one per product).
     */
    describe('getMultipleProductPositions', () => {
        /**
         * Confirms that positions are fetched for multiple products
         * and returned in a Map keyed by product ID.
         *
         * Expected behavior:
         * - The result contains the positions for each product.
         * - Axios is called the correct number of times.
         */
        it('should fetch positions for multiple products', async () => {
            const mockPositions1: ProductPosition[] = [
                { productId: 'p1', positionId: 'pos1', x: 0, y: 0, z: 0, quantity: 10 },
            ];
            const mockPositions2: ProductPosition[] = [
                { productId: 'p2', positionId: 'pos2', x: 1, y: 1, z: 1, quantity: 5 },
            ];

            mockedAxios.get
                .mockResolvedValueOnce({ data: mockPositions1 })
                .mockResolvedValueOnce({ data: mockPositions2 });

            const result = await service.getMultipleProductPositions(['p1', 'p2']);

            expect(result.get('p1')).toEqual(mockPositions1);
            expect(result.get('p2')).toEqual(mockPositions2);
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });
    });
});

import request from 'supertest';
import app from '../../server';
import { WarehouseApiService } from '../../services/warehouseService';
import { OptimizationService } from '../../services/optimalizationService';
import { ProductPosition } from '../../types/globalTypes';

jest.mock('../../services/warehouseService');
jest.mock('../../services/optimalizationService');

describe('OptimizationController E2E', () => {
    const mockWarehouseApi = WarehouseApiService as jest.MockedClass<typeof WarehouseApiService>;
    const mockOptimizationService = OptimizationService as jest.MockedClass<typeof OptimizationService>;

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /optimize should return optimized picking order', async () => {
        const products = ['product-1', 'product-2'];
        const startingPosition = { x: 0, y: 0, z: 0 };

        const productPositions: ProductPosition[] = [
            { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 1 },
            { productId: 'product-2', positionId: 'pos-2', x: 1, y: 1, z: 0, quantity: 1 },
        ];

        mockWarehouseApi.prototype.getMultipleProductPositions.mockResolvedValue(
            new Map([
                ['product-1', [productPositions[0]]],
                ['product-2', [productPositions[1]]],
            ]),
        );

        const optimizationResult = {
            distance: 2,
            pickingOrder: [
                { productId: 'product-1', positionId: 'pos-1' },
                { productId: 'product-2', positionId: 'pos-2' },
            ],
        };
        mockOptimizationService.prototype.optimizePickingOrder.mockReturnValue(optimizationResult);

        const response = await request(app)
            .post('/optimize')
            .send({ products, startingPosition })
            .expect(200);

        expect(response.body).toEqual(optimizationResult);
    });

    it('POST /optimize should return 400 for invalid request', async () => {
        const response = await request(app)
            .post('/optimize')
            .send({ products: [], startingPosition: { x: 0, y: 0 } })
            .expect(400);

        expect(response.body).toHaveProperty('error', 'Invalid request format');
        expect(response.body).toHaveProperty('details');
    });

    it('POST /optimize should return 404 if no positions are available', async () => {
        mockWarehouseApi.prototype.getMultipleProductPositions.mockResolvedValue(
            new Map([['product-1', []]]),
        );

        const response = await request(app)
            .post('/optimize')
            .send({ products: ['product-1'], startingPosition: { x: 0, y: 0, z: 0 } })
            .expect(404);

        expect(response.body).toHaveProperty(
            'error',
            'No available positions found for remaining products: product-1',
        );
    });

    it('POST /optimize should return 502 if warehouse API fails', async () => {
        mockWarehouseApi.prototype.getMultipleProductPositions.mockRejectedValue(
            new Error('API Error: 500 - Internal Server Error'),
        );

        const response = await request(app)
            .post('/optimize')
            .send({ products: ['product-1'], startingPosition: { x: 0, y: 0, z: 0 } })
            .expect(502);

        expect(response.body).toHaveProperty('error', 'Unable to fetch warehouse data');
    });

    it('POST /optimize should return 500 for unexpected errors', async () => {
        mockWarehouseApi.prototype.getMultipleProductPositions.mockRejectedValue(new Error('Unexpected error'));

        const response = await request(app)
            .post('/optimize')
            .send({ products: ['product-1'], startingPosition: { x: 0, y: 0, z: 0 } })
            .expect(500);

        expect(response.body).toHaveProperty('error', 'Internal server error');
        expect(response.body).toHaveProperty('details', 'Unexpected error');
    });
});

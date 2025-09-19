import request from 'supertest';
import express from 'express';
import { OptimizationController } from '../../controllers/optimalizationController';
import { WarehouseApiService } from '../../services/warehouseService';
import { ProductPosition } from '../../types/globalTypes';

// Mock warehouse service
jest.mock('../../services/warehouseService');
const MockedWarehouseApiService = WarehouseApiService as jest.MockedClass<
    typeof WarehouseApiService
>;

describe('OptimizationController E2E', () => {
    let app: express.Application;
    let controller: OptimizationController;
    let mockWarehouseService: jest.Mocked<WarehouseApiService>;

    beforeEach(() => {
        // Create Express app
        app = express();
        app.use(express.json());

        // Create controller instance
        controller = new OptimizationController();

        // Setup mock warehouse service
        mockWarehouseService = new MockedWarehouseApiService() as jest.Mocked<WarehouseApiService>;
        (controller as unknown as { warehouseApi: jest.Mocked<WarehouseApiService> }).warehouseApi = mockWarehouseService;

        // Setup route
        app.post('/optimize', (req, res) => controller.optimizeOrder(req, res));

        jest.clearAllMocks();
    });

    describe('POST /optimize - Success scenarios', () => {
        it('should optimize picking order successfully for multiple products', async () => {
            // Arrange
            const mockPositions = new Map<string, ProductPosition[]>();
            mockPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 10 },
                { productId: 'product-1', positionId: 'pos-2', x: 5, y: 0, z: 0, quantity: 5 },
            ]);
            mockPositions.set('product-2', [
                { productId: 'product-2', positionId: 'pos-3', x: 1, y: 1, z: 0, quantity: 8 },
            ]);

            mockWarehouseService.getMultipleProductPositions.mockResolvedValue(mockPositions);

            const requestBody = {
                products: ['product-1', 'product-2'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            // Act & Assert
            const response = await request(app).post('/optimize').send(requestBody).expect(200);

            expect(response.body).toHaveProperty('distance');
            expect(response.body).toHaveProperty('pickingOrder');
            expect(response.body.pickingOrder).toHaveLength(2);
            expect(response.body.pickingOrder[0]).toHaveProperty('productId');
            expect(response.body.pickingOrder[0]).toHaveProperty('positionId');

            expect(mockWarehouseService.getMultipleProductPositions).toHaveBeenCalledWith([
                'product-1',
                'product-2',
            ]);
        });

        it('should handle single product optimization', async () => {
            // Arrange
            const mockPositions = new Map<string, ProductPosition[]>();
            mockPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 3, y: 4, z: 0, quantity: 10 },
            ]);

            mockWarehouseService.getMultipleProductPositions.mockResolvedValue(mockPositions);

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            // Act & Assert
            const response = await request(app).post('/optimize').send(requestBody).expect(200);

            expect(response.body.distance).toBe(5); // 3-4-5 triangle
            expect(response.body.pickingOrder).toHaveLength(1);
            expect(response.body.pickingOrder[0].productId).toBe('product-1');
        });

        it('should skip products with no available quantity', async () => {
            // Arrange
            const mockPositions = new Map<string, ProductPosition[]>();
            mockPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 0 },
            ]);
            mockPositions.set('product-2', [
                { productId: 'product-2', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 5 },
            ]);

            mockWarehouseService.getMultipleProductPositions.mockResolvedValue(mockPositions);

            const requestBody = {
                products: ['product-1', 'product-2'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            // Act & Assert
            const response = await request(app).post('/optimize').send(requestBody).expect(200);

            expect(response.body.pickingOrder).toHaveLength(1);
            expect(response.body.pickingOrder[0].productId).toBe('product-2');
        });
    });

    describe('POST /optimize - Validation errors (400)', () => {
        it('should return 400 for missing products array', async () => {
            const requestBody = {
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(400);

            expect(response.body).toHaveProperty('error', 'Invalid request format');
            expect(response.body).toHaveProperty('details');
        });

        it('should return 400 for invalid starting position', async () => {
            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 'invalid', y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(400);

            expect(response.body).toHaveProperty('error', 'Invalid request format');
            expect(response.body).toHaveProperty('details');
        });

        it('should return 400 for empty products array', async () => {
            const requestBody = {
                products: [],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(400);

            expect(response.body).toHaveProperty('error', 'Invalid request format');
        });

        it('should return 400 for missing startingPosition', async () => {
            const requestBody = {
                products: ['product-1'],
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(400);

            expect(response.body).toHaveProperty('error', 'Invalid request format');
        });
    });

    describe('POST /optimize - Product not found errors (404)', () => {
        it('should return 404 when no products have available positions', async () => {
            // Arrange
            const mockPositions = new Map<string, ProductPosition[]>();
            mockPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 0, y: 0, z: 0, quantity: 0 },
            ]);
            mockPositions.set('product-2', [
                { productId: 'product-2', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 0 },
            ]);

            mockWarehouseService.getMultipleProductPositions.mockResolvedValue(mockPositions);

            const requestBody = {
                products: ['product-1', 'product-2'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            // Act & Assert
            const response = await request(app).post('/optimize').send(requestBody).expect(404);

            expect(response.body).toHaveProperty(
                'error',
                'No available positions found for remaining products',
            );
        });
    });

    describe('POST /optimize - Warehouse API errors (502)', () => {
        it('should return 502 for warehouse API errors', async () => {
            mockWarehouseService.getMultipleProductPositions.mockRejectedValue(
                new Error('API Error: 500 - Internal Server Error'),
            );

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(502);

            expect(response.body).toHaveProperty('error', 'Unable to fetch warehouse data');
            expect(response.body).toHaveProperty(
                'details',
                'API Error: 500 - Internal Server Error',
            );
        });

        it('should return 502 for network errors', async () => {
            mockWarehouseService.getMultipleProductPositions.mockRejectedValue(
                new Error('Network Error: Unable to reach warehouse API'),
            );

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(502);

            expect(response.body).toHaveProperty('error', 'Unable to fetch warehouse data');
            expect(response.body).toHaveProperty(
                'details',
                'Network Error: Unable to reach warehouse API',
            );
        });
    });

    describe('POST /optimize - Internal server errors (500)', () => {
        it('should return 500 for unexpected errors', async () => {
            mockWarehouseService.getMultipleProductPositions.mockRejectedValue(
                new Error('Unexpected database connection error'),
            );

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(500);

            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(response.body).toHaveProperty('details', 'Unexpected database connection error');
        });

        it('should handle non-Error objects', async () => {
            mockWarehouseService.getMultipleProductPositions.mockRejectedValue('String error');

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            const response = await request(app).post('/optimize').send(requestBody).expect(500);

            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(response.body).toHaveProperty('details', 'String error');
        });
    });

    describe('POST /optimize - Edge cases', () => {
        it('should handle products with multiple position options', async () => {
            // Arrange
            const mockPositions = new Map<string, ProductPosition[]>();
            mockPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 10, y: 10, z: 0, quantity: 1 },
                { productId: 'product-1', positionId: 'pos-2', x: 1, y: 0, z: 0, quantity: 5 }, // Closer position
                { productId: 'product-1', positionId: 'pos-3', x: 20, y: 20, z: 0, quantity: 2 },
            ]);

            mockWarehouseService.getMultipleProductPositions.mockResolvedValue(mockPositions);

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            // Act & Assert
            const response = await request(app).post('/optimize').send(requestBody).expect(200);

            // Should pick the closest position (pos-2)
            expect(response.body.pickingOrder[0].positionId).toBe('pos-2');
        });

        it('should handle 3D coordinates correctly', async () => {
            // Arrange
            const mockPositions = new Map<string, ProductPosition[]>();
            mockPositions.set('product-1', [
                { productId: 'product-1', positionId: 'pos-1', x: 1, y: 1, z: 1, quantity: 5 },
            ]);

            mockWarehouseService.getMultipleProductPositions.mockResolvedValue(mockPositions);

            const requestBody = {
                products: ['product-1'],
                startingPosition: { x: 0, y: 0, z: 0 },
            };

            // Act & Assert
            const response = await request(app).post('/optimize').send(requestBody).expect(200);

            // Distance should be sqrt(1^2 + 1^2 + 1^2) = sqrt(3) ≈ 1.73
            expect(response.body.distance).toBeCloseTo(Math.sqrt(3), 2);
        });
    });
});

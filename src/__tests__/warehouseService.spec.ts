import axios from 'axios';
import { WarehouseApiService } from '../services/warehouseService';
import { ProductPosition } from '../types/globalTypes';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WarehouseApiService', () => {
  let service: WarehouseApiService;

  beforeEach(() => {
    service = new WarehouseApiService();
    jest.clearAllMocks();
  });

  describe('getProductPositions', () => {
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
          }),
        }),
      );
    });

    it('should throw error if axios request fails with response', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 500, statusText: 'Internal Server Error' },
      });

      await expect(service.getProductPositions('product-1')).rejects.toThrow(
        'API Error: 500 - Internal Server Error',
      );
    });

    it('should throw network error if request fails without response', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        request: {},
      });

      await expect(service.getProductPositions('product-1')).rejects.toThrow(
        'Network Error: Unable to reach warehouse API',
      );
    });
  });

  describe('getMultipleProductPositions', () => {
    it('should fetch positions for multiple products', async () => {
      const mockPositions1: ProductPosition[] = [{ productId: 'p1', positionId: 'pos1', x: 0, y: 0, z: 0, quantity: 10 }];
      const mockPositions2: ProductPosition[] = [{ productId: 'p2', positionId: 'pos2', x: 1, y: 1, z: 1, quantity: 5 }];

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

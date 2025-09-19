export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface ProductPosition {
  positionId: string;
  x: number;
  y: number;
  z: number;
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  products: string[];
  startingPosition: Position3D;
}

export interface PickingOrderItem {
  productId: string;
  positionId: string;
}

export interface OptimizationResult {
  distance: number;
  pickingOrder: PickingOrderItem[];
}

export interface ApiError {
  message: string;
  statusCode: number;
}
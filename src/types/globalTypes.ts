/**
 * Represents a 3-dimensional coordinate in space.
 */
export interface Position3D {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Z coordinate */
    z: number;
}

/**
 * Represents a product's position within a warehouse.
 */
export interface ProductPosition {
    /** Unique identifier for the warehouse position */
    positionId: string;
    /** X coordinate of the position */
    x: number;
    /** Y coordinate of the position */
    y: number;
    /** Z coordinate of the position */
    z: number;
    /** ID of the product stored at this position */
    productId: string;
    /** Quantity of product available at this position */
    quantity: number;
}

/**
 * Request payload for an order optimization.
 */
export interface OrderRequest {
    /** Array of product IDs to optimize picking for */
    products: string[];
    /** Starting position of the worker in the warehouse */
    startingPosition: Position3D;
}

/**
 * Represents a single item in the optimized picking order.
 */
export interface PickingOrderItem {
    /** ID of the product to pick */
    productId: string;
    /** ID of the warehouse position from which to pick the product */
    positionId: string;
}

/**
 * Result returned from an order optimization.
 */
export interface OptimizationResult {
    /** Total distance traveled in the optimized picking sequence */
    distance: number;
    /** Ordered list of items to pick */
    pickingOrder: PickingOrderItem[];
}

/**
 * Represents a generic API error structure.
 */
export interface ApiError {
    /** Error message describing the issue */
    message: string;
    /** HTTP status code associated with the error */
    statusCode: number;
}

/**
 * Represents a mocked Axios error for testing purposes.
 */
export interface MockAxiosError {
    /** Indicates if the error is an Axios error */
    isAxiosError: boolean;
    /** HTTP response returned by Axios, if available */
    response?: { status: number; statusText: string };
    /** Axios request object, if the request was made but no response was received */
    request?: unknown;
    /** Error message */
    message?: string;
}

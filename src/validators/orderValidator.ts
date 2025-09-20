import { z } from 'zod';
import { OrderRequest } from '../types/globalTypes';

/**
 * Zod schema for a 3D position.
 */
const positionSchema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
});

/**
 * Zod schema for order optimization request validation.
 */
const orderRequestSchema = z.object({
    /** Array of product IDs to optimize picking for. Must not be empty. */
    products: z.array(z.string()).nonempty({ message: 'Products array cannot be empty' }),
    /** Starting position of the worker in the warehouse */
    startingPosition: positionSchema,
});

/**
 * Validates an incoming order request payload.
 *
 * Uses {@link orderRequestSchema} to ensure that the request contains
 * a non-empty list of products and a valid starting 3D position.
 *
 * @param body - The incoming request body to validate.
 * @returns {OrderRequest} The validated order request object.
 * @throws {ZodError} Thrown if validation fails, e.g., missing fields or incorrect types.
 *
 * @example
 * const payload = { products: ['p1', 'p2'], startingPosition: { x: 0, y: 0, z: 0 } };
 * const validRequest = validateOrderRequest(payload);
 */
export function validateOrderRequest(body: unknown): OrderRequest {
    return orderRequestSchema.parse(body);
}

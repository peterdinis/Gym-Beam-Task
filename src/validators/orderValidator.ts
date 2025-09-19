import { z } from 'zod';
import { OrderRequest } from '../types/globalTypes';

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const orderRequestSchema = z.object({
  products: z.array(z.string()).nonempty({ message: 'Products array cannot be empty' }),
  startingPosition: positionSchema,
});

/**
 * Validate order request using Zod
 * @param body - incoming request body
 * @returns Validated OrderRequest
 * @throws ZodError if validation fails
 */
export function validateOrderRequest(body: unknown): OrderRequest {
  return orderRequestSchema.parse(body);
}

import { ZodError } from 'zod';

/**
 * Represents errors that can occur during order optimization.
 *
 * This type can be either:
 * - {@link ZodError}: Thrown when the input request validation fails.
 * - {@link Error} with optional `code` property: Represents runtime or custom errors
 *   that can occur during the optimization process, such as API failures or internal errors.
 */
export type OptimizationError = ZodError | (Error & { code?: string });
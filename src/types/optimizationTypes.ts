import { ZodError } from 'zod';

export type OptimizationError = ZodError | (Error & { code?: string });

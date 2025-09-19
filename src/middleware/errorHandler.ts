import { Request, Response } from 'express';
import { formatISO } from 'date-fns';

/**
 * Extended Error interface to allow custom HTTP status codes.
 */
export interface AppError extends Error {
    statusCode?: number;
}

/**
 * Global error handler middleware.
 * Catches unhandled errors and returns a JSON response with details.
 *
 * @param error - The error object that occurred
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const errorHandler = (error: AppError, req: Request, res: Response): void => {
    console.error('Unhandled error:', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: message,
        timestamp: formatISO(new Date()),
        path: req.path,
        method: req.method,
    });
};

/**
 * Middleware for handling 404 Not Found errors.
 * Invoked when a requested endpoint does not exist.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: formatISO(new Date()),
    });
};

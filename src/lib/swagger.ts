import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger configuration options for generating OpenAPI documentation.
 *
 * This includes:
 * - OpenAPI version
 * - API title, version, and description
 * - Server URL
 * - Paths to source files containing JSDoc Swagger annotations
 */
const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GymBeam Warehouse Optimization API',
            version: '1.0.0',
            description: 'HTTP server for optimizing warehouse order picking',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

/**
 * Generated Swagger specification using swagger-jsdoc.
 */
export const swaggerSpec = swaggerJsdoc(options);

/**
 * Sets up Swagger UI for the Express application.
 *
 * Mounts the documentation at `/api-docs`.
 *
 * @param app - The Express application instance
 *
 * @example
 * import express from 'express';
 * import { setupSwagger } from './swagger';
 *
 * const app = express();
 * setupSwagger(app);
 * // Swagger UI available at http://localhost:3000/api-docs
 */
export function setupSwagger(app: Express) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

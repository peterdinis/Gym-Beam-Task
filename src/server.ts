import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import optimalizationRoutes from './routes/optimalizationRoutes';
import healthRoutes from "./routes/healthRoutes";
import { setupSwagger } from './swagger';
import 'dotenv/config';

/**
 * Main Express application for the **GymBeam Warehouse Optimization Server**.
 *
 * This server handles:
 * - Health check endpoints
 * - Order optimization requests
 * - Swagger API documentation
 * - Centralized error handling
 *
 * @module App
 */
const app: Express = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware setup
 */
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// Request logger
app.use((req, _, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Routes
 */
// Health check endpoints
app.use(healthRoutes);

// Optimization endpoints
app.use(optimalizationRoutes);

/**
 * Swagger documentation setup
 */
setupSwagger(app);

/**
 * Error handling
 */
// 404 Not Found handler
app.use(notFoundHandler);

// General error handler
app.use(errorHandler);

/**
 * Start the server
 */
app.listen(PORT, () => {
    console.log(`🚀 GymBeam Warehouse Optimization Server running on port ${PORT}`);
});

export default app;

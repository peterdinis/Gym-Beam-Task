import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import optimalizationRoutes from './routes/optimalizationRoutes';
import healthRoutes from "./routes/healthRoutes"
import { setupSwagger } from './swagger';
import 'dotenv/config';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.use(healthRoutes)
app.use(optimalizationRoutes);

setupSwagger(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 GymBeam Warehouse Optimization Server running on port ${PORT}`);
});

export default app;

import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';

export class HealthController {
    private healthService = new HealthService();

    getHealth = (req: Request, res: Response) => {
        const healthStatus = this.healthService.getHealthStatus();
        res.json(healthStatus);
    }
}

import express, { Request, Response } from 'express';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import { getDashboardStats } from '../../controllers/adminControllers/dashboard.controller';

export class DashboardRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Dashboard Routes');
        
        this.app.use('/admin/dashboard', this.router);
    }

    configureRoutes(router: express.Router): express.Application {
        router.get('/stats', getDashboardStats);

        return this.app;
    }
}

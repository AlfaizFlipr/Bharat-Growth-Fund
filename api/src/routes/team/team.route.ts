import express from 'express';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import teamQueries from './team.queries';

export class TeamRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Team Routes');
        this.app.use('/team-api', this.router);
    }

    configureRoutes(router: express.Router): express.Application {
        teamQueries(router);
        return this.app;
    }
}

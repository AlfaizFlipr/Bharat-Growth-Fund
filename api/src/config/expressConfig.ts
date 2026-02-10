import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { AuthRoutes } from '../routes/auth/auth.routes';
import { WithdrawalRoutes } from '../routes/withdrawal/withdrawal.route';
import { RechargeRoutes } from '../routes/recharge/recharge.route';
import { PaymentRoutes } from '../routes/paymentMethod/paymentMethod.route';
import { levelRoutes } from '../routes/level/level.route';
import { verificationRoutes } from '../routes/verification/verification.route';
import { userManagementRoutes } from '../routes/userManagement/userManagment.routes';
import { WithdrawalConfigRoutes } from '../routes/withdrawalCofig/withdrawalConfig.route';
import { DashboardRoutes } from '../routes/admin/dashboard.routes';
import { USDWithdrawalRoutes } from '../routes/usdWithdrawal/usdWithdrawal.route';
import { TeamRoutes } from '../routes/team/team.route';

class ExpressConfig {
  app: express.Application;
  PORT: string | number;

  constructor(app: express.Application, PORT: string | number) {
    this.app = app;
    this.PORT = PORT;
  }

  start() {
    this.addGlobalMiddlewares();
    this.staticServe();

    const routes = [
      new AuthRoutes(this.app),
      new WithdrawalRoutes(this.app),
      new RechargeRoutes(this.app),
      new PaymentRoutes(this.app),
      new levelRoutes(this.app),
      new verificationRoutes(this.app),
      new userManagementRoutes(this.app),
      new WithdrawalConfigRoutes(this.app),
      new DashboardRoutes(this.app),
      new USDWithdrawalRoutes(this.app),
      new TeamRoutes(this.app),
    ];

    if (process.env.NODE_ENV !== 'test') this.configureRoutes(routes);
    return this.app;
  }

  private configureRoutes(routes: any[]) {
    return this.app.listen(this.PORT, () => {
      routes.forEach((route) => {
        console.log('📍 Listening for route:', route.name);
      });
    });
  }

  private addGlobalMiddlewares() {
    const isProduction = process.env.NODE_ENV === 'production';

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];


    const corsOptions = {
      origin: (origin: string | undefined, callback: Function) => {

        if (!origin) {
          return callback(null, true);
        }

        if (!isProduction) {
          return callback(null, true);
        }


        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400,
      optionsSuccessStatus: 200
    };


    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));


    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

  }

  private staticServe() {
    this.app.use('/uploads', express.static('uploads'));
    this.app.use('/api/uploads', express.static('uploads'));
  }
}

export default ExpressConfig;
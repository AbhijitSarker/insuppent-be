import cors from 'cors';
import express from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import routes from './app/routes/index.js';
import { stripeWebhook } from './app/modules/purchase/leadPurchase.controller.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import sessionMiddleware from './app/middlewares/session.js';


const app = express();
// HTTP request logger
app.use(morgan('dev'));

app.use(cors());
app.use(cookieParser());

// Session middleware (for SSO)
app.use(sessionMiddleware);


// Stripe webhook route must be registered BEFORE express.json()
app.post('/api/v1/purchase/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

//Testing
app.get('/', async (req, res) => {
  res.send('Hello World');
});

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Endpoint Not Available',
      },
    ],
  });
  next();
});

export default app;

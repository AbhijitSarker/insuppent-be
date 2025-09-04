import cors from 'cors';
import express from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import routes from './app/routes/index.js';
import { stripeWebhook } from './app/modules/purchase/leadPurchase.controller.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import sessionMiddleware from './app/middlewares/session.js';
import config from './config/index.js';
import settingsRoutes from './app/modules/settings/settings.routes.js';


const app = express();
app.set('trust proxy', true);

// HTTP request logger
app.use(morgan('dev'));

// app.use(cors());

// CORS configuration for session-based authentication
app.use(cors({
  origin: [
    config.frontendUrl || 'http://localhost:5173',
    'http://localhost:5173',
    'https://insuppent-dev.netlify.app',
    'https://insuppent.onrender.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());

// Session middleware (for SSO)
app.use(sessionMiddleware);


// Stripe webhook route must be registered BEFORE express.json()
app.post('/api/v1/purchase/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    session: req.session.id ? 'Session active' : 'No session',
    timestamp: new Date().toISOString()
  });
});
// //Testing
// app.get('/', async (req, res) => {
//   res.send('Hello World');
// });

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

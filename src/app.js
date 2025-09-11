import cors from 'cors';
import express from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import routes from './app/routes/index.js';
import { stripeWebhook } from './app/modules/purchase/leadPurchase.controller.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import config from './config/index.js';
import settingsRoutes from './app/modules/settings/settings.routes.js';

const app = express();
app.set('trust proxy', true);

// HTTP request logger
app.use(morgan('dev'));

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'https://insuppent-dev.netlify.app',
      'https://insuppent.netlify.app',
      'https://insuppent.onrender.com',
      'https://insuplex360.com'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'stripe-signature'],
  exposedHeaders: ['Set-Cookie']
}));

// Stripe webhook route must be registered BEFORE express.json()
app.post('/api/v1/purchase/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

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

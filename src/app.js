import cors from 'cors';
import express from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';

import routes from './app/routes/index.js';
import { stripeWebhook } from './app/modules/purchase/leadPurchase.controller.js';
import morgan from 'morgan';
import settingsRoutes from './app/modules/settings/settings.routes.js';
import config from './config/index.js';
import cookieParser from 'cookie-parser';
import { LeadController } from './app/modules/lead/lead.controller.js';

const app = express();
app.set('trust proxy', true);

// HTTP request logger
app.use(morgan('dev'));

// CORS configuration for session-based authentication
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://insuppent-dev.netlify.app',
      'https://insuppent.netlify.app',
      'https://insuppent.onrender.com',
      'https://insuplex360.com',
      'https://your-wordpress-site.com', // Add your WordPress site
      process.env.FRONTEND_URL, // Add environment variable for frontend URL
    ].filter(Boolean); // Remove any undefined values

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cookie',
    'stripe-signature',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // For legacy browsers
};

// Enable pre-flight for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(cookieParser());


// Stripe webhook route must be registered BEFORE express.json()
app.post('/api/v1/purchase/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Lead webhook route for form submissions (accepts application/x-www-form-urlencoded)
app.post('/api/v1/leads/webhook', express.urlencoded({ extended: true }), (req, res, next) => {
  console.log('Webhook body type:', typeof req.body, 'body:', req.body);
  return LeadController.webhookHandler(req, res, next);
});

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
    timestamp: new Date().toISOString()
  });
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

import cors from 'cors';
import express from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import routes from './app/routes/index.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(cookieParser());

// Body parsers
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
        message: 'API Endpoint Not Found',
      },
    ],
  });
  next();
});

export default app;

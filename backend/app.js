import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import logger from './utils/logger.js';

const app = express();
app.set('trust proxy', 1);

// Setup morgan to pipe HTTP logs to Winston
const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);

// Rate Limiters Configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many high-compute requests from this IP, please try again after 15 minutes.'
  }
});

// Middleware
app.use(cors());
app.use(morganMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply Rate Limiters
app.use('/api', globalLimiter);

// Routes with stricter AI/Auth limits
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/batches', apiLimiter, batchRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date(),
    service: 'bulk-uploader-backend-api'
  });
});

export default app;

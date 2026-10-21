import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateAdminWriteOperations } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import weekRoutes from './routes/weekRoutes.js';
import displayRoutes from './routes/displayRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Allows cross-origin assets for Cloudinary images
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS configuration
  const allowedOrigins = ENV.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('CORS blocked: Origin not allowed.'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static assets (company logo, CSV templates)
  app.use(express.static('public'));

  // Health-check & status endpoints (for Vercel, Render, AWS, and Uptime monitors)
  const healthHandler = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'flexio-tv-backend',
      version: '1.0.0',
    });
  };
  app.get('/', healthHandler);
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Enforce global admin authentication middleware for ALL write operations
  app.use('/api', authenticateAdminWriteOperations);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/weeks', weekRoutes);
  app.use('/api/display', displayRoutes);
  app.use('/api/settings', settingsRoutes);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

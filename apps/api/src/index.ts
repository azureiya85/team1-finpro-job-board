import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';

import dotenv from 'dotenv';
dotenv.config(); // Load .env file from the current directory (apps/api/)

// NOW, add the debug log immediately after to see what's loaded
console.log(`[Express API Startup] RAW process.env.AUTH_SECRET from apps/api/.env: "${process.env.AUTH_SECRET}" (length: ${process.env.AUTH_SECRET?.length})`);
console.log(`[Express API Startup] process.env.FRONTEND_URL from apps/api/.env: "${process.env.FRONTEND_URL}"`);
console.log(`[Express API Startup] process.env.PORT from apps/api/.env: "${process.env.PORT}"`);
import mainApiRouter from './api'; 
import { errorHandler } from './middleware/errorHandler'; 
import cookieParser from 'cookie-parser';

async function startServer() {
  const app: Express = express();

  // --- CORS Configuration (Updated) ---
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Add your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  })); 

  // Security headers - Modified for file uploads
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Body Parsers
  app.use(express.json({ limit: '10mb' })); 
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(cookieParser());

  // --- Enhanced Logging Middleware ---
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });

  // --- API Routes ---
  app.use('/api', mainApiRouter); 

  // --- Health Check Route ---
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // --- Not Found Handler ---
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
  });

  // --- Global Error Handler ---
  app.use(errorHandler);

  // --- Start Server ---
  const server = app.listen(config.port, () => {
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });

  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  });
}

startServer().catch(err => {
  console.error("🚨 Failed to start server:", err);
  process.exit(1);
});
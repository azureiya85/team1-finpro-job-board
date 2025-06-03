import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import  config  from './config';
import mainApiRouter from './api'; // Your main API router
import { errorHandler } from './middleware/errorHandler'; // Your global error handler

async function startServer() {
  const app: Express = express();

  // --- Core Middleware ---
  app.use(cors()); 

  // Security headers
  app.use(helmet());

  // Body Parsers
  app.use(express.json()); 
  app.use(express.urlencoded({ extended: true })); 

  // --- Logging Middleware---
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });

  // --- API Routes ---
  app.use('/api', mainApiRouter); 

  // --- Health Check Route  ---
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // --- Not Found Handler  ---
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

  // Graceful Shutdown 
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
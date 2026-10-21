import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { seedInitialData } from './scripts/seed.js';

async function bootstrap() {
  try {
    console.log('--- Initializing Flexio TV Leaderboard Backend ---');
    await connectDB();

    // Auto-seed demo data if DB is empty to provide immediate live experience
    await seedInitialData();

    const app = createApp();
    const server = app.listen(ENV.PORT, () => {
      console.log(`Backend server successfully listening on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      console.log(`Healthcheck available at: http://localhost:${ENV.PORT}/api/health`);
      console.log(`TV Display API: http://localhost:${ENV.PORT}/api/display/current`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('MongoDB connection closed. Server terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

bootstrap();

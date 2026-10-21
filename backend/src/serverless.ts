import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const app = createApp();

/**
 * Serverless entry handler for Vercel deployment.
 * Automatically guarantees active database connection before processing requests.
 */
export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err: any) {
    console.error('MongoDB serverless connection error:', err?.message || err);
  }
  return app(req, res);
}

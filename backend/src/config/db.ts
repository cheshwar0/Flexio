import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

// Resolve MongoDB Atlas SRV records reliably on all local ISP networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Fall back to default system resolvers if not supported
}

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  // If already connected in serverless cache, reuse immediately
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose;
  }

  if (isConnected) {
    return mongoose;
  }

  const uri = ENV.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Atlas at configured URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      isConnected = true;
      console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error('Failed to connect to configured MongoDB Atlas URI:', (err as Error).message);
      if (ENV.NODE_ENV === 'production') {
        throw err;
      }
      console.warn('Falling back to MongoMemoryServer for local development/testing...');
    }
  } else {
    console.log('No MONGODB_URI configured. Starting in-memory MongoDB for instant local development/preview...');
  }

  // Fallback to MongoMemoryServer for local sandbox / test environment
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    console.log(`Connecting to in-memory MongoDB instance: ${memoryUri}`);
    const conn = await mongoose.connect(memoryUri);
    isConnected = true;
    console.log('Connected to local in-memory MongoDB successfully.');
    return conn;
  } catch (memErr) {
    console.error('Error starting in-memory MongoDB:', memErr);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

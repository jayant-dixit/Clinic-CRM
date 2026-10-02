import mongoose from 'mongoose';
import { config } from './env.js';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  // If user provided a specific URI in env (not default localhost) or if we test connection
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected to MongoDB at ${config.mongodbUri}`);
  } catch (err) {
    console.warn(`[Database] Standalone MongoDB not detected on port 27017 (${err.message}). Initializing embedded in-memory MongoDB engine...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'careslot_db'
        }
      });
      const uri = mongoMemoryServerInstance.getUri();
      await mongoose.connect(uri);
      console.log(`[Database] Connected successfully to embedded MongoDB engine at ${uri}`);
    } catch (memErr) {
      console.error('[Database] Critical error starting embedded MongoDB:', memErr);
      throw memErr;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};

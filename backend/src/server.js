import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    console.log('[Server] Connecting to MongoDB database...');
    await connectDB();

    // Auto-seed if database is freshly started
    const { Clinic } = await import('./models/Clinic.js');
    const count = await Clinic.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Auto-seeding CareSlot demo records...');
      const { seedData } = await import('./seed.js');
      await seedData();
    }

    const server = app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(` 🦷 CareSlot Clinic Management SaaS Backend Running   `);
      console.log(` 🚀 Listening at: http://localhost:${config.port}            `);
      console.log(` 🩺 Health Check: http://localhost:${config.port}/api/health `);
      console.log(`=======================================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();

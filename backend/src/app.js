import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import formRoutes from './routes/formRoutes.js';
import bookingPageRoutes from './routes/bookingPageRoutes.js';
import publicBookingRoutes from './routes/publicBookingRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';

const app = express();

// Security and utility middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all local origins during development
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CareSlot SaaS API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/booking-pages', bookingPageRoutes);
app.use('/api/public/booking', publicBookingRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/superadmin', superAdminRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Central Error Handler
app.use(errorHandler);

export default app;

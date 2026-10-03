import { Router } from 'express';
import {
  getSuperAdminAnalytics,
  getAllClinics,
  createClinicBySuperAdmin,
  updateClinicSubscription,
  updateClinicFeatures,
  addDoctorOrStaffToClinic,
  getAllDoctors,
  getAllPatients,
  getPaymentAnalytics,
  recordPayment,
  getSupportTickets,
  updateSupportTicket,
  createSupportTicketByClinic,
} from '../controllers/superAdminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Clinic-accessible route to submit feedback / complaints
router.post('/feedback', authenticate, createSupportTicketByClinic);
router.post('/support/submit', authenticate, createSupportTicketByClinic);
router.post('/support', authenticate, createSupportTicketByClinic);

// All subsequent routes require SUPER_ADMIN role
router.use(authenticate, authorize('SUPER_ADMIN'));

// Platform Analytics & Multi-Clinic Overview
router.get('/analytics', getSuperAdminAnalytics);

// Clinic & Owner Management
router.get('/clinics', getAllClinics);
router.post('/clinics', createClinicBySuperAdmin);
router.put('/clinics/:id/subscription', updateClinicSubscription);
router.put('/clinics/:id/features', updateClinicFeatures);

// Doctor & Staff Provisioning
router.post('/clinics/:clinicId/staff', addDoctorOrStaffToClinic);
router.get('/doctors', getAllDoctors);

// Global Patients Directory (Usage tracking & billing)
router.get('/patients', getAllPatients);

// Subscription Payments & Revenue Analytics
router.get('/payments', getPaymentAnalytics);
router.post('/payments', recordPayment);

// Support Complaints & Feedback Tickets
router.get('/support', getSupportTickets);
router.put('/support/:id', updateSupportTicket);

export default router;

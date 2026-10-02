import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/landing/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PublicBookingPage } from './pages/public/PublicBookingPage';

// Protected Clinic Dashboard Pages
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { AppointmentsList } from './pages/appointments/AppointmentsList';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { PatientsPage } from './pages/patients/PatientsPage';
import { DoctorsPage } from './pages/doctors/DoctorsPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { FormsListPage } from './pages/forms/FormsListPage';
import { FormBuilderPage } from './pages/forms/FormBuilderPage';
import { BookingPagesList } from './pages/booking-pages/BookingPagesList';
import { QRCodesPage } from './pages/qr-codes/QRCodesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold animate-bounce shadow-md">
            🦷
          </div>
          <p className="text-xs text-slate-500 font-medium">Verifying CareSlot credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public SaaS Landing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Patient Booking Wizard (No Auth Required) */}
            <Route path="/book/:clinicSlug/:bookingSlug" element={<PublicBookingPage />} />

            {/* Protected Clinic Workspace Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="appointments" element={<AppointmentsList />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="forms" element={<FormsListPage />} />
              <Route path="forms/builder/:id" element={<FormBuilderPage />} />
              <Route path="booking-pages" element={<BookingPagesList />} />
              <Route path="qr-codes" element={<QRCodesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

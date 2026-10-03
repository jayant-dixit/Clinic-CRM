import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SupportModalProvider } from './context/SupportModalContext';
import { LockedFeatureGuard } from './components/common/LockedFeatureGuard';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';

// SuperAdmin Pages
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';

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

// Protected Route Guard for Clinic Workspace
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

// SuperAdmin Route Guard (Authorizes Only Root Platform Admins)
const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold animate-bounce shadow-md">
            🛡️
          </div>
          <p className="text-xs text-purple-300 font-medium">Verifying SuperAdmin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SupportModalProvider>
          <BrowserRouter>
            <Routes>
              {/* Public SaaS Landing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Patient Booking Wizard (No Auth Required) */}
              <Route path="/book/:clinicSlug/:bookingSlug" element={<PublicBookingPage />} />

              {/* SuperAdmin Multi-Tenant SaaS Command Center */}
              <Route
                path="/superadmin"
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout />
                  </SuperAdminRoute>
                }
              >
                <Route index element={<SuperAdminDashboard />} />
                <Route path=":tab" element={<SuperAdminDashboard />} />
              </Route>

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

                {/* Feature-Gated Sections (Controlled via SuperAdmin Dashboard) */}
                <Route
                  path="forms"
                  element={
                    <LockedFeatureGuard
                      featureKey="customForms"
                      featureName="Dynamic Intake Forms"
                      featureDescription="Build and distribute customized patient medical histories, clinical consent surveys, and electronic questionnaires."
                    >
                      <FormsListPage />
                    </LockedFeatureGuard>
                  }
                />
                <Route
                  path="forms/builder/:id"
                  element={
                    <LockedFeatureGuard
                      featureKey="customForms"
                      featureName="Custom Form Builder"
                      featureDescription="Design drag-and-drop intake surveys and dynamic questionnaires."
                    >
                      <FormBuilderPage />
                    </LockedFeatureGuard>
                  }
                />
                <Route
                  path="booking-pages"
                  element={
                    <LockedFeatureGuard
                      featureKey="publicBooking"
                      featureName="Public Patient Booking Portals"
                      featureDescription="Publish public appointment scheduling pages for patients to self-schedule online 24/7."
                    >
                      <BookingPagesList />
                    </LockedFeatureGuard>
                  }
                />
                <Route
                  path="qr-codes"
                  element={
                    <LockedFeatureGuard
                      featureKey="qrCodeBooking"
                      featureName="QR Code Frontdesk Booking"
                      featureDescription="Generate printable QR codes for contactless patient check-in and reception desk appointment bookings."
                    >
                      <QRCodesPage />
                    </LockedFeatureGuard>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <LockedFeatureGuard
                      featureKey="automatedNotifications"
                      featureName="Automated SMS & Email Notifications"
                      featureDescription="Send automated appointment confirmation messages, reminder notifications, and follow-up alerts to patients."
                    >
                      <NotificationsPage />
                    </LockedFeatureGuard>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <LockedFeatureGuard
                      featureKey="analyticsReporting"
                      featureName="Advanced Analytics & Revenue Reporting"
                      featureDescription="Gain detailed business intelligence, appointment completion trends, and practitioner productivity charts."
                    >
                      <AnalyticsPage />
                    </LockedFeatureGuard>
                  }
                />

                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all redirect to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SupportModalProvider>
      </AuthProvider>
    </ToastProvider>
  );
}


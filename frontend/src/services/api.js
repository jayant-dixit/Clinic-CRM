const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('careslot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/public/')) {
    localStorage.removeItem('careslot_token');
    localStorage.removeItem('careslot_user');
    localStorage.removeItem('careslot_clinic');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Clinic & Settings
  getClinicProfile: () => request('/clinic/profile'),
  updateClinicProfile: (data) => request('/clinic/profile', { method: 'PUT', body: data }),
  getClinicStaff: () => request('/clinic/staff'),
  addClinicStaff: (data) => request('/clinic/staff', { method: 'POST', body: data }),
  updateClinicStaff: (id, data) => request(`/clinic/staff/${id}`, { method: 'PUT', body: data }),
  getAllClinics: () => request('/clinic/all'),

  // Doctors
  getDoctors: () => request('/doctors'),
  getDoctor: (id) => request(`/doctors/${id}`),
  createDoctor: (data) => request('/doctors', { method: 'POST', body: data }),
  updateDoctor: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: data }),
  deleteDoctor: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => request('/services'),
  getService: (id) => request(`/services/${id}`),
  createService: (data) => request('/services', { method: 'POST', body: data }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: data }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Availability & Slots
  getDoctorAvailability: (doctorId) => request(`/availability?doctorId=${doctorId}`),
  updateDoctorAvailability: (doctorId, data) => request(`/availability/${doctorId}`, { method: 'PUT', body: data }),
  addDateOverride: (doctorId, data) => request(`/availability/${doctorId}/override`, { method: 'POST', body: data }),
  removeDateOverride: (doctorId, date) => request(`/availability/${doctorId}/override/${date}`, { method: 'DELETE' }),
  getBlockedSlots: (params = '') => request(`/availability/blocked-slots${params}`),
  createBlockedSlot: (data) => request('/availability/block-slot', { method: 'POST', body: data }),
  deleteBlockedSlot: (id) => request(`/availability/blocked-slots/${id}`, { method: 'DELETE' }),
  getAvailableSlotsPreview: (doctorId, serviceId, date) =>
    request(`/availability/slots?doctorId=${doctorId}&serviceId=${serviceId}&date=${date}`),

  // Forms
  getForms: () => request('/forms'),
  getForm: (id) => request(`/forms/${id}`),
  createForm: (data) => request('/forms', { method: 'POST', body: data }),
  updateForm: (id, data) => request(`/forms/${id}`, { method: 'PUT', body: data }),
  duplicateForm: (id) => request(`/forms/${id}/duplicate`, { method: 'POST' }),
  deleteForm: (id) => request(`/forms/${id}`, { method: 'DELETE' }),

  // Booking Pages
  getBookingPages: () => request('/booking-pages'),
  getBookingPage: (id) => request(`/booking-pages/${id}`),
  createBookingPage: (data) => request('/booking-pages', { method: 'POST', body: data }),
  updateBookingPage: (id, data) => request(`/booking-pages/${id}`, { method: 'PUT', body: data }),
  deleteBookingPage: (id) => request(`/booking-pages/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params = '') => request(`/appointments${params}`),
  getTodayStats: () => request('/appointments/stats/today'),
  getAppointment: (id) => request(`/appointments/${id}`),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: data }),
  updateAppointmentStatus: (id, data) => request(`/appointments/${id}/status`, { method: 'PUT', body: data }),
  rescheduleAppointment: (id, data) => request(`/appointments/${id}/reschedule`, { method: 'POST', body: data }),
  scheduleFollowUp: (id, data) => request(`/appointments/${id}/follow-up`, { method: 'POST', body: data }),

  // Patients
  getPatients: (params = '') => request(`/patients${params}`),
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (data) => request('/patients', { method: 'POST', body: data }),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: data }),
  addPatientNote: (id, data) => request(`/patients/${id}/notes`, { method: 'POST', body: data }),
  addPatientAttachment: (id, data) => request(`/patients/${id}/attachments`, { method: 'POST', body: data }),

  // Queue
  getQueue: (date = '') => request(`/queue${date ? `?date=${date}` : ''}`),
  callNextPatient: () => request('/queue/call-next', { method: 'POST' }),
  skipQueueItem: (itemId) => request(`/queue/items/${itemId}/skip`, { method: 'POST' }),
  completeQueueItem: (itemId) => request(`/queue/items/${itemId}/complete`, { method: 'POST' }),

  // Notifications
  getNotificationLogs: () => request('/notifications/logs'),
  getNotificationTemplates: () => request('/notifications/templates'),
  updateNotificationTemplate: (data) => request('/notifications/templates', { method: 'PUT', body: data }),
  sendTestNotification: (data) => request('/notifications/test', { method: 'POST', body: data }),

  // Analytics
  getAnalytics: () => request('/analytics/overview'),

  // Public Booking (Unauthenticated)
  getPublicBookingConfig: (clinicSlug, bookingSlug) => request(`/public/booking/${clinicSlug}/${bookingSlug}`),
  getPublicAvailableSlots: (clinicSlug, bookingSlug, doctorId, serviceId, date) =>
    request(`/public/booking/${clinicSlug}/${bookingSlug}/slots?doctorId=${doctorId}&serviceId=${serviceId}&date=${date}`),
  createPublicAppointment: (clinicSlug, bookingSlug, payload) =>
    request(`/public/booking/${clinicSlug}/${bookingSlug}`, { method: 'POST', body: payload }),
  getPublicAppointment: (appointmentNumber) => request(`/public/booking/appointment/${appointmentNumber}`),
  cancelPublicAppointment: (appointmentNumber, reason) =>
    request(`/public/booking/appointment/${appointmentNumber}/cancel`, { method: 'POST', body: { reason } }),
};

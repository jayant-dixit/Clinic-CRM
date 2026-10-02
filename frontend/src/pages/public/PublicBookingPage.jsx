import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Phone,
  MapPin,
  Sparkles,
  CalendarPlus,
  Share2,
  RotateCcw,
  XCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { api } from '../../services/api';
import { DynamicFormRenderer } from '../../components/form-renderer/DynamicFormRenderer';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const PublicBookingPage = () => {
  const { clinicSlug, bookingSlug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Service, 2: Doctor, 3: Form, 4: Date & Time, 5: Review & Confirm, 6: Success

  // Selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submittedFormData, setSubmittedFormData] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow or today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking Result
  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Fetch Booking Config
  useEffect(() => {
    setLoading(true);
    api
      .getPublicBookingConfig(clinicSlug, bookingSlug)
      .then((res) => {
        setConfig(res.data);
        if (res.data.services?.length === 1) {
          setSelectedService(res.data.services[0]);
        }
        if (res.data.doctors?.length === 1) {
          setSelectedDoctor(res.data.doctors[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setBookingError(err.message || 'Booking page not found or inactive.');
      })
      .finally(() => setLoading(false));
  }, [clinicSlug, bookingSlug]);

  // Fetch slots whenever service, doctor, or date changes
  useEffect(() => {
    if (selectedDoctor && selectedService && selectedDate && config?.clinic) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      api
        .getPublicAvailableSlots(clinicSlug, bookingSlug, selectedDoctor._id, selectedService._id, selectedDate)
        .then((res) => {
          setAvailableSlots(res.data || []);
        })
        .catch((err) => {
          console.error(err);
          setAvailableSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDoctor, selectedService, selectedDate, config, clinicSlug, bookingSlug]);

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true);
      setBookingError('');

      const payload = {
        doctorId: selectedDoctor._id,
        serviceId: selectedService._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        formData: submittedFormData,
        bookingSource: window.location.search.includes('source=qr') ? 'QR' : 'BOOKING_LINK',
      };

      const res = await api.createPublicAppointment(clinicSlug, bookingSlug, payload);

      if (res.success && res.data) {
        setConfirmedAppointment(res.data);
        setCurrentStep(6); // Success screen

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_) {}
      }
    } catch (err) {
      setBookingError(err.message || 'Unable to confirm appointment. Please choose another slot.');
      showToast(err.message || 'Slot was taken. Please select another slot.', 'error');
      // If conflict, move back to slot step
      if (err.status === 409) {
        setCurrentStep(4);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!confirmedAppointment) return '#';
    const title = encodeURIComponent(`${confirmedAppointment.service.name} at ${confirmedAppointment.clinic.name}`);
    const details = encodeURIComponent(
      `Appointment Ref: ${confirmedAppointment.appointmentNumber}\nDoctor: ${confirmedAppointment.doctor.name}\nService: ${confirmedAppointment.service.name}\nPhone: ${confirmedAppointment.clinic.phone}`
    );
    const location = encodeURIComponent(
      `${confirmedAppointment.clinic.address?.street || ''}, ${confirmedAppointment.clinic.address?.city || ''}`
    );

    const cleanDate = confirmedAppointment.date.replace(/-/g, '');
    const startClean = confirmedAppointment.startTime.replace(/:/g, '') + '00';
    const endClean = confirmedAppointment.endTime.replace(/:/g, '') + '00';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}T${startClean}/${cleanDate}T${endClean}&details=${details}&location=${location}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (bookingError && !config) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Booking Page Unavailable</h2>
          <p className="text-xs text-slate-500 mt-2">{bookingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const clinic = config.clinic;
  const bookingPage = config.bookingPage;
  const services = config.services || [];
  const doctors = config.doctors || [];
  const formSchema = config.form;

  const stepsList = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Doctor' },
    { num: 3, label: 'Your Details' },
    { num: 4, label: 'Date & Time' },
    { num: 5, label: 'Confirm' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans pb-16">
      {/* Clinic Header Banner (Mobile-Optimized) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic.logo ? (
              <img src={clinic.logo} alt={clinic.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-brand-500/20">
                🦷
              </div>
            )}
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">{clinic.name}</h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{clinic.address?.city || 'Dental Clinic'}</span>
              </p>
            </div>
          </div>

          <a
            href={`tel:${clinic.phone}`}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Call Clinic"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Progress Bar (Visible on Steps 1 to 5) */}
        {currentStep <= 5 && (
          <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-2">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              {stepsList.map((step) => {
                const isPast = currentStep > step.num;
                const isCurrent = currentStep === step.num;
                return (
                  <div key={step.num} className="flex items-center gap-1.5 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                        isPast
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-brand-600 text-white ring-2 ring-brand-200'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
                    </div>
                    <span
                      className={`hidden sm:inline-block font-semibold ${
                        isCurrent ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Form Container */}
      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* STEP 1: CHOOSE SERVICE */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 1 of 5
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Select Treatment or Service</h2>
              <p className="text-xs text-slate-500 mt-0.5">Choose what you would like to consult the doctor for.</p>
            </div>

            <div className="space-y-3 pt-2">
              {services.map((srv) => {
                const isSelected = selectedService?._id === srv._id;
                return (
                  <div
                    key={srv._id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50/50 border-brand-500 ring-2 ring-brand-100 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: srv.color || '#2563eb' }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{srv.name}</h3>
                        {srv.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{srv.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                          <span className="text-brand-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {srv.duration} mins
                          </span>
                          <span className="text-slate-700">₹{srv.price}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedService}
                size="lg"
                className="w-full sm:w-auto"
                iconRight={ChevronRight}
              >
                Continue to Doctor
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE DOCTOR */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 2 of 5
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Select Dental Specialist</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulting for: <strong>{selectedService?.name}</strong>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?._id === doc._id;
                return (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50/50 border-brand-500 ring-2 ring-brand-100 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          doc.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=2563eb&color=fff`
                        }
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                        <p className="text-xs font-semibold text-brand-600 mt-0.5">{doc.specialization}</p>
                        {doc.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{doc.bio}</p>}
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button onClick={() => setCurrentStep(1)} variant="secondary" icon={ChevronLeft}>
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!selectedDoctor}
                size="lg"
                className="flex-1 sm:flex-none"
                iconRight={ChevronRight}
              >
                Fill Information Form
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: FILL DYNAMIC FORM */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 3 of 5
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">{formSchema?.title || 'Patient Registration'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formSchema?.description || 'Please provide your details for the dental consultation record.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-3">
              <DynamicFormRenderer
                formSchema={formSchema}
                initialValues={submittedFormData}
                onSubmit={(data) => {
                  setSubmittedFormData(data);
                  setCurrentStep(4);
                }}
                submitLabel="Proceed to Select Date & Time"
              />
            </div>

            <div className="pt-2 flex justify-start">
              <Button onClick={() => setCurrentStep(2)} variant="secondary" icon={ChevronLeft}>
                Back to Doctor
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE DATE & TIME */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 4 of 5
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Select Date & Available Slot</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Appointments are generated based on Dr. {selectedDoctor?.name}'s live shifts and {selectedService?.duration} min duration.
              </p>
            </div>

            {/* Date Picker Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Choose Appointment Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Generated Time Slots */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-brand-600 font-semibold">{availableSlots.length} available</span>
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 py-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-xl" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No open slots on this date</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    The doctor may be off or fully booked. Please try selecting the next day.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-2 rounded-xl text-xs font-mono font-bold transition-all border flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 scale-[1.02]'
                            : 'bg-slate-50/80 hover:bg-brand-50 hover:border-brand-300 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span>{slot.startTime}</span>
                        <span className="text-[10px] font-normal opacity-75">{slot.endTime}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button onClick={() => setCurrentStep(3)} variant="secondary" icon={ChevronLeft}>
                Back to Details
              </Button>
              <Button
                onClick={() => setCurrentStep(5)}
                disabled={!selectedSlot}
                size="lg"
                className="flex-1 sm:flex-none"
                iconRight={ChevronRight}
              >
                Review & Confirm
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 5 of 5
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Review & Confirm Appointment</h2>
              <p className="text-xs text-slate-500 mt-0.5">Please review your booking details before confirmation.</p>
            </div>

            {bookingError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Booking Conflict</p>
                  <p className="mt-0.5">{bookingError}</p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">Treatment</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedService?.name}</h3>
                  <p className="text-xs text-slate-500">{selectedService?.duration} minutes consultation</p>
                </div>
                <span className="text-lg font-extrabold text-slate-900 font-mono">
                  ₹{selectedService?.price}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Doctor</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedDoctor?.name}</p>
                  <p className="text-slate-500">{selectedDoctor?.specialization}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Date & Time</span>
                  <p className="font-bold text-brand-700 mt-0.5">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="font-mono font-semibold text-slate-800">
                    {selectedSlot?.startTime} - {selectedSlot?.endTime}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <span className="text-slate-400 font-medium">Patient Details</span>
                <p className="font-bold text-slate-900">
                  {submittedFormData.full_name || submittedFormData.name || 'Patient'}
                </p>
                <p className="text-slate-600 font-mono">
                  Phone: {submittedFormData.phone_number || submittedFormData.phone}
                </p>
                {submittedFormData.email && (
                  <p className="text-slate-600">Email: {submittedFormData.email}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button onClick={() => setCurrentStep(4)} variant="secondary" icon={ChevronLeft}>
                Back to Slots
              </Button>
              <Button
                onClick={handleConfirmBooking}
                loading={submitting}
                size="lg"
                variant="primary"
                className="flex-1 sm:flex-none"
                icon={CheckCircle2}
              >
                Confirm Appointment ✓
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: SUCCESS & CONFIRMATION SCREEN */}
        {currentStep === 6 && confirmedAppointment && (
          <div className="space-y-6 animate-fadeIn text-center">
            {/* Success Shield */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Confirmed ✓</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We have reserved your consultation and sent an instant confirmation message to your phone.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Appointment Reference
                  </span>
                  <p className="font-mono text-base font-extrabold text-brand-600">
                    {confirmedAppointment.appointmentNumber}
                  </p>
                </div>
                <Badge status="CONFIRMED" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Patient</span>
                  <p className="font-bold text-slate-900 mt-0.5">{confirmedAppointment.patient.name}</p>
                  <p className="text-slate-500 font-mono">{confirmedAppointment.patient.phone}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Specialist</span>
                  <p className="font-bold text-slate-900 mt-0.5">{confirmedAppointment.doctor.name}</p>
                  <p className="text-slate-500">{confirmedAppointment.doctor.specialization}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Treatment</span>
                  <p className="font-bold text-slate-900 mt-0.5">{confirmedAppointment.service.name}</p>
                  <p className="text-slate-500">{confirmedAppointment.service.duration} mins • ₹{confirmedAppointment.service.price}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Scheduled Time</span>
                  <p className="font-bold text-brand-700 mt-0.5">
                    {confirmedAppointment.date}
                  </p>
                  <p className="font-mono font-bold text-slate-800">
                    {confirmedAppointment.startTime} - {confirmedAppointment.endTime}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Clinic Address</span>
                <p className="font-bold text-slate-900 mt-0.5">{confirmedAppointment.clinic.name}</p>
                <p className="text-slate-500">
                  {confirmedAppointment.clinic.address?.street}, {confirmedAppointment.clinic.address?.city}
                </p>
              </div>
            </div>

            {/* Quick Actions for Patient */}
            <div className="space-y-3">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-4 h-4 text-brand-400" />
                <span>Add to Google Calendar</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Appointment at ${confirmedAppointment.clinic.name}`,
                        text: `Appointment ${confirmedAppointment.appointmentNumber} confirmed on ${confirmedAppointment.date} at ${confirmedAppointment.startTime}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Link copied to clipboard', 'success');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Details</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Do you want to cancel this appointment?')) {
                      api
                        .cancelPublicAppointment(confirmedAppointment.appointmentNumber, 'Cancelled online by patient')
                        .then(() => {
                          showToast('Appointment cancelled', 'info');
                          window.location.reload();
                        })
                        .catch((err) => showToast(err.message, 'error'));
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Booking</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

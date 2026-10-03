import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    patientDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' },
      gender: { type: String, default: 'Male' },
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    bookingPageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookingPage',
      default: null,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    startTime: {
      type: String, // "HH:mm"
      required: true,
    },
    endTime: {
      type: String, // "HH:mm"
      required: true,
    },
    duration: {
      type: Number, // In minutes
      required: true,
    },
    status: {
      type: String,
      enum: [
        'BOOKED',
        'CONFIRMED',
        'ARRIVED',
        'WAITING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ],
      default: 'BOOKED',
      index: true,
    },
    bookingSource: {
      type: String,
      enum: ['QR', 'BOOKING_LINK', 'RECEPTION', 'WALK_IN', 'ADMIN'],
      default: 'BOOKING_LINK',
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    internalNotes: {
      type: String,
      default: '',
    },
    clinicalNotes: {
      type: String,
      default: '',
    },
    treatmentProvided: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    queueToken: {
      type: String,
      default: '',
    },
    queueCalledAt: {
      type: Date,
      default: null,
    },
    followUp: {
      isScheduled: { type: Boolean, default: false },
      recommendedDate: { type: String, default: '' },
      notes: { type: String, default: '' },
      followUpAppointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Compound index for slot conflict queries
AppointmentSchema.index({ clinicId: 1, doctorId: 1, date: 1, status: 1 });

export const Appointment = mongoose.model('Appointment', AppointmentSchema);

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, default: '' },
    recipientEmail: { type: String, default: '' },
    channel: {
      type: String,
      enum: ['WHATSAPP', 'SMS', 'EMAIL'],
      required: true,
    },
    eventType: {
      type: String,
      enum: ['CONFIRMATION', 'REMINDER', 'RESCHEDULED', 'CANCELLED', 'FOLLOW_UP', 'THANK_YOU'],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'FAILED', 'MOCK_SENT'],
      default: 'MOCK_SENT',
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', NotificationSchema);

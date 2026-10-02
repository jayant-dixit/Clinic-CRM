import mongoose from 'mongoose';

const NotificationTemplateSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['CONFIRMATION', 'REMINDER', 'RESCHEDULED', 'CANCELLED', 'FOLLOW_UP', 'THANK_YOU'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['WHATSAPP', 'SMS', 'EMAIL'],
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: '', // For email
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

NotificationTemplateSchema.index({ clinicId: 1, eventType: 1, channel: 1 }, { unique: true });

export const NotificationTemplate = mongoose.model('NotificationTemplate', NotificationTemplateSchema);

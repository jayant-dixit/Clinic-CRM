import mongoose from 'mongoose';

const BookingPageSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Booking page title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Booking page slug is required'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form is required for booking page'],
    },
    allowedServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ], // Empty array means all active services
    allowedDoctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ], // Empty array means all active doctors
    isPublished: {
      type: Boolean,
      default: true,
    },
    themeColor: {
      type: String,
      default: '#2563eb',
    },
  },
  { timestamps: true }
);

BookingPageSchema.index({ clinicId: 1, slug: 1 }, { unique: true });

export const BookingPage = mongoose.model('BookingPage', BookingPageSchema);

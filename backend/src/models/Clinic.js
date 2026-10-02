import mongoose from 'mongoose';

const ClinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Clinic slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Clinic phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Clinic email is required'],
      lowercase: true,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    website: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    settings: {
      minAdvanceBookingHours: { type: Number, default: 2 },
      maxAdvanceBookingDays: { type: Number, default: 30 },
      defaultSlotDuration: { type: Number, default: 30 },
      cancellationPolicy: { type: String, default: 'Please cancel at least 4 hours before your scheduled appointment.' },
      allowReschedule: { type: Boolean, default: true },
      allowCancellation: { type: Boolean, default: true },
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      primaryColor: { type: String, default: '#2563eb' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Clinic = mongoose.model('Clinic', ClinicSchema);

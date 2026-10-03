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
    clinicType: {
      type: String,
      default: 'Multi-Speciality Clinic',
      trim: true,
    },
    googleBusinessProfile: {
      type: String,
      default: '',
      trim: true,
    },
    googlePlaceId: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    totalReviews: {
      type: Number,
      default: 0,
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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'],
        default: 'PROFESSIONAL',
      },
      status: {
        type: String,
        enum: ['ACTIVE', 'TRIAL', 'SUSPENDED', 'OVERDUE', 'CANCELLED'],
        default: 'ACTIVE',
      },
      pricePerMonth: {
        type: Number,
        default: 2999,
      },
      billingCycle: {
        type: String,
        enum: ['MONTHLY', 'ANNUAL'],
        default: 'MONTHLY',
      },
      validUntil: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 86400000),
      },
      patientQuota: {
        type: Number,
        default: 1000,
      },
    },
    features: {
      publicBooking: { type: Boolean, default: true },
      qrCodeBooking: { type: Boolean, default: true },
      customForms: { type: Boolean, default: true },
      analyticsReporting: { type: Boolean, default: true },
      automatedNotifications: { type: Boolean, default: true },
      multiDoctor: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Clinic = mongoose.model('Clinic', ClinicSchema);

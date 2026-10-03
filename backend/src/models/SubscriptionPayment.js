import mongoose from 'mongoose';

const SubscriptionPaymentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    clinicName: {
      type: String,
      default: 'Clinic',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    plan: {
      type: String,
      enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'],
      default: 'PROFESSIONAL',
    },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE', 'FAILED'],
      default: 'PAID',
      index: true,
    },
    billingDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'UPI', 'MANUAL_OFFLINE', 'OTHER'],
      default: 'UPI',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const SubscriptionPayment = mongoose.model('SubscriptionPayment', SubscriptionPaymentSchema);

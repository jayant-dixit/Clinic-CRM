import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Service duration in minutes is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      default: 30,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    color: {
      type: String,
      default: '#2563eb',
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', ServiceSchema);

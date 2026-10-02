import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  {
    author: { type: String, default: 'Staff' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['X-RAY', 'REPORT', 'PRESCRIPTION', 'OTHER'], default: 'OTHER' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const PatientSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: String, // "YYYY-MM-DD"
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Male',
    },
    address: {
      type: String,
      default: '',
    },
    notes: [NoteSchema],
    attachments: [AttachmentSchema],
    totalVisits: {
      type: Number,
      default: 0,
    },
    lastVisitAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

PatientSchema.index({ clinicId: 1, phone: 1 });

export const Patient = mongoose.model('Patient', PatientSchema);

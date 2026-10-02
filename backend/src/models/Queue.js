import mongoose from 'mongoose';

const QueueItemSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    tokenNumber: {
      type: String, // e.g. "#01", "#02", "#08"
      required: true,
    },
    tokenSeq: {
      type: Number,
      required: true,
    },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    doctorName: { type: String, required: true },
    serviceName: { type: String, required: true },
    arrivedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
      default: 'WAITING',
    },
    estimatedWaitMinutes: { type: Number, default: 15 },
  },
  { _id: true, timestamps: true }
);

const QueueSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    currentTokenSeq: {
      type: Number,
      default: 0,
    },
    currentlyServingSeq: {
      type: Number,
      default: 0,
    },
    items: [QueueItemSchema],
  },
  { timestamps: true }
);

QueueSchema.index({ clinicId: 1, date: 1 }, { unique: true });

export const Queue = mongoose.model('Queue', QueueSchema);

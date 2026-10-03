import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'SUPER_ADMIN' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    clinicName: {
      type: String,
      default: 'Clinic',
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['FEATURE_REQUEST', 'BUG', 'BILLING', 'COMPLAINT', 'GENERAL'],
      default: 'GENERAL',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    responses: [ResponseSchema],
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

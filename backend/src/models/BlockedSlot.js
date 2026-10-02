import mongoose from 'mongoose';

const BlockedSlotSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null, // null means all doctors in clinic blocked
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    startTime: {
      type: String, // "HH:mm"
      required: true,
    },
    endTime: {
      type: String, // "HH:mm"
      required: true,
    },
    reason: {
      type: String,
      default: 'Blocked by Admin',
    },
  },
  { timestamps: true }
);

export const BlockedSlot = mongoose.model('BlockedSlot', BlockedSlotSchema);

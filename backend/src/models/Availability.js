import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // Format "HH:mm" e.g. "09:00"
    endTime: { type: String, required: true },   // Format "HH:mm" e.g. "13:00"
  },
  { _id: false }
);

const BreakSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    label: { type: String, default: 'Break' },
  },
  { _id: false }
);

const DayScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sun, 1=Mon, ..., 6=Sat
    dayName: { type: String, required: true },
    isWorkingDay: { type: Boolean, default: true },
    shifts: [ShiftSchema],
    breaks: [BreakSchema],
  },
  { _id: false }
);

const DateOverrideSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    isWorkingDay: { type: Boolean, default: false },
    shifts: [ShiftSchema],
    breaks: [BreakSchema],
    reason: { type: String, default: 'Custom Schedule / Holiday' },
  },
  { _id: false }
);

const AvailabilitySchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    slotIntervalMinutes: {
      type: Number,
      default: 15, // Grid interval for slot start times
    },
    weeklySchedule: [DayScheduleSchema],
    dateOverrides: [DateOverrideSchema],
  },
  { timestamps: true }
);

// One availability document per doctor
AvailabilitySchema.index({ clinicId: 1, doctorId: 1 }, { unique: true });

export const Availability = mongoose.model('Availability', AvailabilitySchema);

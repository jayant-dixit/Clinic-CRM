import { Availability } from '../models/Availability.js';
import { Appointment } from '../models/Appointment.js';
import { BlockedSlot } from '../models/BlockedSlot.js';
import { Service } from '../models/Service.js';
import { Clinic } from '../models/Clinic.js';
import { timeToMinutes, minutesToTime, addMinutesToTime } from '../utils/helpers.js';

export class SlotGenerationService {
  /**
   * Check if two time intervals [s1, e1) and [s2, e2) overlap
   */
  static isOverlapping(s1, e1, s2, e2) {
    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  /**
   * Generate available appointment slots for a given doctor, service, and date
   */
  static async getAvailableSlots({ clinicId, doctorId, serviceId, date }) {
    // 1. Fetch Service to get duration
    const service = await Service.findOne({ _id: serviceId, clinicId, status: 'ACTIVE' });
    if (!service) {
      throw new Error('Service not found or is inactive');
    }
    const duration = service.duration; // in minutes

    // 2. Fetch Clinic for advance booking rules
    const clinic = await Clinic.findById(clinicId);
    const minAdvanceHours = clinic?.settings?.minAdvanceBookingHours || 2;

    // 3. Determine day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    // Parse "YYYY-MM-DD" safely in local date
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    // 4. Fetch Doctor Availability
    const availability = await Availability.findOne({ clinicId, doctorId });
    if (!availability) {
      return [];
    }

    let shifts = [];
    let breaks = [];

    // Check for specific date override first
    const dateOverride = availability.dateOverrides?.find((o) => o.date === date);
    if (dateOverride) {
      if (!dateOverride.isWorkingDay) {
        return []; // Doctor on leave or holiday on this date
      }
      shifts = dateOverride.shifts || [];
      breaks = dateOverride.breaks || [];
    } else {
      // Check weekly schedule
      const daySchedule = availability.weeklySchedule?.find((s) => s.dayOfWeek === dayOfWeek);
      if (!daySchedule || !daySchedule.isWorkingDay) {
        return []; // Doctor off on this day of week
      }
      shifts = daySchedule.shifts || [];
      breaks = daySchedule.breaks || [];
    }

    if (!shifts.length) {
      return [];
    }

    // 5. Fetch existing non-cancelled appointments for this doctor on this date
    const existingAppointments = await Appointment.find({
      clinicId,
      doctorId,
      date,
      status: { $nin: ['CANCELLED'] },
    }).select('startTime endTime status');

    const appointmentIntervals = existingAppointments.map((apt) => ({
      start: timeToMinutes(apt.startTime),
      end: timeToMinutes(apt.endTime),
    }));

    // 6. Fetch blocked slots for this date
    const blockedSlots = await BlockedSlot.find({
      clinicId,
      date,
      $or: [{ doctorId }, { doctorId: null }],
    }).select('startTime endTime');

    const blockedIntervals = blockedSlots.map((b) => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
    }));

    // Convert breaks to minute intervals
    const breakIntervals = (breaks || []).map((brk) => ({
      start: timeToMinutes(brk.startTime),
      end: timeToMinutes(brk.endTime),
    }));

    // 7. Check if date is today and calculate minimum allowable start time
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = date === todayStr;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const minAllowableTimeMinutes = isToday ? currentMinutes + minAdvanceHours * 60 : -1;

    // Slot increment step (e.g. 15 or 30 minutes, or service duration if smaller)
    const step = availability.slotIntervalMinutes || 15;
    const availableSlots = [];

    // 8. Generate and filter candidate slots across each shift
    for (const shift of shifts) {
      const shiftStart = timeToMinutes(shift.startTime);
      const shiftEnd = timeToMinutes(shift.endTime);

      for (let slotStart = shiftStart; slotStart + duration <= shiftEnd; slotStart += step) {
        const slotEnd = slotStart + duration;

        // Skip if too soon today
        if (isToday && slotStart < minAllowableTimeMinutes) {
          continue;
        }

        // Check break overlap
        const overlapsBreak = breakIntervals.some((b) =>
          SlotGenerationService.isOverlapping(slotStart, slotEnd, b.start, b.end)
        );
        if (overlapsBreak) continue;

        // Check existing appointment overlap
        const overlapsAppointment = appointmentIntervals.some((apt) =>
          SlotGenerationService.isOverlapping(slotStart, slotEnd, apt.start, apt.end)
        );
        if (overlapsAppointment) continue;

        // Check blocked slot overlap
        const overlapsBlocked = blockedIntervals.some((blk) =>
          SlotGenerationService.isOverlapping(slotStart, slotEnd, blk.start, blk.end)
        );
        if (overlapsBlocked) continue;

        availableSlots.push({
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd),
          duration,
        });
      }
    }

    return availableSlots;
  }

  /**
   * Concurrency Safe check: Verify if a specific slot is still completely free before saving
   */
  static async verifySlotIsFree({ clinicId, doctorId, date, startTime, endTime, excludeAppointmentId = null }) {
    const sMin = timeToMinutes(startTime);
    const eMin = timeToMinutes(endTime);

    // 1. Check existing appointments
    const query = {
      clinicId,
      doctorId,
      date,
      status: { $nin: ['CANCELLED'] },
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const appointments = await Appointment.find(query).select('startTime endTime appointmentNumber');
    for (const apt of appointments) {
      const aptS = timeToMinutes(apt.startTime);
      const aptE = timeToMinutes(apt.endTime);
      if (SlotGenerationService.isOverlapping(sMin, eMin, aptS, aptE)) {
        return {
          available: false,
          reason: `Slot conflicts with existing appointment ${apt.appointmentNumber} (${apt.startTime} - ${apt.endTime})`,
        };
      }
    }

    // 2. Check blocked slots
    const blocked = await BlockedSlot.find({
      clinicId,
      date,
      $or: [{ doctorId }, { doctorId: null }],
    }).select('startTime endTime reason');

    for (const b of blocked) {
      const bS = timeToMinutes(b.startTime);
      const bE = timeToMinutes(b.endTime);
      if (SlotGenerationService.isOverlapping(sMin, eMin, bS, bE)) {
        return {
          available: false,
          reason: `Slot is blocked by clinic admin: ${b.reason || 'Not available'}`,
        };
      }
    }

    return { available: true };
  }
}

import { Availability } from '../models/Availability.js';
import { BlockedSlot } from '../models/BlockedSlot.js';
import { SlotGenerationService } from '../services/slotGenerationService.js';

export const getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'doctorId query param is required' });
    }

    let availability = await Availability.findOne({ clinicId: req.clinicId, doctorId });
    if (!availability) {
      // Return empty structure if not created yet
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { weeklySchedule, slotIntervalMinutes } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { clinicId: req.clinicId, doctorId },
      {
        weeklySchedule,
        ...(slotIntervalMinutes && { slotIntervalMinutes: Number(slotIntervalMinutes) }),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Availability schedule updated', data: availability });
  } catch (error) {
    next(error);
  }
};

export const addDateOverride = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date, isWorkingDay, shifts, breaks, reason } = req.body;

    const availability = await Availability.findOne({ clinicId: req.clinicId, doctorId });
    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability record not found for doctor' });
    }

    // Remove existing override for this date if present
    availability.dateOverrides = availability.dateOverrides.filter((o) => o.date !== date);
    availability.dateOverrides.push({
      date,
      isWorkingDay: Boolean(isWorkingDay),
      shifts: shifts || [],
      breaks: breaks || [],
      reason: reason || 'Special Schedule',
    });

    await availability.save();
    return res.status(200).json({ success: true, message: 'Date override saved', data: availability });
  } catch (error) {
    next(error);
  }
};

export const removeDateOverride = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;

    const availability = await Availability.findOne({ clinicId: req.clinicId, doctorId });
    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability record not found' });
    }

    availability.dateOverrides = availability.dateOverrides.filter((o) => o.date !== date);
    await availability.save();

    return res.status(200).json({ success: true, message: 'Date override removed', data: availability });
  } catch (error) {
    next(error);
  }
};

export const createBlockedSlot = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    const blocked = await BlockedSlot.create({
      clinicId: req.clinicId,
      doctorId: doctorId || null,
      date,
      startTime,
      endTime,
      reason: reason || 'Blocked by staff',
    });

    return res.status(201).json({ success: true, message: 'Slot blocked successfully', data: blocked });
  } catch (error) {
    next(error);
  }
};

export const getBlockedSlots = async (req, res, next) => {
  try {
    const { date, doctorId } = req.query;
    const query = { clinicId: req.clinicId };
    if (date) query.date = date;
    if (doctorId) query.$or = [{ doctorId }, { doctorId: null }];

    const blocked = await BlockedSlot.find(query).populate('doctorId', 'name specialization');
    return res.status(200).json({ success: true, data: blocked });
  } catch (error) {
    next(error);
  }
};

export const deleteBlockedSlot = async (req, res, next) => {
  try {
    const blocked = await BlockedSlot.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId });
    if (!blocked) {
      return res.status(404).json({ success: false, message: 'Blocked slot not found' });
    }
    return res.status(200).json({ success: true, message: 'Slot unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlotsPreview = async (req, res, next) => {
  try {
    const { doctorId, serviceId, date } = req.query;

    if (!doctorId || !serviceId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId, serviceId and date are required' });
    }

    const slots = await SlotGenerationService.getAvailableSlots({
      clinicId: req.clinicId,
      doctorId,
      serviceId,
      date,
    });

    return res.status(200).json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    next(error);
  }
};

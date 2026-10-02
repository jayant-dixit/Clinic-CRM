import { Doctor } from '../models/Doctor.js';
import { Availability } from '../models/Availability.js';

const DEFAULT_WEEKLY_SCHEDULE = [
  { dayOfWeek: 1, dayName: 'Monday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch' }] },
  { dayOfWeek: 2, dayName: 'Tuesday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch' }] },
  { dayOfWeek: 3, dayName: 'Wednesday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch' }] },
  { dayOfWeek: 4, dayName: 'Thursday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch' }] },
  { dayOfWeek: 5, dayName: 'Friday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [{ startTime: '13:00', endTime: '14:00', label: 'Lunch' }] },
  { dayOfWeek: 6, dayName: 'Saturday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '14:00' }], breaks: [] },
  { dayOfWeek: 0, dayName: 'Sunday', isWorkingDay: false, shifts: [], breaks: [] },
];

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ clinicId: req.clinicId })
      .populate('assignedServices', 'name duration price color')
      .sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, clinicId: req.clinicId }).populate('assignedServices');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    return res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, phone, email, bio, profileImage, assignedServices, status } = req.body;

    const doctor = await Doctor.create({
      clinicId: req.clinicId,
      name,
      specialization,
      phone: phone || '',
      email: email || '',
      bio: bio || '',
      profileImage: profileImage || '',
      assignedServices: assignedServices || [],
      status: status || 'ACTIVE',
    });

    // Auto-create default availability schedule for this doctor
    await Availability.create({
      clinicId: req.clinicId,
      doctorId: doctor._id,
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      dateOverrides: [],
    });

    const populated = await Doctor.findById(doctor._id).populate('assignedServices');
    return res.status(201).json({ success: true, message: 'Doctor created successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedServices');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    return res.status(200).json({ success: true, message: 'Doctor updated successfully', data: doctor });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    // Remove availability
    await Availability.deleteOne({ doctorId: doctor._id });
    return res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

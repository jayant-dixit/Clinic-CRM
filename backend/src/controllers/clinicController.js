import { Clinic } from '../models/Clinic.js';
import { User } from '../models/User.js';

export const getClinicProfile = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    return res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    next(error);
  }
};

export const updateClinicProfile = async (req, res, next) => {
  try {
    const { name, logo, description, phone, email, address, website, timezone, settings } = req.body;

    const clinic = await Clinic.findByIdAndUpdate(
      req.clinicId,
      {
        ...(name && { name }),
        ...(logo !== undefined && { logo }),
        ...(description !== undefined && { description }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(address && { address }),
        ...(website !== undefined && { website }),
        ...(timezone && { timezone }),
        ...(settings && { settings }),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Clinic profile updated successfully', data: clinic });
  } catch (error) {
    next(error);
  }
};

export const getClinicStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ clinicId: req.clinicId }).select('-password').sort({ role: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    next(error);
  }
};

export const addClinicStaff = async (req, res, next) => {
  try {
    const { name, email, password, role = 'STAFF', phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      clinicId: req.clinicId,
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'CLINIC_ADMIN' ? 'CLINIC_ADMIN' : 'STAFF',
      phone: phone || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member added',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinicStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, role, status } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: id, clinicId: req.clinicId },
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(status && { status }),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    return res.status(200).json({ success: true, message: 'Staff updated', data: user });
  } catch (error) {
    next(error);
  }
};

export const getAllClinicsForAdmin = async (req, res, next) => {
  try {
    const clinics = await Clinic.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: clinics });
  } catch (error) {
    next(error);
  }
};

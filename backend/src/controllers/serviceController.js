import { Service } from '../models/Service.js';
import { Doctor } from '../models/Doctor.js';

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ clinicId: req.clinicId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { name, description, duration, price, color, status, doctorIds } = req.body;

    const service = await Service.create({
      clinicId: req.clinicId,
      name,
      description: description || '',
      duration: Number(duration) || 30,
      price: Number(price) || 0,
      color: color || '#2563eb',
      status: status || 'ACTIVE',
    });

    // If doctorIds provided, associate service to those doctors
    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      await Doctor.updateMany(
        { _id: { $in: doctorIds }, clinicId: req.clinicId },
        { $addToSet: { assignedServices: service._id } }
      );
    }

    return res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { doctorIds, ...updateData } = req.body;
    if (updateData.duration) updateData.duration = Number(updateData.duration);
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Sync doctor associations if specified
    if (Array.isArray(doctorIds)) {
      // Remove this service from doctors not in list
      await Doctor.updateMany(
        { clinicId: req.clinicId, _id: { $nin: doctorIds } },
        { $pull: { assignedServices: service._id } }
      );
      // Add to selected doctors
      await Doctor.updateMany(
        { clinicId: req.clinicId, _id: { $in: doctorIds } },
        { $addToSet: { assignedServices: service._id } }
      );
    }

    return res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Remove from doctors
    await Doctor.updateMany(
      { clinicId: req.clinicId },
      { $pull: { assignedServices: service._id } }
    );

    return res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

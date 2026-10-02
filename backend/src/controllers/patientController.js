import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';

export const getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = { clinicId: req.clinicId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Fetch appointment history
    const appointments = await Appointment.find({ clinicId: req.clinicId, patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .populate('serviceId', 'name duration price color')
      .sort({ date: -1, startTime: -1 });

    return res.status(200).json({
      success: true,
      data: {
        patient,
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const { name, phone, email, dateOfBirth, gender, address } = req.body;

    const existing = await Patient.findOne({ clinicId: req.clinicId, phone });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A patient with this phone number already exists', data: existing });
    }

    const patient = await Patient.create({
      clinicId: req.clinicId,
      name,
      phone,
      email: email || '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || 'Male',
      address: address || '',
    });

    return res.status(201).json({ success: true, message: 'Patient registered', data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({ success: true, message: 'Patient updated', data: patient });
  } catch (error) {
    next(error);
  }
};

export const addPatientNote = async (req, res, next) => {
  try {
    const { text, author } = req.body;
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.notes.unshift({
      text,
      author: author || req.user.name || 'Clinic Staff',
      createdAt: new Date(),
    });
    await patient.save();

    return res.status(200).json({ success: true, message: 'Note added', data: patient });
  } catch (error) {
    next(error);
  }
};

export const addPatientAttachment = async (req, res, next) => {
  try {
    const { name, url, type } = req.body;
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.attachments.unshift({
      name: name || 'Document',
      url: url || 'https://placehold.co/600x400/png?text=Medical+Record',
      type: type || 'REPORT',
      uploadedAt: new Date(),
    });
    await patient.save();

    return res.status(200).json({ success: true, message: 'Attachment added', data: patient });
  } catch (error) {
    next(error);
  }
};

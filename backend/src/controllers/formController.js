import { Form } from '../models/Form.js';
import { slugify } from '../utils/helpers.js';

export const getForms = async (req, res, next) => {
  try {
    const forms = await Form.find({ clinicId: req.clinicId }).sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: forms.length, data: forms });
  } catch (error) {
    next(error);
  }
};

export const getFormById = async (req, res, next) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    next(error);
  }
};

export const createForm = async (req, res, next) => {
  try {
    const { title, description, fields, isDefault, isPublished } = req.body;

    let baseSlug = slugify(title || 'patient-registration');
    let slug = baseSlug;
    let counter = 1;
    while (await Form.findOne({ clinicId: req.clinicId, slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // If marked as default, unset other default forms
    if (isDefault) {
      await Form.updateMany({ clinicId: req.clinicId }, { isDefault: false });
    }

    const form = await Form.create({
      clinicId: req.clinicId,
      title,
      slug,
      description: description || '',
      fields: fields || [],
      isDefault: Boolean(isDefault),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return res.status(201).json({ success: true, message: 'Form schema saved successfully', data: form });
  } catch (error) {
    next(error);
  }
};

export const updateForm = async (req, res, next) => {
  try {
    const { title, description, fields, isDefault, isPublished } = req.body;

    if (isDefault) {
      await Form.updateMany({ clinicId: req.clinicId, _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(fields && { fields }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    return res.status(200).json({ success: true, message: 'Form updated successfully', data: form });
  } catch (error) {
    next(error);
  }
};

export const duplicateForm = async (req, res, next) => {
  try {
    const original = await Form.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original form not found' });
    }

    let baseSlug = `${original.slug}-copy`;
    let slug = baseSlug;
    let counter = 1;
    while (await Form.findOne({ clinicId: req.clinicId, slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const duplicate = await Form.create({
      clinicId: req.clinicId,
      title: `${original.title} (Copy)`,
      slug,
      description: original.description,
      fields: original.fields,
      isDefault: false,
      isPublished: true,
    });

    return res.status(201).json({ success: true, message: 'Form duplicated successfully', data: duplicate });
  } catch (error) {
    next(error);
  }
};

export const deleteForm = async (req, res, next) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }
    return res.status(200).json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    next(error);
  }
};

import QRCode from 'qrcode';
import { BookingPage } from '../models/BookingPage.js';
import { Clinic } from '../models/Clinic.js';
import { config } from '../config/env.js';
import { slugify } from '../utils/helpers.js';

export const getBookingPages = async (req, res, next) => {
  try {
    const pages = await BookingPage.find({ clinicId: req.clinicId })
      .populate('formId', 'title slug fields')
      .populate('allowedServices', 'name duration price color')
      .populate('allowedDoctors', 'name specialization profileImage')
      .sort({ createdAt: -1 });

    const clinic = await Clinic.findById(req.clinicId).select('slug name');

    // Attach full booking URL and QR Data URL for each page
    const clientBase = config.clientUrl || 'http://localhost:5173';
    const enhancedPages = await Promise.all(
      pages.map(async (p) => {
        const fullUrl = `${clientBase}/book/${clinic.slug}/${p.slug}`;
        const qrDataUrl = await QRCode.toDataURL(fullUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        });
        return {
          ...p.toObject(),
          fullUrl,
          qrDataUrl,
          clinicSlug: clinic.slug,
        };
      })
    );

    return res.status(200).json({ success: true, count: enhancedPages.length, data: enhancedPages });
  } catch (error) {
    next(error);
  }
};

export const getBookingPageById = async (req, res, next) => {
  try {
    const page = await BookingPage.findOne({ _id: req.params.id, clinicId: req.clinicId })
      .populate('formId')
      .populate('allowedServices')
      .populate('allowedDoctors');

    if (!page) {
      return res.status(404).json({ success: false, message: 'Booking page not found' });
    }

    const clinic = await Clinic.findById(req.clinicId).select('slug name');
    const clientBase = config.clientUrl || 'http://localhost:5173';
    const fullUrl = `${clientBase}/book/${clinic.slug}/${page.slug}`;
    const qrDataUrl = await QRCode.toDataURL(fullUrl, { width: 320, margin: 2 });

    return res.status(200).json({
      success: true,
      data: {
        ...page.toObject(),
        fullUrl,
        qrDataUrl,
        clinicSlug: clinic.slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBookingPage = async (req, res, next) => {
  try {
    const { title, description, formId, allowedServices, allowedDoctors, isPublished, themeColor } = req.body;

    let baseSlug = slugify(title || 'appointment');
    let slug = baseSlug;
    let counter = 1;
    while (await BookingPage.findOne({ clinicId: req.clinicId, slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const page = await BookingPage.create({
      clinicId: req.clinicId,
      title,
      slug,
      description: description || '',
      formId,
      allowedServices: allowedServices || [],
      allowedDoctors: allowedDoctors || [],
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      themeColor: themeColor || '#2563eb',
    });

    const populated = await BookingPage.findById(page._id)
      .populate('formId')
      .populate('allowedServices')
      .populate('allowedDoctors');

    return res.status(201).json({ success: true, message: 'Booking page created successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateBookingPage = async (req, res, next) => {
  try {
    const page = await BookingPage.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('formId')
      .populate('allowedServices')
      .populate('allowedDoctors');

    if (!page) {
      return res.status(404).json({ success: false, message: 'Booking page not found' });
    }

    return res.status(200).json({ success: true, message: 'Booking page updated', data: page });
  } catch (error) {
    next(error);
  }
};

export const deleteBookingPage = async (req, res, next) => {
  try {
    const page = await BookingPage.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Booking page not found' });
    }
    return res.status(200).json({ success: true, message: 'Booking page deleted' });
  } catch (error) {
    next(error);
  }
};

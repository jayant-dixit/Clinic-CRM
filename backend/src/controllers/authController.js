import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Clinic } from '../models/Clinic.js';
import { config } from '../config/env.js';
import { slugify } from '../utils/helpers.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const register = async (req, res, next) => {
  try {
    const { clinicName, name, email, password, phone } = req.body;

    if (!clinicName || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Generate unique slug
    let baseSlug = slugify(clinicName);
    let slug = baseSlug;
    let counter = 1;
    while (await Clinic.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // 1. Create Clinic
    const clinic = await Clinic.create({
      name: clinicName,
      slug,
      phone: phone || '',
      email: email.toLowerCase(),
      description: `Welcome to ${clinicName}. We provide state of the art healthcare and personalized patient treatment.`,
    });

    // 2. Create Clinic Admin user
    const user = await User.create({
      clinicId: clinic._id,
      name,
      email: email.toLowerCase(),
      password,
      role: 'CLINIC_ADMIN',
      phone: phone || '',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: clinic._id,
      },
      clinic: {
        id: clinic._id,
        name: clinic.name,
        slug: clinic.slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user && (normalizedEmail === 'admin@careflow.com' || normalizedEmail === 'admin@careslot.com')) {
      user = await User.findOne({
        email: { $in: ['admin@careflow.com', 'admin@careslot.com'] }
      }).select('+password');
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const clinic = user.clinicId ? await Clinic.findById(user.clinicId) : null;
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
      clinic: clinic
        ? {
            id: clinic._id,
            name: clinic.name,
            slug: clinic.slug,
            logo: clinic.logo,
            settings: clinic.settings,
            features: clinic.features,
            subscription: clinic.subscription,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const clinic = user.clinicId ? await Clinic.findById(user.clinicId) : null;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        clinicId: user.clinicId,
      },
      clinic,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

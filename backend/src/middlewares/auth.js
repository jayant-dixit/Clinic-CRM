import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User associated with this token no longer exists.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId ? user.clinicId.toString() : null,
    };

    // Attach verified clinicId directly to request to guarantee tenant isolation
    req.clinicId = req.user.clinicId;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || 'Guest'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

export const requireClinic = (req, res, next) => {
  // If Super Admin, they may pass ?clinicId in query or header if managing on behalf
  if (req.user.role === 'SUPER_ADMIN') {
    const overrideClinicId = req.query.clinicId || req.headers['x-clinic-id'];
    if (overrideClinicId) {
      req.clinicId = overrideClinicId.toString();
    }
    return next();
  }

  if (!req.clinicId) {
    return res.status(400).json({
      success: false,
      message: 'No clinic associated with this user session.',
    });
  }
  next();
};

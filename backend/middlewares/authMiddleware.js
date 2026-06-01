import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errorHandler.js';
import { asyncHandler } from './errorMiddleware.js';
import { User } from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Resource authentication missing. Connect with a valid Bearer token signature.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secure_production_secret_fallback_key');
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return next(new ApiError(401, 'The active user corresponding to this encryption key sequence no longer exists.'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Encryption sequence has expired or holds corrupt structures. Sign in again.'));
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Permission denied. System verification properties require higher clearance.'));
    }
    next();
  };
};
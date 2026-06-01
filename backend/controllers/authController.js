import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/errorHandler.js';
import { asyncHandler } from '../middlewares/errorMiddleware.js';

// Signing JWT Token Helper
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_sandbox', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const userId = user._id || user.id;
  const token = signToken(userId);
  
  let responseUser;
  if (user.toObject) {
    responseUser = user.toObject();
  } else {
    responseUser = { ...user };
  }
  
  delete responseUser.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: {
        id: responseUser._id || responseUser.id,
        name: responseUser.name,
        email: responseUser.email,
        role: responseUser.role,
        createdAt: responseUser.createdAt
      }
    }
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  console.log('=== REGISTER HIT ===');
  console.log('Body:', req.body);

  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    console.log('Existing user check done:', existingUser ? 'found' : 'not found');

    if (existingUser) {
      return next(new ApiError(400, 'Email already registered. Proceed to Login.'));
    }

    console.log('Creating user...');
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });
    console.log('User created:', newUser._id || newUser.id);

    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('=== REGISTER ERROR ===');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    return next(err);
  }
});

// @desc    Authenticate and login users
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  console.log('=== LOGIN HIT ===');
  console.log('Body:', req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Invalid email or password credentials.'));
  }

  createSendToken(user, 200, res);
});

// @desc    Retrieve active profile information
// @route   GET /api/v1/auth/me
// @access  Protected
export const getMe = asyncHandler(async (req, res, next) => {
  const userProfile = {
    id: req.user._id || req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    createdAt: req.user.createdAt
  };

  res.status(200).json({
    success: true,
    data: {
      user: userProfile
    }
  });
});
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../models');
require('dotenv').config();

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register
exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    const { name, email, password } = value;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password_hash,
      role: 'viewer'
    });

    res.status(201).json({ success: true, message: 'Registered' });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
    }

    const { email, password } = value;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid email or password' } });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid email or password' } });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role, name: user.name };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET || 'refresh_sec', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken, // Usually set in HTTP Only cookie, returning in body per mock simplicity unless specified
      user: tokenPayload
    });
  } catch (err) {
    next(err);
  }
};

// Refresh
exports.refresh = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: { code: 'NO_TOKEN', message: 'Refresh token is required' } });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_sec');
    const tokenPayload = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });

    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } });
  }
};

// Logout
exports.logout = async (req, res, next) => {
  // Simple explicit invalidate frontend-side or tracking refresh tokens in redis
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

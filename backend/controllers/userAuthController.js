
'use strict';

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

// POST /api/user-auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid name (maximum 100 characters).'
      });
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.'
      });
    }

    if (password.length < 12 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 12 and 72 characters.'
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in.',
      user: getSafeUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    next(error);
  }
};

// POST /api/user-auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user._id.toString();

      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        return res.json({
          success: true,
          message: 'Login successful.',
          user: getSafeUser(user)
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/user-auth/me
const getMe = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in.'
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    return res.json({
      success: true,
      user: getSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/user-auth/logout
const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('leadflow.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
};

module.exports = { register, login, getMe, logout };

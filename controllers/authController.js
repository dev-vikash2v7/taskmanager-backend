const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Api = require('../utils/Api');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Api.conflict(res, 'User with this email already exists');
    }

    // Create new user
    const user = new User({
      email,
      password,
      displayName: displayName || email.split('@')[0]
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return Api.created(res, {
      user: user.getPublicProfile(),
      token
    }, 'User registered successfully');
  } catch (error) {
    console.error('Register error:', error);
    return Api.error(res, 'Registration failed', 500);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return Api.unauthorized(res, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      return Api.unauthorized(res, 'Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return Api.unauthorized(res, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return Api.success(res, {
      user: user.getPublicProfile(),
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return Api.error(res, 'Login failed', 500);
  }
};

// Google sign-in
const googleSignIn = async (req, res) => {
  try {
    const { googleId, email, displayName, avatar } = req.body;

    // Find user by Google ID or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      
      // Update profile if provided
      if (displayName && !user.displayName) {
        user.displayName = displayName;
      }
      
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        displayName: displayName || email.split('@')[0],
        avatar,
        password: Math.random().toString(36).slice(-10) // Random password for Google users
      });
    }

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return Api.success(res, {
      user: user.getPublicProfile(),
      token
    }, 'Google sign-in successful');
  } catch (error) {
    console.error('Google sign-in error:', error);
    return Api.error(res, 'Google sign-in failed', 500);
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    return Api.success(res, {
      user: req.user.getPublicProfile()
    }, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return Api.error(res, 'Failed to get profile', 500);
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const updates = {};

    if (displayName !== undefined) {
      updates.displayName = displayName;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    return Api.success(res, {
      user: user.getPublicProfile()
    }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return Api.error(res, 'Failed to update profile', 500);
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return Api.unauthorized(res, 'Current password is incorrect');
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    return Api.success(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return Api.error(res, 'Failed to change password', 500);
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    return Api.success(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return Api.error(res, 'Logout failed', 500);
  }
};

module.exports = {
  register,
  login,
  googleSignIn,
  getProfile,
  updateProfile,
  changePassword,
  logout
};

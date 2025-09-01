const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  register,
  login,
  googleSignIn,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const googleSignInValidation = [
  body('googleId')
    .notEmpty()
    .withMessage('Google ID is required'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('displayName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters')
];

const updateProfileValidation = [
  body('displayName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/google', googleSignInValidation, validate, googleSignIn);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);
router.put('/change-password', auth, changePasswordValidation, validate, changePassword);
router.post('/logout', auth, logout);

module.exports = router;

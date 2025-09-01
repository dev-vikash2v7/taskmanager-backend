const express = require('express');
const { body, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserStats,
  deleteAccount,
  getUserActivity
} = require('../controllers/userController');

const router = express.Router();

// Apply auth middleware to all user routes
router.use(auth);

// Validation rules
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

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const getUserActivityValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

// Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidation, validate, updateUserProfile);
router.put('/change-password', changePasswordValidation, validate, changePassword);
router.get('/stats', getUserStats);
router.get('/activity', getUserActivityValidation, validate, getUserActivity);
router.delete('/account', deleteAccountValidation, validate, deleteAccount);

module.exports = router;

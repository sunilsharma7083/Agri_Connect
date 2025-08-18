const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getNotifications,
  markNotificationRead,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', 
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid phone number'),
  body('address.street').optional().trim().notEmpty().withMessage('Street cannot be empty'),
  body('address.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('address.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('address.pincode').optional().matches(/^[1-9][0-9]{5}$/).withMessage('Please enter a valid pincode'),
  body('language').optional().isIn(['en', 'hi']).withMessage('Language must be en or hi'),
  handleValidationErrors,
  updateProfile
);

// Upload profile image
router.post('/profile/image', 
  uploadSingle('profileImage'),
  uploadProfileImage
);

// Get user notifications
router.get('/notifications', getNotifications);

// Mark notification as read
router.put('/notifications/:id/read', markNotificationRead);

// Get user statistics
router.get('/stats', getUserStats);

module.exports = router;

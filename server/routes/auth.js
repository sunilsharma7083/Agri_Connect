const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number'),
  body('role')
    .isIn(['farmer', 'buyer'])
    .withMessage('Role must be either farmer or buyer'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid pincode')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number'),
  body('address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address cannot be empty'),
  body('address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),
  body('address.pincode')
    .optional()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid pincode'),
  body('language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Language must be either en or hi')
];

// Routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

router.put('/profile', 
  protect, 
  uploadSingle('profileImage'),
  updateProfileValidation, 
  handleValidationErrors, 
  updateProfile
);

router.put('/change-password', 
  protect, 
  changePasswordValidation, 
  handleValidationErrors, 
  changePassword
);

router.post('/forgot-password', 
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  handleValidationErrors,
  forgotPassword
);

router.put('/reset-password/:token',
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors,
  resetPassword
);

module.exports = router;

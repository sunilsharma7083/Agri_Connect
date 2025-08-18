const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllGrains,
  approveGrain,
  rejectGrain,
  getAllOrders,
  getAnalytics,
  getDashboardStats,
  exportData
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', 
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['farmer', 'buyer', 'admin']).withMessage('Invalid role filter'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  handleValidationErrors,
  getAllUsers
);

router.get('/users/:id', getUserById);

router.put('/users/:id', 
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be boolean'),
  body('role').optional().isIn(['farmer', 'buyer', 'admin']).withMessage('Invalid role'),
  handleValidationErrors,
  updateUser
);

router.delete('/users/:id', deleteUser);

// Grain management
router.get('/grains', 
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'sold', 'expired']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('grainType').optional().isIn(['wheat', 'rice', 'corn', 'barley', 'millet', 'sorghum', 'oats', 'quinoa', 'other']).withMessage('Invalid grain type'),
  handleValidationErrors,
  getAllGrains
);

router.put('/grains/:id/approve', 
  body('adminNotes').optional().isLength({ max: 500 }).withMessage('Admin notes cannot exceed 500 characters'),
  handleValidationErrors,
  approveGrain
);

router.put('/grains/:id/reject', 
  body('adminNotes').isLength({ min: 1, max: 500 }).withMessage('Rejection reason is required and cannot exceed 500 characters'),
  handleValidationErrors,
  rejectGrain
);

// Order management
router.get('/orders', 
  query('status').optional().isIn(['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  handleValidationErrors,
  getAllOrders
);

// Analytics and reporting
router.get('/analytics', 
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  handleValidationErrors,
  getAnalytics
);

router.get('/dashboard', getDashboardStats);

// Data export
router.get('/export/:type', 
  query('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  handleValidationErrors,
  exportData
);

module.exports = router;

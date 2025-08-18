const express = require('express');
const { body, query } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getReceivedOrders,
  rateOrder,
  getOrderAnalytics
} = require('../controllers/orderController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');
const { uploadMultiple } = require('../middleware/upload');
const Order = require('../models/Order');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('grain')
    .isMongoId()
    .withMessage('Valid grain ID is required'),
  body('quantity')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be at least 0.1 quintals'),
  body('deliveryAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Delivery name is required'),
  body('deliveryAddress.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid phone number'),
  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Delivery street address is required'),
  body('deliveryAddress.city')
    .trim()
    .notEmpty()
    .withMessage('Delivery city is required'),
  body('deliveryAddress.state')
    .trim()
    .notEmpty()
    .withMessage('Delivery state is required'),
  body('deliveryAddress.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid pincode'),
  body('paymentMethod')
    .isIn(['cash_on_delivery', 'bank_transfer', 'upi', 'card'])
    .withMessage('Invalid payment method'),
  body('deliveryType')
    .optional()
    .isIn(['farmer_delivery', 'buyer_pickup', 'third_party'])
    .withMessage('Invalid delivery type')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const rateOrderValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
];

const queryValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid status filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalAmount', 'status', 'estimatedDeliveryDate'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Protected routes (require authentication)
router.use(protect);

// Order creation (buyers only)
router.post('/', 
  authorize('buyer'), 
  createOrderValidation, 
  handleValidationErrors, 
  createOrder
);

// Get orders with filters
router.get('/', 
  queryValidation, 
  handleValidationErrors, 
  getOrders
);

// Get my orders (buyer or farmer specific)
router.get('/my/orders', 
  queryValidation, 
  handleValidationErrors, 
  getMyOrders
);

// Get received orders (for farmers)
router.get('/received', 
  (req, res, next) => {
    console.log('📦 Received orders route hit');
    next();
  },
  protect,
  authorize('farmer'),
  queryValidation, 
  handleValidationErrors, 
  getReceivedOrders
);

// Get specific order
router.get('/:id', 
  (req, res, next) => {
    console.log('📦 Order by ID route hit with ID:', req.params.id);
    next();
  },
  getOrder
);

// Update order status (farmers and buyers can update different statuses)
router.put('/:id/status', 
  updateStatusValidation, 
  handleValidationErrors, 
  updateOrderStatus
);

// Cancel order
router.put('/:id/cancel', 
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters'),
  handleValidationErrors,
  cancelOrder
);

// Rate order (after delivery)
router.post('/:id/rate', 
  rateOrderValidation, 
  handleValidationErrors, 
  rateOrder
);

// Upload quality check images (farmers only)
router.post('/:id/quality-images', 
  authorize('farmer'),
  uploadMultiple('qualityImages', 3),
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.farmer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      req.order = order;
      next();
    } catch (error) {
      next(error);
    }
  },
  async (req, res) => {
    try {
      const images = req.files.map(file => `/uploads/quality/${file.filename}`);
      
      req.order.qualityCheck.images = images;
      req.order.qualityCheck.status = 'passed';
      req.order.qualityCheck.checkedBy = req.user._id;
      req.order.qualityCheck.checkedAt = new Date();
      
      await req.order.save();

      res.status(200).json({
        success: true,
        message: 'Quality check images uploaded successfully',
        data: {
          images: images,
          qualityCheck: req.order.qualityCheck
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading quality check images',
        error: error.message
      });
    }
  }
);

// Analytics (admin and individual users)
router.get('/analytics/summary', getOrderAnalytics);

module.exports = router;

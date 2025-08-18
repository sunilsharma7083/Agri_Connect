const express = require('express');
const { body, query } = require('express-validator');
const {
  createGrain,
  getGrains,
  getGrain,
  updateGrain,
  deleteGrain,
  getMyGrains,
  uploadGrainImages,
  likeGrain,
  searchGrains
} = require('../controllers/grainController');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');
const { uploadMultiple } = require('../middleware/upload');
const Grain = require('../models/Grain');

const router = express.Router();

// Validation rules
const createGrainValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('grainType')
    .isIn(['wheat', 'rice', 'corn', 'barley', 'millet', 'sorghum', 'oats', 'quinoa', 'other'])
    .withMessage('Please select a valid grain type'),
  body('variety')
    .trim()
    .notEmpty()
    .withMessage('Grain variety is required'),
  body('quantity')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Quantity must be between 0.1 and 10000 quintals'),
  body('pricePerQuintal')
    .isFloat({ min: 100, max: 50000 })
    .withMessage('Price must be between ₹100 and ₹50,000 per quintal'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Location address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('location.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid pincode'),
  body('qualityGrade')
    .isIn(['A', 'B', 'C'])
    .withMessage('Quality grade must be A, B, or C'),
  body('harvestDate')
    .isISO8601()
    .withMessage('Please enter a valid harvest date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Harvest date cannot be in the future');
      }
      return true;
    }),
  body('minimumOrderQuantity')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Minimum order quantity must be at least 0.1 quintals'),
  body('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be true or false')
];

const updateGrainValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('quantity')
    .optional()
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Quantity must be between 0.1 and 10000 quintals'),
  body('pricePerQuintal')
    .optional()
    .isFloat({ min: 100, max: 50000 })
    .withMessage('Price must be between ₹100 and ₹50,000 per quintal'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('qualityGrade')
    .optional()
    .isIn(['A', 'B', 'C'])
    .withMessage('Quality grade must be A, B, or C'),
  body('minimumOrderQuantity')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Minimum order quantity must be at least 0.1 quintals'),
  body('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be true or false')
];

const searchValidation = [
  query('grainType')
    .optional()
    .isIn(['wheat', 'rice', 'corn', 'barley', 'millet', 'sorghum', 'oats', 'quinoa', 'other'])
    .withMessage('Invalid grain type'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('minQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum quantity must be a positive number'),
  query('qualityGrade')
    .optional()
    .isIn(['A', 'B', 'C'])
    .withMessage('Quality grade must be A, B, or C'),
  query('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be true or false'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'pricePerQuintal', '-pricePerQuintal', 'quantity', '-quantity'])
    .withMessage('Invalid sort parameter')
];

// Public routes
router.get('/', searchValidation, handleValidationErrors, getGrains);
router.get('/search', searchValidation, handleValidationErrors, searchGrains);
router.get('/:id', getGrain);

// Protected routes (require authentication)
router.use(protect);

// Farmer-only routes
router.post('/', 
  authorize('farmer'), 
  uploadMultiple('grainImages', 5),
  createGrainValidation, 
  handleValidationErrors, 
  createGrain
);

router.get('/my/listings', authorize('farmer'), getMyGrains);

router.put('/:id', 
  authorize('farmer'), 
  checkOwnership(Grain),
  updateGrainValidation, 
  handleValidationErrors, 
  updateGrain
);

router.delete('/:id', 
  authorize('farmer'), 
  checkOwnership(Grain),
  deleteGrain
);

router.post('/:id/images', 
  authorize('farmer'), 
  checkOwnership(Grain),
  uploadMultiple('grainImages', 5),
  uploadGrainImages
);

// Buyer routes
router.post('/:id/like', authorize('buyer'), likeGrain);

module.exports = router;

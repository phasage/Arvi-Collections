const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts,
  getRelatedProducts
} = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isMongoId()
    .withMessage('Please provide a valid category ID'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), productValidation, validate, createProduct);
router.put('/:id', protect, authorize('admin'), productValidation, validate, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    brand,
    tags,
    featured,
    onSale,
    inStock,
    search
  } = req.query;

  if (global.demoMode) {
    // Demo mode - filter in-memory data
    let products = global.demoData.products.filter(p => p.status === 'active');
    
    // Apply filters
    if (category) products = products.filter(p => p.category === category);
    if (minPrice) products = products.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) products = products.filter(p => p.price <= parseFloat(maxPrice));
    if (brand) products = products.filter(p => p.brand && p.brand.toLowerCase().includes(brand.toLowerCase()));
    if (featured !== undefined) products = products.filter(p => p.featured === (featured === 'true'));
    if (onSale !== undefined) products = products.filter(p => p.onSale === (onSale === 'true'));
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Add category info
    products = products.map(product => ({
      ...product,
      category: global.demoData.categories.find(c => c._id === product.category)
    }));

    const total = products.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      count: paginatedProducts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: paginatedProducts
    });
  }

  // MongoDB mode
  const filters = {
    status: 'active',
    page: parseInt(page),
    limit: parseInt(limit),
    sort
  };

  if (category) filters.category = category;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  if (brand) filters.brand = brand;
  if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
  if (featured !== undefined) filters.featured = featured === 'true';
  if (onSale !== undefined) filters.onSale = onSale === 'true';
  if (inStock !== undefined) filters.inStock = inStock === 'true';
  if (search) filters.search = search;

  const products = await Product.getFiltered(filters);
  const totalQuery = Product.find({ status: 'active' });
  const total = await totalQuery.countDocuments();

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('reviews')
    .populate('relatedProducts', 'name price images slug');

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Only show active products to public
  if (product.status !== 'active') {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Verify category exists
  const category = await Category.findById(req.body.category);
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Add user to req.body
  req.body.updatedBy = req.user.id;

  // Verify category exists if being updated
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug');

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q) {
    return next(new ErrorResponse('Search query is required', 400));
  }

  const products = await Product.find({
    $and: [
      { status: 'active' },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
          { brand: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({
    $and: [
      { status: 'active' },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
          { brand: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: products
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({
    status: 'active',
    featured: true
  })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const { limit = 4 } = req.query;

  // Find products in the same category, excluding the current product
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: 'active'
  })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts,
  getRelatedProducts
};
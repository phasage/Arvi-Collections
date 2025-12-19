const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    startDate,
    endDate
  } = req.query;

  let query = {};

  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user owns order or is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    customerNotes
  } = req.body;

  // Validate and process items
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
    }

    if (product.status !== 'active') {
      return next(new ErrorResponse(`Product is not available: ${product.name}`, 400));
    }

    // Check stock
    if (product.trackQuantity && product.quantity < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
    }

    const orderItem = {
      product: product._id,
      name: product.name,
      image: product.mainImage,
      price: product.price,
      quantity: item.quantity,
      sku: product.sku
    };

    orderItems.push(orderItem);
    subtotal += product.price * item.quantity;
  }

  // Calculate totals (simplified - in real app, calculate tax based on location)
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    subtotal,
    tax,
    shipping,
    total,
    customerInfo: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    },
    shippingAddress,
    billingAddress: billingAddress || { ...shippingAddress, sameAsShipping: true },
    paymentMethod,
    customerNotes
  });

  // Update product quantities
  await order.updateInventory('decrease');

  // Populate the order before sending response
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  res.status(201).json({
    success: true,
    data: populatedOrder
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, trackingNumber, shippingCarrier, adminNotes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  const updateData = { status };
  
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (shippingCarrier) updateData.shippingCarrier = shippingCarrier;
  if (adminNotes) updateData.adminNotes = adminNotes;

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  res.status(200).json({
    success: true,
    data: updatedOrder
  });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Order.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const stats = await Order.getStats(startDate, endDate);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getOrderStats
};
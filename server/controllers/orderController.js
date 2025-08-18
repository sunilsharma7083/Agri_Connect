const Order = require('../models/Order');
const Grain = require('../models/Grain');
const { asyncHandler } = require('../middleware/error');
const { sendEmail } = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyers only)
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { grain: grainId, quantity, deliveryAddress, paymentMethod, deliveryType, notes } = req.body;

  // Find the grain
  const grain = await Grain.findById(grainId).populate('farmer', 'name email phone address');

  if (!grain) {
    return res.status(404).json({
      success: false,
      message: 'Grain not found'
    });
  }

  if (grain.status !== 'approved') {
    return res.status(400).json({
      success: false,
      message: 'This grain listing is not available for order'
    });
  }

  // Check if enough quantity is available
  if (!grain.isAvailableForOrder(quantity)) {
    return res.status(400).json({
      success: false,
      message: `Insufficient quantity available. Available: ${grain.availableQuantity} quintals`
    });
  }

  // Calculate pricing
  const pricePerQuintal = grain.pricePerQuintal;
  const totalAmount = quantity * pricePerQuintal;

  // Create order
  const order = await Order.create({
    buyer: req.user.id,
    grain: grainId,
    farmer: grain.farmer._id,
    quantity,
    pricePerQuintal,
    totalAmount,
    deliveryAddress,
    paymentMethod,
    deliveryType: deliveryType || 'farmer_delivery',
    pickupAddress: deliveryType === 'buyer_pickup' ? grain.location : undefined,
    estimatedDeliveryDate: deliveryType === 'farmer_delivery' ? 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined, // 7 days from now
    notes: { buyer: notes }
  });

  // Reserve quantity in grain
  grain.reserveQuantity(quantity);
  await grain.save();

  // Populate order data
  await order.populate([
    { path: 'buyer', select: 'name email phone' },
    { path: 'farmer', select: 'name email phone address' },
    { path: 'grain', select: 'title grainType variety images' }
  ]);

  // Send confirmation emails
  try {
    // Email to buyer
    await sendEmail({
      email: req.user.email,
      subject: 'Order Confirmation - Kisaan',
      message: `
        Dear ${req.user.name},
        
        Your order has been placed successfully!
        
        Order Details:
        - Grain: ${grain.title}
        - Quantity: ${quantity} quintals
        - Total Amount: ₹${totalAmount}
        - Farmer: ${grain.farmer.name}
        
        You will receive updates about your order status.
        
        Thank you for using Kisaan!
      `
    });

    // Email to farmer
    await sendEmail({
      email: grain.farmer.email,
      subject: 'New Order Received - Kisaan',
      message: `
        Dear ${grain.farmer.name},
        
        You have received a new order!
        
        Order Details:
        - Grain: ${grain.title}
        - Quantity: ${quantity} quintals
        - Total Amount: ₹${totalAmount}
        - Buyer: ${req.user.name}
        - Phone: ${req.user.phone}
        
        Please login to your dashboard to confirm this order.
        
        Best regards,
        Kisaan Team
      `
    });
  } catch (error) {
    console.error('Order confirmation emails failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query = {};
  
  // Filter by user role
  if (req.user.role === 'farmer') {
    query.farmer = req.user.id;
  } else if (req.user.role === 'buyer') {
    query.buyer = req.user.id;
  }
  // Admin can see all orders

  // Filter by status
  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const orders = await Order.find(query)
    .populate('buyer', 'name email phone address')
    .populate('farmer', 'name email phone address')
    .populate('grain', 'title grainType variety images')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      current: pageNum,
      total: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
      totalItems: total
    },
    data: { orders }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email phone address')
    .populate('farmer', 'name email phone address')
    .populate('grain', 'title grainType variety images location');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user has access to this order
  const hasAccess = 
    req.user.role === 'admin' ||
    order.buyer._id.toString() === req.user.id ||
    order.farmer._id.toString() === req.user.id;

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: { order }
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;
  
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email')
    .populate('farmer', 'name email')
    .populate('grain', 'title');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check permissions for status updates
  const userRole = req.user.role;
  const userId = req.user.id;

  let canUpdate = false;
  let statusDescription = '';

  if (userRole === 'admin') {
    canUpdate = true;
  } else if (userRole === 'farmer' && order.farmer._id.toString() === userId) {
    if (['confirmed', 'shipped', 'delivered'].includes(status)) {
      canUpdate = true;
    }
  } else if (userRole === 'buyer' && order.buyer._id.toString() === userId) {
    if (status === 'paid') {
      canUpdate = true;
    }
  }

  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this order status'
    });
  }

  // Update order
  order.updateStatus(status, statusDescription, req.user.id);
  
  if (notes) {
    if (userRole === 'farmer') {
      order.notes.farmer = notes;
    } else if (userRole === 'buyer') {
      order.notes.buyer = notes;
    } else {
      order.notes.admin = notes;
    }
  }

  await order.save();

  // Send notification emails
  try {
    const statusMessages = {
      confirmed: 'Your order has been confirmed by the farmer',
      paid: 'Payment received for your order',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered'
    };

    if (statusMessages[status]) {
      if (userRole === 'farmer' && order.buyer.email) {
        await sendEmail({
          email: order.buyer.email,
          subject: `Order Update - ${order.grain.title}`,
          message: `${statusMessages[status]}. Order ID: ${order._id}`
        });
      } else if (userRole === 'buyer' && order.farmer.email) {
        await sendEmail({
          email: order.farmer.email,
          subject: `Order Update - ${order.grain.title}`,
          message: `${statusMessages[status]}. Order ID: ${order._id}`
        });
      }
    }
  } catch (error) {
    console.error('Status update email failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  
  const order = await Order.findById(req.params.id).populate('grain');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user can cancel this order
  const userRole = req.user.role;
  const userId = req.user.id;
  
  const canCancel = 
    userRole === 'admin' ||
    (order.buyer.toString() === userId && order.canBeCancelled()) ||
    (order.farmer.toString() === userId && order.canBeCancelled());

  if (!canCancel) {
    return res.status(403).json({
      success: false,
      message: 'Cannot cancel this order'
    });
  }

  // Update order status
  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    description: `Order cancelled: ${reason}`,
    updatedBy: req.user.id
  });

  // Return quantity to grain
  if (order.grain) {
    order.grain.availableQuantity += order.quantity;
    await order.grain.save();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});

// @desc    Get my orders
// @route   GET /api/orders/my/orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  
  if (req.user.role === 'farmer') {
    query.farmer = req.user.id;
  } else {
    query.buyer = req.user.id;
  }

  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const orders = await Order.find(query)
    .populate('buyer', 'name phone')
    .populate('farmer', 'name phone address.city')
    .populate('grain', 'title grainType images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      current: pageNum,
      total: Math.ceil(total / limitNum),
      totalItems: total
    },
    data: { orders }
  });
});

// @desc    Get received orders (for farmers)
// @route   GET /api/orders/received
// @access  Private (Farmer only)
exports.getReceivedOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {
    farmer: req.user.id
  };

  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const orders = await Order.find(query)
    .populate('buyer', 'name phone')
    .populate('grain', 'title grainType images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      current: pageNum,
      total: Math.ceil(total / limitNum),
      totalItems: total
    },
    data: { orders }
  });
});

// @desc    Rate order
// @route   POST /api/orders/:id/rate
// @access  Private
exports.rateOrder = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;
  
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Can only rate delivered orders'
    });
  }

  const userRole = req.user.role;
  const userId = req.user.id;

  if (userRole === 'buyer' && order.buyer.toString() === userId) {
    order.rating.buyerRating = {
      stars: rating,
      review,
      date: new Date()
    };
  } else if (userRole === 'farmer' && order.farmer.toString() === userId) {
    order.rating.farmerRating = {
      stars: rating,
      review,
      date: new Date()
    };
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to rate this order'
    });
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Rating submitted successfully',
    data: { rating: order.rating }
  });
});

// @desc    Get order analytics
// @route   GET /api/orders/analytics/summary
// @access  Private
exports.getOrderAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let matchStage = {};
  
  if (userRole === 'farmer') {
    matchStage.farmer = userId;
  } else if (userRole === 'buyer') {
    matchStage.buyer = userId;
  }
  // Admin gets all orders

  const analytics = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' },
        ordersByStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        }
      }
    }
  ]);

  // Get status breakdown
  const statusBreakdown = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: analytics[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      statusBreakdown
    }
  });
});

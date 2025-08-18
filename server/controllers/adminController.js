const User = require('../models/User');
const Grain = require('../models/Grain');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, role, isActive, search } = req.query;

  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  // Get user statistics
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      current: pageNum,
      total: Math.ceil(total / limitNum),
      totalItems: total
    },
    stats,
    data: { users }
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's grains if farmer
  let grains = [];
  if (user.role === 'farmer') {
    grains = await Grain.find({ farmer: user._id })
      .select('title grainType status quantity pricePerQuintal createdAt')
      .limit(10)
      .sort({ createdAt: -1 });
  }

  // Get user's orders
  const orderQuery = user.role === 'farmer' ? { farmer: user._id } : { buyer: user._id };
  const orders = await Order.find(orderQuery)
    .select('status totalAmount createdAt')
    .limit(10)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      user,
      grains,
      orders,
      stats: {
        totalGrains: grains.length,
        totalOrders: orders.length
      }
    }
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { isActive, isVerified, role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  if (isActive !== undefined) user.isActive = isActive;
  if (isVerified !== undefined) user.isVerified = isVerified;
  if (role) user.role = role;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user: user.toSafeObject() }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Don't allow deletion of other admins
  if (user.role === 'admin' && req.user.id !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete another admin user'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get all grains for admin
// @route   GET /api/admin/grains
// @access  Private/Admin
exports.getAllGrains = asyncHandler(async (req, res, next) => {
  const { status, grainType, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (grainType) query.grainType = grainType;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const grains = await Grain.find(query)
    .populate('farmer', 'name email phone address.city address.state')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Grain.countDocuments(query);

  // Get grain statistics
  const stats = await Grain.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$pricePerQuintal'] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: grains.length,
    pagination: {
      current: pageNum,
      total: Math.ceil(total / limitNum),
      totalItems: total
    },
    stats,
    data: { grains }
  });
});

// @desc    Approve grain listing
// @route   PUT /api/admin/grains/:id/approve
// @access  Private/Admin
exports.approveGrain = asyncHandler(async (req, res, next) => {
  const { adminNotes } = req.body;

  const grain = await Grain.findById(req.params.id).populate('farmer', 'name email');

  if (!grain) {
    return res.status(404).json({
      success: false,
      message: 'Grain not found'
    });
  }

  grain.status = 'approved';
  grain.approvedBy = req.user.id;
  grain.approvedAt = new Date();
  if (adminNotes) grain.adminNotes = adminNotes;

  await grain.save();

  // Send approval email to farmer
  try {
    const { sendEmail } = require('../utils/email');
    await sendEmail({
      email: grain.farmer.email,
      subject: 'Grain Listing Approved - Kisaan',
      message: `
        Dear ${grain.farmer.name},
        
        Your grain listing "${grain.title}" has been approved and is now live on Kisaan!
        
        Buyers can now view and order your grain.
        
        ${adminNotes ? `Admin Notes: ${adminNotes}` : ''}
        
        Best regards,
        Kisaan Team
      `
    });
  } catch (error) {
    console.error('Approval email failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Grain approved successfully',
    data: { grain }
  });
});

// @desc    Reject grain listing
// @route   PUT /api/admin/grains/:id/reject
// @access  Private/Admin
exports.rejectGrain = asyncHandler(async (req, res, next) => {
  const { adminNotes } = req.body;

  const grain = await Grain.findById(req.params.id).populate('farmer', 'name email');

  if (!grain) {
    return res.status(404).json({
      success: false,
      message: 'Grain not found'
    });
  }

  grain.status = 'rejected';
  grain.adminNotes = adminNotes;

  await grain.save();

  // Send rejection email to farmer
  try {
    const { sendEmail } = require('../utils/email');
    await sendEmail({
      email: grain.farmer.email,
      subject: 'Grain Listing Rejected - Kisaan',
      message: `
        Dear ${grain.farmer.name},
        
        Unfortunately, your grain listing "${grain.title}" has been rejected.
        
        Reason: ${adminNotes}
        
        Please review the requirements and submit a new listing.
        
        If you have questions, please contact our support team.
        
        Best regards,
        Kisaan Team
      `
    });
  } catch (error) {
    console.error('Rejection email failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Grain rejected successfully',
    data: { grain }
  });
});

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 20, startDate, endDate } = req.query;

  const query = {};
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const orders = await Order.find(query)
    .populate('buyer', 'name email phone')
    .populate('farmer', 'name email phone')
    .populate('grain', 'title grainType')
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

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'month', startDate, endDate } = req.query;

  let dateRange = {};
  const now = new Date();
  
  if (startDate && endDate) {
    dateRange = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else {
    switch (period) {
      case 'day':
        dateRange = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case 'week':
        dateRange = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateRange = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateRange = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }
  }

  // User analytics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        newUsers: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', dateRange.$gte] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Order analytics
  const orderStats = await Order.aggregate([
    { $match: { createdAt: dateRange } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        avgValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Grain analytics
  const grainStats = await Grain.aggregate([
    {
      $group: {
        _id: '$grainType',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        avgPrice: { $avg: '$pricePerQuintal' }
      }
    }
  ]);

  // Revenue over time
  const revenueOverTime = await Order.aggregate([
    { $match: { createdAt: dateRange, status: { $in: ['delivered', 'paid'] } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      userStats,
      orderStats,
      grainStats,
      revenueOverTime
    }
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total counts
  const totalUsers = await User.countDocuments();
  const totalFarmers = await User.countDocuments({ role: 'farmer' });
  const totalBuyers = await User.countDocuments({ role: 'buyer' });
  const totalGrains = await Grain.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Recent activity
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } });
  const newGrainsThisMonth = await Grain.countDocuments({ createdAt: { $gte: lastMonth } });
  const newOrdersThisMonth = await Order.countDocuments({ createdAt: { $gte: lastMonth } });

  // Revenue statistics
  const revenueStats = await Order.aggregate([
    { $match: { status: { $in: ['delivered', 'paid'] } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalCommission: { $sum: '$commission.amount' },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: lastMonth }, status: { $in: ['delivered', 'paid'] } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        commission: { $sum: '$commission.amount' }
      }
    }
  ]);

  // Pending approvals
  const pendingGrains = await Grain.countDocuments({ status: 'pending' });
  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  res.status(200).json({
    success: true,
    data: {
      totals: {
        users: totalUsers,
        farmers: totalFarmers,
        buyers: totalBuyers,
        grains: totalGrains,
        orders: totalOrders
      },
      thisMonth: {
        newUsers: newUsersThisMonth,
        newGrains: newGrainsThisMonth,
        newOrders: newOrdersThisMonth,
        revenue: monthlyRevenue[0]?.revenue || 0,
        commission: monthlyRevenue[0]?.commission || 0
      },
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        commission: revenueStats[0]?.totalCommission || 0,
        avgOrderValue: revenueStats[0]?.avgOrderValue || 0
      },
      pending: {
        grains: pendingGrains,
        orders: pendingOrders
      }
    }
  });
});

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private/Admin
exports.exportData = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { format = 'json', startDate, endDate } = req.query;

  let query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  let data;
  let filename;

  switch (type) {
    case 'users':
      data = await User.find(query).select('-password').lean();
      filename = `users_export_${Date.now()}`;
      break;
    case 'grains':
      data = await Grain.find(query).populate('farmer', 'name email').lean();
      filename = `grains_export_${Date.now()}`;
      break;
    case 'orders':
      data = await Order.find(query)
        .populate('buyer', 'name email')
        .populate('farmer', 'name email')
        .populate('grain', 'title grainType')
        .lean();
      filename = `orders_export_${Date.now()}`;
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid export type'
      });
  }

  if (format === 'csv') {
    // Convert to CSV (simplified implementation)
    const csv = convertToCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.json({
      success: true,
      exportDate: new Date(),
      recordCount: data.length,
      data
    });
  }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

const User = require('../models/User');
const Grain = require('../models/Grain');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/error');
const { getFileUrl } = require('../middleware/upload');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: user.toSafeObject()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};
  
  // Only update provided fields
  const allowedFields = ['name', 'phone', 'address', 'language'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toSafeObject()
    }
  });
});

// @desc    Upload profile image
// @route   POST /api/users/profile/image
// @access  Private
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  const imageUrl = getFileUrl(req, req.file.path);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profileImage: imageUrl },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile image updated successfully',
    data: {
      profileImage: imageUrl,
      user: user.toSafeObject()
    }
  });
});

// @desc    Get user notifications (placeholder for future implementation)
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  // This is a placeholder for a future notifications system
  // You could implement this with a separate Notification model
  
  res.status(200).json({
    success: true,
    data: {
      notifications: [
        {
          id: '1',
          type: 'info',
          title: 'Welcome to Kisaan!',
          message: 'Thank you for joining our platform. Start by exploring grain listings.',
          read: false,
          createdAt: new Date()
        }
      ]
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationRead = asyncHandler(async (req, res, next) => {
  // Placeholder for notification read functionality
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let stats = {
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    totalEarnings: 0,
    totalSpent: 0,
    completedOrders: 0
  };

  if (userRole === 'farmer') {
    // Farmer statistics
    const grainStats = await Grain.aggregate([
      { $match: { farmer: userId } },
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          activeListings: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          totalQuantity: { $sum: '$quantity' },
          avgPrice: { $avg: '$pricePerQuintal' }
        }
      }
    ]);

    const orderStats = await Order.aggregate([
      { $match: { farmer: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalEarnings: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'delivered'] },
                '$farmerEarnings',
                0
              ]
            }
          },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed']] }, 1, 0] }
          }
        }
      }
    ]);

    stats = {
      ...stats,
      ...(grainStats[0] || {}),
      ...(orderStats[0] || {})
    };

  } else if (userRole === 'buyer') {
    // Buyer statistics
    const orderStats = await Order.aggregate([
      { $match: { buyer: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'delivered'] },
                '$totalAmount',
                0
              ]
            }
          },
          pendingOrders: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed', 'shipped']] }, 1, 0] }
          },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    stats = {
      ...stats,
      ...(orderStats[0] || {})
    };
  }

  // Recent activity
  const recentGrains = userRole === 'farmer' ? 
    await Grain.find({ farmer: userId })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(5) : [];

  const recentOrders = await Order.find(
    userRole === 'farmer' ? { farmer: userId } : { buyer: userId }
  )
    .select('status totalAmount createdAt')
    .populate('grain', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats,
      recentActivity: {
        grains: recentGrains,
        orders: recentOrders
      }
    }
  });
});

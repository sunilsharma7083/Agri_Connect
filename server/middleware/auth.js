const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
exports.checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      
      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Find the resource
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership based on resource type
      let isOwner = false;
      
      if (resource.farmer) {
        isOwner = resource.farmer.toString() === req.user._id.toString();
      } else if (resource.buyer) {
        isOwner = resource.buyer.toString() === req.user._id.toString();
      } else if (resource._id) {
        isOwner = resource._id.toString() === req.user._id.toString();
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in ownership verification'
      });
    }
  };
};

// Middleware to validate user status
exports.checkUserStatus = async (req, res, next) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address to continue.'
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });

    next();
  } catch (error) {
    console.error('User status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in user status verification'
    });
  }
};

// Middleware for optional authentication (user can be logged in or not)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid but continue without user
        console.log('Optional auth - invalid token:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

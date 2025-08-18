const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  grain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grain',
    required: [true, 'Grain ID is required']
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1 quintals']
  },
  pricePerQuintal: {
    type: Number,
    required: [true, 'Price per quintal is required'],
    min: [1, 'Price must be positive']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [1, 'Total amount must be positive']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'bank_transfer', 'upi', 'card'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    paymentMethod: String,
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String
    }
  },
  deliveryAddress: {
    name: {
      type: String,
      required: [true, 'Delivery name is required']
    },
    phone: {
      type: String,
      required: [true, 'Delivery phone is required']
    },
    street: {
      type: String,
      required: [true, 'Delivery street is required']
    },
    city: {
      type: String,
      required: [true, 'Delivery city is required']
    },
    state: {
      type: String,
      required: [true, 'Delivery state is required']
    },
    pincode: {
      type: String,
      required: [true, 'Delivery pincode is required'],
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    }
  },
  pickupAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  deliveryType: {
    type: String,
    enum: ['farmer_delivery', 'buyer_pickup', 'third_party'],
    default: 'farmer_delivery'
  },
  estimatedDeliveryDate: {
    type: Date,
    required: function() {
      return this.deliveryType === 'farmer_delivery' || this.deliveryType === 'third_party';
    }
  },
  actualDeliveryDate: Date,
  trackingDetails: {
    trackingNumber: String,
    carrier: String,
    trackingUrl: String
  },
  qualityCheck: {
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending'
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: Date,
    notes: String,
    images: [String]
  },
  notes: {
    buyer: String,
    farmer: String,
    admin: String
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  cancellationReason: String,
  refundAmount: Number,
  refundDate: Date,
  commission: {
    amount: Number,
    percentage: {
      type: Number,
      default: 5 // 5% commission
    }
  },
  rating: {
    buyerRating: {
      stars: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      date: Date
    },
    farmerRating: {
      stars: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      date: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ buyer: 1 });
orderSchema.index({ farmer: 1 });
orderSchema.index({ grain: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ estimatedDeliveryDate: 1 });

// Compound indexes
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ farmer: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to calculate total amount and commission
orderSchema.pre('save', function(next) {
  // Calculate total amount
  this.totalAmount = this.quantity * this.pricePerQuintal;
  
  // Calculate commission
  if (!this.commission.amount) {
    this.commission.amount = this.totalAmount * (this.commission.percentage / 100);
  }
  
  // Add timeline entry for status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      description: `Order status changed to ${this.status}`,
      timestamp: new Date()
    });
  }
  
  next();
});

// Virtual for delivery address string
orderSchema.virtual('deliveryAddressString').get(function() {
  const addr = this.deliveryAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
});

// Virtual for order value after commission
orderSchema.virtual('farmerEarnings').get(function() {
  return this.totalAmount - this.commission.amount;
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if order can be delivered
orderSchema.methods.canBeDelivered = function() {
  return ['paid', 'shipped'].includes(this.status);
};

// Method to update order status with timeline
orderSchema.methods.updateStatus = function(newStatus, description, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    description: description || `Order status changed to ${newStatus}`,
    updatedBy: updatedBy
  });
  
  // Update specific dates based on status
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status, userId, userRole) {
  const query = { status };
  
  if (userRole === 'farmer') {
    query.farmer = userId;
  } else if (userRole === 'buyer') {
    query.buyer = userId;
  }
  
  return this.find(query)
    .populate('buyer', 'name email phone')
    .populate('farmer', 'name email phone address')
    .populate('grain', 'title grainType variety')
    .sort({ createdAt: -1 });
};

// Static method to get analytics
orderSchema.statics.getAnalytics = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalCommission: { $sum: '$commission.amount' },
        avgOrderValue: { $avg: '$totalAmount' },
        ordersByStatus: {
          $push: {
            status: '$status',
            amount: '$totalAmount'
          }
        }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);

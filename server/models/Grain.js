const mongoose = require('mongoose');

const grainSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  title: {
    type: String,
    required: [true, 'Grain title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  grainType: {
    type: String,
    required: [true, 'Grain type is required'],
    enum: {
      values: ['wheat', 'rice', 'corn', 'barley', 'millet', 'sorghum', 'oats', 'quinoa', 'other'],
      message: 'Please select a valid grain type'
    }
  },
  variety: {
    type: String,
    required: [true, 'Grain variety is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1 quintals'],
    max: [10000, 'Quantity cannot exceed 10000 quintals']
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerQuintal: {
    type: Number,
    required: [true, 'Price per quintal is required'],
    min: [100, 'Price must be at least ₹100 per quintal'],
    max: [50000, 'Price cannot exceed ₹50,000 per quintal']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Grain image'
    }
  }],
  location: {
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: [true, 'Quality grade is required']
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Harvest date cannot be in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'expired'],
    default: 'pending'
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  certifications: [{
    name: String,
    issuer: String,
    validUntil: Date
  }],
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: [0.1, 'Minimum order quantity must be at least 0.1 quintals']
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  adminNotes: {
    type: String,
    maxLength: [500, 'Admin notes cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
grainSchema.index({ grainType: 1 });
grainSchema.index({ status: 1 });
grainSchema.index({ farmer: 1 });
grainSchema.index({ 'location.city': 1 });
grainSchema.index({ 'location.state': 1 });
grainSchema.index({ pricePerQuintal: 1 });
grainSchema.index({ harvestDate: -1 });
grainSchema.index({ createdAt: -1 });
grainSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes
grainSchema.index({ grainType: 1, status: 1 });
grainSchema.index({ 'location.state': 1, grainType: 1 });
grainSchema.index({ pricePerQuintal: 1, grainType: 1 });

// Virtual for total value
grainSchema.virtual('totalValue').get(function() {
  return this.quantity * this.pricePerQuintal;
});

// Virtual for average rating (if reviews are added later)
grainSchema.virtual('averageRating').get(function() {
  // This can be populated from a reviews collection later
  return 0;
});

// Pre-save middleware to update availableQuantity
grainSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableQuantity = this.quantity;
  }
  next();
});

// Method to check if grain is available for order
grainSchema.methods.isAvailableForOrder = function(requestedQuantity) {
  return this.status === 'approved' && 
         this.availableQuantity >= requestedQuantity && 
         requestedQuantity >= this.minimumOrderQuantity &&
         this.expiresAt > new Date();
};

// Method to reserve quantity for order
grainSchema.methods.reserveQuantity = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.availableQuantity -= quantity;
    return true;
  }
  return false;
};

// Static method to find grains by filters
grainSchema.statics.findByFilters = function(filters) {
  const query = { status: 'approved', expiresAt: { $gt: new Date() } };
  
  if (filters.grainType) {
    query.grainType = filters.grainType;
  }
  
  if (filters.state) {
    query['location.state'] = new RegExp(filters.state, 'i');
  }
  
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.pricePerQuintal = {};
    if (filters.minPrice) query.pricePerQuintal.$gte = filters.minPrice;
    if (filters.maxPrice) query.pricePerQuintal.$lte = filters.maxPrice;
  }
  
  if (filters.minQuantity) {
    query.availableQuantity = { $gte: filters.minQuantity };
  }
  
  if (filters.isOrganic !== undefined) {
    query.isOrganic = filters.isOrganic;
  }
  
  if (filters.qualityGrade) {
    query.qualityGrade = filters.qualityGrade;
  }
  
  return this.find(query)
    .populate('farmer', 'name phone address.city address.state')
    .sort({ createdAt: -1 });
};

// Ensure virtual fields are serialized
grainSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Grain', grainSchema);
